"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"

export default function PresetCard({ preset }: any) {

  const [pos, setPos] = useState({ x: 0, y: 0 })
  const { user } = useAuth()
  const [wishlisted, setWishlisted] = useState(false)

  const handleMouseMove = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect()

    const x = (e.clientX - rect.left - rect.width / 2) / 15
    const y = (e.clientY - rect.top - rect.height / 2) / 15

    setPos({ x, y })
  }

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 })
  }

  // Check wishlist status
  useEffect(() => {
    if (!user || !preset?.id) return

    const checkWishlist = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid, "wishlist", preset.id))
        setWishlisted(snap.exists())
      } catch (err) {
        // silently fail
      }
    }

    checkWishlist()
  }, [user, preset?.id])

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) return

    try {
      const ref = doc(db, "users", user.uid, "wishlist", preset.id)

      if (wishlisted) {
        await deleteDoc(ref)
        setWishlisted(false)
      } else {
        await setDoc(ref, {
          presetId: preset.id,
          addedAt: new Date(),
        })
        setWishlisted(true)
      }

      window.dispatchEvent(new Event("wishlist:update"))
    } catch (err) {
      console.error("Wishlist toggle error:", err)
    }
  }

  // prevent crash if preset missing
  if (!preset) return null

  return (
    <Link href={`/preset/${preset.id}`}>

      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 
transition-all duration-300 cursor-pointer
hover:border-purple-500
hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]">

        {/* Wishlist Heart */}
        {user && (
          <button
            onClick={toggleWishlist}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-all"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={18}
              className={`transition-colors duration-200 ${
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-white/70 hover:text-red-400"
              }`}
            />
          </button>
        )}

        {/* Image container */}
        <div className="relative h-64 w-full overflow-hidden">

          {/* Moving wrapper */}
          <div
            style={{
              transform: `scale(1.15) translate(${pos.x}px, ${pos.y}px)`
            }}
            className="absolute inset-0 transition-transform duration-200 ease-out"
          >

            {preset.afterImage && (
              <Image
                src={preset.afterImage}
                alt={preset.name || "Preset"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
            )}

          </div>

        </div>

        <div className="p-4">

          <h3 className="text-white font-semibold text-lg">
            {preset.name || "Untitled Preset"}
          </h3>

          <p className="text-green-400 font-semibold mt-2">
            {preset.price === 0 ? "Free" : `₹${preset.price}`}
          </p>

        </div>

      </div>

    </Link>
  )
}