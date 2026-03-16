"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { addDoc, collection } from "firebase/firestore"

export default function AdminPage() {

  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")

  const uploadPreset = async () => {

    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    })

    const data = await res.json()

    const fileURL = data.secure_url

    await addDoc(collection(db, "presets"), {
      name,
      price,
      fileURL
    })

    alert("Preset uploaded successfully!")

  }

  return (

    <div>

      <h1>Admin Upload</h1>

      <input
        placeholder="Preset Name"
        onChange={(e)=>setName(e.target.value)}
      />

      <input
        placeholder="Price"
        onChange={(e)=>setPrice(e.target.value)}
      />

      <input
        type="file"
        onChange={(e)=>setFile(e.target.files?.[0] || null)}
      />

      <button onClick={uploadPreset}>
        Upload Preset
      </button>

    </div>

  )
}