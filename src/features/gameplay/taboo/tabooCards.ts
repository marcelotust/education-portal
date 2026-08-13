import type { TabooCard } from '@/types';

interface TabooPack {
  category: string;
  cards: readonly Omit<TabooCard, 'category'>[];
}

/**
 * The built-in deck, same trade-off as QUIZ's question bank (`questionPacks.ts`):
 * it ships in the client bundle, so a card is technically readable before it
 * is revealed. Accepted for a classroom game, per #25's decision.
 */
const TABOO_PACKS: readonly TabooPack[] = [
  {
    category: 'ANIMALS',
    cards: [
      { id: 'a1', word: 'ELEPHANT', forbidden: ['TRUNK', 'AFRICA', 'TUSK', 'GRAY', 'ZOO'] },
      { id: 'a2', word: 'PENGUIN', forbidden: ['BIRD', 'ICE', 'BLACK', 'WHITE', 'SWIM'] },
      { id: 'a3', word: 'GIRAFFE', forbidden: ['NECK', 'TALL', 'SPOTS', 'AFRICA', 'ZOO'] },
      { id: 'a4', word: 'KANGAROO', forbidden: ['POUCH', 'AUSTRALIA', 'JUMP', 'HOP', 'BOXING'] },
      { id: 'a5', word: 'LION', forbidden: ['MANE', 'KING', 'ROAR', 'JUNGLE', 'PRIDE'] },
      { id: 'a6', word: 'OCTOPUS', forbidden: ['TENTACLES', 'EIGHT', 'INK', 'SEA', 'ARMS'] },
      { id: 'a7', word: 'BUTTERFLY', forbidden: ['WINGS', 'FLY', 'COCOON', 'COLORFUL', 'INSECT'] },
      { id: 'a8', word: 'CROCODILE', forbidden: ['TEETH', 'RIVER', 'SWAMP', 'BITE', 'REPTILE'] },
    ],
  },
  {
    category: 'MOVIES',
    cards: [
      { id: 'm1', word: 'TITANIC', forbidden: ['SHIP', 'ICEBERG', 'SINK', 'OCEAN', 'LEONARDO'] },
      { id: 'm2', word: 'JAWS', forbidden: ['SHARK', 'OCEAN', 'BEACH', 'ATTACK', 'FIN'] },
      { id: 'm3', word: 'FROZEN', forbidden: ['SNOW', 'ICE', 'ELSA', 'QUEEN', 'COLD'] },
      { id: 'm4', word: 'MATRIX', forbidden: ['PILL', 'COMPUTER', 'NEO', 'REALITY', 'SIMULATION'] },
      {
        id: 'm5',
        word: 'STAR WARS',
        forbidden: ['SPACE', 'JEDI', 'FORCE', 'LIGHTSABER', 'GALAXY'],
      },
      {
        id: 'm6',
        word: 'JURASSIC PARK',
        forbidden: ['DINOSAUR', 'ISLAND', 'PARK', 'REX', 'FOSSIL'],
      },
      { id: 'm7', word: 'AVATAR', forbidden: ['BLUE', 'ALIEN', 'PLANET', 'NAVI', 'FOREST'] },
      { id: 'm8', word: 'SHREK', forbidden: ['OGRE', 'SWAMP', 'GREEN', 'DONKEY', 'FAIRYTALE'] },
    ],
  },
  {
    category: 'SPORTS',
    cards: [
      { id: 's1', word: 'SOCCER', forbidden: ['BALL', 'GOAL', 'FIELD', 'KICK', 'TEAM'] },
      { id: 's2', word: 'BASKETBALL', forbidden: ['HOOP', 'DRIBBLE', 'COURT', 'JUMP', 'NBA'] },
      { id: 's3', word: 'TENNIS', forbidden: ['RACKET', 'NET', 'SERVE', 'COURT', 'BALL'] },
      { id: 's4', word: 'SWIMMING', forbidden: ['POOL', 'WATER', 'STROKE', 'DIVE', 'LAPS'] },
      { id: 's5', word: 'BOXING', forbidden: ['PUNCH', 'RING', 'GLOVES', 'FIGHT', 'KNOCKOUT'] },
      { id: 's6', word: 'SURFING', forbidden: ['WAVE', 'BOARD', 'OCEAN', 'BEACH', 'PADDLE'] },
      { id: 's7', word: 'GOLF', forbidden: ['CLUB', 'HOLE', 'COURSE', 'SWING', 'PAR'] },
      { id: 's8', word: 'VOLLEYBALL', forbidden: ['NET', 'SPIKE', 'COURT', 'TEAM', 'SERVE'] },
    ],
  },
  {
    category: 'FOOD',
    cards: [
      { id: 'f1', word: 'PIZZA', forbidden: ['CHEESE', 'SLICE', 'ITALIAN', 'OVEN', 'TOPPING'] },
      { id: 'f2', word: 'HAMBURGER', forbidden: ['BUN', 'MEAT', 'FRIES', 'GRILL', 'PATTY'] },
      { id: 'f3', word: 'SUSHI', forbidden: ['RICE', 'FISH', 'JAPAN', 'ROLL', 'RAW'] },
      { id: 'f4', word: 'CHOCOLATE', forbidden: ['SWEET', 'BROWN', 'CANDY', 'COCOA', 'BAR'] },
      { id: 'f5', word: 'ICE CREAM', forbidden: ['COLD', 'SCOOP', 'CONE', 'FREEZER', 'SWEET'] },
      { id: 'f6', word: 'SPAGHETTI', forbidden: ['PASTA', 'NOODLE', 'SAUCE', 'ITALIAN', 'FORK'] },
      { id: 'f7', word: 'POPCORN', forbidden: ['CORN', 'MOVIE', 'BUTTER', 'KERNEL', 'SNACK'] },
      { id: 'f8', word: 'PANCAKE', forbidden: ['SYRUP', 'FLAT', 'BREAKFAST', 'FLIP', 'STACK'] },
    ],
  },
  {
    category: 'JOBS',
    cards: [
      { id: 'j1', word: 'DOCTOR', forbidden: ['HOSPITAL', 'PATIENT', 'NURSE', 'MEDICINE', 'SICK'] },
      {
        id: 'j2',
        word: 'TEACHER',
        forbidden: ['SCHOOL', 'STUDENT', 'CLASSROOM', 'LESSON', 'BOARD'],
      },
      { id: 'j3', word: 'FIREFIGHTER', forbidden: ['FIRE', 'TRUCK', 'HOSE', 'RESCUE', 'HELMET'] },
      { id: 'j4', word: 'CHEF', forbidden: ['KITCHEN', 'COOK', 'RESTAURANT', 'RECIPE', 'KNIFE'] },
      { id: 'j5', word: 'ASTRONAUT', forbidden: ['SPACE', 'ROCKET', 'MOON', 'NASA', 'SUIT'] },
      {
        id: 'j6',
        word: 'POLICE OFFICER',
        forbidden: ['BADGE', 'ARREST', 'UNIFORM', 'PATROL', 'CRIME'],
      },
      { id: 'j7', word: 'ARTIST', forbidden: ['PAINT', 'CANVAS', 'BRUSH', 'GALLERY', 'DRAW'] },
      { id: 'j8', word: 'DENTIST', forbidden: ['TEETH', 'CHAIR', 'DRILL', 'CAVITY', 'CLEAN'] },
    ],
  },
  {
    category: 'COUNTRIES',
    cards: [
      { id: 'c1', word: 'BRAZIL', forbidden: ['SOCCER', 'AMAZON', 'CARNIVAL', 'SAMBA', 'RIO'] },
      { id: 'c2', word: 'JAPAN', forbidden: ['SUSHI', 'TOKYO', 'ANIME', 'SAMURAI', 'ISLAND'] },
      { id: 'c3', word: 'EGYPT', forbidden: ['PYRAMID', 'DESERT', 'NILE', 'PHARAOH', 'SPHINX'] },
      { id: 'c4', word: 'FRANCE', forbidden: ['PARIS', 'EIFFEL', 'CROISSANT', 'WINE', 'TOWER'] },
      {
        id: 'c5',
        word: 'AUSTRALIA',
        forbidden: ['KANGAROO', 'OUTBACK', 'SYDNEY', 'KOALA', 'REEF'],
      },
      { id: 'c6', word: 'MEXICO', forbidden: ['TACO', 'DESERT', 'AZTEC', 'SPANISH', 'CACTUS'] },
      { id: 'c7', word: 'CANADA', forbidden: ['MAPLE', 'SNOW', 'HOCKEY', 'COLD', 'MOOSE'] },
      { id: 'c8', word: 'ITALY', forbidden: ['PASTA', 'ROME', 'PIZZA', 'BOOT', 'VATICAN'] },
    ],
  },
];

export const TABOO_DECK: readonly TabooCard[] = TABOO_PACKS.flatMap((pack) =>
  pack.cards.map((card) => ({ ...card, category: pack.category })),
);
