import { Dog, Cat, Turtle, Fish, Bird, Squirrel, Rabbit, Bug, Snail } from "lucide-react";

export const animalConfig = {
  "🐶": {
    name: "Dog",
    icon: Dog,
    bg: "from-amber-500/30 to-amber-700/40",
    border: "border-amber-400/80",
    text: "text-amber-300",
    glowClass: "shadow-[0_0_20px_rgba(251,191,36,0.8)] border-amber-400"
  },
  "🐱": {
    name: "Cat",
    icon: Cat,
    bg: "from-pink-500/30 to-rose-700/40",
    border: "border-pink-400/80",
    text: "text-pink-300",
    glowClass: "shadow-[0_0_20px_rgba(244,114,182,0.8)] border-pink-400"
  },
  "🐿️": {
    name: "Squirrel",
    icon: Squirrel,
    bg: "from-orange-500/30 to-orange-700/40",
    border: "border-orange-400/80",
    text: "text-orange-300",
    glowClass: "shadow-[0_0_20px_rgba(251,146,60,0.8)] border-orange-400"
  },
  "🐢": {
    name: "Turtle",
    icon: Turtle,
    bg: "from-emerald-500/30 to-teal-700/40",
    border: "border-emerald-400/80",
    text: "text-emerald-300",
    glowClass: "shadow-[0_0_20px_rgba(52,211,153,0.8)] border-emerald-400"
  },
  "🐟": {
    name: "Fish",
    icon: Fish,
    bg: "from-cyan-500/30 to-blue-700/40",
    border: "border-cyan-400/80",
    text: "text-cyan-300",
    glowClass: "shadow-[0_0_20px_rgba(34,211,238,0.8)] border-cyan-400"
  },
  "🐦": {
    name: "Bird",
    icon: Bird,
    bg: "from-purple-500/30 to-indigo-700/40",
    border: "border-purple-400/80",
    text: "text-purple-300",
    glowClass: "shadow-[0_0_20px_rgba(192,132,252,0.8)] border-purple-400"
  },
  "🐰": {
    name: "Rabbit",
    icon: Rabbit,
    bg: "from-fuchsia-500/30 to-pink-700/40",
    border: "border-fuchsia-400/80",
    text: "text-fuchsia-300",
    glowClass: "shadow-[0_0_20px_rgba(232,121,249,0.8)] border-fuchsia-400"
  },
  "🐛": {
    name: "Bug",
    icon: Bug,
    bg: "from-lime-500/30 to-green-700/40",
    border: "border-lime-400/80",
    text: "text-lime-300",
    glowClass: "shadow-[0_0_20px_rgba(163,230,53,0.8)] border-lime-400"
  },
  "🐌": {
    name: "Snail",
    icon: Snail,
    bg: "from-yellow-500/30 to-amber-700/40",
    border: "border-yellow-400/80",
    text: "text-yellow-300",
    glowClass: "shadow-[0_0_20px_rgba(250,204,21,0.8)] border-yellow-400"
  },
};

// Level definitions: Level 1 has 6 cards (3 pairs), Level 2 has 10 cards (5 pairs), Level 3 has 12 cards, Level 4 has 16 cards
export const LEVELS = [
  { level: 1, totalCards: 6, pairs: 3, gridCols: "grid-cols-3" },
  { level: 2, totalCards: 10, pairs: 5, gridCols: "grid-cols-5" },
  { level: 3, totalCards: 12, pairs: 6, gridCols: "grid-cols-4" },
  { level: 4, totalCards: 16, pairs: 8, gridCols: "grid-cols-4" },
];

const animalKeys = Object.keys(animalConfig);

export const createCardsForLevel = (levelNumber = 1) => {
  const levelInfo = LEVELS.find(l => l.level === levelNumber) || LEVELS[0];
  const selectedKeys = animalKeys.slice(0, levelInfo.pairs);
  
  // If level requires more pairs than unique keys, loop over available keys
  let pairsList = [];
  while (pairsList.length < levelInfo.pairs) {
    pairsList.push(...animalKeys);
  }
  pairsList = pairsList.slice(0, levelInfo.pairs);

  return [...pairsList, ...pairsList]
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }));
};

export const createCards = () => createCardsForLevel(1);
