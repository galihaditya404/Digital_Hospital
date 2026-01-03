'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Types for the appointment data
type QueueAppointment = {
    id: string;
    queue_number: number;
    status: 'booked' | 'waiting' | 'in_progress' | 'completed' | 'cancelled';
    appointment_date: string;
    doctor: {
        full_name: string;
        specialization: string;
    };
    patient: {
        full_name: string;
    };
};

export default function QueueStatusPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [appointment, setAppointment] = useState<QueueAppointment | null>(null);
    const [currentQueue, setCurrentQueue] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const supabase = createClient();

    // Helper: Mask Name
    const maskName = (fullName: string) => {
        if (!fullName) return '';
        const parts = fullName.split(' ');
        // Handle single word names
        if (parts.length === 1) {
            if (parts[0].length <= 2) return parts[0];
            return parts[0][0] + '*'.repeat(parts[0].length - 2) + parts[0][parts[0].length - 1];
        }
        return parts.map(part => {
            if (part.length <= 2) return part;
            return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
        }).join(' ');
    };

    // Helper: Get Badge Color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'waiting': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'in_progress': return 'bg-green-500 hover:bg-green-600';
            case 'completed': return 'bg-gray-500 hover:bg-gray-600';
            case 'cancelled': return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-blue-500 hover:bg-blue-600'; // booked
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'waiting': return 'Menunggu';
            case 'in_progress': return 'Sedang Dilayani';
            case 'completed': return 'Selesai';
            case 'cancelled': return 'Dibatalkan';
            default: return 'Terdaftar';
        }
    };

    // 1. SEARCH FUNCTION
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setAppointment(null);
        setCurrentQueue(null);

        try {
            // Search logic: Use RPC 'get_queue_status' to bypass RLS securely
            const { data, error: searchError } = await supabase
                .rpc('get_queue_status', { query_input: searchQuery });

            if (searchError) throw searchError;

            // data might be null if not found (RPC returns null)
            if (!data) {
                setError('Booking tidak ditemukan. Pastikan kode booking atau nomor telepon benar.');
                return;
            }

            // Data is already formatted by RPC, but needs type alignment
            const formattedAppt: QueueAppointment = {
                id: (data as any).id,
                queue_number: (data as any).queue_number,
                status: (data as any).status,
                appointment_date: (data as any).appointment_date,
                doctor: {
                    full_name: (data as any).doctor.full_name,
                    specialization: (data as any).doctor.specialization
                },
                patient: {
                    full_name: (data as any).patient.full_name
                }
            };

            setAppointment(formattedAppt);
            setLastUpdated(new Date());

            // Fetch current queue position
            fetchCurrentQueue((data as any).doctor_id, (data as any).appointment_date);

        } catch (err: any) {
            console.error(err);
            setError('Terjadi kesalahan saat mencari data.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to fetch current serving queue
    const fetchCurrentQueue = async (doctorId: any, date: string, myQueue: number = 0) => {
        const { data } = await supabase
            .rpc('get_current_serving_queue', { p_doctor_id: doctorId, p_date: date });

        const servingQueue = data || 0;
        setCurrentQueue(servingQueue);
        setLastUpdated(new Date());
    };

    // 4. REALTIME UPDATES
    useEffect(() => {
        if (!appointment) return;

        // Subscribe to appointments table
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'appointments',
                    // Filter isn't fully supported for joined fields in Realtime, filtering is done here
                },
                (payload) => {
                    const newData = payload.new as any;

                    // If this is OUR appointment, update status
                    if (newData.id === appointment.id) {
                        setAppointment(prev => prev ? ({ ...prev, status: newData.status }) : null);
                        toast.info(`Status antrian Anda berubah menjadi: ${getStatusLabel(newData.status)}`);
                    }

                    // If update is for the SAME doctor and date, refresh stats
                    // We need to know the doctor_id and date from the original search result.
                    // Since we don't store doctor_id in 'appointment' state, we might need to rely on re-fetching or store it.
                    // Actually, the page refreshed logic relies on 'fetchCurrentQueue' which needs doctor_id.
                    // Let's reload everything cleanly if we detect activity.
                    refreshQueueStats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [appointment?.id]);

    const refreshQueueStats = async () => {
        if (!appointment) return;

        // We need doctor_id. Fetch from appointment ID (secure RPC again? or standard select?)
        // Standard select works if we are the owner or have permissions. 
        // BUT we established RLS is blocking.
        // So we should use the same RPC or just reuse the data we had.
        // Problem: 'appointment' state doesn't have doctor_id.
        // Solution: Let's assume we can re-call the search logic or just fetch queue number.

        // We can't easily get doctor_id if we didn't save it.
        // Quick Fix: Add doctor_id to the QueueAppointment type for internal use?
        // Or just re-run the RPC with the ID we have.
        const { data } = await supabase.rpc('get_queue_status', { query_input: appointment.id });
        if (data) {
            fetchCurrentQueue((data as any).doctor_id, (data as any).appointment_date);
        }
    };

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4 space-y-8">

            {/* Search Section */}
            <div className="space-y-4 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Cek Status Antrian</h1>
                <p className="text-muted-foreground">
                    Masukkan kode booking atau nomor telepon untuk melihat status antrian Anda secara real-time.
                </p>
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
                    <Input
                        placeholder="Kode Booking / Nomor Telepon"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Cari
                    </Button>
                </form>
            </div>

            {/* Error State */}
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Tidak Ditemukan</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Result Display */}
            {appointment && (
                <Card className="border-2 border-primary/10 shadow-lg">
                    <CardHeader className="bg-muted/30 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="scroll-m-20 text-xl font-semibold tracking-tight">
                                    {maskName(appointment.patient.full_name)}
                                </CardTitle>
                                <CardDescription>
                                    {appointment.doctor.full_name} • {appointment.doctor.specialization}
                                </CardDescription>
                            </div>
                            <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                                {getStatusLabel(appointment.status)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">

                        {/* Queue Number Display */}
                        <div className="text-center space-y-2">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                                Nomor Antrian
                            </p>
                            <div className="text-6xl font-black text-primary tracking-tighter">
                                {`A-${String(appointment.queue_number).padStart(3, '0')}`}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(appointment.appointment_date), 'EEEE, d MMMM yyyy', { locale: id })}
                            </p>
                        </div>

                        {/* Live Stats */}
                        <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border">
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground uppercase">Antrian Saat Ini</p>
                                <p className="text-2xl font-bold">
                                    {currentQueue ? `A-${String(currentQueue).padStart(3, '0')}` : '-'}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground uppercase">Sisa Antrian</p>
                                <p className="text-2xl font-bold">
                                    {currentQueue && appointment.queue_number > currentQueue
                                        ? Math.max(0, appointment.queue_number - currentQueue)
                                        : 0}
                                </p>
                            </div>
                        </div>

                        {/* Near Notification */}
                        {currentQueue && (appointment.queue_number - currentQueue) <= 3 && (appointment.queue_number - currentQueue) > 0 && appointment.status === 'waiting' && (
                            <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                                <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                                <AlertTitle>Perhatian</AlertTitle>
                                <AlertDescription>
                                    Antrian Anda hampir tiba! Mohon bersiap di area tunggu.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Footer Info */}
                        <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t">
                            <p>Estimasi waktu: ~15 menit / pasien</p>
                            <p>
                                Update otomatis {lastUpdated && `• ${lastUpdated.toLocaleTimeString()}`}
                            </p>
                        </div>

                    </CardContent>
                </Card>
            )}

        </div>
    );
}
