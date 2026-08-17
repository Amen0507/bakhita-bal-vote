import { useState, useEffect } from 'react'
import { getPublicCandidates, getPublicDuos, getVoteResults } from '../services/api'
import { Crown, Star, Users, Lock } from 'lucide-react'
import PageIntro from '../components/PageIntro'

interface ResultEntry { candidate_id?: string; duo_id?: string; votes: number }

interface Results {
  roi: ResultEntry[]
  reine: ResultEntry[]
  duo: ResultEntry[]
}

function PodiumCard({ rank, entry, type, name }: { rank: number; entry: ResultEntry; type: 'roi' | 'reine' | 'duo'; name?: string }) {
  const medals = ['🥇', '🥈', '🥉']
  const medal = medals[rank - 1] || `#${rank}`

  const icons = { roi: '👑', reine: '⭐', duo: '💫' }

  return (
    <div
      className="luxury-card p-4 rounded-xl flex items-center gap-3 animate-fade-up"
      style={{
        animationDelay: `${rank * 0.1}s`,
        background: rank === 1
          ? 'linear-gradient(135deg, rgba(197,160,89,0.15) 0%, rgba(212,175,55,0.25) 100%)'
          : 'rgba(255,255,255,0.7)',
        border: rank === 1 ? '1.5px solid var(--color-gold)' : '1px solid #E8E0CC',
        boxShadow: rank === 1 ? '0 4px 20px rgba(212,175,55,0.2)' : '0 2px 8px rgba(44,34,30,0.05)',
      }}
    >
      <div className="text-2xl flex-shrink-0">{medal}</div>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-base"
        style={{ background: 'linear-gradient(135deg, #C5A059, #D4AF37)' }}>
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: 'var(--color-espresso)' }}>
          {name || 'Participant du Bal'}
        </div>
        <div
          className="font-bold text-xl"
          style={{ fontFamily: 'var(--font-serif)', color: rank === 1 ? 'var(--color-gold-dark)' : 'var(--color-espresso)' }}
        >
          {entry.votes}
          <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-espresso-light)', opacity: 0.6 }}>
            votes
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Results() {
  const [results, setResults] = useState<Results | null>(null)
  const [notPublished, setNotPublished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([getVoteResults(), getPublicCandidates(), getPublicDuos()])
      .then(([res, candidates, duos]) => {
        setResults(res)
        setParticipantNames({
          ...Object.fromEntries(candidates.map(candidate => [candidate.id, `${candidate.first_name} ${candidate.last_name}`])),
          ...Object.fromEntries(duos.map(duo => [
            duo.id,
            duo.duo_name || `${duo.cavalier_first_name} ${duo.cavalier_last_name} & ${duo.cavaliere_first_name} ${duo.cavaliere_last_name}`,
          ])),
        })
      })
      .catch(err => {
        if (err?.response?.status === 403) setNotPublished(true)
        else setError(true)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="text-4xl mb-3 animate-shimmer">🏆</div>
        <p className="text-sm" style={{ color: 'var(--color-espresso-light)', opacity: 0.6 }}>
          Chargement des résultats...
        </p>
      </div>
    )
  }

  if (notPublished) {
    return (
      <div className="min-h-screen max-w-2xl mx-auto px-4 pt-32 pb-16 animate-fade-up">
        <PageIntro eyebrow="Le verdict approche" title="RÉSULTATS" />
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #1a1208 0%, #2C221E 100%)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <Lock size={40} style={{ color: 'var(--color-gold)', margin: '0 auto 16px' }} />
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37' }}
          >
            Mystère & Suspense...
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Les résultats du bal seront dévoilés prochainement par l'administration...
          </p>
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-xs tracking-widest" style={{ color: 'rgba(212,175,55,0.6)' }}>
              ✦ 19 AOÛT 2026 — QUEEN FAFA PALACE ✦
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen max-w-2xl mx-auto px-4 pt-32 pb-16">
        <PageIntro eyebrow="Le palmarès" title="RÉSULTATS" />
        <div className="luxury-card p-8 text-center">
          <p className="text-[#4A3C33]">Impossible de charger les résultats pour le moment.</p>
          <p className="text-sm mt-2 text-[#B08233]">Veuillez réessayer dans quelques instants.</p>
        </div>
      </div>
    )
  }

  if (!results) return null

  const sections = [
    { key: 'roi', label: 'Roi du Bal', icon: Crown, data: results.roi },
    { key: 'reine', label: 'Reine du Bal', icon: Star, data: results.reine },
    { key: 'duo', label: 'Duo du Bal', icon: Users, data: results.duo },
  ] as const

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 pt-32 pb-16">
      <PageIntro
        eyebrow="Le palmarès"
        title="RÉSULTATS"
        description="Découvrez les favoris élus par les invités du Bal Masqué 2026."
      />

      <div className="space-y-8 mb-4">
        {sections.map(({ key, label, icon: Icon, data }) => (
          <div key={key}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C5A059, #D4AF37)' }}>
                <Icon size={14} style={{ color: '#2C221E' }} />
              </div>
              <span className="font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)' }}>
                {label}
              </span>
            </div>
            {data.length === 0 ? (
              <div className="text-center py-4 text-sm" style={{ color: 'var(--color-espresso-light)', opacity: 0.5 }}>
                Aucun vote enregistré
              </div>
            ) : (
              <div className="space-y-2">
                {data.slice(0, 3).map((entry, i) => (
                  <PodiumCard key={i} rank={i + 1} entry={entry} type={key} name={participantNames[entry.candidate_id || entry.duo_id || '']} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
