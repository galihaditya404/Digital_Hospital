'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, MapPin, Star, Calendar, Clock, X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatRupiah, getDayName } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Doctor {
  id: string
  specialization: string
  consultation_fee: number
  bio: string
  license_number: string
  photo_url: string
  profiles: {
    full_name: string
    avatar_url: string
  }
  schedules: Schedule[]
}

interface Schedule {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  room: string
}

export function DoctorsList({ initialDoctors }: { initialDoctors: Doctor[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('all')
  const [showAvailableToday, setShowAvailableToday] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  // Get unique specializations
  const specializations = Array.from(
    new Set(initialDoctors.map((doc) => doc.specialization))
  )

  const today = new Date().getDay() // 0 = Sunday

  const filteredDoctors = initialDoctors.filter((doc) => {
    const matchesSearch = doc.profiles.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    
    const matchesSpecialization =
      selectedSpecialization === 'all' ||
      doc.specialization === selectedSpecialization

    const matchesAvailability =
      !showAvailableToday ||
      doc.schedules.some((sch) => sch.day_of_week === today)

    return matchesSearch && matchesSpecialization && matchesAvailability
  })

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari nama dokter..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select
            value={selectedSpecialization}
            onValueChange={setSelectedSpecialization}
          >
            <SelectTrigger>
              <SelectValue placeholder="Semua Spesialisasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Spesialisasi</SelectItem>
              {specializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showAvailableToday ? 'default' : 'outline'}
            onClick={() => setShowAvailableToday(!showAvailableToday)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tersedia Hari Ini
            </span>
            {showAvailableToday && <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden bg-white transition-shadow hover:shadow-md">
              <div className="aspect-[4/3] relative bg-slate-100">
                 {doctor.photo_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={doctor.photo_url}
                      alt={doctor.profiles.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={doctor.profiles.avatar_url} />
                        <AvatarFallback className="text-2xl">
                          {doctor.profiles.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <Badge className="absolute right-2 top-2 bg-white/90 text-slate-900 hover:bg-white/90">
                    <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                    4.8
                  </Badge>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
                    {doctor.profiles.full_name}
                  </h3>
                  <p className="text-sm font-medium text-blue-600">
                    {doctor.specialization}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Biaya Konsultasi</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupiah(doctor.consultation_fee)}
                  </span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  Lihat Jadwal
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              Tidak ada dokter ditemukan
            </h3>
            <p>Coba ubah filter pencarian Anda.</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchQuery('')
                setSelectedSpecialization('all')
                setShowAvailableToday(false)
              }}
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedDoctor && (
            <>
              <SheetHeader className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                   {selectedDoctor.photo_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={selectedDoctor.photo_url}
                        alt={selectedDoctor.profiles.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                         <Avatar className="h-24 w-24">
                           <AvatarFallback className="text-2xl">
                             {selectedDoctor.profiles.full_name.charAt(0)}
                           </AvatarFallback>
                         </Avatar>
                      </div>
                    )}
                </div>
                <div>
                  <SheetTitle className="text-2xl font-bold text-slate-900">
                    {selectedDoctor.profiles.full_name}
                  </SheetTitle>
                  <SheetDescription className="text-blue-600 font-medium text-base">
                    {selectedDoctor.specialization}
                  </SheetDescription>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Info Grid */}
                <div className="grid gap-4 rounded-lg bg-slate-50 p-4">
                  <div className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                    <span className="text-sm text-slate-500">Nomor STR</span>
                    <span className="text-sm font-medium">{selectedDoctor.license_number || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                    <span className="text-sm text-slate-500">Pengalaman</span>
                    <span className="text-sm font-medium">10+ Tahun</span>
                  </div>
                  <div className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
                    <span className="text-sm text-slate-500">Biaya Konsultasi</span>
                    <span className="text-sm font-bold text-blue-600">
                      {formatRupiah(selectedDoctor.consultation_fee)}
                    </span>
                  </div>
                </div>

                {/* About */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900">Tentang Dokter</h4>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {selectedDoctor.bio || 'Belum ada informasi bio.'}
                  </p>
                </div>

                {/* Schedule */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900">Jadwal Praktik</h4>
                  {selectedDoctor.schedules && selectedDoctor.schedules.length > 0 ? (
                    <div className="rounded-lg border">
                      <div className="grid grid-cols-3 border-b bg-slate-50 p-2 text-xs font-semibold text-slate-500">
                        <div>HARI</div>
                        <div>JAM</div>
                        <div>RUANGAN</div>
                      </div>
                      <div className="divide-y">
                        {selectedDoctor.schedules
                          .sort((a, b) => a.day_of_week - b.day_of_week)
                          .map((schedule) => (
                            <div key={schedule.id} className="grid grid-cols-3 p-3 text-sm">
                              <div className="font-medium text-slate-900">
                                {getDayName(schedule.day_of_week)}
                              </div>
                              <div className="text-slate-600">
                                {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                              </div>
                              <div className="text-slate-600">
                                {schedule.room || 'Poli'}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
                      Belum ada jadwal tersedia
                    </div>
                  )}
                </div>
              </div>

              <SheetFooter className="mt-8">
                <Link href={`/booking?doctor=${selectedDoctor.id}`} className="w-full">
                  <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700">
                    Booking Sekarang
                  </Button>
                </Link>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
