export interface Testimonial {
  id: number;
  name: string;
  classCity: string;
  avatarIndex: number;
  rating: number;
  text: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Aarav Mehta",
    classCity: "Class 12 · Mumbai",
    avatarIndex: 0,
    rating: 5,
    text: "The way concepts are explained here is unreal. I finally understood calculus after years of struggling. Highly recommend to every student!",
  },
  {
    id: 2,
    name: "Priya Sharma",
    classCity: "Class 11 · Delhi",
    avatarIndex: 1,
    rating: 5,
    text: "I went from failing Chemistry to scoring 94 in boards. The teachers are patient and the practice tests are exactly like the real exam.",
  },
  {
    id: 3,
    name: "Rohan Das",
    classCity: "Class 12 · Kolkata",
    avatarIndex: 2,
    rating: 5,
    text: "The Computer Science modules are incredible. I built my first full-stack project after just 2 months of following the course.",
  },
  {
    id: 4,
    name: "Sneha Iyer",
    classCity: "Class 10 · Bengaluru",
    avatarIndex: 3,
    rating: 5,
    text: "Art and studying don't usually go together, but this platform made learning feel creative. I love the visual explanations!",
  },
  {
    id: 5,
    name: "Karan Patel",
    classCity: "Class 12 · Ahmedabad",
    avatarIndex: 4,
    rating: 5,
    text: "Even during sports season with barely 2 hours a day, I managed to keep up with the curriculum. The flexibility is unmatched.",
  },
  {
    id: 6,
    name: "Fatima Khan",
    classCity: "Class 11 · Hyderabad",
    avatarIndex: 5,
    rating: 5,
    text: "The notes are so well-organized and the doubt sessions are genuinely helpful. This platform changed how I study completely.",
  },
  {
    id: 7,
    name: "Dev Kapoor",
    classCity: "Class 12 · Pune",
    avatarIndex: 0,
    rating: 5,
    text: "I cleared JEE Mains with AIR 2800. The mock tests and detailed solutions were the biggest factor in my preparation.",
  },
  {
    id: 8,
    name: "Ananya Reddy",
    classCity: "Class 10 · Chennai",
    avatarIndex: 1,
    rating: 5,
    text: "My parents were skeptical at first but after my mid-term results they're my biggest fans of this platform now!",
  },
  {
    id: 9,
    name: "Vikram Singh",
    classCity: "Class 11 · Jaipur",
    avatarIndex: 2,
    rating: 5,
    text: "Physics used to terrify me. Now I solve HC Verma problems for fun. The mentors here genuinely care about your progress.",
  },
  {
    id: 10,
    name: "Meera Nair",
    classCity: "Class 12 · Kochi",
    avatarIndex: 3,
    rating: 5,
    text: "I balanced board prep and NEET simultaneously thanks to the structured schedule. Got 680+ in NEET and 95% in boards!",
  },
];

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const getInitialPosition = (
  index: number,
  total: number,
  containerW: number,
  containerH: number
) => {
  const cardW = 180;
  const cardH = 260;
  const padX = 10;
  const padY = 10;
  const usableW = containerW - cardW - padX * 2;
  const usableH = containerH - cardH - padY * 2;

  const x = padX + seededRandom(index * 7 + 3) * usableW;
  const y = padY + seededRandom(index * 13 + 7) * usableH;

  return { x, y };
};

export const getRotation = (index: number) => {
  const rotations = [-6, 3, -4, 7, -2, 5, -7, 4, -3, 6, -5, 2, -8, 4, -1, 7];
  return rotations[index % rotations.length];
};
