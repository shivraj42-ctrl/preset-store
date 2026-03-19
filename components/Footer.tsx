import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 text-gray-400">

      <div className="max-w-6xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <h3 className="text-white text-lg font-semibold">XMP Store</h3>
            <p className="text-sm leading-relaxed">
              Premium Lightroom presets to transform your photography. Created by professionals, for creators.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="hover:text-purple-400 transition">Home</Link>
              <Link href="/presets" className="hover:text-purple-400 transition">Presets</Link>
              <Link href="/free" className="hover:text-purple-400 transition">Free Presets</Link>
              <Link href="/contact" className="hover:text-purple-400 transition">Contact</Link>
            </div>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Account</h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/login" className="hover:text-purple-400 transition">Login</Link>
              <Link href="/signup" className="hover:text-purple-400 transition">Sign Up</Link>
              <Link href="/my-presets" className="hover:text-purple-400 transition">My Presets</Link>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider">Connect</h4>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href="https://www.instagram.com/shivraj.png?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-400 transition"
              >
                Instagram
              </a>
              <a href="mailto:shivrajmali6412@gmail.com" className="hover:text-purple-400 transition">
                Email Us
              </a>
            </div>
          </div>

        </div>

        {/* Divider + Copyright */}
        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} XMP Store. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs">
            <span className="hover:text-purple-400 cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-purple-400 cursor-pointer transition">Privacy Policy</span>
          </div>
        </div>

      </div>

    </footer>
  );
}
