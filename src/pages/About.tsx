import Header from "@/components/layout/Header";
import { Github, Linkedin, Twitter, Instagram, Mail } from "lucide-react";

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
                  I'm Vikram Pareddy—a software engineer, writer, and photographer based in Los Angeles. 
                  I spend my days building scalable systems and crafting thoughtful content.
                </p>
                
                <p>
                  By day, I'm a senior engineer at a tech company you've probably heard of, where I architect 
                  systems that serve millions of users. I specialize in Python, distributed systems, and making 
                  complicated things simple. I'm passionate about design patterns, clean code, and mentoring 
                  junior developers.
                </p>
                
                <p>
                  My journey into tech was unconventional. I came from a background in creative fields that 
                  taught me how to see patterns, tell stories, and solve problems from unexpected angles. 
                  That perspective shapes how I approach engineering today.
                </p>
                
                <p>
                  Photography has been a constant in my life for over a decade. I started with film, shooting 
                  landscapes and street photography across the American West. These days I split my time between 
                  digital and analog, always chasing that perfect light. My work has been featured in local galleries 
                  and online publications.
                </p>
                
                <p>
                  This blog is where all these interests collide. I write about technology, share my photography, 
                  and explore the creative process. If you're interested in code, cameras, or creativity—stick around.
                </p>
              </div>
              
              <div className="mt-16">
                <h2 className="text-3xl font-bold mb-6 font-heading">Let's Connect</h2>
                <div className="space-y-4">
                  <a 
                    href="mailto:vikram@vikrampareddy.com" 
                    className="flex items-center gap-3 link-underline text-lg"
                  >
                    <Mail size={20} />
                    vikram@vikrampareddy.com
                  </a>
                  <div className="flex gap-6 mt-6">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      <Github size={24} />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      <Linkedin size={24} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      <Twitter size={24} />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                      <Instagram size={24} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
                alt="Vikram Pareddy"
                className="w-full h-auto mb-8"
              />
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-3 font-heading">Current Focus</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Building distributed systems at scale</li>
                    <li>• Writing about Python design patterns</li>
                    <li>• Planning a photography trip to Iceland</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-3 font-heading">Location</h3>
                  <p className="text-muted-foreground">Los Angeles, California</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-3 font-heading">Skills & Tools</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Python, TypeScript, React, distributed systems, PostgreSQL, AWS, 
                    system design, technical writing, film photography
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
