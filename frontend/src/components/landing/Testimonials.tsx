import React from "react";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  restaurant: string;
  avatar: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Budi Santoso",
    role: "Pemilik",
    restaurant: "Warung Makan Sederhana",
    avatar: "BS",
    content:
      "BistroFlow benar-benar mengubah cara kami mengelola restoran. Fitur offline mode-nya sangat membantu saat internet bermasalah. Dashboard owner juga sangat informatif!",
    rating: 5,
  },
  {
    name: "Siti Rahmawati",
    role: "Kasir",
    restaurant: "RM Padang Jaya",
    avatar: "SR",
    content:
      "Sebagai kasir, saya suka banget sama tampilan POS-nya yang simpel dan cepat. Proses pembayaran jadi lebih efisien, antrean pelanggan berkurang drastis.",
    rating: 5,
  },
  {
    name: "Agus Wijaya",
    role: "Manager",
    restaurant: "Cafe Kopi Nusantara",
    avatar: "AW",
    content:
      "Kitchen display sync-nya luar biasa. Pesanan dari kasir langsung muncul di dapur. Tidak ada lagi salah komunikasi antara pelayan dan koki.",
    rating: 4,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-dark-600"}
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 bg-white dark:bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-50 mb-4">
            Apa Kata Mereka?
          </h2>
          <p className="text-lg text-gray-500 dark:text-dark-400 max-w-2xl mx-auto">
            Dengar langsung dari para pengguna BistroFlow di seluruh Indonesia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 bg-gray-50 dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 relative"
            >
              <Quote
                size={32}
                className="absolute top-4 right-4 text-brand-200 dark:text-brand-800"
              />

              <StarRating rating={testimonial.rating} />

              <p className="text-sm text-gray-600 dark:text-dark-300 mt-4 mb-6 leading-relaxed italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-50">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-400">
                    {testimonial.role} - {testimonial.restaurant}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
