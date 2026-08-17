import { Link } from 'react-router-dom'
import heroMask from '../assets/hero_mask.png'

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-start pt-28 pb-12 overflow-hidden px-4">
      {/* Sparkles background effect could be achieved with the bg image, but we add an extra layer if needed */}
      <div className="w-full max-w-4xl flex flex-col items-center relative z-10">
        
        {/* Main Mask Image */}
        <div className="relative w-[300px] sm:w-[450px] md:w-[600px] h-auto mb-[-60px] sm:mb-[-100px] z-10 animate-float drop-shadow-2xl">
          <img src={heroMask} alt="Golden Masquerade Mask" className="w-full h-auto object-contain" />
        </div>

        {/* Huge Text overlaying the mask slightly */}
        <div className="text-center z-20 flex flex-col items-center">
          <h1 className="text-6xl sm:text-7xl md:text-9xl font-bold leading-none mb-4 tracking-wide gold-text text-center drop-shadow-lg" style={{ fontFamily: 'var(--font-serif)' }}>
            BAL<br />
            MASQUÉ
          </h1>
          
          <div className="ornament-line mb-6 w-full max-w-xs opacity-70">
            <div className="ornament-icon"></div>
          </div>

          <p className="text-sm sm:text-base md:text-xl font-semibold tracking-widest mb-10 text-[#4A3C33] uppercase text-center max-w-2xl px-4 drop-shadow-sm">
            19 Août 2026 – Queen Fafa Palace Calavi
          </p>
          
          <div className="ornament-line mb-6 w-full max-w-[150px] opacity-70"></div>

          <div className="luxury-card py-4 px-6 sm:px-12 mt-4 inline-block w-auto text-center mx-auto mb-10 max-w-[90%]">
            <p className="text-[#C5A059] text-xs sm:text-sm font-semibold tracking-widest uppercase">
              Une nuit. Un masque. Une expérience inoubliable.
            </p>
          </div>
          
           <div className="ornament-line mb-10 w-full max-w-[150px] opacity-70"></div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-2xl px-4 z-30 relative">
            <Link to="/candidates" className="w-full sm:w-auto text-center font-semibold text-sm tracking-widest uppercase text-[#B08233] border border-[#B08233] px-6 py-3 rounded-md hover:bg-[#B08233] hover:text-white transition-colors bg-white/50 backdrop-blur-sm">
              Découvrir les candidats
            </Link>
            <Link to="/register" className="w-full sm:w-auto text-center font-semibold text-sm tracking-widest uppercase text-white bg-gradient-to-r from-[#D4AF37] to-[#C5A059] px-6 py-3 rounded-md shadow-lg hover:shadow-xl hover:from-[#C5A059] hover:to-[#B08233] transition-all">
              S'inscrire
            </Link>
            <Link to="/vote" className="w-full sm:w-auto text-center font-semibold text-sm tracking-widest uppercase text-[#B08233] border border-[#B08233] px-6 py-3 rounded-md hover:bg-[#B08233] hover:text-white transition-colors bg-white/50 backdrop-blur-sm">
              Voter
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
