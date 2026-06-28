import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Item, ItemType, ItemStatus } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const ItemService = {
  async createItem(itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'reporterId' | 'reporterName'>) {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required");

    const path = 'items';
    try {
      const newItem: any = {
        type: itemData.type,
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        location: itemData.location,
        date: itemData.date,
        reporterId: user.uid,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (user.displayName) newItem.reporterName = user.displayName;
      if (itemData.imageUrl) newItem.imageUrl = itemData.imageUrl;
      
      const docRef = await addDoc(collection(db, path), newItem);

      // Simple matching system to notify users
      try {
        const oppositeType = itemData.type === 'lost' ? 'found' : 'lost';
        const q = query(
          collection(db, path), 
          where('type', '==', oppositeType),
          where('category', '==', itemData.category),
          where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        
        for (const matchDoc of snapshot.docs) {
          const matchData = matchDoc.data();
          if (matchData.reporterId !== user.uid) {
            let myEmail = user.email || 'another user';
            
            // Notify the other user about this post
            await addDoc(collection(db, 'notifications'), {
              userId: matchData.reporterId,
              message: `A potential match (${itemData.title}) was posted for your ${itemData.category}. Contact: ${myEmail} : ${itemData.title}`,
              relatedItemId: docRef.id,
              read: false,
              createdAt: serverTimestamp()
            });

            // Notify this user about the existing post
            let theirEmail = 'another user';
            try {
              const theirUserDoc = await getDoc(doc(db, 'users', matchData.reporterId));
              if (theirUserDoc.exists()) {
                theirEmail = theirUserDoc.data().email || theirEmail;
              }
            } catch (e) {
              console.error(e);
            }
            await addDoc(collection(db, 'notifications'), {
              userId: user.uid,
              message: `Your post has a potential match (${matchData.title}). Contact: ${theirEmail} : ${matchData.title}`,
              relatedItemId: matchDoc.id,
              read: false,
              createdAt: serverTimestamp()
            });
          }
        }
      } catch(e) {
         console.error("Match Notification Error:", e);
      }

      return docRef;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateItem(itemId: string, updates: Partial<Item>) {
    const path = `items/${itemId}`;
    try {
      const itemRef = doc(db, 'items', itemId);
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteItem(itemId: string) {
    const path = `items/${itemId}`;
    try {
      await deleteDoc(doc(db, 'items', itemId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeToItems(params: { type?: ItemType; category?: string; location?: string; }, callback: (items: Item[]) => void) {
    const path = 'items';
    // We filter for public items (active/resolved) to satisfy security rules.
    let q = query(collection(db, path), where('status', 'in', ['active', 'resolved']));

    if (params.type) {
      q = query(q, where('type', '==', params.type));
    }
    if (params.category) {
      q = query(q, where('category', '==', params.category));
    }
    if (params.location) {
      q = query(q, where('location', '==', params.location));
    }

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Item[];
      
      // Sort in memory to avoid needing complex composite indices for status + createdAt
      items.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async getItem(itemId: string) {
    const path = `items/${itemId}`;
    try {
      const docSnap = await getDoc(doc(db, 'items', itemId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Item;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async getMyActiveItems(oppositeType: ItemType): Promise<Item[]> {
    const user = auth.currentUser;
    if (!user) return [];
    
    const path = 'items';
    try {
      const q = query(
        collection(db, path), 
        where('reporterId', '==', user.uid),
        where('status', '==', 'active'),
        where('type', '==', oppositeType)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Item[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async matchItems(myItemId: string, theirItemId: string) {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error("Authentication required and email must be verified");
    
    const myItem = await this.getItem(myItemId);
    const theirItem = await this.getItem(theirItemId);
    
    if (!myItem || !theirItem) throw new Error("Item not found");
    
    let theirEmail = '';
    try {
      const theirUserDoc = await getDoc(doc(db, 'users', theirItem.reporterId!));
      if (theirUserDoc.exists()) {
        theirEmail = theirUserDoc.data().email;
      }
    } catch (e) {
      console.error("Could not fetch target user email", e);
    }
    
    if (!theirEmail) {
      throw new Error("Target user has no email registered.");
    }

    await this.updateItem(myItemId, { status: 'resolved' });
    await this.updateItem(theirItemId, { status: 'resolved' });

    try {
      // Create notification for the current user
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        message: `Your item (${myItem.title}) was matched with another item by user ${theirEmail}.`,
        relatedItemId: theirItemId,
        read: false,
        createdAt: serverTimestamp()
      });

      // Create notification for the other user
      await addDoc(collection(db, 'notifications'), {
        userId: theirItem.reporterId,
        message: `Your item (${theirItem.title}) was matched with another item by user ${user.email}.`,
        relatedItemId: myItemId,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    }
  }
};
