'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from "@/components/ui/calendar"

const patientFormSchema = z.object({
  full_name: z.string().min(2, 'Nama harus diisi'),
  nik: z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK harus angka'),
  birth_date: z.date({ required_error: 'Tanggal lahir harus diisi' }),
  gender: z.enum(['male', 'female'], { required_error: 'Pilih jenis kelamin' }),
  phone: z.string().min(10, 'Nomor HP tidak valid').regex(/^08\d+$/, 'Harus diawali 08'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  address: z.string().min(5, 'Alamat harus diisi'),
  insurance_type: z.enum(['umum', 'bpjs', 'asuransi_swasta']),
  insurance_number: z.string().optional(),
}).refine((data) => {
  if (data.insurance_type !== 'umum' && !data.insurance_number) {
    return false
  }
  return true
}, {
  message: "Nomor asuransi wajib diisi",
  path: ["insurance_number"],
})

export type PatientFormData = z.infer<typeof patientFormSchema>

interface PatientFormStepProps {
  initialData?: Partial<PatientFormData>
  onSubmit: (data: PatientFormData) => void
  isGuest?: boolean
}

export function PatientFormStep({ initialData, onSubmit, isGuest }: PatientFormStepProps) {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      nik: initialData?.nik || '',
      gender: initialData?.gender as 'male' | 'female' | undefined,
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
      insurance_type: (initialData?.insurance_type as any) || 'umum',
      insurance_number: initialData?.insurance_number || '',
      birth_date: initialData?.birth_date ? new Date(initialData.birth_date) : undefined
    },
  })

  // Watch insurance type to conditionally show number field
  const insuranceType = form.watch('insurance_type')

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {!initialData && (
        <div className="bg-blue-50 p-4 rounded-lg flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-blue-700">Sudah punya akun? Login untuk isi data otomatis.</p>
          <Button variant="outline" size="sm" className="bg-white text-blue-600 border-blue-200">
            Login Sekarang
          </Button>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Informasi Pribadi</h3>
            
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Sesuai KTP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIK</FormLabel>
                    <FormControl>
                      <Input placeholder="16 digit angka" {...field} maxLength={16} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pilih tanggal</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Jenis Kelamin</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Laki-laki
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Perempuan
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Telepon / WhatsApp</FormLabel>
                    <FormControl>
                      <Input placeholder="08xxxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="nama@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Lengkap</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Jl. Contoh No. 123, Kota..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 pt-4">
             <h3 className="font-semibold text-lg text-slate-900 border-b pb-2">Pembayaran & Asuransi</h3>
             
             <FormField
              control={form.control}
              name="insurance_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Pembayaran</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis pembayaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="umum">Umum (Bayar Sendiri)</SelectItem>
                      <SelectItem value="bpjs">BPJS Kesehatan</SelectItem>
                      <SelectItem value="asuransi_swasta">Asuransi Swasta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {insuranceType !== 'umum' && (
              <FormField
                control={form.control}
                name="insurance_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Kartu {insuranceType === 'bpjs' ? 'BPJS' : 'Asuransi'}</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nomor kartu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <Button type="submit" className="w-full h-12 text-base">
            Lanjutkan
          </Button>
        </form>
      </Form>
    </div>
  )
}
