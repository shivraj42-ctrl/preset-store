import Navbar from "@/components/Navbar";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import Footer from "@/components/Footer";
import HomeClient from "@/components/HomeClient";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Preset } from "@/lib/types";

// Explicitly opt into dynamic rendering since we are fetching from Firebase without caching
export const dynamic = "force-dynamic";

export default async function Home() {
  let presets: Preset[] = [];
  let categories: string[] = ["All"];

  try {
    const querySnapshot = await getDocs(collection(db, "presets"));
    presets = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // Strip Firestore Timestamp objects — they can't cross Server→Client boundary
      return JSON.parse(JSON.stringify({ id: doc.id, ...data }));
    }) as Preset[];

    const catSnapshot = await getDocs(collection(db, "categories"));
    const catNames = catSnapshot.docs.map(doc => doc.data().name);
    categories = ["All", ...catNames];
  } catch (error) {
    console.error("Error fetching presets server-side:", error);
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      {/* HERO */}
      <section className="text-center py-32 px-6 bg-gradient-to-b from-black to-zinc-900">
        <h1 className="text-6xl font-bold mb-6">Premium Lightroom Classic</h1>
        <p className="text-gray-400 text-xl max-w-xl mx-auto mb-10">
          Transform your photos instantly using presets used by creators.
        </p>
      </section>

      {/* BEFORE AFTER SLIDER */}
      <BeforeAfterSlider />

      {/* PRESETS (Client Component for search/filtering) */}
      <HomeClient initialPresets={presets} categories={categories} />

      <Footer />
    </div>
  );
}