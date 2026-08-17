import { useState, useEffect } from 'react'
import { registerCandidate, registerDuo, getSystemSettings } from '../services/api'
import { CheckCircle, AlertCircle, Lock } from 'lucide-react'
import type { SystemSettings } from '../types'
import PageIntro from '../components/PageIntro'

type Mode = 'ROI' | 'REINE' | 'DUO'

export default function Register() {
  const [mode, setMode] = useState<Mode>('ROI')
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [form, setForm] = useState<{
    first_name: string; last_name: string; photo: File | null;
    cavalier_first_name: string; cavalier_last_name: string; cavalier_photo: File | null;
    cavaliere_first_name: string; cavaliere_last_name: string; cavaliere_photo: File | null;
    duo_name: string;
  }>({
    first_name: '', last_name: '', photo: null,
    cavalier_first_name: '', cavalier_last_name: '', cavalier_photo: null,
    cavaliere_first_name: '', cavaliere_last_name: '', cavaliere_photo: null,
    duo_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getSystemSettings()
      .then(s => setSettings(s))
      .finally(() => setSettingsLoading(false))
  }, [])

  const update = (field: string, value: any) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')
    setError('')

    try {
      const formData = new FormData()
      if (mode === 'DUO') {
        if (form.duo_name) formData.append('duo_name', form.duo_name)
        formData.append('cavalier_first_name', form.cavalier_first_name)
        formData.append('cavalier_last_name', form.cavalier_last_name)
        formData.append('cavaliere_first_name', form.cavaliere_first_name)
        formData.append('cavaliere_last_name', form.cavaliere_last_name)
        if (form.cavalier_photo) formData.append('cavalier_photo', form.cavalier_photo)
        if (form.cavaliere_photo) formData.append('cavaliere_photo', form.cavaliere_photo)
        
        await registerDuo(formData)
        setSuccess('Votre duo a été inscrit avec succès ! 🎉')
      } else {
        formData.append('category', mode)
        formData.append('first_name', form.first_name)
        formData.append('last_name', form.last_name)
        if (form.photo) formData.append('photo', form.photo)

        await registerCandidate(formData)
        setSuccess(`Votre candidature en tant que ${mode === 'ROI' ? 'Roi' : 'Reine'} a été enregistrée ! 🎉`)
      }
      setForm({
        first_name: '', last_name: '', photo: null,
        cavalier_first_name: '', cavalier_last_name: '', cavalier_photo: null,
        cavaliere_first_name: '', cavaliere_last_name: '', cavaliere_photo: null,
        duo_name: ''
      })
    } catch (err: any) {
      const msg = err?.response?.data?.detail
      if (typeof msg === 'string') {
        setError(msg)
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.")
      }
    } finally {
      setLoading(false)
    }
  }

  const modes = [
    { key: 'ROI', label: '👑 Roi' },
    { key: 'REINE', label: '⭐ Reine' },
    { key: 'DUO', label: '💫 Duo' },
  ] as const

  return (
    <div className="min-h-screen w-full flex flex-col items-center pt-32 pb-16 px-4">
      <PageIntro
        eyebrow="Entrez dans la danse"
        title="INSCRIPTION"
        description="Présentez votre candidature pour devenir Roi, Reine ou Duo du Bal Masqué."
      />

      {settingsLoading ? (
        <div className="luxury-card w-full max-w-lg p-10 flex flex-col items-center gap-4 animate-pulse">
          <div className="h-8 bg-[#D4AF37]/20 rounded w-3/4"></div>
          <div className="h-4 bg-[#D4AF37]/10 rounded w-1/2"></div>
        </div>
      ) : settings && (
        (mode === 'ROI' && !settings.roi_inscriptions_open) ||
        (mode === 'REINE' && !settings.reine_inscriptions_open) ||
        (mode === 'DUO' && !settings.duo_inscriptions_open)
      ) ? (
        <div className="luxury-card w-full max-w-lg p-10 flex flex-col items-center text-center gap-4">
          <Lock size={48} className="text-[#C5A059]" />
          <h3 className="text-2xl font-bold text-[#2C221E]" style={{ fontFamily: 'var(--font-serif)' }}>
            Inscriptions fermées
          </h3>
          <p className="text-[#4A3C33]">
            Les inscriptions pour la catégorie <strong>{mode === 'ROI' ? 'Roi' : mode === 'REINE' ? 'Reine' : 'Duo'}</strong> sont actuellement fermées.
          </p>
          <p className="text-sm text-[#B08233]">Vous pouvez sélectionner une autre catégorie.</p>
        </div>
      ) : (

      <div className="luxury-card w-full max-w-lg p-8 bg-white/70 space-y-6">

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-2">
          {modes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setError(''); setSuccess('') }}
              className={`py-3 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${
                mode === key
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-white shadow-lg'
                  : 'bg-white text-[#B08233] border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 animate-fade-up">
            <CheckCircle size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 animate-fade-up">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode !== 'DUO' ? (
            <>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#B08233] mb-2">Prénom</label>
                <input
                  className="input-elegant"
                  placeholder="Votre prénom"
                  value={form.first_name}
                  onChange={e => update('first_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#B08233] mb-2">Nom</label>
                <input
                  className="input-elegant"
                  placeholder="Votre nom de famille"
                  value={form.last_name}
                  onChange={e => update('last_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#B08233] mb-2">Photo (optionnel)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-elegant text-xs"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) update('photo', file);
                  }}
                  style={{ paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-[#B08233] mb-2">Nom du Duo (optionnel)</label>
                <input
                  className="input-elegant"
                  placeholder="Ex: Les Étoiles d'Or"
                  value={form.duo_name}
                  onChange={e => update('duo_name', e.target.value)}
                />
              </div>
              <div className="p-4 rounded-xl bg-[#FDF8EC] border border-[#D4AF37]/40">
                <div className="text-xs font-bold tracking-widest uppercase text-[#B08233] mb-3">👔 Cavalier</div>
                <div className="space-y-3">
                  <input className="input-elegant" placeholder="Prénom" value={form.cavalier_first_name}
                    onChange={e => update('cavalier_first_name', e.target.value)} required />
                  <input className="input-elegant" placeholder="Nom" value={form.cavalier_last_name}
                    onChange={e => update('cavalier_last_name', e.target.value)} required />
                  <div>
                    <label className="block text-[10px] font-semibold tracking-widest uppercase text-[#B08233] mb-1">Photo (optionnel)</label>
                    <input type="file" accept="image/*" className="input-elegant text-xs"
                      onChange={e => { const file = e.target.files?.[0]; if (file) update('cavalier_photo', file); }}
                      style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }} />
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#F9F0FF] border border-[#C5A059]/40">
                <div className="text-xs font-bold tracking-widest uppercase text-[#B08233] mb-3">👗 Cavalière</div>
                <div className="space-y-3">
                  <input className="input-elegant" placeholder="Prénom" value={form.cavaliere_first_name}
                    onChange={e => update('cavaliere_first_name', e.target.value)} required />
                  <input className="input-elegant" placeholder="Nom" value={form.cavaliere_last_name}
                    onChange={e => update('cavaliere_last_name', e.target.value)} required />
                  <div>
                    <label className="block text-[10px] font-semibold tracking-widest uppercase text-[#B08233] mb-1">Photo (optionnel)</label>
                    <input type="file" accept="image/*" className="input-elegant text-xs"
                      onChange={e => { const file = e.target.files?.[0]; if (file) update('cavaliere_photo', file); }}
                      style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }} />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="btn-gold w-full"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : '✨ Soumettre ma candidature'}
          </button>
        </form>

        <p className="text-center text-xs text-[#4A3C33]/50">
          Places très limitées — candidatures soumises à validation
        </p>
      </div>
      )}
    </div>
  )
}
