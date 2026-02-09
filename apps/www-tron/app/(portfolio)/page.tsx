import { aboutData } from '@/lib/portfolio-data'
import { getAllPostsMetadata } from './blog/loader'
import { WritingsSection } from '@/lib/components/site/writings-section'
import { HeroContactAskAI } from '@/lib/components/chat/hero-contact-ask-ai'

export default function AboutPage() {
  const data = aboutData
  const posts = getAllPostsMetadata()

  return (
    <div className="py-8 md:py-12 space-y-12 md:space-y-14 flex flex-col gap-10">
      
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="font-tourney text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Clay Curry
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10">
          Portfolio Website
        </p>
        <HeroContactAskAI />
      </div>

      {/* About Me */}
      <div className='mx-4'>
        <SectionHeader title="About" />
        <div className="space-y-4 text-md md:text-md text-card-foreground leading-relaxed">
          {data.description.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Writings */}
      <div className="mx-4">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader title="Writings" />
        </div>
        <WritingsSection posts={posts} />
      </div>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="font-tourney font-semibold uppercase tracking-wider text-xl md:text-2xl">
        {title}
      </span>
      <div className="w-3 h-px bg-foreground rounded-full" />
    </div>
  )
}
