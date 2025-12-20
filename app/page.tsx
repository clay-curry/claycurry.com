"use client";

export default function HomePage() {
  return (
    <section className="hero-section flex flex-col items-start justify-center px-4">
      <div className="text-left pl-4 space-y-4 animate-fade-in-left min-h-[50vh] pt-24">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
          Hi, I'm <span className="font-bold">Clay</span>.
        </h1>
        <p className="mt-12 max-w-2xl text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
          Comrade in the digital realm; horticulturalist for software
          ecosystems.
        </p>
      </div>

      <style jsx>{`
          @keyframes fadeInEffect {
            to {
              opacity: 1;
            }
          }
        `}</style>
      <div
        className="w-full max-w-3xl mt-16 p-6 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 opacity-0 transition-opacity duration-700"
        style={{
          animation: "fadeInEffect 0.5s forwards",
          animationDelay: ".3s",
        }}
      >
        <h2 className="text-2xl font-semibold underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600 mb-4">
          Experience
        </h2>
        <p className="text-gray-800 dark:text-gray-200 mb-2">
          My career centers on AI-driven applications across defense and
          e-commerce:
        </p>
        <ol className="space-y-2 list-decimal ml-6 text-gray-700 dark:text-gray-300">
          <li>
            <span className="font-semibold">Amazon.com:</span> Core Shopping
            (Homepage, Detail Page, OffersX). Software Dev Engineer.
          </li>
          <li>
            <span className="font-semibold">
              Oklahoma Aerospace and Defense Institute:
            </span>{" "}
            US Air Force. Lab Assist - Computer Vision .
          </li>
          <li>
            <span className="font-semibold">Oklahoma University:</span>{" "}
            Department of Physics & Astronomy. Linux System Admin.
          </li>
        </ol>
      </div>
      <div
        className="w-full max-w-3xl mt-16 p-6 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 opacity-0 transition-opacity duration-700"
        style={{
          animation: "fadeInEffect 0.5s forwards",
          animationDelay: ".3s",
        }}
      >
        <h2 className="text-2xl font-semibold underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600 mb-4">
          Open Source Software
        </h2>
        <p className="text-gray-800 dark:text-gray-200 mb-2">
          Contributions, discussions, and involvement.
        </p>
        <ol className="space-y-2 list-decimal ml-6 text-gray-700 dark:text-gray-300">
          <li>
            <span className="font-semibold">TODO:</span> implement activity
            monitor
          </li>
        </ol>
      </div>
    </section>
  );
}
