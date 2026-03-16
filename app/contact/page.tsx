import Navbar from "@/components/Navbar";

export default function Contact() {
  return (
    <div className="bg-black min-h-screen text-white">

      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-24 text-center">

        <h1 className="text-4xl font-bold mb-6">
          Contact
        </h1>

        <p className="text-gray-400 mb-12">
          If you have questions about presets or downloads, feel free to reach out.
        </p>

        <div className="space-y-10">

          {/* Email */}
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Email
            </h2>

            <a
              href="mailto:your@email.com"
              className="text-purple-400 hover:text-purple-300 transition"
            >
              shivrajmali6412@gmail.com
            </a>
          </div>

          {/* Business Inquiries */}
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Business Inquiries
            </h2>

            <p className="text-gray-400">
              For collaborations, partnerships, or licensing inquiries,
              please contact us via email.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}