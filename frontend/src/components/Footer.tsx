export default function Footer() {
  return (
    <footer className="w-full flex flex-col items-center py-8 px-6 mt-8 relative z-20">
      <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl text-[#C5A059] gap-4">
        
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/bal_cs_stebakhita_2k26/"
            target="_blank"
            rel="noreferrer"
            aria-label="Suivez-nous sur Instagram"
            className="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>

        {/* Text */}
        <p className="text-xs font-semibold tracking-widest uppercase text-[#4A3C33]">
          Suivez-nous sur Instagram
        </p>

        {/* Hashtag */}
        <div className="flex flex-col items-center">
          <p className="text-[#B08233] font-serif text-lg tracking-widest">
            #BALMASQUÉ2026
          </p>
          <div className="ornament-line opacity-70 w-16 mt-1">
             <div className="ornament-icon scale-50"></div>
          </div>
        </div>
      </div>
    </footer>
  )
}
