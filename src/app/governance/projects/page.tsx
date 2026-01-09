'use client'
import { useStore } from '@/lib/store'
import Link from 'next/link'
import { HardHat, ArrowRight, Clock, CheckCircle2 } from 'lucide-react'
import { clsx } from 'clsx'

export default function ProjectsPage() {
  const { projects } = useStore()

  const statusLabels: Record<string, string> = {
    DIAGNOSIS: '1. Diagnoosi & Valvoja',
    TECH_LEAD: '2. Urakkakilpailutus',
    CONSTRUCTION: '3. Toteutus',
    WARRANTY: '4. Takuuaika'
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <HardHat className="text-[#002f6c]" />
          Projektikeskus
        </h1>
        <p className="text-slate-500 mt-1">Hallinnoi isoja hankkeita (esim. Putkiremontti) ilman välikäsiä.</p>
      </header>

      <div className="grid gap-6">
        {projects.map(project => {
          const activeTender = project.tenders.find(t => t.status === 'OPEN' || t.status === 'REVIEW')
          
          return (
            <div key={project.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{project.type}</div>
                    <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
                  </div>
                  <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600">
                    {statusLabels[project.status]}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-slate-100 rounded-full mb-6">
                  <div 
                    className="absolute h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ 
                      width: project.status === 'DIAGNOSIS' ? '25%' : 
                             project.status === 'TECH_LEAD' ? '50%' : 
                             project.status === 'CONSTRUCTION' ? '75%' : '100%' 
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 font-medium">Vaihe</span>
                    <span>{statusLabels[project.status]}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 font-medium">Aktiivinen kilpailutus</span>
                    <span>{activeTender ? (activeTender.type === 'SUPERVISOR' ? 'Valvonta' : 'Urakka') : '-'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-500 font-medium">Viimeisin päivitys</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                {project.status === 'DIAGNOSIS' && (
                  <Link 
                    href={`/governance/projects/${project.id}/hire-supervisor`}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Valitse Valvoja <ArrowRight size={16} />
                  </Link>
                )}
                {project.status === 'TECH_LEAD' && (
                  <Link 
                    href={`/governance/projects/${project.id}/construction-tender`}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Kilpailuta Urakka <ArrowRight size={16} />
                  </Link>
                )}
                {project.status === 'CONSTRUCTION' && (
                  <Link 
                    href={`/governance/projects/${project.id}/execution`}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Työmaaportaali (Valvoja) <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
