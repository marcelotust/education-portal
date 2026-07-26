import type { QuizQuestion } from '@/types';

export interface QuestionPack {
  topic: string;
  questions: readonly QuizQuestion[];
}

/**
 * The built-in question bank, one pack per topic. Authoring questions is not a
 * feature: a teacher picks a topic, and these are ours to write.
 *
 * It lives in code, which ships every pack — including `correctIndex` — to
 * every player. Fine for trivia, wrong for anything graded; see issue #14 for
 * the move to a per-topic asset or a table when the bank outgrows a module.
 */
export const QUESTION_PACKS: readonly QuestionPack[] = [
  {
    topic: 'GENERAL',
    questions: [
      {
        id: 'g1',
        prompt: 'Which planet is closest to the Sun?',
        options: ['Venus', 'Mercury', 'Mars', 'Earth'],
        correctIndex: 1,
      },
      {
        id: 'g2',
        prompt: 'How many continents are there?',
        options: ['5', '6', '7', '8'],
        correctIndex: 2,
      },
      {
        id: 'g3',
        prompt: 'What is the largest ocean?',
        options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
        correctIndex: 3,
      },
      {
        id: 'g4',
        prompt: 'Which country has the most people?',
        options: ['India', 'China', 'Brazil', 'Indonesia'],
        correctIndex: 0,
      },
      {
        id: 'g5',
        prompt: 'What is the capital of Brazil?',
        options: ['Rio de Janeiro', 'Salvador', 'Brasilia', 'Sao Paulo'],
        correctIndex: 2,
      },
      {
        id: 'g6',
        prompt: 'Which river runs through the Amazon rainforest?',
        options: ['Parana', 'Amazon', 'Nile', 'Congo'],
        correctIndex: 1,
      },
      {
        id: 'g7',
        prompt: 'How many minutes are there in a day?',
        options: ['1440', '1200', '960', '2400'],
        correctIndex: 0,
      },
      {
        id: 'g8',
        prompt: 'Which language has the most native speakers?',
        options: ['English', 'Spanish', 'Mandarin Chinese', 'Hindi'],
        correctIndex: 2,
      },
      {
        id: 'g9',
        prompt: 'What is the tallest mountain above sea level?',
        options: ['K2', 'Mount Everest', 'Aconcagua', 'Kilimanjaro'],
        correctIndex: 1,
      },
      {
        id: 'g10',
        prompt: 'Which of these is not a primary colour of light?',
        options: ['Red', 'Green', 'Blue', 'Yellow'],
        correctIndex: 3,
      },
      {
        id: 'g11',
        prompt: 'How many players does a football team field at once?',
        options: ['9', '10', '11', '12'],
        correctIndex: 2,
      },
      {
        id: 'g12',
        prompt: 'Which desert is the largest hot desert on Earth?',
        options: ['Gobi', 'Sahara', 'Kalahari', 'Atacama'],
        correctIndex: 1,
      },
      {
        id: 'g13',
        prompt: 'What currency is used in Japan?',
        options: ['Yuan', 'Won', 'Yen', 'Ringgit'],
        correctIndex: 2,
      },
      {
        id: 'g14',
        prompt: 'How many sides does a hexagon have?',
        options: ['5', '6', '7', '8'],
        correctIndex: 1,
      },
      {
        id: 'g15',
        prompt: 'Which instrument has 88 keys?',
        options: ['Organ', 'Accordion', 'Piano', 'Harp'],
        correctIndex: 2,
      },
    ],
  },
  {
    topic: 'SCIENCE',
    questions: [
      {
        id: 's1',
        prompt: 'What gas do plants absorb from the air?',
        options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
        correctIndex: 1,
      },
      {
        id: 's2',
        prompt: 'How many bones does an adult human have?',
        options: ['206', '186', '226', '246'],
        correctIndex: 0,
      },
      {
        id: 's3',
        prompt: 'What is the chemical symbol for gold?',
        options: ['Go', 'Gd', 'Au', 'Ag'],
        correctIndex: 2,
      },
      {
        id: 's4',
        prompt: 'Which organ pumps blood around the body?',
        options: ['Lungs', 'Heart', 'Liver', 'Kidneys'],
        correctIndex: 1,
      },
      {
        id: 's5',
        prompt: 'What force keeps the planets in orbit around the Sun?',
        options: ['Gravity', 'Magnetism', 'Friction', 'Pressure'],
        correctIndex: 0,
      },
      {
        id: 's6',
        prompt: 'What is water made of?',
        options: [
          'Hydrogen and oxygen',
          'Hydrogen and carbon',
          'Oxygen and nitrogen',
          'Carbon and oxygen',
        ],
        correctIndex: 0,
      },
      {
        id: 's7',
        prompt: 'Which planet is known as the red planet?',
        options: ['Jupiter', 'Venus', 'Mars', 'Saturn'],
        correctIndex: 2,
      },
      {
        id: 's8',
        prompt: 'What do we call an animal that eats only plants?',
        options: ['Carnivore', 'Herbivore', 'Omnivore', 'Predator'],
        correctIndex: 1,
      },
      {
        id: 's9',
        prompt: 'At what temperature does water freeze, in Celsius?',
        options: ['0', '10', '-10', '32'],
        correctIndex: 0,
      },
      {
        id: 's10',
        prompt: 'Which part of a plant makes most of its food?',
        options: ['Root', 'Stem', 'Leaf', 'Flower'],
        correctIndex: 2,
      },
      {
        id: 's11',
        prompt: 'What is the closest star to Earth?',
        options: ['Sirius', 'The Sun', 'Proxima Centauri', 'Polaris'],
        correctIndex: 1,
      },
      {
        id: 's12',
        prompt: 'How many legs does an insect have?',
        options: ['4', '6', '8', '10'],
        correctIndex: 1,
      },
      {
        id: 's13',
        prompt: 'What do we call the change from liquid to gas?',
        options: ['Condensation', 'Evaporation', 'Freezing', 'Melting'],
        correctIndex: 1,
      },
      {
        id: 's14',
        prompt: 'Which blood cells carry oxygen?',
        options: ['White cells', 'Red cells', 'Platelets', 'Plasma cells'],
        correctIndex: 1,
      },
      {
        id: 's15',
        prompt: 'What is the largest animal alive today?',
        options: ['African elephant', 'Blue whale', 'Giraffe', 'Great white shark'],
        correctIndex: 1,
      },
    ],
  },
];

export const QUIZ_TOPICS: readonly string[] = QUESTION_PACKS.map((pack) => pack.topic);
