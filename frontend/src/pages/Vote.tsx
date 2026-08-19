import { useState, useEffect } from 'react'
import { getPublicCandidates, getPublicDuos, submitBallot, getSystemSettings, verifyVoteCode } from '../services/api'
import type { Candidate, Duo, SystemSettings, VoteCategory } from '../types'
import { CheckCircle, AlertCircle, Crown, Star, Users, Lock, KeyRound } from 'lucide-react'
import PageIntro from '../components/PageIntro'

type Category = VoteCategory

export default function Vote() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [category, setCategory] = useState<Category>('ROI')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [duos, setDuos] = useState<Duo[]>([])
  const [selections, setSelections] = useState<Record<Category, string | null>>({ ROI: null, REINE: null, DUO: null })
  const [voteCode, setVoteCode] = useState('')
  const [codeVerified, setCodeVerified] = useState(false)
  const [verifyingCode, setVerifyingCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getPublicCandidates(), getPublicDuos(), getSystemSettings()])
      .then(([cRes, dRes, sRes]) => {
        setCandidates(cRes)
        setDuos(dRes)
        setSettings(sRes)
      })
      .finally(() => setDataLoading(false))
  }, [])


  const handleVerifyCode = async () => {
    setVerifyingCode(true)
    setError('')
    try {
      await verifyVoteCode(voteCode.trim().toUpperCase())
      setVoteCode(voteCode.trim().toUpperCase())
      setCodeVerified(true)
    } catch (err: any) {
      const msg = err?.response?.data?.detail
      setError(typeof msg === 'string' ? msg : 'Impossible de vérifier ce code.')
    } finally {
      setVerifyingCode(false)
    }
  }

  const handleVote = async () => {
    if (!selections.ROI || !selections.REINE || !selections.DUO) return
    setLoading(true)
    setError('')
    try {
      await submitBallot({
        code: voteCode,
        roi_candidate_id: selections.ROI,
        reine_candidate_id: selections.REINE,
        duo_id: selections.DUO,
      })
      setSuccess('Votre bulletin pour les trois catégories a bien été enregistré ! 🎉')
      setSelections({ ROI: null, REINE: null, DUO: null })
      setVoteCode('')
      setCodeVerified(false)
    } catch (err: any) {
      const msg = err?.response?.data?.detail
      setError(typeof msg === 'string' ? msg : "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { key: 'ROI' as Category, label: 'Roi', icon: Crown },
    { key: 'REINE' as Category, label: 'Reine', icon: Star },
    { key: 'DUO' as Category, label: 'Duo', icon: Users },
  ]

  const currentList = category === 'DUO'
    ? duos
    : candidates.filter(c => c.category === category)

  if (dataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="text-5xl animate-pulse mb-4">🎭</div>
        <p className="text-[#B08233] tracking-widest">Chargement...</p>
      </div>
    )
  }

  if (settings && settings.voting_status !== 'OPEN') {
    return (
      <div className="min-h-screen flex flex-col items-center pt-32 px-4 pb-16">
        <PageIntro eyebrow="Le choix vous appartient" title="VOTER" />
        <div className="luxury-card w-full max-w-lg p-10 flex flex-col items-center text-center gap-4">
          <Lock size={48} className="text-[#C5A059]" />
          <h3 className="text-2xl font-bold text-[#2C221E]" style={{ fontFamily: 'var(--font-serif)' }}>
            Votes fermés
          </h3>
          <p className="text-[#4A3C33]">Les votes sont actuellement fermés. Revenez bientôt !</p>
          <p className="text-xs text-[#B08233] tracking-widest">✦ 19 AOÛT 2026 — QUEEN FAFA PALACE ✦</p>
        </div>
      </div>
    )
  }

  if (!codeVerified) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center pt-32 pb-16 px-4">
        <PageIntro eyebrow="Accès au scrutin" title="VOTER" description="Saisissez le code à usage unique remis par l'agent d'accueil." />
        <div className="luxury-card w-full max-w-lg p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full flex items-center justify-center bg-[#F5EDCC] text-[#B08233]"><KeyRound size={26} /></div>
          <h2 className="text-2xl font-bold text-[#2C221E]" style={{ fontFamily: 'var(--font-serif)' }}>Votre code de vote</h2>
          <p className="mt-2 text-sm text-[#4A3C33]">Ce code ne peut être utilisé qu'une seule fois pour votre bulletin complet.</p>
          {success && <div className="toast-success mt-5 flex items-center gap-2 text-left"><CheckCircle size={17} /><span>{success}</span></div>}
          {error && <div className="toast-error mt-5 flex items-center gap-2 text-left"><AlertCircle size={17} /><span>{error}</span></div>}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <input className="input-elegant text-center font-semibold tracking-[0.35em] uppercase" maxLength={6} placeholder="ABC123" value={voteCode} onChange={event => setVoteCode(event.target.value.toUpperCase())} />
            <button className="btn-gold whitespace-nowrap" onClick={handleVerifyCode} disabled={verifyingCode || voteCode.trim().length !== 6}>{verifyingCode ? 'Vérification…' : 'Continuer'}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center pt-32 pb-16 px-4">
      <PageIntro
        eyebrow="Le choix vous appartient"
        title="VOTER"
        description="Sélectionnez votre favori et faites vivre la magie du Bal Masqué."
      />

      <div className="luxury-card w-full max-w-2xl p-8 bg-white/70 space-y-6">

        {/* Category tabs */}
        <div className="flex gap-3">
          {categories.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
            onClick={() => { setCategory(key); setError('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${
                category === key
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-lg'
                  : 'bg-white text-[#B08233] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
              {selections[key] && <CheckCircle size={15} />}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
            <CheckCircle size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Candidate list */}
        {currentList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎭</div>
            <p className="text-[#B08233] tracking-widest">Aucun candidat disponible pour cette catégorie.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {category === 'DUO' ? (
              (currentList as Duo[]).map(d => {
                const isSelected = selections.DUO === d.id
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelections(current => ({ ...current, DUO: d.id }))}
                    className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#FDF8EC] shadow-md'
                        : 'border-[#E8E0CC] bg-white hover:border-[#D4AF37]/50'
                    }`}
                  >
                    {d.duo_name && <div className="mb-3 break-words font-bold text-[#B08233]" style={{ fontFamily: 'var(--font-serif)' }}>{d.duo_name}</div>}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#F0E8CC] text-center text-lg font-bold leading-[3.5rem] text-[#B08233]">
                          {d.cavalier_photo_url ? (
                            <img src={d.cavalier_photo_url} alt={`${d.cavalier_first_name} ${d.cavalier_last_name}`} className="h-full w-full object-cover" />
                          ) : d.cavalier_first_name[0]}
                        </div>
                        <span className="min-w-0 break-words text-sm leading-snug text-[#2C221E]">{d.cavalier_first_name} {d.cavalier_last_name}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#F0E8CC] text-center text-lg font-bold leading-[3.5rem] text-[#B08233]">
                          {d.cavaliere_photo_url ? (
                            <img src={d.cavaliere_photo_url} alt={`${d.cavaliere_first_name} ${d.cavaliere_last_name}`} className="h-full w-full object-cover" />
                          ) : d.cavaliere_first_name[0]}
                        </div>
                        <span className="min-w-0 break-words text-sm leading-snug text-[#2C221E]">{d.cavaliere_first_name} {d.cavaliere_last_name}</span>
                      </div>
                    </div>
                    {isSelected && <div className="flex justify-end mt-1"><CheckCircle size={16} className="text-[#D4AF37]" /></div>}
                  </button>
                )
              })
            ) : (
              (currentList as Candidate[]).map((c, i) => {
                const isSelected = selections[category] === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelections(current => ({ ...current, [category]: c.id }))}
                    className={`group w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all border-2 ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#FDF8EC] shadow-md'
                        : 'border-[#E8E0CC] bg-white hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <div className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#5C4316] sm:h-28 sm:w-24 ${
                      isSelected ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#FDF8EC]' : ''
                    }`}>
                      {c.photo_url ? (
                        <img
                          src={c.photo_url}
                          alt={`${c.first_name} ${c.last_name}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center font-serif text-4xl font-bold text-white/90">{c.first_name[0]}</span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#1D1512]/60 to-transparent" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-[#2C221E]" style={{ fontFamily: 'var(--font-serif)' }}>{c.first_name} {c.last_name}</div>
                      <div className="mt-1 text-xs text-[#B08233] tracking-widest">Candidat N° {i + 1}</div>
                    </div>
                    {isSelected && <CheckCircle size={20} className="text-[#D4AF37] flex-shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        )}

        <button
          className="btn-gold w-full"
          onClick={handleVote}
          disabled={!selections.ROI || !selections.REINE || !selections.DUO || loading}
        >
          {loading ? 'Enregistrement...' : '✨ Confirmer mon bulletin'}
        </button>
      </div>
    </div>
  )
}
