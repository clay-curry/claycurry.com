import { getAllPostsMetadata } from './blog/loader'
import { WritingsSection } from '@/lib/components/site/writings-section'
import { Hero } from '@/lib/components/site/hero'
import { AboutSection } from '@/lib/components/site/about-section'

export default function AboutPage() {

  // Page owns data acquisition; WritingsSection stays a pure presentation component.
  // This keeps filesystem loading visible at the server-component boundary, avoids
  // coupling the component to the data source, and allows future reuse with
  // different post sets (filtered, paginated, from a CMS, etc.).
  const posts = getAllPostsMetadata()

  return (
    <div className="py-8 md:py-12 space-y-12 md:space-y-14 flex flex-col gap-10">
      <Hero />
      <AboutSection />
      <WritingsSection posts={posts} />
    </div>
  )
}
