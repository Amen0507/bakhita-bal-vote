import { useState, useEffect } from 'react'
import { getPublicCandidates, getPublicDuos, getVoteResults } from '../services/api'
import { Crown, Star, Users, Lock } from 'lucide-react'
import PageIntro from '../components/PageIntro'

interface ResultEntry { candidate_id?: string; duo_id?: string; votes: number }
interface Participant { name: string; photoUrls: string[] }

interface Results {
  roi: ResultEntry[]
  reine: ResultEntry[]
  duo: ResultEntry[]
}

function PodiumCard({ rank, entry, type, participant }: { rank: number; entry: ResultEntry; type: 'roi' | 'reine' | 'duo'; participant?: Participant }) {
  const medals = ['🥇', '🥈', '🥉']
  const medal = medals[rank - 1] || `#${rank}`
  const icons = { roi: '👑', reine: '⭐', duo: '💫' }
  const photoUrls = participant?.photoUrls || []

  return (
    <div
      className="group relative min-h-28 overflow-hidden rounded-2xl border animate-fade-up"
      style={{
        animationDelay: `${rank * 0.1}s`,
        background: rank === 1
          ? 'linear-gradient(135deg, #2C221E 0%, #4A3C33 100%)'
          : 'rgba(253,252,250,0.92)',
        borderColor: rank === 1 ? '#D4AF37' : 'rgba(212,175,55,0.35)',
        boxShadow: rank === 1 ? '0 10px 26px rgba(44,34,30,0.28)' : '0 5px 16px rgba(44,34,30,0.09)',
      }}
    >
      <div className="flex min-h-28">
        <div className="relative w-28 flex-shrink-0 overflow-hidden sm:w-36">
          {photoUrls.length > 0 ? (
            <div className={`grid h-full ${photoUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {photoUrls.slice(0, 2).map((photoUrl, index) => (
                <img key={index} src={photoUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#C5A059] to-[#D4AF37] text-3xl">
              {icons[type]}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#2C221E]/25" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-4 sm:px-5">
          <div className="text-2xl leading-none sm:text-3xl">{medal}</div>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[0.6rem] font-bold tracking-[0.2em] uppercase" style={{ color: rank === 1 ? '#E8C547' : '#B08233' }}>
              {rank === 1 ? 'En tête du classement' : `Position ${rank}`}
            </p>
            <h3 className="truncate text-lg font-bold sm:text-xl" style={{ fontFamily: 'var(--font-serif)', color: rank === 1 ? '#FFFFFF' : '#2C221E' }}>
              {participant?.name || 'Participant du Bal'}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold leading-none sm:text-3xl" style={{ fontFamily: 'var(--font-serif)', color: rank === 1 ? '#F5E5AD' : '#B08233' }}>
              {entry.votes}
            </div>
            <div className="mt-1 text-[0.6rem] font-semibold tracking-widest uppercase" style={{ color: rank === 1 ? 'rgba(255,255,255,0.6)' : '#4A3C33' }}>
              votes
            </div>
          </div>
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
  const [participants, setParticipants] = useState<Record<string, Participant>>({})

  useEffect(() => {
    Promise.all([getVoteResults(), getPublicCandidates(), getPublicDuos()])
      .then(([res, candidates, duos]) => {
        setResults(res)
        setParticipants({
          ...Object.fromEntries(candidates.map(candidate => [candidate.id, {
            name: `${candidate.first_name} ${candidate.last_name}`,
            photoUrls: candidate.photo_url ? [candidate.photo_url] : [],
          }])),
          ...Object.fromEntries(duos.map(duo => [
            duo.id, {
              name: duo.duo_name || `${duo.cavalier_first_name} ${duo.cavalier_last_name} & ${duo.cavaliere_first_name} ${duo.cavaliere_last_name}`,
              photoUrls: [duo.cavalier_photo_url, duo.cavaliere_photo_url].filter((photoUrl): photoUrl is string => Boolean(photoUrl)),
            },
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

      <div className="space-y-10 mb-4">
        {sections.map(({ key, label, icon: Icon, data }) => (
          <div key={key}>
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #C5A059, #D4AF37)' }}>
                <Icon size={14} style={{ color: '#2C221E' }} />
              </div>
              <span className="text-xl font-semibold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-espresso)' }}>
                {label}
              </span>
            </div>
            {data.length === 0 ? (
              <div className="text-center py-4 text-sm" style={{ color: 'var(--color-espresso-light)', opacity: 0.5 }}>
                Aucun vote enregistré
              </div>
            ) : (
              <div className="space-y-3">
                {data.slice(0, 3).map((entry, i) => (
                  <PodiumCard key={i} rank={i + 1} entry={entry} type={key} participant={participants[entry.candidate_id || entry.duo_id || '']} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
