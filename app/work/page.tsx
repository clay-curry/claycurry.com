import UnderConstruction from "@/components/under-construction";

export default function WorkPage() {
  return (
    <main className="flex-1">
      <div className="w-full h-8"></div> {/* vertical space */}
      <section className="hero-section flex flex-col items-start justify-center min-h-[30vh] py-8 px-4">
        <div className="text-left space-y-4 animate-fade-in-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Work
          </h1>
        </div>
      </section>
      <UnderConstruction />
    </main>
  );
}
