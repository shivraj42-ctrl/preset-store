import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function POST(req) {
  try {
    const { userId, presetId } = await req.json()

    if (!userId || !presetId) {
      return NextResponse.json({ error: "Missing userId or presetId" }, { status: 400 })
    }

    // Verify purchase exists
    const purchaseRef = doc(db, "purchases", `${userId}_${presetId}`)
    const purchaseSnap = await getDoc(purchaseRef)

    if (!purchaseSnap.exists()) {
      return NextResponse.json({ error: "Not purchased" }, { status: 403 })
    }

    // Fetch preset to get download URL
    const presetRef = doc(db, "presets", presetId)
    const presetSnap = await getDoc(presetRef)

    if (!presetSnap.exists()) {
      return NextResponse.json({ error: "Preset not found" }, { status: 404 })
    }

    const downloadUrl = presetSnap.data().downloadUrl

    if (!downloadUrl) {
      return NextResponse.json({ error: "No download URL available" }, { status: 404 })
    }

    return NextResponse.json({ downloadUrl })

  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
