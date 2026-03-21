"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Star } from "lucide-react";

export default function PresetReviews({
  presetId,
  isPurchased,
}: {
  presetId: string;
  isPurchased: boolean;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!presetId) return;

    const q = query(
      collection(db, "presets", presetId, "reviews"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(data);
    });

    return () => unsubscribe();
  }, [presetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("You must be logged in to leave a review.");
      return;
    }
    if (!isPurchased) {
      setError("You can only review presets you have downloaded/purchased.");
      return;
    }
    if (!text.trim()) {
      setError("Please write a review.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "presets", presetId, "reviews"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userImage: user.photoURL || null,
        rating,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText("");
      setRating(5);
    } catch (err) {
      console.error(err);
      setError("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 border-t border-zinc-900 mt-10">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="flex items-center gap-2 bg-zinc-900 px-4 py-1.5 rounded-full border border-purple-500/30">
          <Star className="fill-yellow-500 text-yellow-500" size={16} />
          <span className="font-semibold">{averageRating}</span>
          <span className="text-gray-400 text-sm">({reviews.length})</span>
        </div>
      </div>

      {isPurchased ? (
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-12 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
        >
          <h3 className="text-lg font-semibold mb-4 text-purple-300">
            Write a Review
          </h3>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className="focus:outline-none transition hover:scale-110"
              >
                <Star
                  className={`transition-colors duration-200 ${
                    num <= rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-600"
                  }`}
                  size={24}
                />
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you think of this preset?"
            rows={4}
            className="w-full bg-zinc-800 border border-zinc-700 p-3 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 mb-4 transition-all resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition disabled:opacity-50 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]"
          >
            {loading ? "Submitting..." : "Post Review"}
          </button>
        </form>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-12 text-center text-gray-400">
          You must purchase or download this preset to write a review.
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500">No reviews yet. Be the first!</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-black border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center border border-zinc-700">
                    {review.userImage ? (
                      <img src={review.userImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold text-gray-400 uppercase">
                        {review.userName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{review.userName}</p>
                    <p className="text-xs text-gray-500">
                      {review.createdAt?.toDate?.().toLocaleDateString() || "Just now"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < review.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-zinc-700"
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {review.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
