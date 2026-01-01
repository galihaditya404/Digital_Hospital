import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Stethoscope, 
  Bed, 
  Ambulance, 
  FlaskConical, 
  Scan, 
  Pill,
  Users,
  UserCheck,
  Clock,
  Award,
  Calendar,
  ChevronRight
} from 'lucide-react'

export default async function LandingPage() {
  const supabase = await createClient()
  
  // Fetch doctors
  const { data: doctors } = await supabase
    .from('doctors')
    .select('*, profiles(full_name, avatar_url)')
    .eq('is_active', true)
    .limit(4)

  const services = [
    { icon: Stethoscope, title: 'Rawat Jalan', desc: 'Konsultasi dokter umum dan spesialis dengan jadwal fleksibel.' },
    { icon: Bed, title: 'Rawat Inap', desc: 'Kamar perawatan nyaman dengan fasilitas medis lengkap.' },
    { icon: Ambulance, title: 'IGD 24 Jam', desc: 'Penanganan gawat darurat cepat tanggap oleh tim medis profesional.' },
    { icon: FlaskConical, title: 'Laboratorium', desc: 'Pemeriksaan lab lengkap dengan hasil akurat dan cepat.' },
    { icon: Scan, title: 'Radiologi', desc: 'Layanan Rontgen, USG, dan CT Scan dengan teknologi modern.' },
    { icon: Pill, title: 'Farmasi', desc: 'Layanan obat lengkap 24 jam untuk kebutuhan pasien.' },
  ]

  const features = [
    { title: 'Dokter Berpengalaman', desc: 'Tim dokter spesialis tersertifikasi dengan jam terbang tinggi.', icon: UserCheck },
    { title: 'Fasilitas Modern', desc: 'Peralatan medis terkini dan terawat untuk diagnosis akurat.', icon: Stethoscope },
    { title: 'Harga Transparan', desc: 'Informasi biaya jelas tanpa biaya tersembunyi.', icon: Award },
    { title: 'Pelayanan Prima', desc: 'Mengutamakan kenyamanan dan kepuasan pasien.', icon: Users },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20 lg:py-32 overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full border border-blue-400 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-100 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-300 mr-2 animate-pulse"></span>
              Buka 24 Jam Setiap Hari
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
              Rumah Sakit XYZ
              <span className="block text-blue-200 mt-2 text-3xl md:text-5xl font-semibold">Melayani dengan Sepenuh Hati</span>
            </h1>
            
            <p className="text-xl text-blue-100 max-w-[700px]">
              Fasilitas modern, dokter berpengalaman, dan pelayanan kesehatan terbaik untuk Anda dan keluarga tercinta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link href="/booking">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 text-base h-12 px-8">
                  <Calendar className="mr-2 h-5 w-5" />
                  Booking Online
                </Button>
              </Link>
              <Link href="/doctors">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white/10 hover:text-white text-base h-12 px-8">
                  Lihat Jadwal Dokter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATISTICS BAR */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center text-blue-600 mb-2">
                <UserCheck size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">50+</h3>
              <p className="text-gray-500 font-medium">Dokter Spesialis</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center text-blue-600 mb-2">
                <Users size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">10k+</h3>
              <p className="text-gray-500 font-medium">Pasien Dilayani</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center text-blue-600 mb-2">
                <Clock size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">24h</h3>
              <p className="text-gray-500 font-medium">Layanan IGD</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center text-blue-600 mb-2">
                <Award size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">15+</h3>
              <p className="text-gray-500 font-medium">Tahun Pengalaman</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LAYANAN SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Layanan Kami</h2>
            <p className="text-gray-600">
              Menyediakan layanan kesehatan komprehensif dengan dukungan teknologi medis terkini.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 space-y-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <service.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                  <p className="text-gray-500 leading-relaxed">
                    {service.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <div className="w-full md:w-1/2 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Mengapa Memilih <br/>
                  <span className="text-blue-600">Rumah Sakit XYZ?</span>
                </h2>
                <p className="text-lg text-gray-600">
                  Komitmen kami adalah memberikan pelayanan kesehatan terbaik yang berfokus pada keselamatan dan kenyamanan pasien.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {features.map((feature, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                      {feature.title}
                    </div>
                    <p className="text-sm text-gray-500 pl-7">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-1/2">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video lg:aspect-auto lg:h-[500px] bg-slate-200">
                {/* Placeholder Image when no real image available */}
                <div className="absolute inset-0 bg-blue-100 flex items-center justify-center text-blue-300">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DOCTORS PREVIEW */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Dokter Kami</h2>
              <p className="text-gray-600">Ditangani oleh dokter spesialis berpengalaman</p>
            </div>
            <Link href="/doctors" className="hidden md:flex items-center text-blue-600 font-medium hover:text-blue-700">
              Lihat Semua Dokter <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {doctors && doctors.length > 0 ? (
               doctors.map((doctor: any) => (
                 <Card key={doctor.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                   <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                     {doctor.photo_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                       <img 
                         src={doctor.photo_url} 
                         alt={doctor.profiles?.full_name} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                         <UserCheck size={48} />
                       </div>
                     )}
                   </div>
                   <CardContent className="p-4">
                     <h3 className="font-bold text-gray-900 truncate">{doctor.profiles?.full_name}</h3>
                     <p className="text-blue-600 text-sm font-medium mb-2">{doctor.specialization}</p>
                     <p className="text-gray-500 text-xs line-clamp-2">{doctor.bio || 'Dokter Spesialis di Rumah Sakit XYZ'}</p>
                   </CardContent>
                 </Card>
               ))
             ) : (
               [1, 2, 3, 4].map((i) => (
                 <Card key={i} className="overflow-hidden opacity-60">
                    <div className="aspect-[4/3] bg-slate-200 animate-pulse" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-slate-100 rounded w-1/2 animate-pulse" />
                    </CardContent>
                 </Card>
               ))
             )}
          </div>
          
          <div className="mt-8 text-center md:hidden">
             <Link href="/doctors">
               <Button variant="outline" className="w-full">Lihat Semua Dokter</Button>
             </Link>
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Butuh Konsultasi Medis?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Jangan tunda kesehatan Anda. Buat janji temu dengan dokter spesialis kami sekarang juga.
            Mudah, cepat, dan tanpa antri lama.
          </p>
          <Link href="/booking">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all">
              Booking Sekarang
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
