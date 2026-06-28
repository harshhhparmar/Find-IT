export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'resolved' | 'archived';

export interface Item {
  id?: string;
  type: ItemType;
  title: string;
  description: string;
  category: string;
  location: string;
  coordinates?: { lat: number, lng: number };
  date: string;
  imageUrl?: string;
  reporterId: string;
  reporterName: string;
  status: ItemStatus;
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
}

export interface AppNotification {
  id?: string;
  userId: string;
  message: string;
  createdAt: any;
  read: boolean;
  relatedItemId?: string;
}

export const CATEGORIES = [
  'Electronics',
  'Wallets & Bags',
  'Keys',
  'Documents',
  'Clothing',
  'Books',
  'Other'
];

export const LOCATIONS = [
  'SCE',
  'SETI',
  'SETI Corridor',
  'SALITER',
  'SIP',
  'SCP',
  'SID',
  'Architecture',
  'Volleyball Ground',
  'Hospital/MBBS',
  'MBBS Parking',
  'Cricket Ground',
  'Canteen',
  'Parking Near Canteen',
  'Main Parking'
];
