import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import PhotoLightbox from "@/components/photography/PhotoLightbox";
import { getPhotos } from "@/lib/content";
import { toPascalCase } from "@/lib/utils";

const Photography = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const photos = useMemo(() => getPhotos(), []);
  const categories = useMemo(() => Array.from(new Set(photos.map(p => p.category))), [photos]);
  
  const filteredPhotos = selectedCategory
    ? photos.filter(p => p.category === selectedCategory)
    : photos;

  // Show placeholder message if no photos
  if (photos.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        
        <main className="pt-32 pb-24 px-6">
          <div className="container-wide">
            <h1 className="text-display mb-8">Photography</h1>
            <div className="text-center py-24">
              <p className="text-xl text-muted-foreground mb-4">No photos yet</p>
              <p className="text-muted-foreground">
                Add photos to <code className="bg-secondary px-2 py-1 rounded">content/photography/</code> folder
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
          <h1 className="text-display mb-8">Photography</h1>
          
          {/* Category filter */}
          <div className="mb-12 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 text-sm tracking-wide transition-colors rounded-full ${
                !selectedCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm tracking-wide transition-colors rounded-full ${
                  selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {toPascalCase(category)}
              </button>
            ))}
          </div>
          
          {/* Masonry grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => setLightboxIndex(index)}
              >
                <img
                  src={photo.src}
                  alt={photo.description}
                  className="w-full h-auto transition-all duration-300 group-hover:opacity-90"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={filteredPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
};

export default Photography;
