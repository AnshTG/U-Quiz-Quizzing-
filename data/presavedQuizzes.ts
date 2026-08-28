import { SavedQuizRecord, Question } from '../types';

export const PRE_SAVED_BENCHMARK_QUIZZES: Omit<SavedQuizRecord, 'userId'>[] = [
  {
    id: 'presaved_c10_sci_chem_life_elec',
    title: 'Class 10 Science: Board Sprint (Reactions, Life Processes, Electricity)',
    description: 'High-yield NCERT Class 10 fundamental questions for board preparation.',
    createdAt: '2026-08-20T10:00:00.000Z',
    timestamp: 1724148000000,
    isPreSaved: true,
    config: {
      class: 'Class 10',
      subject: 'Science',
      topics: ['1: Chemical Reactions and Equations', '5: Life Processes', '11: Electricity'],
      strength: 'Medium',
      quantity: 5,
      timeLimitMinutes: 10,
      syllabusYear: '2026-27'
    },
    questions: [
      {
        question: 'Which of the following processes represents a chemical decomposition reaction requiring thermal energy?',
        options: [
          'Burning of natural gas',
          'Heating of ferrous sulphate crystals (FeSO₄·7H₂O)',
          'Reaction of quicklime with water',
          'Rusting of iron in moist air'
        ],
        correctAnswer: 'Heating of ferrous sulphate crystals (FeSO₄·7H₂O)',
        explanation: 'Heating ferrous sulphate crystals causes decomposition into ferric oxide (Fe₂O₃), sulphur dioxide (SO₂), and sulphur trioxide (SO₃).'
      },
      {
        question: 'In the human digestive system, bile juice produced by the liver performs which primary function?',
        options: [
          'Digestion of proteins into amino acids',
          'Emulsification of large fat globules and providing an alkaline medium for pancreatic enzymes',
          'Conversion of starch into maltose',
          'Absorption of water in the large intestine'
        ],
        correctAnswer: 'Emulsification of large fat globules and providing an alkaline medium for pancreatic enzymes',
        explanation: 'Bile salts break down large fat globules into smaller ones (emulsification), increasing enzyme efficiency in the alkaline small intestine.'
      },
      {
        question: 'According to Ohm\'s Law, what happens to the electric current flowing through a conductor if the resistance is doubled while the potential difference remains constant?',
        options: [
          'Current is doubled',
          'Current remains unchanged',
          'Current is halved',
          'Current becomes four times greater'
        ],
        correctAnswer: 'Current is halved',
        explanation: 'Since I = V/R, current is inversely proportional to resistance. Doubling resistance halves the electric current.'
      },
      {
        question: 'Which component in the human circulatory system prevents the backflow of deoxygenated and oxygenated blood inside the heart chambers?',
        options: [
          'Aorta walls',
          'Valves in the atria and ventricles',
          'Capillary membranes',
          'Septum muscle'
        ],
        correctAnswer: 'Valves in the atria and ventricles',
        explanation: 'Valves ensure that blood flows strictly in one direction and prevents backflow when atria or ventricles contract.'
      },
      {
        question: 'What is the commercial unit of electrical energy consumed in domestic households, and its value in Joules?',
        options: [
          '1 kWh = 3.6 × 10⁶ J',
          '1 Watt = 1000 J',
          '1 Ampere = 1 Coulomb/sec',
          '1 Joule = 1 kW/hour'
        ],
        correctAnswer: '1 kWh = 3.6 × 10⁶ J',
        explanation: '1 Kilowatt-hour (kWh) equals 1000 Watts × 3600 seconds = 3.6 × 10⁶ Joules, commonly referred to as 1 unit of electricity.'
      }
    ]
  },
  {
    id: 'presaved_c10_math_trig_quad',
    title: 'Class 10 Mathematics: Trigonometry & Quadratic Equations Mastery',
    description: 'Essential problem-solving set covering standard trigonometric identities and quadratic roots.',
    createdAt: '2026-08-18T14:30:00.000Z',
    timestamp: 1723991400000,
    isPreSaved: true,
    config: {
      class: 'Class 10',
      subject: 'Mathematics',
      topics: ['4: Quadratic Equations', '8: Introduction to Trigonometry', '9: Some Applications of Trigonometry'],
      strength: 'Hard',
      quantity: 5,
      timeLimitMinutes: 12,
      syllabusYear: '2026-27'
    },
    questions: [
      {
        question: 'If sin(A - B) = 1/2 and cos(A + B) = 1/2, where 0° < A + B ≤ 90° and A > B, find the value of angle A and angle B.',
        options: [
          'A = 45°, B = 15°',
          'A = 60°, B = 30°',
          'A = 50°, B = 20°',
          'A = 45°, B = 30°'
        ],
        correctAnswer: 'A = 45°, B = 15°',
        explanation: 'sin(A - B) = sin 30° => A - B = 30°. cos(A + B) = cos 60° => A + B = 60°. Adding both gives 2A = 90° => A = 45°, and B = 15°.'
      },
      {
        question: 'For what value of k does the quadratic equation 2x² + kx + 3 = 0 have two equal real roots?',
        options: [
          'k = ± 2√6',
          'k = ± 4√3',
          'k = ± 6',
          'k = ± 24'
        ],
        correctAnswer: 'k = ± 2√6',
        explanation: 'For equal real roots, Discriminant D = b² - 4ac = 0. Here k² - 4(2)(3) = 0 => k² = 24 => k = ±√24 = ±2√6.'
      },
      {
        question: 'The value of the expression (sin² 30° + cos² 30°) / (sec² 45° - tan² 45°) is equal to:',
        options: [
          '1',
          '2',
          '0',
          '1/2'
        ],
        correctAnswer: '1',
        explanation: 'Using the fundamental trigonometric identities sin²θ + cos²θ = 1 and sec²θ - tan²θ = 1, the fraction is 1 / 1 = 1.'
      },
      {
        question: 'A ladder 15 m long just reaches the top of a vertical wall. If the ladder makes an angle of 60° with the wall, find the height of the wall.',
        options: [
          '7.5 m',
          '15√3/2 m',
          '10 m',
          '12.5 m'
        ],
        correctAnswer: '7.5 m',
        explanation: 'The angle with the wall is 60°, so cos 60° = (Height of wall) / (Length of ladder) => 1/2 = Height / 15 => Height = 7.5 m.'
      },
      {
        question: 'If one root of the quadratic equation 3x² - 10x + k = 0 is reciprocal to the other, what is the value of k?',
        options: [
          'k = 3',
          'k = -3',
          'k = 1/3',
          'k = 10'
        ],
        correctAnswer: 'k = 3',
        explanation: 'Let roots be α and 1/α. Product of roots α × (1/α) = 1. According to the formula, product = c/a = k/3. Therefore k/3 = 1 => k = 3.'
      }
    ]
  },
  {
    id: 'presaved_c9_sci_motion_cell',
    title: 'Class 9 Science: Motion, Laws & Fundamental Unit of Life',
    description: 'Core concepts assessment on kinematics, inertia, and cell organelles for Class 9.',
    createdAt: '2026-08-15T09:00:00.000Z',
    timestamp: 1723712400000,
    isPreSaved: true,
    config: {
      class: 'Class 9',
      subject: 'Science',
      topics: ['5: The Fundamental Unit of Life', '7: Motion', '8: Force and Laws of Motion'],
      strength: 'Medium',
      quantity: 5,
      timeLimitMinutes: 10,
      syllabusYear: '2026-27'
    },
    questions: [
      {
        question: 'Which organelle is known as the "powerhouse of the cell" due to ATP synthesis, and possesses its own DNA and ribosomes?',
        options: [
          'Endoplasmic Reticulum',
          'Mitochondria',
          'Golgi Apparatus',
          'Lysosome'
        ],
        correctAnswer: 'Mitochondria',
        explanation: 'Mitochondria generate ATP (adenosine triphosphate) via cellular respiration and have their own distinct DNA and ribosomes.'
      },
      {
        question: 'An object travels 16 m in 4 s and then another 16 m in 2 s. What is the average speed of the object?',
        options: [
          '5.33 m/s',
          '4.00 m/s',
          '8.00 m/s',
          '6.50 m/s'
        ],
        correctAnswer: '5.33 m/s',
        explanation: 'Total distance = 16 + 16 = 32 m. Total time = 4 + 2 = 6 s. Average speed = 32 / 6 = 5.33 m/s.'
      },
      {
        question: 'Why does an athlete run some distance before taking a long jump, according to Newton\'s First Law of Motion?',
        options: [
          'To overcome gravity',
          'To acquire inertia of motion, helping him jump farther',
          'To increase frictional resistance with air',
          'To decrease muscle energy consumption'
        ],
        correctAnswer: 'To acquire inertia of motion, helping him jump farther',
        explanation: 'The running velocity provides inertia of motion to the athlete’s body, which sustains greater forward distance during the leap.'
      },
      {
        question: 'Which cell organelle contains digestive hydrolytic enzymes capable of digesting worn-out cell parts (suicide bags)?',
        options: [
          'Ribosomes',
          'Lysosomes',
          'Plastids',
          'Vacuoles'
        ],
        correctAnswer: 'Lysosomes',
        explanation: 'Lysosomes contain potent hydrolytic digestive enzymes synthesized by RER that degrade foreign debris and damaged cellular organelles.'
      },
      {
        question: 'What is the slope of a Velocity-Time graph of a moving vehicle equal to?',
        options: [
          'Distance travelled',
          'Acceleration of the vehicle',
          'Speed',
          'Displacement'
        ],
        correctAnswer: 'Acceleration of the vehicle',
        explanation: 'The slope of a velocity-time graph (change in velocity divided by change in time, Δv/Δt) represents the acceleration of the object.'
      }
    ]
  },
  {
    id: 'presaved_c10_sst_nationalism_money',
    title: 'Class 10 Social Science: Nationalism in Europe & Money and Credit',
    description: 'Comprehensive Board drill for CBSE Class 10 History and Economics concepts.',
    createdAt: '2026-08-12T11:00:00.000Z',
    timestamp: 1723460400000,
    isPreSaved: true,
    config: {
      class: 'Class 10',
      subject: 'Social Science',
      topics: ['History Ch 1: The Rise of Nationalism in Europe', 'Economics Ch 3: Money and Credit'],
      strength: 'Medium',
      quantity: 5,
      timeLimitMinutes: 10,
      syllabusYear: '2026-27'
    },
    questions: [
      {
        question: 'Who hosted the historic Congress of Vienna in 1815 to establish conservative order in Europe?',
        options: [
          'Giuseppe Mazzini',
          'Duke Metternich (Austrian Chancellor)',
          'Otto von Bismarck',
          'Napoleon Bonaparte'
        ],
        correctAnswer: 'Duke Metternich (Austrian Chancellor)',
        explanation: 'The Congress of Vienna (1815) was hosted by the Austrian Chancellor Duke Metternich to undo Napoleonic changes and restore monarchies.'
      },
      {
        question: 'What is the collateral required by formal lenders before disbursing a loan?',
        options: [
          'An asset that the borrower owns (like land, building, vehicle) as a guarantee to the lender',
          'A recommendation letter from local village elders',
          'A deposit of old currency notes',
          'An affidavit stating willingness to work for the lender'
        ],
        correctAnswer: 'An asset that the borrower owns (like land, building, vehicle) as a guarantee to the lender',
        explanation: 'Collateral is an asset owned by the borrower that serves as security to the lender until the loan is fully repaid.'
      },
      {
        question: 'Which central institution in India issues currency notes on behalf of the Central Government?',
        options: [
          'State Bank of India (SBI)',
          'Reserve Bank of India (RBI)',
          'Ministry of Finance directly',
          'NITI Aayog'
        ],
        correctAnswer: 'Reserve Bank of India (RBI)',
        explanation: 'In India, only the Reserve Bank of India (RBI) is authorized by law to issue currency notes on behalf of the Central Government.'
      },
      {
        question: 'The allegory of the German nation depicted with a crown of oak leaves signifying heroism is called:',
        options: [
          'Marianne',
          'Germania',
          'Britannia',
          'Bharat Mata'
        ],
        correctAnswer: 'Germania',
        explanation: 'Germania was the visual representation and female allegory of the German nation, wearing an oak crown symbolizing heroism.'
      },
      {
        question: 'Why are Self-Help Groups (SHGs) particularly effective in rural microfinance?',
        options: [
          'They provide loans with 50% government grant without repayment',
          'They help rural poor and women overcome lack of collateral and pool regular small savings',
          'They replace commercial banks completely',
          'They only lend money for religious ceremonies'
        ],
        correctAnswer: 'They help rural poor and women overcome lack of collateral and pool regular small savings',
        explanation: 'SHGs pool regular small savings, foster collective financial discipline, and allow members to access credit without demanding physical collateral.'
      }
    ]
  }
];
