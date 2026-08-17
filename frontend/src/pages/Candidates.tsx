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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div key={c.id} className="luxury-card flex flex-col items-center p-8 bg-white/70 text-center animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-[#D4AF37] to-[#C5A059] text-white shadow-inner mb-4 overflow-hidden">
                      {c.photo_url ? (
                        <img src={c.photo_url} alt={`${c.first_name} ${c.last_name}`} className="w-full h-full object-cover" />
                      ) : c.first_name[0]}
                    </div>
                    <h3 className="text-xl font-bold text-[#2C221E] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                      {c.first_name} {c.last_name}
                    </h3>
                    <div className="text-xs font-semibold tracking-widest uppercase text-[#B08233] mb-4">
                      Candidat N° {i + 1}
                    </div>
                  </div>
                ))
              )
            ) : (
              duos.length === 0 ? (
                <div className="col-span-full"><EmptyState /></div>
              ) : (
                duos.map((d, i) => (
                  <div key={d.id} className="luxury-card flex flex-col items-center p-8 bg-white/70 text-center animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    {d.duo_name && (
                      <h3 className="text-xl font-bold text-[#2C221E] mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                        {d.duo_name}
                      </h3>
                    )}
                    <div className="flex items-center justify-center gap-4 w-full">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-[#D4AF37] to-[#C5A059] text-white shadow-inner mb-2 overflow-hidden">
                          {d.cavalier_photo_url ? <img src={d.cavalier_photo_url} alt={d.cavalier_first_name} className="w-full h-full object-cover" /> : d.cavalier_first_name[0]}
                        </div>
                        <div className="text-sm font-semibold text-[#2C221E]">{d.cavalier_first_name}</div>
                      </div>
                      <span className="text-[#D4AF37] text-2xl">❤</span>
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-[#D4AF37] to-[#C5A059] text-white shadow-inner mb-2 overflow-hidden">
                          {d.cavaliere_photo_url ? <img src={d.cavaliere_photo_url} alt={d.cavaliere_first_name} className="w-full h-full object-cover" /> : d.cavaliere_first_name[0]}
                        </div>
                        <div className="text-sm font-semibold text-[#2C221E]">{d.cavaliere_first_name}</div>
                      </div>
                    </div>
                  </div>
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
