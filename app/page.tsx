import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (

      <section className="hero-section flex flex-col items-start justify-center min-h-[50vh] py-8 px-4">
        <div className="text-left pl-4 space-y-4 animate-fade-in-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Hi, I'm <span className="font-bold">Clay</span>.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mt-6">
            Welcome to my corner of the internet.
          </p>
        </div>
      </section>

  )
}