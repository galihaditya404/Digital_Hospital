import Link from 'next/link'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Rumah Sakit XYZ</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              Memberikan pelayanan kesehatan terbaik dengan fasilitas modern dan tenaga medis profesional untuk Anda dan keluarga.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-blue-400 transition-colors">
                  Cari Dokter
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-blue-400 transition-colors">
                  Booking Jadwal
                </Link>
              </li>
              <li>
                <Link href="/antrian" className="hover:text-blue-400 transition-colors">
                  Cek Antrian
                </Link>
              </li>
            </ul>
          </div>

          {/* Layanan */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Layanan</h4>
            <ul className="space-y-2 text-sm">
              <li>Rawat Jalan</li>
              <li>Rawat Inap</li>
              <li>IGD 24 Jam</li>
              <li>Laboratorium & Radiologi</li>
              <li>Farmasi</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                <span>Jl. Kesehatan No. 123, Jakarta Selatan, DKI Jakarta</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                <span>(021) 555-0123</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                <span>info@rsxyz.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 shrink-0" />
                <div>
                  <p>IGD: 24 Jam</p>
                  <p>Poli: 08:00 - 20:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="container py-6 text-center text-sm text-slate-500">
          <p>© 2025 Rumah Sakit XYZ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
