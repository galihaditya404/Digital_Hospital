'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { FileUp, Paperclip } from 'lucide-react'

interface ComplaintData {
  complaint: string
  referralFile: File | null
}

interface ComplaintStepProps {
  initialData?: Partial<ComplaintData>
  onSubmit: (data: ComplaintData) => void
}

export function ComplaintStep({ initialData, onSubmit }: ComplaintStepProps) {
  const [complaint, setComplaint] = useState(initialData?.complaint || '')
  const [file, setFile] = useState<File | null>(initialData?.referralFile || null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ complaint, referralFile: file })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 bg-white p-6 rounded-lg border shadow-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="complaint">Keluhan atau Gejala</Label>
          <Textarea 
            id="complaint"
            placeholder="Jelaskan keluhan atau gejala yang Anda rasakan secara detail..."
            className="min-h-[150px] resize-none"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Surat Rujukan (Jika ada)</Label>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
            <Input 
              id="file" 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0])
                }
              }}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <FileUp className="h-8 w-8 text-blue-500" />
              {file ? (
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Paperclip className="h-4 w-4" />
                  {file.name}
                </div>
              ) : (
                <>
                   <span className="font-medium">Klik untuk upload file</span>
                   <span className="text-xs">PDF, JPG, PNG (Max 5MB)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-base">
        Lanjutkan
      </Button>
    </form>
  )
}
