import { getDocs, collection, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryGrid from "@/components/GalleryGrid";

// Always fetch fresh data — no caching
export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  let photos: any[] = [];

  try {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    photos = snap.docs.map((d) => {
      const data = d.data();
      return JSON.parse(JSON.stringify({ id: d.id, ...data }));
    });
  } catch (err) {
    console.error("Error fetching gallery:", err);
  }

  return (
    <div className="min-h-screen text-white">
      <Navbar />

      {/* Header */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Photo Gallery
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          A curated collection of photographs — showcasing moments, edits, and creative work.
        </p>
        <div className="mt-6 h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      </section>

      {/* Gallery Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No photos yet — check back soon!</p>
          </div>
        ) : (
          <GalleryGrid photos={photos} />
        )}
      </section>

      <Footer />
    </div>
  );
}
