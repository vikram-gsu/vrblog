export interface Photo {
  id: number;
  src: string;
  description: string;
  category: string;
  width: number;
  height: number;
}

export const photos: Photo[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    description: "Morning light breaking through mountain peaks in the Pacific Northwest. Captured during a solo backpacking trip where I learned that the best photos happen when you wake up before the sun.",
    category: "landscape",
    width: 1920,
    height: 1280
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b",
    description: "Urban exploration in downtown Los Angeles. This abandoned building told stories through its peeling paint and shattered windows. Shot on film with my old Minolta.",
    category: "urban",
    width: 1280,
    height: 1920
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    description: "Street portrait of a musician in New Orleans' French Quarter. He'd been playing that corner for 30 years. We talked for an hour after this shot.",
    category: "portrait",
    width: 1280,
    height: 1920
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6",
    description: "Golden hour on the California coast. The light was perfect for exactly 8 minutes. I took 47 shots and kept this one.",
    category: "landscape",
    width: 1920,
    height: 1280
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2",
    description: "Reflections in downtown Chicago. Sometimes the most interesting shots are in puddles, not skylines.",
    category: "urban",
    width: 1920,
    height: 1280
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    description: "Natural light portrait during a creative collaboration. The subject is a fellow photographer—we took turns behind the camera.",
    category: "portrait",
    width: 1280,
    height: 1920
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    description: "Foggy morning in Yosemite Valley. I'd hiked to this spot in the dark, waiting for sunrise. Nature delivered.",
    category: "landscape",
    width: 1920,
    height: 1280
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1514315384763-ba401779410f",
    description: "Night photography in Tokyo's Shibuya district. The energy of this city at night is impossible to capture, but I tried.",
    category: "urban",
    width: 1280,
    height: 1920
  }
];
