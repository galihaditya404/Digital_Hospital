
import { createClient } from '@/lib/supabase/server'
import { getBookingConfirmation } from '@/lib/actions/booking'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Calendar, Clock, Download, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default async function BookingSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>
}) {
    const params = await searchParams
    const bookingId = params.id

    if (!bookingId) {
        redirect('/booking')
    }

    const booking = await getBookingConfirmation(bookingId)

    if (!booking) {
        return (
            <div className="min-h-screen pt-32 text-center">
                <h1 className="text-2xl font-bold text-red-600">Booking tidak ditemukan</h1>
                <Link href="/booking" className="text-blue-600 hover:underline mt-4 block">
                    Kembali ke Booking
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 pt-32">
            <div className="container mx-auto px-4 max-w-xl">
                <div className="text-center mb-8">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Booking Berhasil!</h1>
                    <p className="text-slate-600 mt-2">
                        Terima kasih telah melakukan booking. Silakan simpan detail berikut.
                    </p>
                </div>

                <Card className="overflow-hidden border-t-4 border-t-green-500 shadow-lg">
                    <CardContent className="p-8 space-y-8">
                        <div className="text-center bg-slate-50 p-6 rounded-lg border border-slate-100">
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Nomor Antrian</p>
                            <p className="text-5xl font-bold text-blue-600 mt-2">A-{String(booking.queue_number).padStart(3, '0')}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between border-b pb-4">
                                <span className="text-slate-500">Kode Booking</span>
                                <span className="font-mono font-bold text-slate-900">{booking.id.slice(0, 8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between border-b pb-4">
                                <span className="text-slate-500">Dokter</span>
                                <div className="text-right">
                                    <span className="block font-medium text-slate-900">{booking.doctors?.profiles?.full_name}</span>
                                    <span className="text-xs text-blue-600">{booking.doctors?.specialization}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b pb-4">
                                <span className="text-slate-500">Tanggal</span>
                                <div className="flex items-center gap-2 font-medium text-slate-900">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    {format(new Date(booking.appointment_date), 'EEEE, d MMMM yyyy', { locale: id })}
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b pb-4">
                                <span className="text-slate-500">Estimasi Jam</span>
                                <div className="flex items-center gap-2 font-medium text-slate-900">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    {booking.schedules?.start_time?.slice(0, 5)} - {booking.schedules?.end_time?.slice(0, 5)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline" className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Simpan
                            </Button>
                            <Button variant="outline" className="w-full">
                                <Share2 className="mr-2 h-4 w-4" />
                                Bagikan
                            </Button>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Link href={`/antrian?code=${booking.id}`} className="w-full">
                                <Button className="w-full h-12 text-base">
                                    Cek Status Antrian
                                </Button>
                            </Link>
                            <Link href="/" className="w-full block">
                                <Button variant="ghost" className="w-full text-slate-500">
                                    Kembali ke Beranda
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
