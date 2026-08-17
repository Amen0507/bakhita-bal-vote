import { useState, useEffect } from 'react'
import { getPublicCandidates, getPublicDuos } from '../services/api'
import type { Candidate, Duo } from '../types'
import { Crown, Star, Users } from 'lucide-react'
import PageIntro from '../components/PageIntro'

type Tab = 'ROI' | 'REINE' | 'DUO'

export default function Candidates() {
  const [tab, setTab] = useState<Tab>('ROI')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [duos, setDuos] = useState<Duo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPublicCandidates(), getPublicDuos()])
      .then(([cRes, dRes]) => {
        setCandidates(cRes)
        setDuos(dRes)
      })
      .finally(() => setLoading(false))
  }, [])

  const rois = candidates.filter(c => c.category === 'ROI')
  const reines = candidates.filter(c => c.category === 'REINE')

  const tabs = [
    { key: 'ROI', label: 'Candidats Roi', icon: Crown, count: rois.length },
    { key: 'REINE', label: 'Candidates Reine', icon: Star, count: reines.length },
    { key: 'DUO', label: 'Duos', icon: Users, count: duos.length },
  ] as const

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center pt-32 pb-16 overflow-x-hidden px-4">
      <PageIntro
        eyebrow="La cour du Bal"
        title="LES CANDIDATS"
        description="Découvrez celles et ceux qui feront rayonner cette soirée d'exception."
      />

      {/* Tabs */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-4 mb-10">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all shadow-md ${
              tab === key
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white hover:from-[#C5A059] hover:to-[#B08233]'
                : 'bg-white/80 text-[#B08233] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
            <span className="text-xs bg-[#4A3C33] text-white px-2 py-0.5 rounded-full">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="w-full max-w-5xl">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-white/50 border border-[#D4AF37]/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tab !== 'DUO' ? (
              (tab === 'ROI' ? rois : reines).length === 0 ? (
                <div className="col-span-full"><EmptyState /></div>
              ) : (
                (tab === 'ROI' ? rois : reines).map((c, i) => (
                  <article key={c.id} className="group relative overflow-hidden rounded-2xl border border-[#D4AF37]/50 bg-[#2C221E] shadow-xl animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#D4AF37] to-[#5C4316]">
                      {c.photo_url ? (
                        <img src={c.photo_url} alt={`${c.first_name} ${c.last_name}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <span className="flex h-full items-center justify-center font-serif text-8xl font-bold text-white/90">{c.first_name[0]}</span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1D1512] via-[#1D1512]/15 to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full border border-[#F5EDCC]/70 bg-[#2C221E]/75 px-3 py-1 text-[0.65rem] font-bold tracking-[0.2em] text-[#F5EDCC] backdrop-blur-sm">
                        {tab === 'ROI' ? 'ROI' : 'REINE'} · {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-6 text-center text-white">
                        <p className="mb-2 text-[0.65rem] font-semibold tracking-[0.26em] text-[#E8C547] uppercase">Candidat officiel</p>
                        <h3 className="text-3xl font-bold leading-tight drop-shadow-lg" style={{ fontFamily: 'var(--font-serif)' }}>
                          {c.first_name} {c.last_name}
                        </h3>
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-[#8C6718] via-[#F5E5AD] to-[#8C6718]" />
                  </article>
                ))
              )
            ) : (
              duos.length === 0 ? (
                <div className="col-span-full"><EmptyState /></div>
              ) : (
                duos.map((d, i) => (
                  <article key={d.id} className="group relative overflow-hidden rounded-2xl border border-[#D4AF37]/50 bg-[#2C221E] shadow-xl animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="relative grid aspect-[4/5] grid-cols-2 overflow-hidden bg-[#2C221E]">
                      <div className="relative overflow-hidden bg-gradient-to-br from-[#D4AF37] to-[#5C4316]">
                        {d.cavalier_photo_url ? <img src={d.cavalier_photo_url} alt={`${d.cavalier_first_name} ${d.cavalier_last_name}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <span className="flex h-full items-center justify-center font-serif text-6xl font-bold text-white/90">{d.cavalier_first_name[0]}</span>}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1D1512]/90 to-transparent px-3 pb-4 pt-10 text-center text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>{d.cavalier_first_name}</div>
                      </div>
                      <div className="relative overflow-hidden bg-gradient-to-br from-[#C5A059] to-[#E8C547]">
                        {d.cavaliere_photo_url ? <img src={d.cavaliere_photo_url} alt={`${d.cavaliere_first_name} ${d.cavaliere_last_name}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <span className="flex h-full items-center justify-center font-serif text-6xl font-bold text-white/90">{d.cavaliere_first_name[0]}</span>}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1D1512]/90 to-transparent px-3 pb-4 pt-10 text-center text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>{d.cavaliere_first_name}</div>
                      </div>
                    </div>
                    <div className="absolute left-4 top-4 rounded-full border border-[#F5EDCC]/70 bg-[#2C221E]/75 px-3 py-1 text-[0.65rem] font-bold tracking-[0.2em] text-[#F5EDCC] backdrop-blur-sm">
                      DUO · {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-[#1D1512]/90 px-5 py-4 text-center text-white backdrop-blur-sm">
                      <p className="mb-1 text-[0.6rem] font-semibold tracking-[0.26em] text-[#E8C547] uppercase">Duo officiel</p>
                      <h3 className="text-xl font-bold leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>{d.duo_name || `${d.cavalier_first_name} & ${d.cavaliere_first_name}`}</h3>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-[#8C6718] via-[#F5E5AD] to-[#8C6718]" />
                  </article>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center w-full">
      <div className="text-6xl mb-6">🎭</div>
      <p className="text-lg font-semibold tracking-widest text-[#B08233] uppercase">
        Aucun candidat pour le moment
      </p>
    </div>
  )
}
