import React from "react";
import { UtensilsCrossed, Github, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <UtensilsCrossed size={20} />
              </div>
              <span className="text-xl font-bold">BistroFlow</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              POS system modern untuk restoran Indonesia. Dibangun dengan teknologi
              terkini untuk mendukung digitalisasi usaha kuliner Anda.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center text-gray-400 hover:bg-brand-600 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="mailto:hello@bistroflow.id"
                className="w-9 h-9 rounded-lg bg-dark-700 flex items-center justify-center text-gray-400 hover:bg-brand-600 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Produk
            </h3>
            <ul className="space-y-3">
              {["Fitur", "Harga", "API", "Changelog"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Perusahaan
            </h3>
            <ul className="space-y-3">
              {["Tentang", "Blog", "Karir", "Kontak"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-dark-700 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} BistroFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300 transition-colors">
              Kebijakan Privasi
            </a>
            <a href="#" className="hover:text-gray-300 transition-colors">
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
