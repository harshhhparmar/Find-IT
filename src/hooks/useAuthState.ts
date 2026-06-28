import { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, User, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(!auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
