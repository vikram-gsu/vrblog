import { useState } from "react";
import Header from "@/components/layout/Header";
import { Download } from "lucide-react";

const Resume = () => {
  const [viewMode, setViewMode] = useState<"web" | "pdf">("web");
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-24 px-6">
        <div className="container-narrow">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-display">Resume</h1>
            <div className="flex gap-4 text-sm">
              <button
                onClick={() => setViewMode("web")}
                className={`link-underline uppercase tracking-wide ${viewMode === "web" ? "text-primary" : ""}`}
              >
                Web Version
              </button>
              <button
                onClick={() => setViewMode("pdf")}
                className={`link-underline uppercase tracking-wide ${viewMode === "pdf" ? "text-primary" : ""}`}
              >
                Download PDF
              </button>
            </div>
          </div>
          
          {viewMode === "web" ? (
            <div className="space-y-16">
              {/* Summary */}
              <section>
                <h2 className="text-3xl font-bold mb-6">Professional Summary</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  Senior Software Engineer with 5+ years of experience building scalable distributed systems. 
                  Passionate about clean code, design patterns, and mentoring junior developers. Proven track 
                  record of leading technical initiatives that serve millions of users while maintaining 
                  high code quality and team velocity.
                </p>
              </section>
              
              {/* Experience */}
              <section>
                <h2 className="text-3xl font-bold mb-8">Experience</h2>
                <div className="space-y-12">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="text-2xl font-bold">Senior Software Engineer</h3>
                      <span className="text-sm uppercase tracking-wide text-muted-foreground">2022 - Present</span>
                    </div>
                    <p className="text-lg mb-4">TechCorp • San Francisco, CA</p>
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                      <li>Led migration of monolithic architecture to microservices, reducing deployment time by 70%</li>
                      <li>Architected real-time notification system serving 5M+ users with 99.9% uptime</li>
                      <li>Mentored 6 junior engineers, 4 of whom were promoted to mid-level roles</li>
                      <li>Implemented comprehensive testing strategy that increased code coverage from 45% to 85%</li>
                      <li>Reduced API response times by 40% through database optimization and caching strategies</li>
                    </ul>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="text-2xl font-bold">Software Engineer</h3>
                      <span className="text-sm uppercase tracking-wide text-muted-foreground">2020 - 2022</span>
                    </div>
                    <p className="text-lg mb-4">StartupXYZ • Los Angeles, CA</p>
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                      <li>Built core features for SaaS platform used by 10,000+ businesses</li>
                      <li>Designed and implemented RESTful APIs with comprehensive documentation</li>
                      <li>Collaborated with product team to translate business requirements into technical solutions</li>
                      <li>Improved application performance through code optimization and infrastructure upgrades</li>
                    </ul>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="text-2xl font-bold">Junior Developer</h3>
                      <span className="text-sm uppercase tracking-wide text-muted-foreground">2019 - 2020</span>
                    </div>
                    <p className="text-lg mb-4">Digital Agency • Remote</p>
                    <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                      <li>Developed custom WordPress plugins and themes for client websites</li>
                      <li>Maintained and enhanced existing web applications</li>
                      <li>Participated in code reviews and learned best practices from senior developers</li>
                    </ul>
                  </div>
                </div>
              </section>
              
              {/* Skills */}
              <section>
                <h2 className="text-3xl font-bold mb-6">Skills & Technologies</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold mb-2">Languages:</h3>
                    <p className="text-muted-foreground">Python, TypeScript, JavaScript, SQL, Bash</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Frameworks & Libraries:</h3>
                    <p className="text-muted-foreground">React, Node.js, FastAPI, Django, Express.js</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Infrastructure & Tools:</h3>
                    <p className="text-muted-foreground">AWS, Docker, Kubernetes, PostgreSQL, Redis, MongoDB, Git, CI/CD</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Practices:</h3>
                    <p className="text-muted-foreground">Agile/Scrum, Test-Driven Development, System Design, Code Review, Technical Documentation</p>
                  </div>
                </div>
              </section>
              
              {/* Education */}
              <section>
                <h2 className="text-3xl font-bold mb-6">Education</h2>
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-2xl font-bold">Full-Stack Web Development</h3>
                    <span className="text-sm uppercase tracking-wide text-muted-foreground">2019</span>
                  </div>
                  <p className="text-lg text-muted-foreground">Coding Bootcamp • San Francisco, CA</p>
                </div>
              </section>
              
              {/* Projects */}
              <section>
                <h2 className="text-3xl font-bold mb-6">Notable Projects</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Personal Blog & Portfolio</h3>
                    <p className="text-muted-foreground mb-2">
                      Built with React, TypeScript, and Tailwind CSS. Features photography gallery with custom 
                      lightbox, blog with search/filtering, and comedy show listings. Fully responsive and optimized 
                      for performance.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Python Design Patterns Series</h3>
                    <p className="text-muted-foreground mb-2">
                      Comprehensive technical writing series exploring classic design patterns with Python 
                      implementations. Read by 50,000+ developers and cited in university curricula.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="text-center py-24">
              <Download size={48} className="mx-auto mb-6 text-primary" />
              <h2 className="text-2xl font-bold mb-4">Download Resume PDF</h2>
              <p className="text-muted-foreground mb-8">
                Click the button below to download a PDF version of my resume
              </p>
              <a
                href="/resume-alex-chen.pdf"
                download
                className="inline-block bg-primary text-primary-foreground px-8 py-4 text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              >
                Download PDF
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Resume;
