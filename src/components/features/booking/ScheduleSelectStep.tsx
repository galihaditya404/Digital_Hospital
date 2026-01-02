'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addDays, isSameDay } from 'date-fns'
import { id } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatRupiah } from '@/lib/utils'
import { getDoctorSchedules, type ScheduleSlot } from '@/lib/actions/booking'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

interface Doctor {
  id: string
  profiles: {
    full_name: string
    avatar_url: string
  }
  specialization: string
  consultation_fee: number
}

interface ScheduleSelectStepProps {
  doctor: Doctor
}

export function ScheduleSelectStep({ doctor }: ScheduleSelectStepProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<ScheduleSlot[]>([])
  const [loading, setLoading] = useState(false)
  
  // Generate next 7 days
  const nextDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate) return
      
      setLoading(true)
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd')
        const data = await getDoctorSchedules(doctor.id, formattedDate)
        setSlots(data)
      } catch (error) {
        console.error('Failed to fetch slots', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [selectedDate, doctor.id])

  const handleSelectSlot = (slot: ScheduleSlot) => {
    if (!selectedDate) return
    
    const params = new URLSearchParams(searchParams.toString())
    params.set('step', '3')
    params.set('date', format(selectedDate, 'yyyy-MM-dd'))
    params.set('schedule', slot.id)
    params.set('time', slot.formatted_time)
    router.push(`/booking?${params.toString()}`)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Doctor Info Card */}
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={doctor.profiles.avatar_url} />
                <AvatarFallback className="text-xl">{doctor.profiles.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg text-slate-900">{doctor.profiles.full_name}</h3>
              <p className="text-blue-600 font-medium">{doctor.specialization}</p>
              
              <div className="mt-6 w-full space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Biaya Konsultasi</span>
                  <span className="font-semibold">{formatRupiah(doctor.consultation_fee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Durasi</span>
                  <span className="font-semibold">~15 Menit</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {/* Date Selection */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Pilih Tanggal
          </h4>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {nextDays.map((date) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              return (
                <button
                  key={date.toString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex min-w-[100px] flex-col items-center justify-center rounded-lg border p-3 text-sm transition-all",
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600 ring-offset-2"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                  )}
                >
                  <span className={cn("font-medium", isSelected ? "text-blue-700" : "text-slate-500")}>
                    {format(date, 'EEE', { locale: id })}
                  </span>
                  <span className={cn("text-lg font-bold", isSelected ? "text-blue-700" : "text-slate-900")}>
                    {format(date, 'd')}
                  </span>
                  <span className={cn("text-xs", isSelected ? "text-blue-600" : "text-slate-400")}>
                    {format(date, 'MMM', { locale: id })}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Slots Selection */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pilih Jam Praktik
          </h4>
          
          {!selectedDate ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-slate-500">
              Silakan pilih tanggal terlebih dahulu
            </div>
          ) : loading ? (
             <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
               {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
             </div>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {slots.map((slot) => (
                <button
                  key={slot.id}
                  disabled={!slot.available}
                  onClick={() => handleSelectSlot(slot)}
                  className={cn(
                    "group relative flex items-center justify-between rounded-lg border p-4 text-left transition-all",
                    slot.available
                      ? "bg-white hover:border-blue-600 hover:shadow-sm"
                      : "cursor-not-allowed bg-slate-50 opacity-60"
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      {slot.formatted_time}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      {slot.room}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        slot.available
                          ? "bg-green-100 text-green-700 group-hover:bg-green-200"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {slot.available ? `Sisa ${slot.quota - slot.booked}` : 'Penuh'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-slate-500">
              Tidak ada jadwal praktik pada tanggal ini.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
