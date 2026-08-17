type PageIntroProps = {
  eyebrow?: string
  title: string
  description?: string
}

export default function PageIntro({ eyebrow = 'Bal Masqué 2026', title, description }: PageIntroProps) {
  return (
    <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
      <p className="texture-gold-text text-[0.68rem] font-semibold tracking-[0.28em] uppercase text-[#C5A059] mb-3">
        {eyebrow}
      </p>
      <h1 className="texture-gold-text text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide text-[#B08233]" style={{ fontFamily: 'var(--font-serif)' }}>
        {title}
      </h1>
      <div className="ornament-line opacity-80 w-36 mt-4">
        <div className="ornament-icon" />
      </div>
      {description && (
        <p className="texture-copy max-w-xl mt-5 text-sm sm:text-base leading-relaxed text-[#4A3C33]">
          {description}
        </p>
      )}
    </div>
  )
}
