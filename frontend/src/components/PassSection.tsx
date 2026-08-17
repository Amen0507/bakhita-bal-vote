import maskSmall from '../assets/hero_mask.png'

export default function PassSection() {
  return (
    <section className="w-full flex flex-col items-center py-12 px-4 relative z-20">
      
      {/* Title */}
      <div className="flex items-center justify-center w-full mb-6">
        <div className="ornament-line opacity-70 hidden sm:flex w-24"></div>
        <h2 className="text-4xl sm:text-5xl font-bold tracking-widest text-[#B08233] mx-6" style={{ fontFamily: 'var(--font-serif)' }}>
          PASS
        </h2>
        <div className="ornament-line opacity-70 hidden sm:flex w-24"></div>
      </div>

      <div className="flex flex-col items-center mb-8 w-full max-w-2xl text-center space-y-4">
        <div className="border border-[#D4AF37] px-6 py-3 rounded-xl bg-white/50 w-full">
          <p className="text-[#C5A059] font-bold tracking-widest text-lg sm:text-xl uppercase">Billetterie Ouverte !</p>
          <p className="text-[#4A3C33] text-sm sm:text-base tracking-widest uppercase mt-1">Les masques sont offerts</p>
        </div>
        <p className="text-[#B08233] font-bold tracking-widest text-base sm:text-lg uppercase">
          ⚠️ Places très limitées !
        </p>
      </div>

      <div className="luxury-card w-full max-w-4xl p-6 sm:p-10 rounded-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Pass Interne */}
          <div className="luxury-card flex flex-col items-center p-10 bg-white/70 justify-center">
            <h3 className="text-[#C5A059] text-sm sm:text-base font-semibold tracking-widest uppercase mb-4">Pass Interne</h3>
            <div className="text-[#B08233] font-serif flex items-baseline">
              <span className="text-5xl sm:text-6xl font-bold">12 000</span>
            </div>
            <div className="flex items-center w-full my-4">
              <div className="h-px bg-[#D4AF37] flex-grow opacity-50"></div>
              <span className="text-[#4A3C33] mx-4 font-sans font-semibold tracking-widest">FCFA</span>
              <div className="h-px bg-[#D4AF37] flex-grow opacity-50"></div>
            </div>
            <div className="text-[#D4AF37] text-lg tracking-widest">
              ★★★
            </div>
          </div>

          {/* Pass Externe */}
          <div className="luxury-card flex flex-col items-center p-10 bg-white/70 relative overflow-hidden justify-center">
            <h3 className="text-[#C5A059] text-sm sm:text-base font-semibold tracking-widest uppercase mb-4">Pass Externe</h3>
            <div className="text-[#B08233] font-serif flex items-baseline">
              <span className="text-5xl sm:text-6xl font-bold">15 000</span>
            </div>
            <div className="flex items-center w-full my-4">
              <div className="h-px bg-[#D4AF37] flex-grow opacity-50"></div>
              <span className="text-[#4A3C33] mx-4 font-sans font-semibold tracking-widest">FCFA</span>
              <div className="h-px bg-[#D4AF37] flex-grow opacity-50"></div>
            </div>
             <div className="text-[#D4AF37] text-lg tracking-widest">
              ★★★
            </div>
          </div>

        </div>
      </div>

      <div className="flex items-center justify-center space-x-4">
        <img src={maskSmall} alt="Mask" className="w-8 h-6 object-contain" />
        <p className="text-[#4A3C33] text-sm sm:text-base tracking-widest uppercase font-semibold">
          Dress code : Élégant et Masqué
        </p>
        <img src={maskSmall} alt="Mask" className="w-8 h-6 object-contain" />
      </div>

    </section>
  )
}
