import Header from "@/components/layout/Header";
import { upcomingShows, pastShows, comedyVideos } from "@/data/comedyShows";
import { ExternalLink } from "lucide-react";

const Comedy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-32 pb-24 px-6">
        <div className="container-wide">
          <h1 className="text-display mb-16">Comedy</h1>
          
          {/* Videos Section */}
          <section className="mb-24">
            <h2 className="text-4xl font-bold mb-8">Videos & Clips</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {comedyVideos.map(video => (
                <div key={video.id}>
                  <div className="aspect-video bg-secondary mb-4">
                    <iframe
                      width="100%"
                      height="100%"
                      src={video.embedUrl}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                </div>
              ))}
            </div>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 link-underline text-sm uppercase tracking-wide"
            >
              Watch more on YouTube <ExternalLink size={14} />
            </a>
          </section>
          
          {/* Upcoming Shows */}
          <section className="mb-24">
            <h2 className="text-4xl font-bold mb-12">Where to See Me Next</h2>
            {upcomingShows.length > 0 ? (
              <div className="space-y-12">
                {upcomingShows.map((show, index) => (
                  <div key={show.id}>
                    <div className="grid md:grid-cols-[120px_1fr] gap-6">
                      <div>
                        <div className="text-5xl font-bold">
                          {new Date(show.date).getDate()}
                        </div>
                        <div className="text-sm uppercase tracking-wide text-muted-foreground">
                          {new Date(show.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{show.venue}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{show.location}</p>
                        <p className="text-sm text-muted-foreground mb-4">{show.time} • {show.description}</p>
                        {show.ticketLink && (
                          <a
                            href={show.ticketLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 link-underline text-sm uppercase tracking-wide"
                          >
                            Get Tickets <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                    {index < upcomingShows.length - 1 && (
                      <hr className="mt-12 border-border" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xl text-muted-foreground">No shows scheduled. Check back soon!</p>
            )}
          </section>
          
          {/* Past Shows */}
          {pastShows.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-8 text-muted-foreground">Past Shows</h2>
              <div className="space-y-6">
                {pastShows.map(show => (
                  <div key={show.id} className="opacity-60">
                    <div className="flex gap-4 items-baseline">
                      <time className="text-sm uppercase tracking-wide text-muted-foreground min-w-[100px]">
                        {new Date(show.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                      <div>
                        <span className="font-bold">{show.venue}</span>
                        <span className="text-muted-foreground"> • {show.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Comedy;
