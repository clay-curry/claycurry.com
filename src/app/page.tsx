"use client";
import { PageViews } from "@/src/lib/components/page-views";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/lib/components/ui/accordion";

export default () =>
    <>
      <style jsx>{`
        @keyframes fadeInEffect {
          to {
            opacity: 1;
          }
        }
      `}</style>

      {/* Contact Section */}
      <section 
        className="hero-section flex flex-col items-start justify-center px-4"
      >
        <div 
          className="text-left pl-4 space-y-4 animate-fade-in-left min-h-[30vh] pt-24"
        >
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
          >
            Clay Curry
          </h1>
          <p 
            className="mt-4 text-lg text-gray-700 dark:text-gray-200"
          >
            Seattle, Washington |{" "}
            <a
              href="mailto:me@claycurry.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              me@claycurry.com
            </a>
          </p>

          <div className="flex gap-4 text-lg">
            <a
              href="https://github.com/clay-curry"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/clay-curry"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </section>



      {/* Content Section - Centered and Full Width */}
      <section 
        className="w-full flex flex-col items-center px-4"
      >

        {/* Page Views Counter */}
        <div className="w-full max-w-6xl flex justify-end mt-4">
          <PageViews />
        </div>

        {/* Candidate Profile Summary */}
        <div
          className="w-full max-w-6xl mt-12 p-6 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 opacity-0 transition-opacity duration-700"
          style={{
            animation: "fadeInEffect 0.5s forwards",
            animationDelay: ".2s",
          }}
        >
          <h2 className="text-2xl font-semibold underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600 mb-4">
            About Me
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              I enjoy building highly visible software within large, legacy systems at scale, finding tremendous 
              satisfaction in learning they create value for users and growing their impact.
            </p>

            <p>
              I am very comfortable with Python, JavaScript, Golang; talking to caches, databases, queues, and web 
              servers; and building out systems end-to-end. 
            </p>

          </div>
        </div>

        {/* Professional Experience */}
        <div
          className="w-full max-w-6xl mt-8 p-6 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 opacity-0 transition-opacity duration-700"
          style={{
            animation: "fadeInEffect 0.5s forwards",
            animationDelay: ".4s",
          }}
        >
          <h2 className="text-2xl font-semibold underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600 mb-4">
            Professional Experience
          </h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
                <div className="flex flex-1 justify-between items-start">
                  <span>Amazon.com — Software Development Engineer</span>
                  <span className="font-normal text-gray-600 dark:text-gray-400">Nov 2024 – Current</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-between text-gray-900 dark:text-gray-100">
                  <span><span className="font-bold">Organization:</span> Core Shopping (
                    <a 
                      href="https://www.amazon.com/dp/0471417432"
                      className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600"
                    >
                        Detail Page
                    </a>, <a 
                      href="https://www.helium10.com/blog/what-is-the-amazon-buy-box/#what-is-the-buy-box-on-amazon"
                      className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600"
                    >
                        Buybox
                    </a>)
                  </span>
                  <span>Seattle, WA</span>
                </div>

                <ul className="mt-2 space-y-2 list-disc ml-6 text-gray-700 dark:text-gray-300">
                  <li>
                    Owned a Buybox ranking upgrade for used book offers, producing affordability savings for customers 
                    resulting in 9.7MM lift in annualized units sold and $30.2 MM lift in annualized OPS 
                  </li>


                  <li>
                    Expanded the Buybox "Join Prime" accordion button to 24 countries, producing 5 additional service 
                    and business metrics.
                  </li>

                  <li>
                    Participated in a 24x7 engineering on-call rotation for Buybox to ensure
                    service uptime and subject matter expert availability.
                  </li>

                </ul>

              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
                <div className="flex flex-1 justify-between items-start">
                  <span>University of Oklahoma — Linux System Administrator</span>
                  <span className="font-normal text-gray-600 dark:text-gray-400">Feb 2021 – Jan 2023</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-between text-gray-900 dark:text-gray-100">
                  <span><span className="font-bold">Organization:</span> Department of Physics</span>
                  <span>Norman, OK</span>
                </div>

                <ul className="mt-2 space-y-2 list-disc ml-6 text-gray-700 dark:text-gray-300">

                  <li>

                    Administered 72 research Red Hat Enterprise Linux workstations for

                    numerical computing workloads.

                  </li>

                  <li>

                    Saved 4 weeks of annual IT operational effort by streamlining

                    inventory-taking procedures using background jobs.

                  </li>

                  <li>

                    Ported legacy department website content to modern content

                    management software, leveraging Python to automate the transfer of

                    120 pages of structured data.

                  </li>

                </ul>


              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Education */}
        <div
          className="w-full max-w-6xl mt-8 p-6 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 opacity-0 transition-opacity duration-700"
          style={{
            animation: "fadeInEffect 0.5s forwards",
            animationDelay: ".6s",
          }}
        >

          <h2 className="text-2xl font-semibold underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600 mb-4">
            Education
          </h2>

          <Accordion type="single" collapsible>
            <AccordionItem value="edu-1">
              <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
                <div className="flex flex-1 justify-between items-start">
                  <span>Computer Science, B.S.</span>
                  <span className="font-normal text-gray-600 dark:text-gray-400">Dec 2023</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-gray-700 dark:text-gray-300">
                  <p>University of Oklahoma. Mathematics minor.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Certifications */}
        <div
          className="w-full max-w-6xl mt-8 p-6 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 opacity-0 transition-opacity duration-700"
          style={{
            animation: "fadeInEffect 0.5s forwards",
            animationDelay: ".8s",
          }}
        >
          <h2 className="text-2xl font-semibold underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600 mb-4">
            Certifications
          </h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="cert-1">
              <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
                <div className="flex flex-1 justify-between items-start">
                  <span>AWS Solutions Architect – Professional</span>
                  <span className="font-normal text-gray-600 dark:text-gray-400">Nov 2025</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-gray-700 dark:text-gray-300">
                  <a 
                    href="https://www.credly.com/badges/c4d07372-5471-409a-a842-950f6b94dab4/public_url" 
                    className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600"
                  >
                    Proof of Certification
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>

        </div>



        {/* Awards and Honors */}

        <div

          className="w-full max-w-6xl mt-8 p-6 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 opacity-0 transition-opacity duration-700"

          style={{

            animation: "fadeInEffect 0.5s forwards",

            animationDelay: "1.0s",

          }}

        >

          <h2 className="text-2xl font-semibold underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600 mb-4">

            Awards and Honors

          </h2>

          <Accordion type="single" collapsible>

            <AccordionItem value="award-1">
              <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
                <div className="flex flex-1 justify-between items-start">
                  <span>Association for Computing Machinery (ACM), Oklahoma Student Chapter</span>
                  <span className="font-normal text-gray-600 dark:text-gray-400">Sep 2021 – Sep 2022</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-between text-gray-900 dark:text-gray-100">
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Position:</span> President, Chair
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Advisor:</span> <a href="https://www.linkedin.com/in/rafal-jabrzemski-0546464/" className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600">Rafal Jabrzemski</a>
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="award-2">
              <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
                <div className="flex flex-1 justify-between items-start">
                  <span>Association for Women in Computing (Student Chapter)</span>
                  <span className="font-normal text-gray-600 dark:text-gray-400">Apr 2021 – Sep 2022</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-between text-gray-900 dark:text-gray-100">
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Position:</span> Treasurer
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    <span className="font-bold">Advisor:</span> <a href="https://www.linkedin.com/in/sridhar-radhakrishnan-b3591817/" className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600">Sridhar Radhakrishnan</a>
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="award-3">
              <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
                <div className="flex flex-1 justify-between items-start">
                  <span>Oklahoma Rising Scholars Award (formerly Academic Scholars Program)</span>
                  <span className="font-normal text-gray-600 dark:text-gray-400">May 2017</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-between text-gray-900 dark:text-gray-100">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-bold">Issued by:</span> Oklahoma State Regents for Higher Education
                    </p>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">
                      Oklahoma students can automatically qualify for the program by scoring at or above the 99.5 percentile on the ACT or SAT
                    </p>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <a href="/highschool-transcript.jpeg" className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600">Proof</a>
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>

        </div>



        {/* Test Scores */}

        <div

          className="w-full max-w-6xl mt-8 mb-16 p-6 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-gray-100 dark:border-zinc-800 opacity-0 transition-opacity duration-700"

          style={{

            animation: "fadeInEffect 0.5s forwards",

            animationDelay: "1.2s",

          }}

        >

          <h2 className="text-2xl font-semibold underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600 mb-4">

            Test Scores

          </h2>

          <Accordion type="single" collapsible>

            <AccordionItem value="test-1">
              <AccordionTrigger className="font-semibold text-gray-900 dark:text-gray-100">
                <div className="flex flex-1 justify-between items-start">
                  <span>ACT exam: 34 / 36</span>
                  <span className="font-normal text-gray-600 dark:text-gray-400">Sep 2016</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex justify-between text-gray-900 dark:text-gray-100">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-bold">College Readiness Exam:</span> University of Oklahoma
                    </p>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    <a href="/highschool-transcript.jpeg" className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-400 dark:decoration-blue-600">Proof</a>
                  </span>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>

        </div>

      </section>

    </>;