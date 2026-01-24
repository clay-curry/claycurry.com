import { PenTool, Code, Smartphone, Zap } from 'lucide-react'
import { aboutData } from '@/lib/portfolio-data'
import { AboutIcon } from '@/lib/components/icons/AboutIcon'
import { SkillsIcon } from '@/lib/components/icons/SkillsIcon'

const iconMap = {
  Code,
  Zap,
  Smartphone,
  PenTool,
}

export default function AboutPage() {
  const data = aboutData

  return (
    <div className="space-y-8 md:space-y-10">
      {/* About Me */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <AboutIcon className="h-4 md:h-5 w-auto filter-[drop-shadow(0_0_10px_var(--tron-glow))_drop-shadow(0_0_20px_var(--tron-glow))]" />
          <div className="w-3 h-0.25 bg-foreground rounded-full" />
        </div>
        <div className="space-y-4 text-sm md:text-base text-card-foreground leading-relaxed">
          {data.description.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* What I'm Doing */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <SkillsIcon className="h-4 md:h-5 w-auto filter-[drop-shadow(0_0_10px_var(--tron-glow))_drop-shadow(0_0_20px_var(--tron-glow))]" />
          <div className="w-3 h-0.25 bg-foreground rounded-full" />
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
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">Kind Words</h3>
        <div className="relative overflow-hidden">
          <div className="flex gap-3 md:gap-4 animate-marquee">
            {[...data.testimonials, ...data.testimonials].map((testimonial, index) => (
              <div key={index} className="flex-shrink-0 w-72 md:w-80 p-4 md:p-6 bg-secondary rounded-xl md:rounded-2xl border border-border">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl object-cover"
                  />
                  <h4 className="text-base md:text-lg font-semibold text-foreground">{testimonial.name}</h4>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{testimonial.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      
    </div>
  )
}
