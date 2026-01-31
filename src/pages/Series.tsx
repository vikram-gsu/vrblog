import { useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { getSeries } from "@/lib/content";

const Series = () => {
  const allSeries = useMemo(() => getSeries(), []);
  
  if (allSeries.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        
        <main className="pt-32 pb-24 px-6">
          <div className="container-wide">
            <h1 className="text-display mb-8">Series</h1>
            <div className="text-center py-24">
              <p className="text-xl text-muted-foreground mb-4">No series yet</p>
              <p className="text-muted-foreground">
                Add series to <code className="bg-secondary px-2 py-1 rounded">content/series/</code> folder
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-24 px-6">
        <div className="container-wide">
          <h1 className="text-display mb-8">Series</h1>
          <p className="text-xl text-muted-foreground mb-16 max-w-2xl">
            In-depth explorations of topics that deserve more than a single blog post. 
            Each series builds progressively, so start from the beginning.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {allSeries.map(s => (
              <Link
                key={s.id}
                to={`/series/${s.id}`}
                className="group block"
              >
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-12 mb-6 aspect-video flex items-center justify-center transition-all duration-300 group-hover:from-primary/20 group-hover:to-primary/10">
                  <h2 className="text-4xl font-bold text-center">{s.title}</h2>
                </div>
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-sm uppercase tracking-wide text-muted-foreground">
                    {s.posts.length} parts
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Series;
