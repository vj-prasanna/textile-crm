import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserDocument(result.user);
  return result;
}

export type UserRole = "admin" | "sales";

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = "sales"
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await createUserDocument(result.user, displayName, role);
  return result;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export async function createUserDocument(
  user: User,
  displayName?: string,
  role: UserRole = "sales"
) {
  const ref = doc(db, "users", user.uid);
  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    displayName: displayName ?? user.displayName ?? "User",
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function ensureUserDocument(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await createUserDocument(user);
  }
}

export async function getUserDocument(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
