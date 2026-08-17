export default function Footer() {
  return (
    <footer className="w-full flex flex-col items-center py-8 px-6 mt-8 relative z-20">
      <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl text-[#C5A059] gap-4">
        
        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <a href="#" className="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors">
            {/* Facebook Icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors">
            {/* Instagram Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="#" className="w-10 h-10 rounded-full border border-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors">
            {/* TikTok Icon (SVG) */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.36 6.33 6.33 0 0 0 6.25-6.36V7.9a8.4 8.4 0 0 0 4.14 1.44v-3.41a4.93 4.93 0 0 1-2.07-.74z"/>
            </svg>
          </a>
        </div>

        {/* Text */}
        <p className="text-xs font-semibold tracking-widest uppercase text-[#4A3C33]">
          Suivez-nous sur nos réseaux
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
