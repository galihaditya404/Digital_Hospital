import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
  steps: { id: number; label: string }[]
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="relative flex w-full items-center justify-between">
      <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 bg-slate-100" />
      <div 
        className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 bg-blue-600 transition-all duration-300" 
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />
      
      {steps.map((step) => {
        const isCompleted = step.id < currentStep
        const isCurrent = step.id === currentStep

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                isCompleted
                  ? "border-blue-600 bg-blue-600 text-white"
                  : isCurrent
                  ? "border-blue-600 bg-white text-blue-600"
                  : "border-slate-200 bg-white text-slate-400"
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : step.id}
            </div>
            <span
              className={cn(
                "hidden text-xs font-medium sm:block",
                isCompleted || isCurrent ? "text-blue-600" : "text-slate-400"
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
