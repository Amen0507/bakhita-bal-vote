import { Link } from 'react-router-dom'
import maskWhiteGold from '../assets/mask_white_gold.png'
import maskBlackGold from '../assets/mask_black_gold.png'
import maskSilver from '../assets/mask_silver.png'
import maskBlack from '../assets/mask_black.png'

export default function VoteSection() {
  const masks = [
    { id: 1, img: maskWhiteGold, alt: "Masque Blanc & Or" },
    { id: 2, img: maskBlackGold, alt: "Masque Noir & Or" },
    { id: 3, img: maskSilver, alt: "Masque Argent" },
    { id: 4, img: maskBlack, alt: "Masque Noir" },
  ]

  return (
    <section className="w-full flex flex-col items-center py-12 px-4 relative z-20">
      <div className="luxury-card w-full max-w-4xl p-8 sm:p-12 rounded-2xl flex flex-col items-center">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row items-center justify-center w-full mb-4 text-center">
          <div className="ornament-line opacity-70 hidden sm:flex w-16 mb-4 sm:mb-0 mr-4"></div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-widest text-[#2C221E] uppercase" style={{ fontFamily: 'var(--font-serif)' }}>
            Votez pour votre masque préféré
          </h2>
          <div className="ornament-line opacity-70 hidden sm:flex w-16 mt-4 sm:mt-0 ml-4"></div>
        </div>
        
        <p className="text-sm text-[#4A3C33] mb-12 text-center">
          Choisissez le masque qui vous inspire le plus !
        </p>

        {/* Masks Grid */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-12">
          {masks.map((mask) => (
            <div key={mask.id} className="mask-container cursor-pointer transform hover:scale-110 transition-transform duration-300">
              <img src={mask.img} alt={mask.alt} />
            </div>
          ))}
        </div>

        <Link to="/vote" className="w-full max-w-xs">
          <button className="btn-gold w-full text-lg py-3">Voter</button>
        </Link>
        
      </div>
    </section>
  )
}
