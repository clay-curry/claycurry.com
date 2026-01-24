import { PenTool, Code, Smartphone, Zap } from 'lucide-react'
import { aboutData } from '@/lib/portfolio-data'

const iconMap = {
  Code,
  Zap,
  Smartphone,
  PenTool,
}

export default function AboutPage() {
  const data = aboutData

  return (
    <div className="py-8 md:py-12 space-y-12 md:space-y-14">
      {/* About Me */}
      <div className='mt-10 mb-20'>
        <div className="flex items-center gap-4 mb-6">
          <span className="font-tourney font-semibold uppercase tracking-wider text-xl md:text-2xl">About</span>
          <div className="w-3 h-px bg-foreground rounded-full" />
        </div>
        <div className="space-y-4 text-sm md:text-base text-card-foreground leading-relaxed">
          {data.description.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* What I'm Doing */}
      <div className='mb-20'>
        <div className="flex items-center gap-4 mb-6">
          <span className="font-tourney font-semibold uppercase tracking-wider text-xl md:text-2xl">Skills</span>
          <div className="w-3 h-px bg-foreground rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {data.services.map((service, index) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap]
            return (
              <div
                key={index}
                className="flex gap-3 md:gap-4 p-4 md:p-6 bg-secondary rounded-xl md:rounded-2xl border border-border hover:border-accent transition-colors"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
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

      {/* Testimonials with Marquee Animation */}
      
    </div>
  )
}
