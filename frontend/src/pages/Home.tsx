import HeroSection from '../components/HeroSection'
import PassSection from '../components/PassSection'
import VoteSection from '../components/VoteSection'

export default function Home() {
  return (
    <div className="min-h-screen w-full relative flex flex-col items-center overflow-x-hidden">
      <HeroSection />
      <PassSection />
      <VoteSection />
    </div>
  )
}
