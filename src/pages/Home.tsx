import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="container-wide">
            <div className="max-w-4xl">
              <h1 className="text-hero mb-8 font-heading">
                Vikram Pareddy
              </h1>
              <p className="text-display mb-8 text-muted-foreground">
                Developer. Writer. Creator.
              </p>
              <p className="text-xl md:text-2xl leading-relaxed max-w-2xl mb-12">
                I write code during the day, words in the evening, and jokes at night. 
                Sometimes they overlap. This is where I share all of it.
              </p>
              <div className="flex gap-6 text-sm">
                <Link to="/blog" className="link-underline uppercase tracking-wide">
                  Read the blog →
                </Link>
                <Link to="/photography" className="link-underline uppercase tracking-wide">
                  View photos →
                </Link>
                <Link to="/about" className="link-underline uppercase tracking-wide">
                  About me →
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Quick intro section */}
        <section className="py-24 px-6 border-t border-border">
          <div className="container-wide">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-4 font-heading">Technology</h3>
                <p className="text-muted-foreground">
                  Senior engineer building systems that scale. Python enthusiast. 
                  Design pattern evangelist. I write about code, careers, and learning.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 font-heading">Photography</h3>
                <p className="text-muted-foreground">
                  Capturing moments in landscapes, streets, and portraits. 
                  Film photographer turned digital. Always chasing the light.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
