export type CampusEvent = {
  id: string;
  title: string;
  description: string;
  category: string;
  startsAt: string;
  location: string;
  priceCents: number;
  capacity: number;
  ticketsSold: number;
  image: string;
  imageAlt: string;
  accent: string;
  published: boolean;
};

const events: CampusEvent[] = [
  {
    id: "tartan-fall-market",
    title: "Tartan Fall Market",
    description: "Local makers, warm cider, and one more reason to linger on campus.",
    category: "MARKET · OUTDOORS",
    startsAt: "2026-10-24T11:00:00-04:00",
    location: "Cohon University Center",
    priceCents: 1200,
    capacity: 120,
    ticketsSold: 78,
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "A lively outdoor gathering under string lights",
    accent: "#e85b3f",
    published: true,
  },
  {
    id: "jazz-on-the-cut",
    title: "Jazz on the Cut",
    description: "A brass-forward set from student musicians, with the city as a backdrop.",
    category: "LIVE MUSIC",
    startsAt: "2026-10-30T19:00:00-04:00",
    location: "The Fence, Carnegie Mellon",
    priceCents: 800,
    capacity: 90,
    ticketsSold: 54,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Stage lights glowing over a live music crowd",
    accent: "#4e78b8",
    published: true,
  },
  {
    id: "tartan-film-festival",
    title: "Tartan Film Festival",
    description: "Big-screen premieres and short films made by the people around you.",
    category: "FILM · ARTS",
    startsAt: "2026-11-06T18:00:00-05:00",
    location: "McConomy Auditorium",
    priceCents: 600,
    capacity: 140,
    ticketsSold: 140,
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Rows of red seats in a movie theater",
    accent: "#7b6a9a",
    published: true,
  },
  {
    id: "makers-night",
    title: "Riverfront Makers Night",
    description: "Make something with your hands, meet someone new, take home a story.",
    category: "MAKING · COMMUNITY",
    startsAt: "2026-11-14T17:00:00-05:00",
    location: "The Andy Warhol Museum",
    priceCents: 0,
    capacity: 300,
    ticketsSold: 127,
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "Friends sharing a meal around a table",
    accent: "#4b8a70",
    published: true,
  },
];

export function getUpcomingEvents(now = new Date()) {
  return events
    .filter((event) => event.published && new Date(event.startsAt) > now)
    .map((event) => ({
      ...event,
      seatsRemaining: Math.max(0, event.capacity - event.ticketsSold),
    }));
}