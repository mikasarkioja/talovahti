import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh] w-full">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#002f6c]" />
        <p className="text-slate-500 font-medium animate-pulse">Ladataan...</p>
      </div>
    </div>
  )
}
