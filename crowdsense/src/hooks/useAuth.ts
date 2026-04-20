"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase/client";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export interface User extends FirebaseUser {
  isOrganizer?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user is an organizer
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const isOrganizer = userDoc.exists() && userDoc.data()?.isOrganizer;

          setUser({
            ...firebaseUser,
            isOrganizer,
          } as User);
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser(firebaseUser as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  }, [router]);

  return { user, loading, signOut };
}
