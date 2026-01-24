import { PenTool, Code, Smartphone, Zap, Link, ArrowRight } from 'lucide-react'
import { aboutData } from '@/lib/portfolio-data'
import { getAllPostsMetadata } from '../blog/loader'
import { WritingsSection } from '@/lib/components/writings-section'
import { HeroAskAI } from '@/lib/components/ai-elements/hero-ask-ai'

const iconMap = {
  Code,
  Zap,
  Smartphone,
  PenTool,
}

export default function AboutPage() {
  const data = aboutData
  const posts = getAllPostsMetadata()

  return (
    <div className="py-8 md:py-12 space-y-12 md:space-y-14 flex flex-col gap-10">
      
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="font-tourney text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Clay Curry
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          Portfolio Website
        </p>
        <HeroAskAI />
      </div>

      {/* About Me */}
      <div className='mx-4'>
        <SectionHeader title="About" />
        <div className="space-y-4 text-sm md:text-base text-card-foreground leading-relaxed">
          {data.description.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Writings */}
      <div className="mx-4">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader title="Writings" />
          <Link
            href="/blog"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <WritingsSection posts={posts} />
      </div>

      {/* What I'm Doing */}
      <div className='mx-4'>
        <SectionHeader title="Skills" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {data.services.map((service, index) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap]
            return (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-secondary rounded-xl md:rounded-2xl border border-border hover:border-accent transition-colors"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 shrink-0">
                  <IconComponent className="w-full h-full text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-semibold text-foreground mb-2 text-shadow-none">{service.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              </div>
            )
          })}
        </div>
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
