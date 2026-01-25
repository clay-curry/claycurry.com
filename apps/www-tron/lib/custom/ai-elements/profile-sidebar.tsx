import { Mail, Phone, MapPin } from 'lucide-react'
import { Github, Twitter, Linkedin } from 'lucide-react'
import { profileData } from '@/lib/portfolio-data'

interface ProfileSidebarProps {
  data?: typeof profileData
}

export function ProfileSidebar({ data = profileData }: ProfileSidebarProps) {
  return (
    <aside className="w-full lg:w-96 h-fit bg-card border border-border/80 p-4 md:p-6 lg:sticky lg:top-8 lg:my-8 lg:ml-8">
      {/* Profile Image */}
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6">
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-accent/20 via-accent/5 to-transparent animate-pulse-slow" />
          <div className="absolute inset-0.5 rounded-3xl bg-secondary overflow-hidden">
            <img
              src={data.avatar || "/placeholder.svg"}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">{data.name}</h1>
        <p className="text-xs md:text-sm text-muted-foreground bg-secondary px-3 md:px-4 py-1 rounded-lg">
          {data.title}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-border my-4 md:my-6" />

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
        {[
          { icon: Mail, label: 'Email', value: data.email, href: `mailto:${data.email}`, breakAll: true },
          { icon: Phone, label: 'Phone', value: data.phone, href: `tel:${data.phone.replace(/\s/g, '')}` },
          { icon: MapPin, label: 'Location', value: data.location },
        ].map(({ icon: Icon, label, value, href, breakAll }) => (
          <div key={label} className="flex items-start gap-3 pl-2">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 dark:text-primary" />
            </div>
            <div className={`flex-1${breakAll ? ' min-w-0' : ''}`}>
              <p className="text-xs text-muted-foreground uppercase mb-1">{label}</p>
              {href ? (
                <a
                  href={href}
                  className={`text-sm text-foreground hover:text-accent transition-colors${breakAll ? ' break-all' : ''}`}
                >
                  {value}
                </a>
              ) : (
                <p className="text-sm text-foreground">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Social Links */}
      <div className="flex items-center justify-center gap-4 mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
        <a
          href={data.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
          aria-label="GitHub"
        >
          <Github className="w-5 h-5" />
        </a>
        <a
          href={data.social.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
          aria-label="Twitter"
        >
          <Twitter className="w-5 h-5" />
        </a>
        <a
          href={data.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-lg bg-secondary hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
          aria-label="LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </a>
      </div>
    </aside>
  )
}
