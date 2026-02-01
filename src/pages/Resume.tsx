import { useState } from "react";
import Header from "@/components/layout/Header";
import { Download, FileText } from "lucide-react";

const Resume = () => {
  const [viewMode, setViewMode] = useState<"web" | "pdf">("web");

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-24 px-6">
        <div className="container-narrow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <h1 className="text-display">Resume</h1>
            <div className="flex gap-4 text-sm">
              <button
                onClick={() => setViewMode("web")}
                className={`px-4 py-2 rounded-full transition-colors ${
                  viewMode === "web"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Web Version
              </button>
              <button
                onClick={() => setViewMode("pdf")}
                className={`px-4 py-2 rounded-full transition-colors ${
                  viewMode === "pdf"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                Download PDF
              </button>
            </div>
          </div>

          {viewMode === "web" ? (
            <div className="space-y-12">
              {/* Summary */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-primary uppercase tracking-wide">
                  Summary
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Software Engineer with 10+ years of experience building
                  scalable distributed systems. Passionate about clean code,
                  design patterns, and mentoring junior developers. Proven track
                  record of leading technical initiatives that serve millions of
                  users while maintaining high code quality and team velocity.
                </p>
              </section>

              {/* Experience */}
              <section>
                <h2 className="text-xl font-bold mb-6 text-primary uppercase tracking-wide">
                  Experience
                </h2>
                <div className="space-y-10">
                  <div className="border-l-2 border-border pl-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-2">
                      <h3 className="text-xl font-bold">Software Engineer</h3>
                      <span className="text-sm text-muted-foreground">
                        2022 – Present
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Microsoft, Atlanta, GA
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Led migration of monolithic architecture to
                          microservices, reducing deployment time by 70%
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Architected real-time notification system serving 5M+
                          users with 99.9% uptime
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Mentored 6 junior engineers, 4 of whom were promoted
                          to mid-level roles
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Designed and implemented telemetry systems to monitor
                          application performance and reliability
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-border pl-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-2">
                      <h3 className="text-xl font-bold">Software Engineer</h3>
                      <span className="text-sm text-muted-foreground">
                        2020 – 2022
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      StartupXYZ • Los Angeles, CA
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Built core features for SaaS platform used by 10,000+
                          businesses
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Designed and implemented RESTful APIs with
                          comprehensive documentation
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Collaborated with product team to translate business
                          requirements into technical solutions
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-border pl-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-2">
                      <h3 className="text-xl font-bold">Junior Developer</h3>
                      <span className="text-sm text-muted-foreground">
                        2019 – 2020
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Digital Agency • Remote
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Developed custom WordPress plugins and themes for
                          client websites
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>
                          Participated in code reviews and learned best
                          practices from senior developers
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Skills */}
              <section>
                <h2 className="text-xl font-bold mb-6 text-primary uppercase tracking-wide">
                  Skills
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Languages</h3>
                    <p className="text-muted-foreground">
                      Python, TypeScript, SQL
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Frameworks</h3>
                    <p className="text-muted-foreground">
                      React, Node.js, FastAPI, Express.js
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Infrastructure</h3>
                    <p className="text-muted-foreground">Azure, Docker</p>
                  </div>
                </div>
              </section>

              {/* Education */}
              <section>
                <h2 className="text-xl font-bold mb-6 text-primary uppercase tracking-wide">
                  Education
                </h2>
                <div className="border-l-2 border-border pl-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-2">
                    <h3 className="text-xl font-bold">
                      Full-Stack Web Development
                    </h3>
                    <span className="text-sm text-muted-foreground">2019</span>
                  </div>
                  <p className="text-muted-foreground">
                    Coding Bootcamp • San Francisco, CA
                  </p>
                </div>
              </section>

              {/* Projects */}
              <section>
                <h2 className="text-xl font-bold mb-6 text-primary uppercase tracking-wide">
                  Projects
                </h2>
                <div className="space-y-6">
                  <div className="border-l-2 border-border pl-6">
                    <h3 className="text-lg font-bold mb-2">
                      Personal Blog & Portfolio
                    </h3>
                    <p className="text-muted-foreground">
                      Built with React, TypeScript, and Tailwind CSS. Features
                      photography gallery with custom lightbox, blog with
                      search/filtering, and fully responsive design.
                    </p>
                  </div>
                  <div className="border-l-2 border-border pl-6">
                    <h3 className="text-lg font-bold mb-2">
                      Python Design Patterns Series
                    </h3>
                    <p className="text-muted-foreground">
                      Comprehensive technical writing series exploring classic
                      design patterns with Python implementations. Read by
                      50,000+ developers.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-secondary/50 rounded-lg p-12 max-w-md mx-auto">
                <FileText size={48} className="mx-auto mb-6 text-primary" />
                <h2 className="text-2xl font-bold mb-4">Resume PDF</h2>
                <p className="text-muted-foreground mb-8">
                  Upload your resume PDF to{" "}
                  <code className="bg-secondary px-2 py-1 rounded text-sm">
                    public/resume.pdf
                  </code>{" "}
                  to enable downloads.
                </p>
                <a
                  href="/resume.pdf"
                  download="vikram-pareddy-resume.pdf"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity"
                >
                  <Download size={18} />
                  Download PDF
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Resume;
