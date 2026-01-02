'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/utils"
import { Star } from "lucide-react"

interface Doctor {
  id: string
  profiles: {
    full_name: string
    avatar_url: string
  }
  specialization: string
  consultation_fee: number
}

interface DoctorSelectStepProps {
  doctors: Doctor[]
}

export function DoctorSelectStep({ doctors }: DoctorSelectStepProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelect = (doctorId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', '2')
    params.set('doctor', doctorId)
    router.push(`/booking?${params.toString()}`)
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doctor) => (
        <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-all">
          <div className="flex p-4 gap-4 items-start">
             <Avatar className="h-16 w-16 rounded-lg">
                <AvatarImage src={doctor.profiles.avatar_url} />
                <AvatarFallback>{doctor.profiles.full_name.charAt(0)}</AvatarFallback>
             </Avatar>
             <div className="flex-1 space-y-1">
                <h3 className="font-bold text-slate-900 line-clamp-1">
                  {doctor.profiles.full_name}
                </h3>
                <p className="text-sm text-blue-600 font-medium">
                  {doctor.specialization}
                </p>
                <div className="flex items-center gap-1 text-xs text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span>4.8</span>
                </div>
             </div>
          </div>
          <CardContent className="p-4 pt-0 border-t bg-slate-50/50 mt-2">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-500">Biaya</span>
              <span className="font-semibold text-slate-900">
                {formatRupiah(doctor.consultation_fee)}
              </span>
            </div>
            <Button onClick={() => handleSelect(doctor.id)} className="w-full">
              Pilih Dokter
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
