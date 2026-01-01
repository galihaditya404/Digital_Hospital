import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">Rumah Sakit XYZ</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-blue-600">
            Beranda
          </Link>
          <Link href="/doctors" className="transition-colors hover:text-blue-600">
            Dokter
          </Link>
          <Link href="/booking" className="transition-colors hover:text-blue-600">
            Booking
          </Link>
          <Link href="/antrian" className="transition-colors hover:text-blue-600">
            Cek Antrian
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Masuk
            </Button>
          </Link>
          <Link href="/booking">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Buat Janji
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
