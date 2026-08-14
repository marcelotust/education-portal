-- QUIZ questions and TABOO cards, moved out of the client bundle (#34).
-- Neither table is room-scoped: content is the same for every room, so RLS
-- here just gates "signed in" the same way public.rooms does, not per-row
-- ownership. Topic/category names stay in code (see quizRound.ts,
-- tabooRound.ts) — only the spoiler-bearing content (correct_index,
-- forbidden words) moves here.

create table public.quiz_questions (
  id text primary key,
  topic text not null,
  prompt text not null,
  options text[] not null,
  correct_index integer not null,
  created_at timestamptz not null default now()
);

comment on table public.quiz_questions is 'QUIZ question bank, drawn by topic when a match is dealt.';

create index quiz_questions_topic_idx on public.quiz_questions (topic);

create table public.taboo_cards (
  id text primary key,
  category text not null,
  word text not null,
  forbidden text[] not null,
  created_at timestamptz not null default now()
);

comment on table public.taboo_cards is 'TABOO deck, drawn by category when a match is dealt.';

create index taboo_cards_category_idx on public.taboo_cards (category);

-- The Data API does not expose new tables automatically, so grant explicitly.
-- Read-only from the client on purpose: nobody writes content from the app.
grant select on table public.quiz_questions to anon, authenticated;
grant select on table public.taboo_cards to anon, authenticated;

alter table public.quiz_questions enable row level security;
alter table public.taboo_cards enable row level security;

create policy "Signed-in users can read quiz questions"
on public.quiz_questions
for select
to authenticated
using (true);

create policy "Signed-in users can read taboo cards"
on public.taboo_cards
for select
to authenticated
using (true);

-- Seed: the content that used to live in questionPacks.ts and tabooCards.ts.
insert into public.quiz_questions (id, topic, prompt, options, correct_index) values
('g1', 'GENERAL', 'Which planet is closest to the Sun?', ARRAY['Venus', 'Mercury', 'Mars', 'Earth'], 1),
('g2', 'GENERAL', 'How many continents are there?', ARRAY['5', '6', '7', '8'], 2),
('g3', 'GENERAL', 'What is the largest ocean?', ARRAY['Atlantic', 'Indian', 'Arctic', 'Pacific'], 3),
('g4', 'GENERAL', 'Which country has the most people?', ARRAY['India', 'China', 'Brazil', 'Indonesia'], 0),
('g5', 'GENERAL', 'What is the capital of Brazil?', ARRAY['Rio de Janeiro', 'Salvador', 'Brasilia', 'Sao Paulo'], 2),
('g6', 'GENERAL', 'Which river runs through the Amazon rainforest?', ARRAY['Parana', 'Amazon', 'Nile', 'Congo'], 1),
('g7', 'GENERAL', 'How many minutes are there in a day?', ARRAY['1440', '1200', '960', '2400'], 0),
('g8', 'GENERAL', 'Which language has the most native speakers?', ARRAY['English', 'Spanish', 'Mandarin Chinese', 'Hindi'], 2),
('g9', 'GENERAL', 'What is the tallest mountain above sea level?', ARRAY['K2', 'Mount Everest', 'Aconcagua', 'Kilimanjaro'], 1),
('g10', 'GENERAL', 'Which of these is not a primary colour of light?', ARRAY['Red', 'Green', 'Blue', 'Yellow'], 3),
('g11', 'GENERAL', 'How many players does a football team field at once?', ARRAY['9', '10', '11', '12'], 2),
('g12', 'GENERAL', 'Which desert is the largest hot desert on Earth?', ARRAY['Gobi', 'Sahara', 'Kalahari', 'Atacama'], 1),
('g13', 'GENERAL', 'What currency is used in Japan?', ARRAY['Yuan', 'Won', 'Yen', 'Ringgit'], 2),
('g14', 'GENERAL', 'How many sides does a hexagon have?', ARRAY['5', '6', '7', '8'], 1),
('g15', 'GENERAL', 'Which instrument has 88 keys?', ARRAY['Organ', 'Accordion', 'Piano', 'Harp'], 2),
('s1', 'SCIENCE', 'What gas do plants absorb from the air?', ARRAY['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], 1),
('s2', 'SCIENCE', 'How many bones does an adult human have?', ARRAY['206', '186', '226', '246'], 0),
('s3', 'SCIENCE', 'What is the chemical symbol for gold?', ARRAY['Go', 'Gd', 'Au', 'Ag'], 2),
('s4', 'SCIENCE', 'Which organ pumps blood around the body?', ARRAY['Lungs', 'Heart', 'Liver', 'Kidneys'], 1),
('s5', 'SCIENCE', 'What force keeps the planets in orbit around the Sun?', ARRAY['Gravity', 'Magnetism', 'Friction', 'Pressure'], 0),
('s6', 'SCIENCE', 'What is water made of?', ARRAY['Hydrogen and oxygen', 'Hydrogen and carbon', 'Oxygen and nitrogen', 'Carbon and oxygen'], 0),
('s7', 'SCIENCE', 'Which planet is known as the red planet?', ARRAY['Jupiter', 'Venus', 'Mars', 'Saturn'], 2),
('s8', 'SCIENCE', 'What do we call an animal that eats only plants?', ARRAY['Carnivore', 'Herbivore', 'Omnivore', 'Predator'], 1),
('s9', 'SCIENCE', 'At what temperature does water freeze, in Celsius?', ARRAY['0', '10', '-10', '32'], 0),
('s10', 'SCIENCE', 'Which part of a plant makes most of its food?', ARRAY['Root', 'Stem', 'Leaf', 'Flower'], 2),
('s11', 'SCIENCE', 'What is the closest star to Earth?', ARRAY['Sirius', 'The Sun', 'Proxima Centauri', 'Polaris'], 1),
('s12', 'SCIENCE', 'How many legs does an insect have?', ARRAY['4', '6', '8', '10'], 1),
('s13', 'SCIENCE', 'What do we call the change from liquid to gas?', ARRAY['Condensation', 'Evaporation', 'Freezing', 'Melting'], 1),
('s14', 'SCIENCE', 'Which blood cells carry oxygen?', ARRAY['White cells', 'Red cells', 'Platelets', 'Plasma cells'], 1),
('s15', 'SCIENCE', 'What is the largest animal alive today?', ARRAY['African elephant', 'Blue whale', 'Giraffe', 'Great white shark'], 1);

insert into public.taboo_cards (id, category, word, forbidden) values
('a1', 'ANIMALS', 'ELEPHANT', ARRAY['TRUNK', 'AFRICA', 'TUSK', 'GRAY', 'ZOO']),
('a2', 'ANIMALS', 'PENGUIN', ARRAY['BIRD', 'ICE', 'BLACK', 'WHITE', 'SWIM']),
('a3', 'ANIMALS', 'GIRAFFE', ARRAY['NECK', 'TALL', 'SPOTS', 'AFRICA', 'ZOO']),
('a4', 'ANIMALS', 'KANGAROO', ARRAY['POUCH', 'AUSTRALIA', 'JUMP', 'HOP', 'BOXING']),
('a5', 'ANIMALS', 'LION', ARRAY['MANE', 'KING', 'ROAR', 'JUNGLE', 'PRIDE']),
('a6', 'ANIMALS', 'OCTOPUS', ARRAY['TENTACLES', 'EIGHT', 'INK', 'SEA', 'ARMS']),
('a7', 'ANIMALS', 'BUTTERFLY', ARRAY['WINGS', 'FLY', 'COCOON', 'COLORFUL', 'INSECT']),
('a8', 'ANIMALS', 'CROCODILE', ARRAY['TEETH', 'RIVER', 'SWAMP', 'BITE', 'REPTILE']),
('m1', 'MOVIES', 'TITANIC', ARRAY['SHIP', 'ICEBERG', 'SINK', 'OCEAN', 'LEONARDO']),
('m2', 'MOVIES', 'JAWS', ARRAY['SHARK', 'OCEAN', 'BEACH', 'ATTACK', 'FIN']),
('m3', 'MOVIES', 'FROZEN', ARRAY['SNOW', 'ICE', 'ELSA', 'QUEEN', 'COLD']),
('m4', 'MOVIES', 'MATRIX', ARRAY['PILL', 'COMPUTER', 'NEO', 'REALITY', 'SIMULATION']),
('m5', 'MOVIES', 'STAR WARS', ARRAY['SPACE', 'JEDI', 'FORCE', 'LIGHTSABER', 'GALAXY']),
('m6', 'MOVIES', 'JURASSIC PARK', ARRAY['DINOSAUR', 'ISLAND', 'PARK', 'REX', 'FOSSIL']),
('m7', 'MOVIES', 'AVATAR', ARRAY['BLUE', 'ALIEN', 'PLANET', 'NAVI', 'FOREST']),
('m8', 'MOVIES', 'SHREK', ARRAY['OGRE', 'SWAMP', 'GREEN', 'DONKEY', 'FAIRYTALE']),
('s1', 'SPORTS', 'SOCCER', ARRAY['BALL', 'GOAL', 'FIELD', 'KICK', 'TEAM']),
('s2', 'SPORTS', 'BASKETBALL', ARRAY['HOOP', 'DRIBBLE', 'COURT', 'JUMP', 'NBA']),
('s3', 'SPORTS', 'TENNIS', ARRAY['RACKET', 'NET', 'SERVE', 'COURT', 'BALL']),
('s4', 'SPORTS', 'SWIMMING', ARRAY['POOL', 'WATER', 'STROKE', 'DIVE', 'LAPS']),
('s5', 'SPORTS', 'BOXING', ARRAY['PUNCH', 'RING', 'GLOVES', 'FIGHT', 'KNOCKOUT']),
('s6', 'SPORTS', 'SURFING', ARRAY['WAVE', 'BOARD', 'OCEAN', 'BEACH', 'PADDLE']),
('s7', 'SPORTS', 'GOLF', ARRAY['CLUB', 'HOLE', 'COURSE', 'SWING', 'PAR']),
('s8', 'SPORTS', 'VOLLEYBALL', ARRAY['NET', 'SPIKE', 'COURT', 'TEAM', 'SERVE']),
('f1', 'FOOD', 'PIZZA', ARRAY['CHEESE', 'SLICE', 'ITALIAN', 'OVEN', 'TOPPING']),
('f2', 'FOOD', 'HAMBURGER', ARRAY['BUN', 'MEAT', 'FRIES', 'GRILL', 'PATTY']),
('f3', 'FOOD', 'SUSHI', ARRAY['RICE', 'FISH', 'JAPAN', 'ROLL', 'RAW']),
('f4', 'FOOD', 'CHOCOLATE', ARRAY['SWEET', 'BROWN', 'CANDY', 'COCOA', 'BAR']),
('f5', 'FOOD', 'ICE CREAM', ARRAY['COLD', 'SCOOP', 'CONE', 'FREEZER', 'SWEET']),
('f6', 'FOOD', 'SPAGHETTI', ARRAY['PASTA', 'NOODLE', 'SAUCE', 'ITALIAN', 'FORK']),
('f7', 'FOOD', 'POPCORN', ARRAY['CORN', 'MOVIE', 'BUTTER', 'KERNEL', 'SNACK']),
('f8', 'FOOD', 'PANCAKE', ARRAY['SYRUP', 'FLAT', 'BREAKFAST', 'FLIP', 'STACK']),
('j1', 'JOBS', 'DOCTOR', ARRAY['HOSPITAL', 'PATIENT', 'NURSE', 'MEDICINE', 'SICK']),
('j2', 'JOBS', 'TEACHER', ARRAY['SCHOOL', 'STUDENT', 'CLASSROOM', 'LESSON', 'BOARD']),
('j3', 'JOBS', 'FIREFIGHTER', ARRAY['FIRE', 'TRUCK', 'HOSE', 'RESCUE', 'HELMET']),
('j4', 'JOBS', 'CHEF', ARRAY['KITCHEN', 'COOK', 'RESTAURANT', 'RECIPE', 'KNIFE']),
('j5', 'JOBS', 'ASTRONAUT', ARRAY['SPACE', 'ROCKET', 'MOON', 'NASA', 'SUIT']),
('j6', 'JOBS', 'POLICE OFFICER', ARRAY['BADGE', 'ARREST', 'UNIFORM', 'PATROL', 'CRIME']),
('j7', 'JOBS', 'ARTIST', ARRAY['PAINT', 'CANVAS', 'BRUSH', 'GALLERY', 'DRAW']),
('j8', 'JOBS', 'DENTIST', ARRAY['TEETH', 'CHAIR', 'DRILL', 'CAVITY', 'CLEAN']),
('c1', 'COUNTRIES', 'BRAZIL', ARRAY['SOCCER', 'AMAZON', 'CARNIVAL', 'SAMBA', 'RIO']),
('c2', 'COUNTRIES', 'JAPAN', ARRAY['SUSHI', 'TOKYO', 'ANIME', 'SAMURAI', 'ISLAND']),
('c3', 'COUNTRIES', 'EGYPT', ARRAY['PYRAMID', 'DESERT', 'NILE', 'PHARAOH', 'SPHINX']),
('c4', 'COUNTRIES', 'FRANCE', ARRAY['PARIS', 'EIFFEL', 'CROISSANT', 'WINE', 'TOWER']),
('c5', 'COUNTRIES', 'AUSTRALIA', ARRAY['KANGAROO', 'OUTBACK', 'SYDNEY', 'KOALA', 'REEF']),
('c6', 'COUNTRIES', 'MEXICO', ARRAY['TACO', 'DESERT', 'AZTEC', 'SPANISH', 'CACTUS']),
('c7', 'COUNTRIES', 'CANADA', ARRAY['MAPLE', 'SNOW', 'HOCKEY', 'COLD', 'MOOSE']),
('c8', 'COUNTRIES', 'ITALY', ARRAY['PASTA', 'ROME', 'PIZZA', 'BOOT', 'VATICAN']);
