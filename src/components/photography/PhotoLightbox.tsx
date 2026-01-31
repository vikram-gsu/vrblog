import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "@/lib/content";

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const PhotoLightbox = ({ photos, currentIndex, onClose, onNavigate }: PhotoLightboxProps) => {
  const [showDescription, setShowDescription] = useState(false);
  const currentPhoto = photos[currentIndex];
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        setShowDescription(prev => !prev);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);
  
  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    onNavigate(newIndex);
    setShowDescription(false);
  };
  
  const handleNext = () => {
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    onNavigate(newIndex);
    setShowDescription(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X size={32} />
      </button>
      
      {/* Navigation arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-6 text-white/80 hover:text-white transition-colors z-10"
        aria-label="Previous photo"
      >
        <ChevronLeft size={48} />
      </button>
      
      <button
        onClick={handleNext}
        className="absolute right-6 text-white/80 hover:text-white transition-colors z-10"
        aria-label="Next photo"
      >
        <ChevronRight size={48} />
      </button>
      
      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <img
          src={currentPhoto.src}
          alt={currentPhoto.description}
          className="max-w-full max-h-[90vh] object-contain"
        />
        
        {/* Description overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-black/85 text-white p-8 transition-all duration-300 ${
            showDescription ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <p className="text-sm md:text-base leading-relaxed">{currentPhoto.description}</p>
        </div>
      </div>
      
      {/* Hint text */}
      <div className="absolute bottom-6 right-6 text-white/50 text-xs">
        Press D for description
      </div>
      
      {/* Counter */}
      <div className="absolute bottom-6 left-6 text-white/50 text-sm">
        {currentIndex + 1} / {photos.length}
      </div>
    </div>
  );
};

export default PhotoLightbox;
