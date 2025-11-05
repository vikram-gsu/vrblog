import { useState } from "react";
import Header from "@/components/layout/Header";
import PhotoLightbox from "@/components/photography/PhotoLightbox";
import { photos } from "@/data/photos";

const Photography = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const categories = Array.from(new Set(photos.map(p => p.category)));
  
  const filteredPhotos = selectedCategory
    ? photos.filter(p => p.category === selectedCategory)
    : photos;
  
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
              className={`px-4 py-2 text-sm uppercase tracking-wide transition-colors ${
                !selectedCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm uppercase tracking-wide transition-colors ${
                  selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {category}
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
