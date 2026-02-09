export const profileData = {
  name: 'Clay Curry',
  title: 'Software Engineer',
  avatar: '/clay_profile_cropped.png',
  email: 'me@claycurry.com',
  phone: '+1 (405) 301-1055',
  location: 'San Francisco, CA',
  githubUsername: 'clay-curry',
  social: {
    github: 'https://github.com/clay-curry',
    x: 'https://x.com/claybuilds',
    linkedin: 'https://www.linkedin.com/in/clay-curry/',
  },
} as const

export const siteConfig = {
  repo: 'https://github.com/clay-curry/claycurry.com',
} as const

export const aboutData = {
  description: [
    "I am passionate about building products that continuously learn from user behavior and evade enshittification through feedback loops."
  ],
  skills: [
    'Claude Code',
    'Codex',
    'Polyrepo / Monorepo',
    'Material 3',
    'UX Foundations',
    'Brand/Design Languages',
    'Design Systems',
    'Cloudflare DNS',
    'React / Next.js / Vercel',
    'Webpack / Turbopack',
    'Turborepo',
    'Figma',
    'User Engagement',
    'Web Scraping',
    'PyTorch',
    'Bun / Node.js',
    'Linux',
    'Open Source Software',
    'TypeScript',
    'Tailwind CSS',
    'Firebase',
    'AWS',
    'Docker',
    'Kubernetes',
    'WebSockets',
    'Java',
    'REST APIs',
    'Python',
    'SQL',
    'MongoDB',
    'Google Cloud',
    'CI/CD',
    'Remote Team Leadership',
  ],
  testimonials: [
    {
      avatar: '/professional-man.jpg',
      name: 'Matt Thaibault',
      text: 'Clay was hired to create a corporate identity. We were very pleased with the work done. He has a lot of experience and is very concerned about the needs of client.',
    },
    {
      avatar: '/professional-woman-diverse.png',
      name: 'Yunjao Mao',
      text: 'Clay was hired to create a corporate identity. We were very pleased with the work done. He has a lot of experience and is very concerned about the needs of client.',
    },
    {
      avatar: '/professional-man.jpg',
      name: 'Soumya Bhattacharya',
      text: 'Outstanding work! Clay delivered a high-quality product that exceeded our expectations. His attention to detail is remarkable.',
    },
    {
      avatar: '/professional-woman-diverse.png',
      name: 'Reajul Chowdhury',
      text: 'Professional, creative, and highly skilled. Clay is the developer you want on your team for any complex project.',
    },
  ],
  clients: [
    { name: 'TechCorp', logo: '/tech-company-logo.jpg' },
    { name: 'StartupHub', logo: '/startup-logo.png' },
    { name: 'CodeLabs', logo: '/software-company-logo.png' },
    { name: 'WebSolutions', logo: '/web-agency-logo.jpg' },
    { name: 'AppMakers', logo: '/app-development-logo.jpg' },
  ],
}

export const resumeData = {
  education: [
    {
      title: 'University of California, Berkeley',
      period: '2013 — 2017',
      description:
        'Studied Computer Science with a focus on web technologies and software engineering principles.',
    },
    {
      title: 'Frontend Development Bootcamp',
      period: '2017 — 2018',
      description: 'Intensive program covering modern JavaScript frameworks, responsive design, and UX principles.',
    },
  ],
  experience: [
    {
      title: 'Senior Software Engineer',
      period: '2020 — Present',
      description:
        'Leading development of scalable web applications using React, Node.js, and cloud technologies. Mentoring junior developers and implementing best practices.',
    },
    {
      title: 'Software Engineer',
      period: '2018 — 2020',
      description:
        'Developed and maintained multiple client projects using modern web technologies. Collaborated with design teams to create seamless user experiences.',
    },
  ],
  skills: [
    { name: 'Product Design', level: 90 },
    { name: 'Frontend Development', level: 95 },
    { name: 'Backend Development', level: 85 },
    { name: 'Database Design', level: 80 },
  ],
}

export const blogData = {
  posts: [
    {
      title: 'So Good They Can\'t Ignore You',
      category: 'Book Review',
      date: 'Jan 25, 2025',
      readTime: '7 min',
      image: '/software-architecture.jpg',
      excerpt: 'Cal Newport\'s case for why skills trump passion in the quest for work you love.',
      tags: ['Books', 'Career', 'Productivity'],
      slug: 'so-good-they-cant-ignore-you',
    }
  ],
}

export const contactData = {
  email: 'me@claycurry.com',
  phone: '+1 (405) 301-1055',
  location: 'San Francisco, CA',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.50764017948915!3d37.75780951542879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus',
} as const