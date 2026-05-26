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
  {
    id: 11,
    name: "Arjun Gupta",
    classCity: "Class 10 · Lucknow",
    avatarIndex: 4,
    rating: 5,
    text: "The doubt-clearing sessions are lightning fast. I never have to wait more than a day to get my questions answered properly.",
  },
  {
    id: 12,
    name: "Ishita Banerjee",
    classCity: "Class 11 · Kolkata",
    avatarIndex: 5,
    rating: 5,
    text: "I love how the biology animations make complex processes so easy to visualize. Cell division finally makes sense!",
  },
  {
    id: 13,
    name: "Sahil Joshi",
    classCity: "Class 12 · Nagpur",
    avatarIndex: 0,
    rating: 5,
    text: "Went from 60% in my pre-boards to 89% in the final exam. The revision strategy they taught me was a game changer.",
  },
  {
    id: 14,
    name: "Divya Krishnan",
    classCity: "Class 10 · Coimbatore",
    avatarIndex: 1,
    rating: 5,
    text: "My English writing improved so much! The feedback on essays is detailed and the teachers actually read every word.",
  },
  {
    id: 15,
    name: "Aditya Rao",
    classCity: "Class 12 · Mangalore",
    avatarIndex: 4,
    rating: 5,
    text: "The peer study groups connected me with students who think like me. We push each other to do better every week.",
  },
  {
    id: 16,
    name: "Zara Hussain",
    classCity: "Class 11 · Bhopal",
    avatarIndex: 5,
    rating: 5,
    text: "I switched from a coaching institute to this platform and saved so much time on commuting. Results are even better now!",
  },
];

export const getInitialPosition = (
  index: number,
  total: number,
  containerW: number,
  containerH: number
) => {
  const cols = 4;
  const rows = Math.ceil(total / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);
  const cellW = containerW / cols;
  const cellH = containerH / rows;
  const jitterX = ((index * 137) % 60) - 30;
  const jitterY = ((index * 89) % 60) - 30;
  return {
    x: col * cellW + cellW / 2 - 90 + jitterX,
    y: row * cellH + cellH / 2 - 120 + jitterY,
  };
};

export const getRotation = (index: number) => {
  const rotations = [-6, 3, -4, 7, -2, 5, -7, 4, -3, 6, -5, 2, -8, 4, -1, 7];
  return rotations[index % rotations.length];
};
