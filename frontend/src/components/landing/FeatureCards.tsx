import React from "react";
import { WifiOff, Monitor, Grid3X3, Printer, BarChart3, Shield } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <WifiOff size={28} />,
    title: "Offline Mode",
    description:
      "Tetap bertransaksi tanpa internet. Data akan tersimpan secara lokal dan sinkron otomatis saat koneksi kembali.",
  },
  {
    icon: <Monitor size={28} />,
    title: "Kitchen Display Sync",
    description:
      "Pesanan langsung masuk ke dapur secara real-time. Kurangi kesalahan komunikasi dan percepat penyajian.",
  },
  {
    icon: <Grid3X3 size={28} />,
    title: "Manajemen Meja",
    description:
      "Atur meja dengan visual grid. Pantau status meja, pindah meja, dan gabung meja dengan mudah.",
  },
  {
    icon: <Printer size={28} />,
    title: "Multi Printer",
    description:
      "Dukungan multiple printer untuk struk dan docket dapur. Konfigurasi otomatis via jaringan.",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "Laporan Real-time",
    description:
      "Dashboard owner dengan metrik lengkap: omzet, laba, item terlaris, dan tren penjualan harian.",
  },
  {
    icon: <Shield size={28} />,
    title: "Multi-level Akses",
    description:
      "Kontrol akses berdasarkan peran: owner, kasir, dan dapur. Setiap pengguna memiliki batasan masing-masing.",
  },
];

export function FeatureCards() {
  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-50 mb-4">
            Kenapa Memilih{" "}
            <span className="text-brand-600">BistroFlow</span>?
          </h2>
          <p className="text-lg text-gray-500 dark:text-dark-400 max-w-2xl mx-auto">
            Solusi POS yang dirancang khusus untuk kebutuhan restoran Indonesia,
            dengan fitur lengkap dan harga terjangkau.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-50 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
