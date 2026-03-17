import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");
  const presetId = searchParams.get("presetId");

  if (!userId || !presetId) {
    return NextResponse.json({ purchased: false });
  }

  const purchaseId = `${userId}_${presetId}`;

  const docRef = doc(db, "purchases", purchaseId);
  const docSnap = await getDoc(docRef);

  return NextResponse.json({
    purchased: docSnap.exists(),
  });
}