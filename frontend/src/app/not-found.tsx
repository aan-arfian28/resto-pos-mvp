import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-brand-600">404</h1>
        <h2 className="text-xl text-gray-700 dark:text-dark-300">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500">Halaman yang Anda cari tidak tersedia.</p>
        <Link href="/login" className="inline-block px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}
