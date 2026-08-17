import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import logo from '../assets/hero_mask.png'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Candidats', path: '/candidates' },
    { name: 'Inscription', path: '/register' },
    { name: 'Voter', path: '/vote' },
    { name: 'Résultats', path: '/results' },
  ]

  return (
    <header className="w-full flex justify-center fixed top-0 z-50 bg-[#F4F1EA]/90 backdrop-blur-md border-b border-[#D4AF37]/20">
      <div className="w-full max-w-7xl flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Logo Bal Masqué" className="w-12 h-10 object-contain drop-shadow-md" />
          <h1 className="text-xl font-bold tracking-widest text-[#C5A059] uppercase hidden sm:block" style={{ fontFamily: 'var(--font-serif)' }}>
            Bal Masqué
          </h1>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold tracking-widest uppercase transition-colors ${
                location.pathname === link.path 
                  ? 'text-[#C5A059]' 
                  : 'text-[#4A3C33] hover:text-[#C5A059]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-[#C5A059] hover:text-[#D4AF37] transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={32} strokeWidth={1.5} /> : <Menu size={32} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="absolute top-full left-0 w-full bg-[#F4F1EA] shadow-xl border-b border-[#D4AF37]/20 flex flex-col items-center py-6 gap-6 md:hidden">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-lg font-semibold tracking-widest uppercase ${
                location.pathname === link.path 
                  ? 'text-[#C5A059]' 
                  : 'text-[#4A3C33]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
