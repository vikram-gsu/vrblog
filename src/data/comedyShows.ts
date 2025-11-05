export interface ComedyShow {
  id: number;
  date: string;
  venue: string;
  location: string;
  time: string;
  description: string;
  ticketLink?: string;
  isPast?: boolean;
}

export const upcomingShows: ComedyShow[] = [
  {
    id: 1,
    date: "2024-12-15",
    venue: "The Comedy Store",
    location: "Los Angeles, CA",
    time: "8:00 PM",
    description: "Special holiday show with surprise guests. Bringing my new tech-themed material—finally putting my day job to good use.",
    ticketLink: "https://thecomedystore.com"
  },
  {
    id: 2,
    date: "2024-12-28",
    venue: "Laugh Factory",
    location: "Hollywood, CA",
    time: "9:30 PM",
    description: "Late night set. Testing new material about AI and the absurdity of tech culture.",
    ticketLink: "https://laughfactory.com"
  },
  {
    id: 3,
    date: "2025-01-10",
    venue: "The Improv",
    location: "San Francisco, CA",
    time: "7:00 PM",
    description: "First show of the new year! Bringing the heat to my hometown crowd.",
    ticketLink: "https://improv.com"
  },
  {
    id: 4,
    date: "2025-01-22",
    venue: "Comedy Cellar",
    location: "New York, NY",
    time: "10:00 PM",
    description: "East coast debut! Beyond excited to perform at this legendary club.",
    ticketLink: "https://comedycellar.com"
  }
];

export const pastShows: ComedyShow[] = [
  {
    id: 5,
    date: "2024-10-30",
    venue: "The Comedy Underground",
    location: "Seattle, WA",
    time: "8:00 PM",
    description: "Sold out Halloween special. Dressed as a deprecated API.",
    isPast: true
  },
  {
    id: 6,
    date: "2024-09-15",
    venue: "Punch Line Comedy Club",
    location: "Sacramento, CA",
    time: "9:00 PM",
    description: "Weekend headlining set. Great crowd, terrible hotel.",
    isPast: true
  }
];

export const comedyVideos = [
  {
    id: 1,
    title: "Why Developers Make Terrible Roommates",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "5 minute set from The Comedy Store"
  },
  {
    id: 2,
    title: "Dating Apps: A Developer's Nightmare",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "My take on swiping culture and algorithm optimization"
  }
];
