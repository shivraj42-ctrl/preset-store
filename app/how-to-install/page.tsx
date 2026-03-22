import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Smartphone, Monitor, Cloud, Download, FolderOpen, Import, CheckCircle2, Copy, Play } from "lucide-react";

export const metadata = {
  title: "How to Install Presets - SnapGrid",
  description: "Learn how to import and use your new presets in Adobe Lightroom Mobile, Lightroom Classic (Desktop), and Lightroom CC.",
};

export default function HowToInstall() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-purple-500/30">
      <Navbar />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
            How to Install Presets
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Don't know how to import presets in Lightroom or Lightroom Classic? Here is a simple step-by-step guide to get you started on any platform.
          </p>
        </div>

        <div className="space-y-12">
          {/* Mobile Guide */}
          <section className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 md:p-12 hover:border-purple-500/20 transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                <Smartphone size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Adobe Lightroom (Mobile)</h2>
                <p className="text-gray-400 text-sm">iOS & Android App</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StepCard
                number="1"
                icon={<Download size={20} />}
                title="Download the file"
                description="Download the preset file to your phone (usually in .DNG or .XMP format)."
              />
              <StepCard
                number="2"
                icon={<Import size={20} />}
                title="Import the preset"
                description="Open Lightroom, tap '+ Add Photos' and select the downloaded preset file."
              />
              <StepCard
                number="3"
                icon={<Copy size={20} />}
                title="Copy settings"
                description="Open the imported image, tap the 3 dots (⋮) top right, click 'Copy Settings' and confirm."
              />
              <StepCard
                number="4"
                icon={<CheckCircle2 size={20} />}
                title="Apply preset"
                description="Open any photo you want to edit, tap 3 dots (⋮) and select 'Paste Settings'."
              />
            </div>
          </section>

          {/* Classic Desktop Guide */}
          <section className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 md:p-12 hover:border-blue-500/20 transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                <Monitor size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Adobe Lightroom Classic</h2>
                <p className="text-gray-400 text-sm">Desktop Version</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StepCard
                number="1"
                icon={<Download size={20} />}
                title="Download files"
                description="Save the files to your computer (Format: .XMP for modern or .LRTEMPLATE)."
              />
              <StepCard
                number="2"
                icon={<FolderOpen size={20} />}
                title="Go to Develop"
                description="Open Lightroom Classic and click the 'Develop' tab in the top menu."
              />
              <StepCard
                number="3"
                icon={<Import size={20} />}
                title="Import presets"
                description="Find the Presets panel on the left, click the '+' icon, and select 'Import Presets'."
              />
              <StepCard
                number="4"
                icon={<Play size={20} />}
                title="Use the preset"
                description="Select the downloaded files. Once imported, click on any preset while a photo is selected to apply instantly."
              />
            </div>
          </section>

          {/* CC Desktop Cloud Guide */}
          <section className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 md:p-12 hover:border-teal-500/20 transition-colors">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400">
                  <Cloud size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Adobe Lightroom CC</h2>
                  <p className="text-gray-400 text-sm">Desktop Cloud Version</p>
                </div>
              </div>
              <span className="bg-zinc-800 text-xs px-3 py-1 rounded-full text-gray-300">
                Method 1: Import .XMP (Recommended)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StepCard
                number="1"
                icon={<Download size={20} />}
                title="Download files"
                description="Download your preset files. Verify the format is .XMP."
              />
              <StepCard
                number="2"
                icon={<FolderOpen size={20} />}
                title="Open Presets"
                description="Open Lightroom, ensure you're in the Edit panel, and click the 'Presets' icon on the right."
              />
              <StepCard
                number="3"
                icon={<Import size={20} />}
                title="Import"
                description="Click the 3 dots (⋮) in the Presets panel, click 'Import Presets', and select your .XMP files."
              />
              <StepCard
                number="4"
                icon={<Play size={20} />}
                title="Apply preset"
                description="Select any photo and simply click on your imported preset to apply it."
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StepCard({ number, icon, title, description }: { number: string; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl italic group-hover:scale-110 transition-transform">
        {number}
      </div>
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
