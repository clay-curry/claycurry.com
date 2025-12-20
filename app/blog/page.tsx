import { Posts } from "@/components/posts";

export default function BlogPage() {

  const posts = [
    { slug: 'readme', date: '06 Jun 2025', title: "README", subtitle: "A review of how this website is constructed.", prefix: "'The Elements of Style' by William Strunk Jr. provides practical advice on how to improve your writing.", tags: ['Book Review'] },
    { slug: 'about', date: '04 Jun 2025', title: "About", subtitle: "The weekly routine that keeps me in shape", prefix: "This post outlines my workout routine, which consists of four sessions per week. It has all the details including the excercises, sets, reps, and weight.", tags: ['Health', 'Lifestyle'] }    
  ]

  return <main className="flex-1">
      
      <div className="w-full h-8"></div> {/* vertical space */}
      
      <section className="hero-section flex flex-col items-start justify-center min-h-[30vh] py-8 px-4">
        <div className="text-left space-y-4 animate-fade-in-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Blog
          </h1>
        </div>
      </section>

      <div>
        Pinned
      </div>
      <div className="py-4">
        <Posts entries={posts} filterEntries={false} />
      </div>

      <div>
        Recent
      </div>

      <Posts entries={posts} />
    </main>
}