import React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-dark-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Siap digunakan 24/7
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Kelola Restoran
              <span className="block text-brand-200">Lebih Cerdas</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-lg mx-auto md:mx-0">
              POS system modern untuk restoran Indonesia. Offline-ready, real-time kitchen sync,
              dan manajemen meja yang efisien.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors shadow-lg shadow-brand-900/20"
              >
                Mulai Sekarang
                <ArrowRight size={20} />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Pelajari Lebih Lanjut
                <ChevronRight size={20} />
              </a>
            </div>
          </div>

          {/* Right Mockup */}
          <div className="hidden md:flex justify-center">
            <div className="relative">
              {/* Device Frame */}
              <div className="w-72 h-[500px] bg-dark-800 rounded-[32px] border-4 border-dark-600 shadow-2xl overflow-hidden">
                {/* Status Bar */}
                <div className="bg-brand-600 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <span className="text-white text-xs font-medium">BistroFlow POS</span>
                  <span className="text-white/60 text-xs">09:41</span>
                </div>

                {/* Mock Content */}
                <div className="p-3 space-y-2">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {["Semua", "Makanan", "Minuman", "Snack"].map((tab) => (
                      <div
                        key={tab}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          tab === "Semua"
                            ? "bg-brand-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tab}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-lg p-2">
                        <div className="bg-gray-200 h-16 rounded-md mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                        <div className="h-4 bg-brand-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 blur-xl rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
          <path
            d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z"
            fill="#F9FAFB"
          />
        </svg>
      </div>
    </section>
  );
}
