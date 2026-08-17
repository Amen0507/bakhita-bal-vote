import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getSettings, updateSettings,
  getAdminCandidates, createAdminCandidate, deleteAdminCandidate,
  getAdminDuos, createAdminDuo, deleteAdminDuo,
  getAdminVoteResults, issueVoteCode
} from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  Settings, Users, LogOut, Crown, Star, Trash2, Plus,
  RefreshCw, Trophy, Ticket, Copy, Check
} from 'lucide-react'

type Tab = 'settings' | 'candidates' | 'duos' | 'results'

interface SettingsData {
  roi_limit: number; reine_limit: number
  roi_inscriptions_open: boolean; reine_inscriptions_open: boolean; duo_inscriptions_open: boolean
  voting_status: string; results_published: boolean
}

/* ─── Toggle — même look que les pages publiques mais fond sombre ─── */
function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}
    >
      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.78)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
        style={{
          background: value ? 'linear-gradient(to right, #C5A059, #D4AF37)' : 'rgba(255,255,255,0.12)',
          boxShadow: value ? '0 0 10px rgba(212,175,55,0.35)' : 'none',
          border: 'none', cursor: 'pointer',
        }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all"
          style={{ left: value ? '26px' : '2px' }}
        />
      </button>
    </div>
  )
}

/* ─── Card sombre avec bordure or — cohérente avec luxury-card ─── */
function AdminCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: 'rgba(44,34,30,0.75)',
        border: '1px solid rgba(212,175,55,0.22)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25), inset 0 0 20px rgba(212,175,55,0.03)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </div>
  )
}

/* ─── Input sombre — même forme que input-elegant ─── */
function DarkInput({ placeholder, value, onChange, required, type = 'text' }: {
  placeholder: string; value: string; onChange: (v: string) => void
  required?: boolean; type?: string
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      className="input-elegant"
      style={{
        background: 'rgba(255,255,255,0.06)',
        borderColor: 'rgba(212,175,55,0.28)',
        color: 'rgba(255,255,255,0.85)',
      }}
    />
  )
}

export default function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('settings')
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [settingsMsg, setSettingsMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [issuedVoteCode, setIssuedVoteCode] = useState<{ code: string; voter_number: number } | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const [candidates, setCandidates] = useState<any[]>([])
  const [duos, setDuos] = useState<any[]>([])
  const [voteResults, setVoteResults] = useState<any>(null)
  const [candidateNames, setCandidateNames] = useState<Record<string, string>>({})
  const [newCandidateForm, setNewCandidateForm] = useState({ category: 'ROI', first_name: '', last_name: '' })
  const [newDuoForm, setNewDuoForm] = useState({ cavalier_first_name: '', cavalier_last_name: '', cavaliere_first_name: '', cavaliere_last_name: '', duo_name: '' })
  const [addingCandidate, setAddingCandidate] = useState(false)
  const [addingDuo, setAddingDuo] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    document.body.classList.add('bg-admin')
    getSettings().then(r => setSettings(r)).catch(() => { logout(); navigate('/admin/login') })
    getAdminCandidates().then(r => {
      setCandidates(r)
      const map: Record<string, string> = {}
      r.forEach((c: any) => { map[c.id] = `${c.first_name} ${c.last_name}` })
      setCandidateNames(prev => ({ ...prev, ...map }))
    })
    getAdminDuos().then(r => {
      setDuos(r)
      const map: Record<string, string> = {}
      r.forEach((d: any) => { map[d.id] = d.duo_name || `${d.cavalier_first_name} & ${d.cavaliere_first_name}` })
      setCandidateNames(prev => ({ ...prev, ...map }))
    })
    getAdminVoteResults().then(r => setVoteResults(r)).catch(() => { })

    return () => document.body.classList.remove('bg-admin')
  }, [])

  const showMsg = (text: string, ok = true) => {
    setSettingsMsg({ text, ok })
    setTimeout(() => setSettingsMsg(null), 3000)
  }

  const saveSettings = async (patch: Partial<SettingsData>) => {
    if (!settings) return
    setSettings(prev => prev ? { ...prev, ...patch } : prev)
    try {
      await updateSettings(patch)
      showMsg('Paramètres sauvegardés ✓')
    } catch {
      showMsg('Erreur lors de la sauvegarde', false)
    }
  }

  const handleDeleteCandidate = async (id: string) => {
    setDeletingId(id)
    await deleteAdminCandidate(id)
    setCandidates(c => c.filter(x => x.id !== id))
    setDeletingId(null)
  }

  const handleDeleteDuo = async (id: string) => {
    setDeletingId(id)
    await deleteAdminDuo(id)
    setDuos(d => d.filter(x => x.id !== id))
    setDeletingId(null)
  }

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await createAdminCandidate({ ...newCandidateForm, is_manual_entry: true })
      setCandidates(c => [...c, res])
      setCandidateNames(prev => ({ ...prev, [res.id]: `${res.first_name} ${res.last_name}` }))
      setNewCandidateForm({ category: 'ROI', first_name: '', last_name: '' })
      setAddingCandidate(false)
      showMsg('Candidat ajouté ✓')
    } catch { showMsg("Erreur lors de l'ajout", false) }
  }

  const handleAddDuo = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await createAdminDuo({ ...newDuoForm, is_manual_entry: true })
      setDuos(d => [...d, res])
      setCandidateNames(prev => ({ ...prev, [res.id]: res.duo_name || `${res.cavalier_first_name} & ${res.cavaliere_first_name}` }))
      setNewDuoForm({ cavalier_first_name: '', cavalier_last_name: '', cavaliere_first_name: '', cavaliere_last_name: '', duo_name: '' })
      setAddingDuo(false)
      showMsg('Duo ajouté ✓')
    } catch { showMsg("Erreur lors de l'ajout", false) }
  }

  const handleIssueVoteCode = async () => {
    try {
      setIssuedVoteCode(await issueVoteCode())
      setCodeCopied(false)
    } catch {
      showMsg('Impossible de générer un code', false)
    }
  }

  const copyCode = () => {
    if (issuedVoteCode) {
      navigator.clipboard.writeText(issuedVoteCode.code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  const navTabs = [
    { key: 'settings', label: 'Paramètres', icon: Settings },
    { key: 'candidates', label: 'Candidats', icon: Users },
    { key: 'duos', label: 'Duos', icon: Crown },
    { key: 'results', label: 'Résultats', icon: Trophy },
  ] as const

  const roiCount = candidates.filter(c => c.category === 'ROI').length
  const reineCount = candidates.filter(c => c.category === 'REINE').length

  return (
    <div className="min-h-screen">
      {/* ─── Header — style identique au Header.tsx public mais sombre ─── */}
      <header
        className="w-full flex justify-center fixed top-0 z-50 border-b"
        style={{
          background: 'rgba(44,34,30,0.92)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(212,175,55,0.2)',
        }}
      >
        <div className="w-full max-w-2xl px-4">
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(197,160,89,0.15))',
                  border: '1px solid rgba(212,175,55,0.35)',
                }}
              >
                🎭
              </div>
              <div>
                <div
                  className="font-bold text-sm tracking-widest uppercase"
                  style={{ fontFamily: 'var(--font-serif)', color: '#C5A059' }}
                >
                  Bal Masqué
                </div>
                <div
                  className="text-[10px] tracking-widest uppercase"
                  style={{ color: 'rgba(212,175,55,0.45)' }}
                >
                  Administration
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => { logout(); navigate('/admin/login') }}
              className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg transition-all"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
            >
              <LogOut size={13} />
              Déconnexion
            </button>
          </div>

          {/* Tab nav — même style que les tabs de Candidates.tsx */}
          <div className="flex gap-1 pb-0 overflow-x-auto">
            {navTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap tracking-widest uppercase transition-all border-b-2"
                style={{
                  borderBottomColor: tab === key ? '#D4AF37' : 'transparent',
                  color: tab === key ? '#D4AF37' : 'rgba(212,175,55,0.45)',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Content ─── */}
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">

        {/* Toast flottant */}
        {settingsMsg && (
          <div
            className="animate-fade-up"
            style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              zIndex: 100, padding: '10px 20px', borderRadius: 12, fontSize: 13, whiteSpace: 'nowrap',
              ...(settingsMsg.ok
                ? { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }
                : { background: '#fef2f2', border: '1px solid #fecaca', color: '#b42318' }),
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {settingsMsg.text}
          </div>
        )}

        {/* ══ SETTINGS ══════════════════════════════════════════ */}
        {tab === 'settings' && settings && (
          <div className="animate-fade-up space-y-4">

            {/* Contrôle du scrutin */}
            <AdminCard>
              <div className="p-5">
                <h2 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37' }}>
                  Contrôle du Scrutin
                </h2>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Gérez l'état des votes et la publication des résultats
                </p>
                <div className="mb-3">
                  <label className="block text-xs font-semibold mb-2 tracking-widest uppercase" style={{ color: 'rgba(212,175,55,0.6)' }}>
                    Statut du Vote
                  </label>
                  <select
                    className="input-elegant"
                    value={settings.voting_status}
                    onChange={e => saveSettings({ voting_status: e.target.value })}
                    style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(212,175,55,0.28)', color: 'rgba(255,255,255,0.85)' }}
                  >
                    <option value="OPEN" style={{ background: '#2C221E' }}>🟢 Ouvert</option>
                    <option value="CLOSED" style={{ background: '#2C221E' }}>🔴 Fermé</option>
                  </select>
                </div>
                <Toggle value={settings.results_published} onChange={v => saveSettings({ results_published: v })} label="Publier les résultats" />
              </div>
            </AdminCard>

            {/* Inscriptions */}
            <AdminCard>
              <div className="p-5">
                <h2 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37' }}>
                  Inscriptions
                </h2>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Ouvrir ou fermer les candidatures par catégorie
                </p>
                <Toggle value={settings.roi_inscriptions_open} onChange={v => saveSettings({ roi_inscriptions_open: v })} label="Inscriptions Roi" />
                <Toggle value={settings.reine_inscriptions_open} onChange={v => saveSettings({ reine_inscriptions_open: v })} label="Inscriptions Reine" />
                <Toggle value={settings.duo_inscriptions_open} onChange={v => saveSettings({ duo_inscriptions_open: v })} label="Inscriptions Duo" />
              </div>
            </AdminCard>

            {/* Quotas */}
            <AdminCard>
              <div className="p-5">
                <h2 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37' }}>
                  Quotas
                </h2>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Nombre maximum de candidats par catégorie
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Limite Roi', field: 'roi_limit' as const },
                    { label: 'Limite Reine', field: 'reine_limit' as const },
                  ].map(({ label, field }) => (
                    <div key={field}>
                      <label className="block text-xs mb-1.5" style={{ color: 'rgba(212,175,55,0.6)' }}>{label}</label>
                      <input
                        type="number"
                        className="input-elegant"
                        value={settings[field]}
                        onChange={e => saveSettings({ [field]: parseInt(e.target.value) })}
                        min={1}
                        style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(212,175,55,0.28)', color: 'rgba(255,255,255,0.85)' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </AdminCard>

            {/* Code de vote */}
            <AdminCard>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}
                  >
                    <Ticket size={17} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold" style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37' }}>
                      Code de vote
                    </h2>
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Générez un code unique à remettre à un votant par l'agent d'accueil.
                    </p>
                    <button className="btn-gold text-xs py-2 px-4 mt-3" onClick={handleIssueVoteCode}>
                      ✦ Générer un code
                    </button>

                    {issuedVoteCode && (
                      <div
                        className="animate-fade-up mt-3 rounded-xl overflow-hidden"
                        style={{ border: '1px solid rgba(212,175,55,0.3)' }}
                      >
                        <div
                          className="flex items-center justify-between px-4 py-2"
                          style={{ background: 'rgba(212,175,55,0.1)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}
                        >
                          <span className="text-xs" style={{ color: 'rgba(212,175,55,0.7)', letterSpacing: '0.1em' }}>
                            Votant n° {issuedVoteCode.voter_number}
                          </span>
                          <button
                            onClick={copyCode}
                            className="flex items-center gap-1.5 text-xs"
                            style={{ color: codeCopied ? '#22c55e' : 'rgba(212,175,55,0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            {codeCopied ? <Check size={13} /> : <Copy size={13} />}
                            {codeCopied ? 'Copié !' : 'Copier'}
                          </button>
                        </div>
                        <div
                          className="py-4 text-center"
                          style={{ background: 'rgba(0,0,0,0.15)' }}
                        >
                          <div
                            style={{
                              fontFamily: 'monospace', fontSize: 26, fontWeight: 800,
                              letterSpacing: '0.3em', color: '#D4AF37',
                              textShadow: '0 0 16px rgba(212,175,55,0.35)',
                            }}
                          >
                            {issuedVoteCode.code}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AdminCard>
          </div>
        )}

        {/* ══ CANDIDATES ════════════════════════════════════════ */}
        {tab === 'candidates' && (
          <div className="animate-fade-up">
            {/* Titre de section — même style que PageIntro mais compact */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase" style={{ color: '#C5A059' }}>
                  La cour du Bal
                </p>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37' }}>
                  Candidats ({candidates.length})
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {roiCount} Roi · {reineCount} Reine
                </p>
              </div>
              <button
                className="btn-gold text-xs py-2 px-4"
                onClick={() => setAddingCandidate(!addingCandidate)}
              >
                <Plus size={13} className="inline mr-1" />
                Ajouter
              </button>
            </div>

            {addingCandidate && (
              <AdminCard className="animate-fade-up mb-4">
                <form onSubmit={handleAddCandidate} className="p-5 space-y-3">
                  <select
                    className="input-elegant"
                    value={newCandidateForm.category}
                    onChange={e => setNewCandidateForm(f => ({ ...f, category: e.target.value }))}
                    style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(212,175,55,0.28)', color: 'rgba(255,255,255,0.85)' }}
                  >
                    <option value="ROI" style={{ background: '#2C221E' }}>👑 Roi</option>
                    <option value="REINE" style={{ background: '#2C221E' }}>⭐ Reine</option>
                  </select>
                  <DarkInput placeholder="Prénom" value={newCandidateForm.first_name} onChange={v => setNewCandidateForm(f => ({ ...f, first_name: v }))} required />
                  <DarkInput placeholder="Nom" value={newCandidateForm.last_name} onChange={v => setNewCandidateForm(f => ({ ...f, last_name: v }))} required />
                  <div className="flex gap-2">
                    <button type="submit" className="btn-gold flex-1 py-2 text-xs">Enregistrer</button>
                    <button type="button" className="btn-ghost flex-1 py-2 text-xs" onClick={() => setAddingCandidate(false)}>Annuler</button>
                  </div>
                </form>
              </AdminCard>
            )}

            <div className="space-y-2">
              {candidates.map(c => (
                <AdminCard key={c.id}>
                  <div className="p-3 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C5A059, #D4AF37)', color: '#2C221E' }}
                    >
                      {c.first_name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.88)' }}>
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#C5A059' }}>
                        {c.category === 'ROI' ? <Crown size={10} /> : <Star size={10} />}
                        {c.category}
                        {c.is_manual_entry && <span className="ml-1 opacity-40">(admin)</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCandidate(c.id)}
                      disabled={deletingId === c.id}
                      className="btn-danger p-1.5 rounded-lg transition-opacity"
                      style={{ opacity: deletingId === c.id ? 0.4 : 1 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </AdminCard>
              ))}
              {candidates.length === 0 && (
                <div className="text-center py-10 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Aucun candidat enregistré
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ DUOS ═════════════════════════════════════════════ */}
        {tab === 'duos' && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase" style={{ color: '#C5A059' }}>
                  La cour du Bal
                </p>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37' }}>
                  Duos ({duos.length})
                </h2>
              </div>
              <button className="btn-gold text-xs py-2 px-4" onClick={() => setAddingDuo(!addingDuo)}>
                <Plus size={13} className="inline mr-1" />
                Ajouter
              </button>
            </div>

            {addingDuo && (
              <AdminCard className="animate-fade-up mb-4">
                <form onSubmit={handleAddDuo} className="p-5 space-y-3">
                  <DarkInput placeholder="Nom du duo (optionnel)" value={newDuoForm.duo_name} onChange={v => setNewDuoForm(f => ({ ...f, duo_name: v }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <DarkInput placeholder="Prénom cavalier" value={newDuoForm.cavalier_first_name} onChange={v => setNewDuoForm(f => ({ ...f, cavalier_first_name: v }))} required />
                    <DarkInput placeholder="Nom cavalier" value={newDuoForm.cavalier_last_name} onChange={v => setNewDuoForm(f => ({ ...f, cavalier_last_name: v }))} required />
                    <DarkInput placeholder="Prénom cavalière" value={newDuoForm.cavaliere_first_name} onChange={v => setNewDuoForm(f => ({ ...f, cavaliere_first_name: v }))} required />
                    <DarkInput placeholder="Nom cavalière" value={newDuoForm.cavaliere_last_name} onChange={v => setNewDuoForm(f => ({ ...f, cavaliere_last_name: v }))} required />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-gold flex-1 py-2 text-xs">Enregistrer</button>
                    <button type="button" className="btn-ghost flex-1 py-2 text-xs" onClick={() => setAddingDuo(false)}>Annuler</button>
                  </div>
                </form>
              </AdminCard>
            )}

            <div className="space-y-2">
              {duos.map(d => (
                <AdminCard key={d.id}>
                  <div className="p-3 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #C5A059, #D4AF37)' }}
                    >
                      💫
                    </div>
                    <div className="flex-1 min-w-0">
                      {d.duo_name && (
                        <div className="text-xs font-bold mb-0.5" style={{ color: '#D4AF37' }}>{d.duo_name}</div>
                      )}
                      <div className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {d.cavalier_first_name} {d.cavalier_last_name}
                        <span style={{ color: '#D4AF37', margin: '0 5px' }}>·</span>
                        {d.cavaliere_first_name} {d.cavaliere_last_name}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDuo(d.id)}
                      disabled={deletingId === d.id}
                      className="btn-danger p-1.5 rounded-lg transition-opacity"
                      style={{ opacity: deletingId === d.id ? 0.4 : 1 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </AdminCard>
              ))}
              {duos.length === 0 && (
                <div className="text-center py-10 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Aucun duo enregistré
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ RESULTS ═══════════════════════════════════════════ */}
        {tab === 'results' && (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase" style={{ color: '#C5A059' }}>
                  Le palmarès
                </p>
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37' }}>
                  Résultats
                </h2>
              </div>
              <button
                onClick={() => getAdminVoteResults().then(r => setVoteResults(r))}
                className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg transition-all"
                style={{
                  background: 'rgba(212,175,55,0.12)', color: '#D4AF37',
                  border: '1px solid rgba(212,175,55,0.25)',
                }}
              >
                <RefreshCw size={13} />
                Actualiser
              </button>
            </div>

            {voteResults ? (
              <div className="space-y-4">
                {[
                  { key: 'roi', label: 'Roi du Bal', icon: '👑' },
                  { key: 'reine', label: 'Reine du Bal', icon: '⭐' },
                  { key: 'duo', label: 'Duo du Bal', icon: '💫' },
                ].map(({ key, label, icon }) => {
                  const data = ((voteResults[key] as any[]) || []).sort((a, b) => b.votes - a.votes)
                  const total = data.reduce((a, r) => a + r.votes, 0)
                  const medals = ['🥇', '🥈', '🥉']
                  return (
                    <AdminCard key={key}>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-base">{icon}</span>
                          <span className="font-semibold text-sm" style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37' }}>{label}</span>
                          <span
                            className="ml-auto text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}
                          >
                            {total} votes
                          </span>
                        </div>

                        {data.length === 0 ? (
                          <p className="text-xs text-center py-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                            Aucun vote enregistré
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {data.map((entry: any, i: number) => {
                              const pct = total > 0 ? Math.round((entry.votes / total) * 100) : 0
                              const id = entry.candidate_id || entry.duo_id
                              const name = candidateNames[id] || `…${id?.slice(-6)}`
                              return (
                                <div key={i}>
                                  <div className="flex justify-between text-xs mb-1.5">
                                    <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                                      {medals[i] || `#${i + 1}`} {name}
                                    </span>
                                    <span style={{ color: '#D4AF37', fontWeight: 600 }}>
                                      {entry.votes}
                                      <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, marginLeft: 4 }}>({pct}%)</span>
                                    </span>
                                  </div>
                                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${pct}%`,
                                        background: i === 0
                                          ? 'linear-gradient(90deg, #C5A059, #E8C547)'
                                          : 'linear-gradient(90deg, rgba(197,160,89,0.55), rgba(212,175,55,0.55))',
                                        transition: 'width 0.7s ease',
                                      }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </AdminCard>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16 text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Chargement des statistiques...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
