import Header from "@/components/layout/Header";
import { Github, Linkedin, Twitter, Instagram } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="pt-32 pb-24 px-6">
        <div className="container-wide">
          <div className="grid md:grid-cols-[2fr_1fr] gap-16">
            <div>
              <h1 className="text-display mb-8 font-heading">About Me</h1>

              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  I'm Vikram Pareddy—a software engineer, writer, and
                  photographer based in Atlanta. I spend my days building
                  scalable systems and crafting thoughtful content.
                </p>

                <p>
                  By day, I'm an engineer at Microsoft, where I architect
                  systems that serve millions of users. I specialize in building
                  distributed systems, and making complicated things simple. I'm
                  passionate about design patterns, clean code, and mentoring
                  junior developers.
                </p>

                <p>
                  My journey into tech was mostly conventional. I've been
                  studying Computer Science and Software Engineering for years,
                  which taught me how to see patterns, tell stories, and solve
                  problems from unexpected angles. That perspective shapes how I
                  approach engineering today.
                </p>

                <p>
                  Photography has been a constant in my life for over a decade.
                  I started with digital, shooting landscapes and street
                  photography across the world. These days I split my time
                  between digital and analog, always chasing that perfect light.
                </p>

                <p>
                  This blog is where all these interests collide. I write about
                  technology, share my photography, and explore the creative
                  process. If you're interested in code, cameras, or
                  creativity—stick around.
                </p>
              </div>

              <div className="mt-16">
                <h2 className="text-3xl font-bold mb-6 font-heading">
                  Let's Connect
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-6 mt-6">
                    <a
                      href="https://github.com/vikram-gsu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      <Github size={24} />
                    </a>
                    <a
                      href="https://linkedin.com/in/vikrampareddy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      <Linkedin size={24} />
                    </a>
                    <a
                      href="https://instagram.com/some.vikram"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      <Instagram size={24} name="some.vikram" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <img
                src="/assets/profile/hst_2023.jpg"
                alt="Vikram Pareddy"
                className="w-full h-auto mb-8"
              />
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-3 font-heading">
                    Current Focus
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Building distributed systems at scale</li>
                    <li>• Writing about Python design patterns</li>
                    <li>
                      • Working on building AI agents to help small businesses
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3 font-heading">
                    Location
                  </h3>
                  <p className="text-muted-foreground">Atlanta, Georgia</p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3 font-heading">
                    Skills & Tools
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Python, TypeScript, React, Agents, Evals, Distributed
                    Systems, Azure, System Design, Technical Writing, Film
                    Photography
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
