"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"
import { addToCart } from "@/lib/cart"
import { motion } from "framer-motion"

export default function PresetCard({ preset }: any) {
  const { user } = useAuth()
  const [wishlisted, setWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(preset, user?.uid)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  if (!preset) return null

  return (
    <Link href={`/preset/${preset.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative rounded-2xl overflow-hidden cursor-pointer
          bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]
          hover:border-purple-500/40 hover:bg-white/[0.08]
          transition-all duration-500 ease-out
          hover:shadow-[0_8px_40px_rgba(168,85,247,0.15),0_0_0_1px_rgba(168,85,247,0.1)]"
      >
        {/* ── Ambient glow on hover ── */}
        <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 0%), rgba(168,85,247,0.06), transparent 40%)"
          }}
        />

        {/* ── Image container ── */}
        <div className="relative h-64 w-full overflow-hidden">
          {/* Image with zoom on hover */}
          <div className={`absolute inset-0 transition-transform duration-700 ease-out ${isHovered ? "scale-110" : "scale-100"}`}>
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

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

          {/* Top actions row */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            {/* Price badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
              preset.price === 0
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : "bg-white/10 text-white border-white/10"
            }`}>
              {preset.price === 0 ? "Free" : `₹${preset.price}`}
            </span>

            {/* Wishlist button */}
            {user && (
              <button
                onClick={toggleWishlist}
                className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                  wishlisted
                    ? "bg-red-500/20 border border-red-500/30"
                    : "bg-white/10 border border-white/10 hover:bg-white/20"
                }`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  size={14}
                  className={`transition-all duration-300 ${
                    wishlisted
                      ? "fill-red-400 text-red-400 scale-110"
                      : "text-white/80 hover:text-red-300"
                  }`}
                />
              </button>
            )}
          </div>

          {/* Hover action buttons */}
          <div className={`absolute bottom-4 left-3 right-3 flex gap-2 z-10 transition-all duration-400 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            {/* View button */}
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-medium hover:bg-white/20 transition-all">
              <Eye size={13} />
              <span>Preview</span>
            </div>

            {/* Add to cart button */}
            {preset.price > 0 && (
              <button
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg backdrop-blur-md text-xs font-medium transition-all duration-300 ${
                  addedToCart
                    ? "bg-green-500/30 border border-green-500/40 text-green-300"
                    : "bg-purple-500/30 border border-purple-500/40 text-purple-200 hover:bg-purple-500/50"
                }`}
              >
                <ShoppingCart size={13} />
                <span>{addedToCart ? "Added!" : "Cart"}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Info section ── */}
        <div className="relative p-4">
          {/* Category tag */}
          {preset.category && (
            <span className="inline-block text-[10px] uppercase tracking-wider text-purple-400 font-medium mb-1.5">
              {preset.category}
            </span>
          )}

          {/* Title */}
          <h3 className="text-white font-semibold text-base leading-snug group-hover:text-purple-200 transition-colors duration-300">
            {preset.name || "Untitled Preset"}
          </h3>

          {/* Bottom shine line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </div>
      </motion.div>
    </Link>
  )
}