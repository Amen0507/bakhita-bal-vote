import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLogin } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.body.classList.add('bg-admin')
    return () => document.body.classList.remove('bg-admin')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await adminLogin(username, password)
      login(res.access_token)
      navigate('/admin/dashboard')
    } catch {
      setError("Identifiants incorrects. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-up">

        {/* Page intro — même style que les pages publiques */}
        <div className="flex flex-col items-center text-center mb-8">
          <p className="text-[0.68rem] font-semibold tracking-[0.28em] uppercase mb-3" style={{ color: '#C5A059' }}>
            Bal Masqué 2026
          </p>
          <h1 className="text-4xl font-bold tracking-wide" style={{ fontFamily: 'var(--font-serif)', color: '#D4AF37' }}>
            ADMIN
          </h1>
          <div className="ornament-line opacity-80 w-36 mt-4">
            <div className="ornament-icon" />
          </div>
          <p className="mt-4 text-sm" style={{ color: 'rgba(212,175,55,0.55)' }}>
            Espace réservé à l'administration
          </p>
        </div>

        {/* Card identique aux luxury-card publiques, mais fond sombre */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(44,34,30,0.85)',
            border: '1px solid rgba(212,175,55,0.3)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35), inset 0 0 20px rgba(212,175,55,0.04)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {error && (
            <div className="toast-error flex items-center gap-2 mb-4">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                style={{ color: 'rgba(212,175,55,0.7)' }}
              >
                Identifiant
              </label>
              <input
                className="input-elegant"
                placeholder="admin"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(212,175,55,0.3)', color: 'rgba(255,255,255,0.88)' }}
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-2 tracking-widest uppercase"
                style={{ color: 'rgba(212,175,55,0.7)' }}
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  className="input-elegant pr-12"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(212,175,55,0.3)', color: 'rgba(255,255,255,0.88)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(212,175,55,0.55)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-gold w-full mt-2" disabled={loading}>
              {loading ? 'Connexion...' : '✦ Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
