import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutMe from "@/components/AboutMe";
import FeaturedPresets from "@/components/FeaturedPresets";
import HomeClient from "@/components/HomeClient";
import GalleryTeaser from "@/components/GalleryTeaser";
import StatsSection from "@/components/StatsSection";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import type { Preset } from "@/lib/types";

// ISR: serve from cache, revalidate in background every 60s
export const revalidate = 60;

export default async function Home() {
  let presets: Preset[] = [];
  let categories: string[] = ["All"];
  let galleryPhotos: any[] = [];
  let totalCustomers = 0;

  try {
    // Fetch presets
    const querySnapshot = await getDocs(collection(db, "presets"));
    presets = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return JSON.parse(JSON.stringify({ id: doc.id, ...data }));
    }) as Preset[];

    // Fetch categories
    const catSnapshot = await getDocs(collection(db, "categories"));
    const catNames = catSnapshot.docs.map((doc) => doc.data().name);
    categories = ["All", ...catNames];

    // Fetch gallery photos (latest 3)
    try {
      const gq = query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(3));
      const gallerySnap = await getDocs(gq);
      galleryPhotos = gallerySnap.docs.map((d) =>
        JSON.parse(JSON.stringify({ id: d.id, ...d.data() }))
      );
    } catch (e) {
      // gallery collection might not exist yet
    }

    // Count purchases for stats
    try {
      const purchaseSnap = await getDocs(collection(db, "purchases"));
      const uniqueUsers = new Set(purchaseSnap.docs.map((d) => d.data().userId));
      totalCustomers = uniqueUsers.size;
    } catch (e) {
      // purchases collection might not exist yet
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  // Get preview images for hero floating cards
  const previewImages = presets
    .filter((p) => p.coverImage || p.afterImage)
    .slice(0, 3)
    .map((p) => p.coverImage || p.afterImage || "");

  // Featured presets: use trending-flagged ones, fallback to first 8
  const trending = presets.filter((p: any) => p.isTrending);
  const featured = trending.length > 0 ? trending : presets.slice(0, 8);

  return (
    <div className="min-h-screen text-white">
      <Navbar />

      {/* 1. Hero */}
      <HeroSection previewImages={previewImages} />

      {/* 2. About Me */}
      <AboutMe />

      {/* 3. Featured / Trending */}
      <FeaturedPresets presets={featured} />

      {/* 4. All Presets (search + filter + grid) */}
      <HomeClient initialPresets={presets} categories={categories} />

      {/* 5. Gallery Teaser */}
      <GalleryTeaser photos={galleryPhotos} />

      {/* 6. Stats */}
      {/* <StatsSection
        totalPresets={presets.length}
        totalCustomers={totalCustomers}
        totalPhotos={galleryPhotos.length}
      /> */}

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}