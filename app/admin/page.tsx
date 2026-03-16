"use client";

import { useState } from "react";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [presetFile, setPresetFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!beforeImage || !afterImage || !presetFile) return;

    alert("Upload logic will run here");
  };

  return (
    <div className="max-w-xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">Upload Preset</h1>

      <input
        placeholder="Preset Name"
        className="border p-2 w-full mb-4"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Price"
        className="border p-2 w-full mb-4"
        onChange={(e) => setPrice(e.target.value)}
      />

      <input type="file" onChange={(e) => setBeforeImage(e.target.files?.[0] || null)} />
      <input type="file" onChange={(e) => setAfterImage(e.target.files?.[0] || null)} />
      <input type="file" onChange={(e) => setPresetFile(e.target.files?.[0] || null)} />

      <button
        onClick={handleUpload}
        className="bg-black text-white px-6 py-2 mt-4 rounded"
      >
        Upload Preset
      </button>
    </div>
  );
}