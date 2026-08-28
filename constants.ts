import { NCERTEntry, SyllabusYear } from './types';

export interface SyllabusMetadata {
  id: SyllabusYear;
  label: string;
  shortLabel: string;
  tag: string;
  badge: string;
  academicYear: string;
  description: string;
  framework: string;
  isLatest: boolean;
  highlights: string[];
}

export const SYLLABUS_METADATA: Record<SyllabusYear, SyllabusMetadata> = {
  '2026-27': {
    id: '2026-27',
    label: '2026-27 Official NCERT Curriculum (NCF-SE Aligned)',
    shortLabel: '2026-27 Official NCERT',
    tag: 'Official 2026-27 NCERT',
    badge: 'Session 2026-27',
    academicYear: '2026-27',
    framework: 'NCF-SE & NEP 2020 Standard',
    description: 'The official NCERT textbook curriculum (ncert.nic.in/textbook.php) for academic session 2026-27. Features the latest textbooks: Curiosity (Science), Ganita Prakash (Maths), Exploring Society: India and Beyond (Social Science), Poorvi (English), Malhar (Hindi), Deepakam (Sanskrit), Mridang, Sarangi, Santoor, Veena, Maths Mela & Our Wondrous World across all stages.',
    isLatest: true,
    highlights: [
      'Official Middle Stage series: Curiosity (Science), Ganita Prakash (Maths), Exploring Society (SST)',
      'New Language series: Poorvi (English), Malhar (Hindi), Deepakam (Sanskrit)',
      'Primary Foundation series: Mridang, Sarangi, Joyful Mathematics, Santoor, Veena, Maths Mela & Our Wondrous World',
      'Unified identical curriculum with session 2025-26'
    ]
  },
  '2025-26': {
    id: '2025-26',
    label: '2025-26 Official NCERT Curriculum (Aligned Standard)',
    shortLabel: '2025-26 Official NCERT',
    tag: 'Official 2025-26 NCERT',
    badge: 'Session 2025-26',
    academicYear: '2025-26',
    framework: 'NCF-SE & NEP 2020 Standard',
    description: 'The official NCERT textbook curriculum for academic session 2025-26, identical and aligned with the 2026-27 standard across all Classes 1–12.',
    isLatest: false,
    highlights: [
      'Identical unified NCERT syllabus matching 2026-27 curriculum',
      'Curiosity (Science), Ganita Prakash (Maths), Exploring Society, Poorvi, Malhar, Deepakam, Santoor, Veena',
      'Comprehensive Class 1 to 12 coverage across all subjects and streams',
      'Unified identical curriculum with session 2026-27'
    ]
  }
};

// ==========================================
// OFFICIAL UNIFIED NCERT SYLLABUS (CLASSES 1 - 12)
// Unified source of truth for 2025-26 and 2026-27
// ==========================================
const rawNCERTData: Record<string, Record<string, string[]>> = {
  "Class 1": {
    "English (Mridang)": [
      "Unit 1: My Family and Me (Two Little Hands, Greetings, Picture Reading)",
      "Unit 2: Life Around Us (Picture Reading: At the Garden, The Cap-seller and the Monkeys)",
      "Unit 3: Food and Water (Fun with Vegetables, The Big Carrot, Healthy Foods)",
      "Unit 4: Making Things (Catch Me If You Can, The Bubble, the Straw and the Shoe)",
      "Unit 5: My School (We are All Indians, Rhymes & Playground Play)"
    ],
    "Hindi (Sarangi)": [
      "इकाई 1: परिवार (मीना का परिवार, दादा-दादी)",
      "इकाई 2: रंग ही रंग (रीना का विद्यालय, अमन, रंग-बिरंगे खिलौने)",
      "इकाई 3: हमारा खान-पान (रसोई, गोल-गोल रोटी, फलों की टोकरी)",
      "इकाई 4: प्रकृति (पतंग, गिलहरी, नटखट चूहा)",
      "इकाई 5: मेला (आनंदी की टोकरी, हमारा प्यारा मेला)"
    ],
    "Mathematics (Joyful Mathematics)": [
      "1: Finding the Furry Cat! (Spatial Relationships, Above/Below, Inside/Outside & Pre-number Concepts)",
      "2: What is Long? What is Round? (Exploring 2D and 3D Shapes in Daily Life)",
      "3: Mango Treat (Numbers 1 to 9 & Interactive Counting Stories)",
      "4: Making 10 (Number Combinations, Pairs, Grouping & Concept of Zero)",
      "5: How Many? (Addition up to 10 with Counters and Visuals)",
      "6: Vegetable Farm (Subtraction up to 10 and Number Stories)",
      "7: Lina’s Family (Numbers 10 to 20 & Ten-Frames Grouping)",
      "8: Fun with Numbers (Numbers 21 to 99 & Place Value Intro)",
      "9: Utsav (Patterns, Sequences, Body Rhythms & Tiling)",
      "10: How do I Spend My Day? (Time, Daily Routines & Event Sequences)",
      "11: How Many Times? (Non-standard Length, Handspans & Footsteps)",
      "12: How Much Can We Spend? (Coins, Currency & Money Exploration)",
      "13: So Many Toys (Data Handling, Sorting & Simple Pictographs)"
    ],
    "Arts & Environmental Exploration (Our World)": [
      "1: My Senses and Body Awareness (Sight, Hearing, Touch, Taste, Smell)",
      "2: Nature Sounds, Colors and Textures Around Home and School",
      "3: Animal Friends and Green Plants in Our Habitat",
      "4: Family, Community Helpers and Seasonal Festivities"
    ]
  },
  "Class 2": {
    "English (Mridang)": [
      "Unit 1: Fun with Friends (My Bicycle, Picture Reading: At the Fair, Outdoor Games)",
      "Unit 2: Welcome to My World (It is Fun, Seeing without Eyes, Sensory Exploration)",
      "Unit 3: Going Places (Come Here Little Bird, The Little Engine That Could)",
      "Unit 4: Life Around Us (Storm in the Garden, The Magic Porridge Pot)",
      "Unit 5: Harmony (A Little Tree, The Giant Turnip, Working Together)"
    ],
    "Hindi (Sarangi)": [
      "इकाई 1: नीम की सीख (सीख, दो गौरैया)",
      "इकाई 2: घर और आस-पास (घर, बया हमारी चिड़िया रानी)",
      "इकाई 3: हमारा खान-पान (हलवाई की दुकान, चटपटी चाट)",
      "इकाई 4: अनुभव और खेल (मेला, गिल्ली-डंडा, मिलकर खेलें)",
      "इकाई 5: हमारा सुंदर संसार (तितली, पेड़ और हम, प्रकृति वंदना)"
    ],
    "Mathematics (Joyful Mathematics)": [
      "1: Day at the Beach (Counting in Groups & Place Value)",
      "2: Shapes Around Us (2D & 3D Spatial Geometry, Flat vs Curved Surfaces)",
      "3: Fun with Numbers (Numbers up to 100, Expanded Form & Skip Counting)",
      "4: Shadow Stories (Addition & Subtraction Situations with Regrouping)",
      "5: Playing with Lines (Straight, Curved, Slanting Lines & Figure Outlines)",
      "6: Decoration for Party (Repeating & Growing Geometric Patterns)",
      "7: Rani’s Gift (Measurement of Capacity, Vessels & Liquid Volume)",
      "8: Grouping in Tens and Ones (Bundles of Sticks, Coins & Abacus)",
      "9: Seasons and Time (Days of the Week, Calendar Months & Daily Clocks)",
      "10: Fun at the Fair (Financial Literacy: Coins, Notes & Bill Calculations)",
      "11: Data Around Us (Simple Tables, Tally Records & Categorisation)"
    ],
    "Environmental Awareness (Living in Harmony)": [
      "1: My Neighborhood, Helpers and Daily Living",
      "2: Weather Changes, Monsoons and Four Seasons",
      "3: Pure Water, Fresh Air, Hygiene and Well-being",
      "4: Care for Birds, Domestic Animals and Tree Plantation"
    ]
  },
  "Class 3": {
    "English (Santoor)": [
      "Unit 1: Colours of Life (Colours of Life, Best Friends)",
      "Unit 2: Best Friends & School Fun (The Toy Train Journey)",
      "Unit 3: Fun & Fair (The Giant Wheel at the Fair)",
      "Unit 4: Nature's Bounty (The Story of the Rain Cloud, A Little Seed Grows)",
      "Unit 5: Inquisitive Minds (The Fly & Other Inquisitive Friends)",
      "Unit 6: Science Exploration (Chandrayaan: Reaching the Moon)",
      "Unit 7: Magic of Words (Word Play, Rhymes & Reading Delights)"
    ],
    "Hindi (Veena)": [
      "1: चाँद का कुर्ता (कविता - रामधारी सिंह 'दिनकर')",
      "2: चींटी और कबूतर की दोस्ती (हितोपदेश कथा)",
      "3: सूरज और हवा की परीक्षा (बोधकथा)",
      "4: सुंदर खिलौनेवाला (कविता)",
      "5: साहसी बालक (सच्ची प्रेरक घटना)",
      "6: प्रकृति की सीख (सोहनलाल द्विवेदी की कविता)",
      "7: हमारा राष्ट्रीय तिरंगा (देशभक्ति एवं प्रतीक)",
      "8: पेड़-पौधों का संसार (पर्यावरण जागरूकता)",
      "9: मिलकर खेलें खेल (सहयोग और मैत्री)",
      "10: दादी माँ की कहानियाँ (संस्कार एवं सीख)"
    ],
    "Mathematics (Maths Mela)": [
      "1: What's in a Name? (Numbers Everywhere in Daily Life & Digits)",
      "2: Toy Joy (Addition and Subtraction Stories & Problem Solving)",
      "3: Double Century (Numbers up to 1000, Place Value & Expanded Notation)",
      "4: Vacation with My Nani (Time, Duration, Reading Clocks & Calendars)",
      "5: Fun with Shapes and Tiling Patterns (2D Shapes, Symmetry & Tessellations)",
      "6: House of Hundreds (Three-Digit Numeration & Place Value Blocks)",
      "7: Equal Sharing (Introduction to Division, Equal Distribution & Grouping)",
      "8: Measuring with Steps & Handspans (Length, Metres, Centimetres & Estimation)",
      "9: Smart Charts & Data Representation (Pictographs, Tables & Bar Displays)"
    ],
    "The World Around Us (Our Wondrous World)": [
      "1: Family, Relationships and Belonging (Generations & Family Trees)",
      "2: Plants and Leaves Around Us (Herbs, Shrubs, Trees & Leaf Patterns)",
      "3: Animals, Birds and Insects in Nature (Habitats, Feathers & Food)",
      "4: The Food on Our Plates & Nutritional Diversity Across Regions",
      "5: Precious Water and Where it Comes From (Sources, Rivers & Storage)",
      "6: Shelters, Houses and Building Materials (Igloos, Stilt Houses, Bricks)",
      "7: Travel, Mapping and Neighborhood Roads (Landmarks, Compass Directions)"
    ]
  },
  "Class 4": {
    "English (Santoor 4)": [
      "Unit 1: Spark of Wonder (The Sky Above Us & Star Stories)",
      "Unit 2: Compassion and Friendship (The Banyan Tree & Forest Friends)",
      "Unit 3: Adventures and Journeys (The Whispering Mountain & Travel Tales)",
      "Unit 4: Science and Nature (Rivers of Life & Soil Secrets)",
      "Unit 5: Cultural Mosaic (Festivals of Joy & Heritage Crafts)"
    ],
    "Hindi (Veena 4)": [
      "1: मन के भोले-भाले बादल (कल्पनाशील कविता)",
      "2: जैसा सवाल वैसा जवाब (बीरबल की चतुराई और हाज़िरजवाबी)",
      "3: किरमिच की गेंद (मैत्री और ईमानदारी)",
      "4: पापा जब बच्चे थे (एलेक्जेंडर रस्किन)",
      "5: दोस्त की पोशाक (नसरुद्दीन का रोचक प्रसंग)",
      "6: नाव बनाओ नाव बनाओ (कागज़ की नाव और वर्षा गीत)",
      "7: दान का हिसाब (सुकुमार राय की प्रेरक कहानी)",
      "8: कौन? (सोहनलाल द्विवेदी की कुतरने वाले जीव पर कविता)",
      "9: स्वतंत्रता की ओर (गांधीजी का साबरमती आश्रम और दांडी मार्च)",
      "10: थप्प रोटी थप्प दाल (अभिनय और रसोई नाटक)",
      "11: पढ़क्कू की सूझ (रामधारी सिंह 'दिनकर' का हास्य-व्यंग्य)",
      "12: सुनीता की पहिया कुर्सी (सहानुभूति नहीं, समानता)",
      "13: हुदहुद (पक्षी की कलगी, रंग-रूप और स्वभाव)",
      "14: मुफ़्त ही मुफ़्त (गुजराती लोककथा - भीखूभाई)"
    ],
    "Mathematics (Maths Mela 4 / Ganit Tarang)": [
      "1: Building with Bricks (3D Perspective, Spatial Views & Brick Tessellations)",
      "2: Long and Short (Metric Measurement of Length, Metres & Kilometres)",
      "3: A Trip to Bhopal (Multiplication, Estimation & Journey Mathematics)",
      "4: Tick-Tick-Tick (Clocks, 24-Hour Time Format & Calendars)",
      "5: The Way the World Looks (Spatial Perspectives, Top/Side Views)",
      "6: The Junk Seller (Currency, Invoices, Decimals & Profit/Loss Basics)",
      "7: Jugs and Mugs (Volume and Capacity in Litres & Millilitres)",
      "8: Carts and Wheels (Circles, Radius, Diameter & Compass Drawings)",
      "9: Halves and Quarters (Fractions, Parts of a Whole & Equal Partitioning)",
      "10: Play with Patterns (Symmetry, Number Codes & Magic Grids)",
      "11: Tables and Shares (Division, Grouping & Multi-digit Calculations)",
      "12: How Heavy? How Light? (Mass, Weight Measurement & Balances)",
      "13: Fields and Fences (Perimeter and Area of Irregular/Regular Shapes)",
      "14: Smart Charts (Bar Graphs, Pictographs & Data Interpretation)"
    ],
    "The World Around Us (Our Wondrous World 4)": [
      "1: Going to School & Transport Modes Across Geographies (Bridges, Vallam, Camel-Cart)",
      "2: Ear to Ear (Animal Sensory Systems, Outer/Inner Ears & Skin Patterns)",
      "3: A Day with Nandu (Elephant Herds, Social Animals & Matriarchal Leadership)",
      "4: The Story of Amrita (Bishnoi Community, Khejadi Trees & Forest Protection)",
      "5: Anita and the Honeybees (Girl Child Education, Apiculture & Cooperative)",
      "6: Omana's Journey & Railway Networks Across Western Ghats",
      "7: From the Window (Changing Topography, Rivers, Backwaters & Flora)",
      "8: Reaching Grandmother's House (Ferry Boats, Tickets & Travel Logistics)",
      "9: Changing Families and Socio-Economic Migration (New Born, Transfers)",
      "10: Living in River Basins: A River's Tale (Aquatic Life & Pollution Causes)",
      "11: Traditional Crafts: Pochampalli Weavers (Ikat, Silk Weaving & Heritage)",
      "12: Defence Officer Wahida (Naval Surgeon, Leadership & Breaking Barriers)"
    ]
  },
  "Class 5": {
    "English (Santoor 5)": [
      "Unit 1: Ocean of Stories (Tales of Bravery and Wit Across Cultures)",
      "Unit 2: Scientific Inventions & Discoveries (Young Minds & Inventors)",
      "Unit 3: Ecology and Living Earth (Guardians of the Green & Biodiversity)",
      "Unit 4: Courage, Resilience & Sportsmanship (Champions of Grit & Fair Play)",
      "Unit 5: Unity in Heritage (Folk Arts, Melodies and Indian Traditions)"
    ],
    "Hindi (Veena 5)": [
      "1: राख की रस्सी (तिब्बती लोककथा - लोनपो गार और चालाक लड़की)",
      "2: फ़सलों के त्योहार (मकर संक्रांति, पोंगल, बीहू, ओणम व लोहड़ी)",
      "3: खिलौनेवाला (सुभद्रा कुमारी चौहान की कालजयी कविता)",
      "4: नन्हा फ़नकार (केशव और अकबर का संवाद - पत्थर पर नक्काशी)",
      "5: जहाँ चाह वहाँ राह (इला सचानी की कसीदाकारी और अदम्य साहस)",
      "6: चिट्ठी का सफ़र (कबूतर से पिनकोड व आधुनिक संचार का इतिहास)",
      "7: डाकिए की कहानी, कँवरसिंह की जुबानी (पहाड़ी क्षेत्र में डाक सेवा)",
      "8: वे दिन भी क्या दिन थे (आइज़क असीमोव की कंप्यूटर स्कूल पर कहानी)",
      "9: एक माँ की बेबसी (रतन और उसकी माँ की मूक संवेदना)",
      "10: एक दिन की बादशाहत (बच्चों का बड़ों के अधिकारों का अनुभव)",
      "11: चावल की रोटियाँ (कोको और उसके दोस्तों का हास्य नाटक)",
      "12: गुरु और चेला (सोहनलाल द्विवेदी - अंधेर नगरी चौपट राजा)",
      "13: स्वामी की दादी (आर.के. नारायण - मालगुडी डेज़ प्रसंग)",
      "14: बाघ आया उस रात (नागार्जुन की वन्यजीव पर कविता)",
      "15: बिशन की दिलेरी (घायल तीतर की जान बचाने का अदम्य साहस)",
      "16: पानी रे पानी (जल चक्र, सूखा और बाढ़ की समस्या पर निबंध)",
      "17: छोटी-सी हमारी नदी (रवींद्रनाथ ठाकुर की मनोहारी कविता)",
      "18: चुनौती हिमालय की (जवाहरलाल नेहरू की अमरनाथ यात्रा का रोमांच)"
    ],
    "Mathematics (Maths Mela 5 / Ganit Tarang)": [
      "1: The Fish Tale (Large Numbers up to Lakhs/Crores, Boat Speeds & Catch Math)",
      "2: Shapes and Angles (Acute, Obtuse, Right, Reflex Angles, Protractors & Clock Hands)",
      "3: How Many Squares? (Area on Gridded Sheets, Perimeter vs Area & Tangrams)",
      "4: Parts and Wholes (Equivalent Fractions, Fraction Strips, Mixed Fractions & Decimals)",
      "5: Does it Look the Same? (Rotational & Reflectional Symmetry, 1/2, 1/3, 1/4, 1/6 Turns)",
      "6: Be My Multiple, I'll Be Your Factor (Multiples, Common Factors, Factor Trees & Venn Diagrams)",
      "7: Can You See the Pattern? (Square Numbers, Palindromic Numbers & Magic Hexagons)",
      "8: Mapping Your Way (Map Scales, Grid Navigation, Aerial Perspectives & Route Tracing)",
      "9: Boxes and Sketches (Nets of 3D Cubes/Cuboids, Isometric Views & Floor Blueprints)",
      "10: Tenths and Hundredths (Decimals, Millimetres, Metric Conversions, Currency & Decimals on Number Line)",
      "11: Area and its Boundary (Formulas for Rectangles/Squares, Fencing & Floor Tiles)",
      "12: Smart Charts (Tally Charts, Chapati/Pie Charts, Family Trees & Frequency Tables)",
      "13: Ways to Multiply and Divide (Standard Column Algorithms, Box Method & Word Problems)",
      "14: How Big? How Heavy? (Volume of Solids, Cube Units, Mass & Water Displacement)"
    ],
    "The World Around Us (Our Wondrous World 5)": [
      "1: Super Senses (Animal Senses: Acute Vision of Eagles, Olfactory Trail of Ants & Bat Echolocation)",
      "2: A Snake Charmer's Story (Kalbeliyas, Folk Instruments, Venom, Antivenom & Wildlife Laws)",
      "3: From Tasting to Digesting (Tongue Taste Buds, Digestive Organs, Gastric Juices & Glucose Drip)",
      "4: Mangoes Round the Year (Food Preservation, Drying, Mamidi Tandra & Bacteria Spoilage)",
      "5: Seeds and Seeds (Seed Anatomy, Germination Requirements, Dispersal Mechanisms & Pitcher Plant)",
      "6: Every Drop Counts (Ghadsisar Lake, Historical Stepwells / Baolis, Johads & Rainwater Harvesting)",
      "7: Experiments with Water (Density, Dead Sea Buoyancy, Floating/Sinking & Solute Dissolution)",
      "8: A Treat for Mosquitoes (Malaria Parasite, Anopheles, Dengue, Anaemia, Haemoglobin & Blood Reports)",
      "9: Up You Go! (Mountaineering Leader Duties, Nehru Institute of Mountaineering & Bachendri Pal Everest Summit)",
      "10: Walls Tell Stories (Golconda Fort Architecture, Acoustic Engineering, Cannons & Museum Relics)",
      "11: Sunita in Space (Microgravity, Space Station Daily Life, Atmosphere & Earth from Orbit)",
      "12: What if it Finishes...? (Petroleum Origins, Refining, Non-renewable Fossil Fuels & Green Energy)",
      "13: A Shelter so High! (Changthang Cold Desert, Changpas, Pashmina Goats, Rebo Tents & Lekha Enclosures)",
      "14: When the Earth Shook! (Bhuj Earthquake 2001, Fault Lines, Seismology & Emergency Disaster Management)",
      "15: Blow Hot, Blow Cold (Dr. Zakir Husain Story - Temperature Regulation, Stethoscope & Lungs)",
      "16: Who will do this Work? (Dignity of Manual Labour, Sanitation Workers & Dr. B.R. Ambedkar's Vision)",
      "17: Across the Wall (Nagpada Basketball Association, Gender Stereotypes & Team Empowerment)",
      "18: No Place for Us? (Tehri Dam Displacement, Khedi Village, Rehabilitation & Urban Struggles)",
      "19: A Seed Tells a Farmer's Story (Bajra Seed, Traditional Crop Rotation, Desi Seeds vs Chemical Farming)",
      "20: Whose Forests? (Suryamani, Kuduk Tribe, 'Torang' Nature Center & Forest Rights Act 2007)",
      "21: Like Father, Like Daughter (Genetics, Hereditary Traits, Polio Awareness & Gregor Mendel's Experiments)",
      "22: On the Move Again (Sugarcane Harvest Migrants, Mukadam Agent System & Children's Schooling)"
    ]
  },
  "Class 6": {
    "Science (Curiosity)": [
      "1: The Wonderful World of Science (Scientific Inquiry, Observation, Questioning & Scientific Method)",
      "2: Diversity in the Living World (Plant & Animal Biodiversity, Habitats, Structural Adaptations)",
      "3: Mindful Eating: A Path to a Healthy Body (Nutrients, Balanced Diet, Deficiency Diseases & Digestive Well-being)",
      "4: Exploring Magnets (Magnetic & Non-Magnetic Materials, Magnetic Poles, Compasses & Practical Applications)",
      "5: Measurement of Length and Motion (Standard SI Units, Metric Rulers, Rectilinear, Circular & Periodic Motion)",
      "6: Materials Around Us (Properties of Materials, Lustre, Transparency, Hardness, Solubility & Grouping)",
      "7: Temperature and its Measurement (Clinical & Laboratory Thermometers, Celsius Scale & Thermal Expansion)",
      "8: A Journey Through States of Water (Evaporation, Condensation, Transpiration, Water Cycle & Cloud Formation)",
      "9: Methods of Separation in Everyday Life (Handpicking, Threshing, Winnowing, Sieving, Filtration & Decantation)",
      "10: Living Creatures: Exploring Their Characteristics (Cellular Organisation, Growth, Respiration, Response & Excretion)",
      "11: Nature's Treasures (Air, Water, Fertile Soil, Forest Minerals, Renewable & Non-renewable Resource Conservation)",
      "12: Beyond Earth (Solar System, Planets, Moon Phases, Eclipses, Constellations & Space Exploration)"
    ],
    "Mathematics (Ganita Prakash)": [
      "1: Patterns in Mathematics (Visual Sequences, Geometric Tessellations, Number Patterns & Sequence Discovery)",
      "2: Lines and Angles (Points, Rays, Line Segments, Acute, Right, Obtuse, Straight Angles & Intersecting/Parallel Lines)",
      "3: Number Play (Large Numbers, Indian & International Place Value, Roman Numerals, Comparison & Estimation)",
      "4: Data Handling and Presentation (Tally Marks, Frequency Distributions, Pictographs, Bar Graphs & Analysis)",
      "5: Prime Time (Factors, Multiples, Prime & Composite Numbers, Sieve of Eratosthenes, Prime Factorisation, HCF & LCM)",
      "6: Perimeter and Area (Boundary Measurements, Rectangles, Squares, Composite Figures & Gridded Calculations)",
      "7: Fractions (Concept of Parts of Whole, Proper, Improper, Mixed Fractions, Equivalent Fractions & Number Line Arithmetic)",
      "8: Playing with Constructions (Geometric Tools, Ruler & Compass, Perpendicular Bisectors, Circles & Angle Constructions)"
    ],
    "Social Science (Exploring Society: India and Beyond)": [
      "Theme A: India and the World: Land and the People -> 1: Locating Places on the Earth (Latitudes, Longitudes, Equator, Prime Meridian, Hemispheres & Grid Coordinates)",
      "Theme A: India and the World: Land and the People -> 2: Oceans and Continents (Seven Continents, Major Ocean Basins, Continental Drift & Earth Relief)",
      "Theme A: India and the World: Land and the People -> 3: Landforms and Life (Mountains, Plateaus, Plains & Human Environmental Adaptation)",
      "Theme B: Tapestry of the Past -> 4: Timeline and Sources of History (Archaeological Excavations, Inscriptions, Manuscripts, Numismatics & Historical Chronology)",
      "Theme B: Tapestry of the Past -> 5: India, That Is Bharat (Geographic Extent, Civilisational Unity, Ancient Nomenclature & Cultural Continuity)",
      "Theme B: Tapestry of the Past -> 6: The Beginnings of Indian Civilisation (Indus-Saraswati / Harappan Civilisation, Urban Planning, Drainage, Crafts & Trade)",
      "Theme C: Our Cultural Heritage and Knowledge Traditions -> 7: India's Cultural Roots (Vedic Literature, Upanishadic Philosophy, Epics & Oral Knowledge Systems)",
      "Theme C: Our Cultural Heritage and Knowledge Traditions -> 8: Unity in Diversity, or 'Many in the One' (Linguistic, Cultural, Plural Traditions of Bharat)",
      "Theme D: Governance and Democracy -> 9: Family and Community (Social Structures, Kinship, Cooperation & Community Living)",
      "Theme D: Governance and Democracy -> 10: Grassroots Democracy – Part 1: Governance (Meaning of Governance, Public Welfare, Rules & Rule of Law)",
      "Theme D: Governance and Democracy -> 11: Grassroots Democracy – Part 2: Local Government in Rural Areas (Gram Sabha, Gram Panchayat, Ward Members & Nyaya Panchayat)",
      "Theme D: Governance and Democracy -> 12: Grassroots Democracy – Part 3: Local Government in Urban Areas (Municipal Corporations, Municipal Councils & Nagar Panchayats)",
      "Theme E: Economic Life Around Us -> 13: The Value of Work (Dignity of Labour, Household Tasks, Division of Labour & Unpaid/Paid Work)",
      "Theme E: Economic Life Around Us -> 14: Economic Activities Around Us (Primary, Secondary, Tertiary Sectors, Livelihoods, Weekly Markets & Supply Chains)"
    ],
    "English (Poorvi)": [
      "Unit 1: Fables and Folk Tales (A Bottle of Dew, The Raven and the Fox, Rama to the Rescue)",
      "Unit 2: Friendship (The Unlikely Best Friends, A Friend's Prayer, The Chair)",
      "Unit 3: Nurturing Nature (Neem Baba, What a Bird Thought, Spices that Heal Us)",
      "Unit 4: Sports and Wellness (Change of Heart, The Winner, Yoga—A Way of Life)",
      "Unit 5: Culture and Tradition (Hamara Bharat—Incredible India!, The Kites, Ila Sachani: Embroidering Dreams with her Feet)"
    ],
    "Hindi (Malhar)": [
      "1: मातृभूमि (मैथिलीशरण गुप्त की राष्ट्रभक्ति कविता)",
      "2: गोल (खेल भावना और एकाग्रता का महत्व)",
      "3: पहली बूँद (वर्षा ऋतु का मनोहारी सौंदर्य)",
      "4: हार की जीत (सुदर्शन की कालजयी बाबा भारती और खड़क सिंह की कहानी)",
      "5: रहीम के दोहे (नीतिपरक और व्यावहारिक दोहे)",
      "6: मेरी माँ (अमर शहीद रामप्रसाद 'बिस्मिल' का आत्मकथ्य)",
      "7: जलाते चलो (ज्ञान और आशा का प्रकाश फैलाने वाला गीत)",
      "8: सत्रिया और बिहू नृत्य (असम की समृद्ध शास्त्रीय और लोक नृत्य परंपरा)",
      "9: मैया मैं नहिं माखन खायो (भक्त सूरदास का कृष्ण बाल वर्णन)",
      "10: परीक्षा (मुंशी प्रेमचंद की योग्यता व चरित्र पर प्रेरक कहानी)",
      "11: चेतक की वीरता (श्याम नारायण पांडेय का वीर रस काव्य)",
      "12: हिंद महासागर में छोटा-सा हिंदुस्तान (मॉरीशस की यात्रा और भारतीय संस्कृति)",
      "13: पेड़ की बात (आचार्य जगदीश चंद्र बसु के वैज्ञानिक विचार)"
    ],
    "Sanskrit (Deepakam)": [
      "1: वयं वर्णमालां पठामः (संस्कृत वर्णमाला एवं शुद्ध उच्चारणम्)",
      "2: संयुक्त-व्यञ्जनानि (संयुक्त वर्ण संरचना एवं शब्द रचना)",
      "3: एषः कः? एषा का? एतत् किम्? (सर्वनाम प्रयोगः पुंल्लिङ्ग-स्त्रीलिङ्ग-नपुंसकलिङ्ग)",
      "4: अहं च त्वं च (उत्तम पुरुष एवं मध्यम पुरुष क्रिया प्रयोगाः)",
      "5: संख्यागणना ननु सरला (१ तः ५० पर्यन्तं संख्यावाचक शब्दाः)",
      "6: अहं प्रातः उत्तिष्ठामि (दिनचर्या, समय निर्देशः एवं लकार प्रयोगः)",
      "7: शूराः वयं धीराः वयम् (देशभक्ति पूर्णम् उत्साह गीतम्)",
      "8: सः एव महान् चित्रकारः (प्रतिभा एवं अभ्यासस्य महत्वम्)",
      "9: अतिथिदेवो भव (भारतीय संस्कृति परम्परा एवं शिष्टाचारः)",
      "10: बुद्धिः सर्वार्थसाधिका (पञ्चतन्त्रस्य चातुर्य कथा)",
      "11: यः जानाति सः पण्डितः (रोचक प्रहेलिकाः एवं उत्तरम्)",
      "12: त्वम् आपणं गच्छ (आपण व्यवहारः एवं संवाद रचना)",
      "13: पृथिव्यां त्रीणि रत्नानि (सुभाषितानि एवं नैतिक मूल्यानि)",
      "14: आलस्यं हि मनुष्याणां शरीरस्थः महान् रिपुः (परिश्रमस्य महत्वम्)",
      "15: माधवस्य प्रियम् अङ्गम् (शरीरावयव परिचयः एवं स्वास्थ्यम्)",
      "16: वृक्षाः सत्पुरुषाः इव (पर्यावरण संरक्षणम् एवं परोपकारः)"
    ]
  },
  "Class 7": {
    "Science (Curiosity 7)": [
      "1: Nutrition in Plants (Autotrophic Photosynthesis, Stomata, Parasitic Cuscuta, Insectivorous Pitcher Plant & Saprotrophs)",
      "2: Nutrition in Animals (Human Alimentary Canal, Enzymes, Stomach, Small Intestine Villi, Ruminant Digestion & Amoeba Pseudopodia)",
      "3: Heat and Temperature (Conduction in Solids, Convection in Fluids, Radiation, Thermometers & Land/Sea Breeze)",
      "4: Acids, Bases and Salts (Natural Litmus, Turmeric, China Rose Indicators, Neutralisation Reaction & Everyday Applications)",
      "5: Physical and Chemical Changes (Reversible vs Irreversible, Rusting Galvanisation & Copper Sulphate Crystallisation)",
      "6: Respiration in Organisms (Cellular Respiration, Aerobic vs Anaerobic, Diaphragm Breathing Mechanism & Gas Exchange)",
      "7: Transportation in Animals and Plants (Human Heart Anatomy, Double Circulation, Pulse Rate, Xylem & Phloem Translocation)",
      "8: Reproduction in Plants (Asexual Modes: Vegetative Propagation, Budding, Fragmentation, Spores, Pollination & Double Fertilisation)",
      "9: Motion and Time (Speed Calculations s=d/t, Simple Pendulum Time Period T=2π√(l/g) & Distance-Time Graphs)",
      "10: Electric Current and its Effects (Heating Effect Joule Law, Electric Fuse, Miniature Circuit Breakers & Electromagnets)",
      "11: Light and Optical Phenomena (Reflection from Plane Mirrors, Concave/Convex Mirrors, Convex/Concave Lenses & Newton's Disc Spectrum)",
      "12: Forests: Our Lifeline (Canopy, Understorey, Decomposers Humus, Interlocking Food Webs & Forest Microclimate)",
      "13: Wastewater Story (Sewage Characteristics, Primary/Secondary WWTP Treatment Stages, Sanitation & Clean Water Practices)"
    ],
    "Mathematics (Ganita Prakash 7)": [
      "1: Integers (Closure, Commutative, Associative Properties, Distributive Law of Multiplication & Multiplication Rules)",
      "2: Fractions and Decimals (Multiplication and Division of Proper/Improper Fractions, Decimal Arithmetic on Number Line)",
      "3: Data Handling (Arithmetic Mean, Median, Mode, Range of Data, Double Bar Graphs & Elementary Chance/Probability)",
      "4: Simple Equations (Setting Up Linear Equations, Balancing/Transposition Methods & Word Problem Solutions)",
      "5: Lines and Angles (Complementary, Supplementary, Adjacent, Vertically Opposite, Alternate Interior & Corresponding Angles)",
      "6: The Triangle and its Properties (Medians, Altitudes, Exterior Angle Theorem, Angle Sum Property & Pythagoras Theorem a^2+b^2=c^2)",
      "7: Comparing Quantities (Ratios, Percentages, Profit and Loss Percentage & Simple Interest Formula SI=PRT/100)",
      "8: Rational Numbers (Positive/Negative Rationals, Standard Form, Density of Rationals & Operations on Number Line)",
      "9: Perimeter and Area (Area of Parallelogram A=bh, Triangles A=1/2bh, Circles: Circumference 2πr and Area πr^2)",
      "10: Algebraic Expressions (Terms, Factors, Numerical Coefficients, Monomials/Binomials & Value Calculation)",
      "11: Exponents and Powers (Laws of Exponents: a^m × a^n, (a^m)^n, Expressing Large Numbers in Standard Scientific Form)",
      "12: Symmetry (Line of Symmetry, Rotational Symmetry, Angle of Rotation, Order of Symmetry & Centre of Rotation)",
      "13: Visualising Solid Shapes (Plane Figures vs Solid Polyhedra, Faces, Edges, Vertices, Nets & Isometric Drawings)"
    ],
    "Social Science (Exploring Society: Our Living World & Heritage)": [
      "Theme A: Our Dynamic Planet -> 1: Inside Our Earth (Crust, Mantle, Core, Igneous, Sedimentary, Metamorphic Rocks & Rock Cycle)",
      "Theme A: Our Dynamic Planet -> 2: Our Changing Earth (Lithospheric Plates, Earthquakes, Volcanoes, River Erosion, Glacial Moraines & Sand Dunes)",
      "Theme A: Our Dynamic Planet -> 3: Atmosphere, Air and Climate (Layers of Atmosphere: Troposphere to Exosphere, Weather, Climate & Planetary Winds)",
      "Theme A: Our Dynamic Planet -> 4: Water: Circulation and Resources (Hydrological Cycle, Ocean Waves, High/Low Tides & Major Ocean Currents)",
      "Theme B: Our Medieval & Early Modern Heritage -> 5: Tracing Changes Through a Thousand Years (Historical Maps, Terminology Evolution & Archival Records)",
      "Theme B: Our Medieval & Early Modern Heritage -> 6: Kings and Kingdoms: 7th–12th Century (Cholas, Rashtrakutas, Gurjara-Pratiharas, Prashastis & Land Grants)",
      "Theme B: Our Medieval & Early Modern Heritage -> 7: The Delhi Sultanate (Mamluk, Khalji, Tughlaq Dynasties, Expansion, Iqta System & Garrison Towns)",
      "Theme B: Our Medieval & Early Modern Heritage -> 8: The Mughal Empire (Babur to Aurangzeb, Mansabdari System, Jagirdari & Sulh-i-Kul Policy)",
      "Theme B: Our Medieval & Early Modern Heritage -> 9: Tribes, Nomads and Settled Communities (Gonds, Ahoms, Clan Structures & Frontier Migrations)",
      "Theme B: Our Medieval & Early Modern Heritage -> 10: Devotional Paths to the Divine (Bhakti Movement, Sufism, Alvars, Nayanars, Kabir, Mirabai & Guru Nanak)",
      "Theme B: Our Medieval & Early Modern Heritage -> 11: The Making of Regional Cultures (Languages, Literature, Kathak Dance, Miniature Painting & Regional Icons)",
      "Theme B: Our Medieval & Early Modern Heritage -> 12: Eighteenth-Century Political Formations (Awadh, Bengal, Hyderabad, Maratha Empire & Sikh Confederacy)",
      "Theme C: Democracy, Society and Media -> 13: On Equality (Universal Adult Franchise, Midday Meal Scheme, Article 15 & Civil Rights Movement)",
      "Theme C: Democracy, Society and Media -> 14: Role of the Government in Health (Public Healthcare Infrastructure, Private Sector & Kerala Health Experience)",
      "Theme C: Democracy, Society and Media -> 15: How the State Government Works (MLAs, Legislative Assembly Debates, Chief Minister & Executive Departments)",
      "Theme C: Democracy, Society and Media -> 16: Growing Up as Boys and Girls (Gender Socialisation, Domestic Unpaid Labour & Samoan Case Study)",
      "Theme C: Democracy, Society and Media -> 17: Understanding Media and Advertising (Media Independence, Public Sphere, Target Audience & Commercial Branding)",
      "Theme C: Democracy, Society and Media -> 18: Markets Around Us (Weekly Markets, Neighborhood Shops, Shopping Malls & Supply Chain Middlemen)"
    ],
    "English (Poorvi 7)": [
      "Unit 1: Wit and Wisdom (The Three Questions, The Wise Minister, Folktales of Bharat)",
      "Unit 2: The Spirit of Sports (Rising Champions, The Game of Life, Mindful Movement)",
      "Unit 3: Environmental Guardians (Whispering Forests, Save the Sacred Groves, River Guardians)",
      "Unit 4: Science and Imagination (The Starry Night, Inventions that Changed the World, Robo-Companion)",
      "Unit 5: Cultural Harmony (Heritage Songs, Threads of Bharat, Folk Dances of the East)"
    ],
    "Hindi (Malhar 7)": [
      "1: हम पंछी उन्मुक्त गगन के (शिवमंगल सिंह 'सुमन')",
      "2: दादी माँ (शिवप्रसाद सिंह की आत्मकथात्मक कहानी)",
      "3: हिमालय की बेटियाँ (नागार्जुन का निबंध)",
      "4: कठपुतली (भवानी प्रसाद मिश्र की कविता)",
      "5: मिठाईवाला (भगवती प्रसाद वाजपेयी की कहानी)",
      "6: रक्त और हमारा शरीर (यतीश अग्रवाल का वैज्ञानिक आलेख)",
      "7: पापा खो गए (विजय तेंदुलकर का नाटक)",
      "8: शाम-एक किसान (सर्वेश्वर दयाल सक्सेना)",
      "9: चिड़िया की बच्ची (जैनेंद्र कुमार की कहानी)",
      "10: अपूर्व अनुभव (तोमोए स्कूल - तोत्तो-चान)",
      "11: रहीम के दोहे (नीति वचन)",
      "12: कंचा (टी. पद्मनाभन की कहानी)",
      "13: एक तिनका (अयोध्यासिंह उपाध्याय 'हरिऔध')",
      "14: खानपान की बदलती तस्वीर (प्रयाग शुक्ल)",
      "15: नीलकंठ (महादेवी वर्मा का रेखाचित्र)",
      "16: भोर और बरखा (मीराबाई के पद)",
      "17: वीर कुँवर सिंह (१८५७ की क्रांति के नायक)",
      "18: संघर्ष के कारण मैं तुनुकमिज़ाज हो गया: धनराज पिल्लै",
      "19: आश्रम का अनुमानित व्यय (महात्मा गांधी)",
      "20: विप्लव-गायन (बालकृष्ण शर्मा 'नवीन')"
    ],
    "Sanskrit (Deepakam 7)": [
      "1: सुभाषितानि (सदाचार श्लोकाः)",
      "2: दुर्बुद्धिः विनश्यति (पञ्चतन्त्रकथा)",
      "3: स्वावलम्बनम् (संख्यावाचक शब्दाः)",
      "4: पण्डिता रमाबाई (स्त्रीशिक्षायाः प्रणेत्री)",
      "5: सदाचारः (नीतिवचनानि)",
      "6: सङ्कल्पः सिद्धिदायकः (पार्वती-शिव संवादः)",
      "7: त्रिवर्णः ध्वजः (राष्ट्रध्वज परिचयः)",
      "8: अहमपि विद्यालयं गमिष्यामि (बालश्रम निषेधः)",
      "9: विश्वबन्धुत्वम् (शान्ति सन्देशः)",
      "10: समवायो हि दुर्जयः (सङ्घटन शक्तिः)",
      "11: विद्याधनम् (विद्या प्रशंसा)",
      "12: अमृतं संस्कृतम् (संस्कृत भाषा महत्वम्)",
      "13: लालनगीतम् (मातृवात्सल्यम्)"
    ]
  },
  "Class 8": {
    "Science (Curiosity 8)": [
      "1: Crop Production and Management (Soil Preparation, Sowing, Manures/Fertilisers, Modern Irrigation, Weeding, Harvesting & Silo Storage)",
      "2: Microorganisms: Friend and Foe (Bacteria, Fungi, Protozoa, Algae, Viruses, Antibiotics, Vaccine Production & Nitrogen Fixation Cycle)",
      "3: Coal and Petroleum (Exhaustible Natural Resources, Fossil Fuels, Fractional Distillation, Refining, Carbonisation & Petrochemical Derivatives)",
      "4: Combustion and Flame (Ignition Temperature, Inflammable Substances, Fire Extinguishers, Calorific Value & Luminous/Non-Luminous Flame Zones)",
      "5: Conservation of Plants and Animals (Deforestation Consequences, Biosphere Reserves, National Parks, Sanctuaries, Red Data Book & Migration)",
      "6: Reproduction in Animals (Sexual & Asexual, Binary Fission, Budding, Male/Female Reproductive Organs, Metamorphosis & Dolly Cloning)",
      "7: Reaching the Age of Adolescence (Puberty Changes, Endocrine Glands, Pituitary, Hormones, Secondary Sexual Traits & Reproductive Health)",
      "8: Force and Pressure (Contact & Non-contact Forces, Liquid Pressure, Manometers & Atmospheric Pressure Calculations)",
      "9: Friction (Static, Sliding, Rolling Friction, Advantages/Disadvantages, Lubricants & Fluid Viscous Drag / Streamlining)",
      "10: Sound (Vibrations in Vocal Cords, Propagation Medium, Amplitude, Frequency, Pitch, Loudness & Decibels / Noise Pollution)",
      "11: Chemical Effects of Electric Current (Electrolytes, Ions, Chemical Reactions during Electrolysis & Industrial Electroplating)",
      "12: Some Natural Phenomena (Electric Charges, Electroscope, Lightning Conductors & Seismology Richter Scale Earthquake Drills)",
      "13: Light and Optical Phenomena (Laws of Reflection, Regular/Diffused, Multiple Reflections, Human Eye Anatomy, Defects & Braille System)"
    ],
    "Mathematics (Ganita Prakash 8)": [
      "1: Rational Numbers (Closure, Commutative, Associative Properties, Distributivity, Additive/Multiplicative Inverse & Rational Numbers on Number Line)",
      "2: Linear Equations in One Variable (Solving Equations with Variables on Both Sides, Cross-Multiplication & Word Problem Applications)",
      "3: Understanding Quadrilaterals (Convex/Concave Polygons, Angle Sum Property, Properties of Parallelogram, Rhombus, Rectangle, Square, Kite & Trapezium)",
      "4: Data Handling (Frequency Distribution of Grouped Data, Histograms, Circle Graphs / Pie Charts & Theoretical Chance/Probability)",
      "5: Squares and Square Roots (Square Properties, Pythagorean Triplets, Prime Factorisation & Division Method for Square Roots)",
      "6: Cubes and Cube Roots (Cubes of Numbers, Hardy-Ramanujan Numbers, Prime Factorisation & Cube Root Patterns)",
      "7: Comparing Quantities (Ratios, Percentage Variations, Discount, Sales Tax/GST & Compound Interest Formula A=P(1+r/100)^n)",
      "8: Algebraic Expressions and Identities (Monomials, Binomials, Polynomial Multiplication & Standard Identities (a±b)^2, (a+b)(a-b))",
      "9: Mensuration (Area of Trapezium, General Quadrilateral, Surface Area & Volume of Cuboid, Cube, Right Circular Cylinder)",
      "10: Exponents and Powers (Negative Integral Exponents, Laws of Exponents & Standard Scientific Form for Microscopic/Cosmic Numbers)",
      "11: Direct and Inverse Proportions (Direct Variation x/y=k, Inverse Variation xy=k & Proportionality Applications)",
      "12: Factorisation (Common Factors, Regrouping Terms, Using Algebraic Identities, Splitting Middle Term & Polynomial Division)",
      "13: Introduction to Graphs (Line Graphs, Linear Graphs, Coordinate Planes (x, y) & Independent/Dependent Variable Graphs)"
    ],
    "Social Science (Exploring Society: Transitions & Modern India)": [
      "Theme A: Resources and Sustainable Development -> 1: Resources: Types, Natural, Human-Made & Sustainable Conservation",
      "Theme A: Resources and Sustainable Development -> 2: Land, Soil, Water, Natural Vegetation and Wildlife (Profiles, Degradation & Conservation)",
      "Theme A: Resources and Sustainable Development -> 3: Agriculture: Farming Types, Major Crops, Food Security & Comparative Farms (India vs USA)",
      "Theme A: Resources and Sustainable Development -> 4: Industries: Classification, Industrial Systems, Steel (Jamshedpur/Pittsburgh) & IT Hubs",
      "Theme A: Resources and Sustainable Development -> 5: Human Resources: Population Distribution, Density, Growth Factors & Age-Sex Pyramids",
      "Theme B: Transitions in History - Our Past III -> 6: How, When and Where (Periodisation, Colonial Archives & Historical Sources)",
      "Theme B: Transitions in History - Our Past III -> 7: From Trade to Territory (East India Company, Battle of Plassey 1757, Buxar & Annexation)",
      "Theme B: Transitions in History - Our Past III -> 8: Ruling the Countryside (Permanent Settlement, Ryotwari, Mahalwari & Indigo Rebellion)",
      "Theme B: Transitions in History - Our Past III -> 9: Tribals, Dikus and the Vision of a Golden Age (Birsa Munda, Santhals, Gonds & Forest Laws)",
      "Theme B: Transitions in History - Our Past III -> 10: When People Rebel: 1857 and After (Causes, Sepoy Mutiny, Leaders, Suppression & 1858 Act)",
      "Theme B: Transitions in History - Our Past III -> 11: Civilising the Native, Educating the Nation (Orientalists vs Macaulay, Wood's Despatch, Nai Talim)",
      "Theme B: Transitions in History - Our Past III -> 12: Women, Caste and Reform (Raja Ram Mohan Roy, Vidyasagar, Jyotirao Phule, Ambedkar & Periyar)",
      "Theme B: Transitions in History - Our Past III -> 13: The Making of the National Movement: 1870s–1947 (Congress, Swadeshi, Non-Cooperation, Dandi March, Quit India & Partition)",
      "Theme C: Democratic Institutions and Justice -> 14: The Indian Constitution (Preamble, Federalism, Separation of Powers & Fundamental Rights)",
      "Theme C: Democratic Institutions and Justice -> 15: Understanding Secularism (State Neutrality & Indian Model vs Western Model)",
      "Theme C: Democratic Institutions and Justice -> 16: Parliament and the Making of Laws (Role of Citizens, MPs & Legislative Procedures)",
      "Theme C: Democratic Institutions and Justice -> 17: Judiciary (Structure of Courts, Judicial Independence, Judicial Review & PIL)",
      "Theme C: Democratic Institutions and Justice -> 18: Understanding Our Criminal Justice System (Role of Police, Public Prosecutor, Judge & Fair Trial)",
      "Theme C: Democratic Institutions and Justice -> 19: Confronting Marginalisation (Safeguards for SCs/STs, Prevention of Atrocities Act & Reservations)",
      "Theme C: Democratic Institutions and Justice -> 20: Public Facilities and Law & Social Justice (Safe Water, Electricity, Healthcare, Bhopal Tragedy & Labour Laws)"
    ],
    "English (Poorvi 8)": [
      "Unit 1: Courage and Valor (The Best Christmas Present in the World, The Ant and the Cricket)",
      "Unit 2: Nature and Harmony (Geography Lesson, The Tsunami, Glimpses of the Past, Macavity: The Mystery Cat)",
      "Unit 3: Science and Discovery (Bepin Choudhury's Lapse of Memory, The Last Bargain)",
      "Unit 4: Human Values (The Summit Within, The School Boy, This is Jody's Fawn)",
      "Unit 5: Heritage and Wonder (A Visit to Cambridge, When I Set Out for Lyonnesse, A Short Monsoon Diary, Ancient Education System of India)"
    ],
    "Hindi (Malhar 8)": [
      "1: ध्वनि (सूर्यकांत त्रिपाठी 'निराला')",
      "2: लाख की चूड़ियाँ (कामनाथ की कहानी)",
      "3: बस की यात्रा (हरिशंकर परसाई का व्यंग्य)",
      "4: दीवानों की हस्ती (भगवतीचरण वर्मा)",
      "5: चिट्ठियों की अनूठी दुनिया (अरविंद कुमार सिंह)",
      "6: भगवान के डाकिए (रामधारी सिंह 'दिनकर')",
      "7: क्या निराश हुआ जाए (हजारी प्रसाद द्विवेदी का निबंध)",
      "8: यह सबसे कठिन समय नहीं (जया जादवानी)",
      "9: कबीर की साखियाँ (नीति और भक्ति)",
      "10: कामचोर (इस्मत चुग़ताई की हास्य कथा)",
      "11: जब सिनेमा ने बोलना सीखा (प्रदीप तिवारी - आलम आरा)",
      "12: सुदामा चरित (नरोत्तमदास का सवैया)",
      "13: जहाँ पहिया है (पी. साईनाथ - महिला सशक्तीकरण)",
      "14: अकबरी लोटा (अन्नपूर्णानन्द वर्मा)",
      "15: सूरदास के पद (कृष्ण बाललीला)",
      "16: पानी की कहानी (रामचंद्र तिवारी का वैज्ञानिक निबंध)",
      "17: बाज और साँप (निर्मल वर्मा का बोधकथा)",
      "18: टोपी (संजय की लोककथा)"
    ],
    "Sanskrit (Deepakam 8)": [
      "1: सुभाषितानि (नीति श्लोकाः)",
      "2: बिलस्य वाणी न कदापि मे श्रुता (पञ्चतन्त्रकथा)",
      "3: डिजीभारतम् (डिजिटल भारतम् एवं प्रविधिः)",
      "4: सदैव पुरतो निधेहि चरणम् (श्रीधर भास्कर वर्णेकर)",
      "5: कण्टकेनैव कण्टकम् (चातुर्यकथा)",
      "6: गृहं शून्यं सुतां विना (कन्या संरक्षणम्)",
      "7: भारतजनताऽहम् (डॉ. रमाकान्त शुक्ल)",
      "8: संसारसागरस्य नायकाः (तड़ाग निर्मातारः)",
      "9: सप्तभगिन्यः (पूर्वोत्तर भारतस्य राज्यानि)",
      "10: नीतिनवनीतम् (मनुस्मृति श्लोकाः)",
      "11: सावित्री बाई फुले (स्त्रीशिक्षा आन्दोलनम्)",
      "12: कः रक्षति कः रक्षितः (पर्यावरण संरक्षणम्)",
      "13: क्षितौ राजते भारतस्वर्णभूमिः (राष्ट्रगौरवम्)",
      "14: आर्यभटः (प्राचीन भारतीय खगोलविज्ञानी)",
      "15: प्रहेलिकाः (प्रश्नोत्तरी क्रीडा)"
    ]
  },
  "Class 9": {
    "Mathematics": [
      "1: Number Systems (Irrational Numbers, Real Number Operations & Laws of Radicals)",
      "2: Polynomials (Zeroes, Remainder Theorem, Factor Theorem & Algebraic Identities)",
      "3: Coordinate Geometry (Cartesian Plane, Quadrants & Plotting Points)",
      "4: Linear Equations in Two Variables (Standard Form ax+by+c=0 & Graph of Linear Equations)",
      "5: Introduction to Euclid's Geometry (Euclid's Axioms, Postulates & Deductive Logic)",
      "6: Lines and Angles (Intersecting Lines, Parallel Lines with Transversal & Angle Sum Theorem)",
      "7: Triangles (Congruence Criteria: SAS, ASA, AAS, SSS, RHS & Isosceles Triangle Properties)",
      "8: Quadrilaterals (Mid-point Theorem & Properties of Parallelograms)",
      "9: Circles (Angle Subtended by Chords, Perpendicular from Centre & Cyclic Quadrilaterals)",
      "10: Heron's Formula (Calculation of Area of Triangles)",
      "11: Surface Areas and Volumes (Right Circular Cones, Spheres & Hemispheres)",
      "12: Statistics (Graphical Representation: Histograms & Frequency Polygons)"
    ],
    "Science": [
      "1: Matter in Our Surroundings (States of Matter, Evaporation, Latent Heat & Sublimation)",
      "2: Is Matter Around Us Pure? (Solutions, Suspensions, Colloids, Tyndall Effect & Mixtures)",
      "3: Atoms and Molecules (Laws of Chemical Combination, Atomic Mass & Chemical Formula Writing)",
      "4: Structure of the Atom (Thomson, Rutherford, Bohr Models, Neutrons, Isotopes & Isobars)",
      "5: The Fundamental Unit of Life (Cell Membrane, Nucleus, Cytoplasm, Organelles & Plasmolysis)",
      "6: Tissues (Meristematic, Permanent Plant Tissues, Epithelial, Connective, Muscular & Nervous Tissues)",
      "7: Motion (Distance, Displacement, Uniform/Non-uniform Motion, Equations of Motion & Circular Motion)",
      "8: Force and Laws of Motion (Newton's Three Laws, Inertia, Momentum & Conservation of Momentum)",
      "9: Gravitation (Universal Law of Gravitation, Free Fall, Acceleration due to Gravity 'g', Mass vs Weight, Archimedes' Principle & Relative Density)",
      "10: Work and Energy (Work Done by Constant Force, Kinetic & Potential Energy, Law of Conservation of Energy & Power)",
      "11: Sound (Propagation of Sound Waves, Longitudinal Waves, Speed of Sound, Reflection of Sound, Echo, Ultrasound & Human Ear Structure)",
      "12: Improvement in Food Resources (Crop Variety Improvement, Nutrient Management, Manures/Fertilisers, Animal Husbandry & Pisciculture)"
    ],
    "Social Science (History)": [
      "1: The French Revolution (Estates General, Storming of Bastille, Reign of Terror & Abolition of Slavery)",
      "2: Socialism in Europe and the Russian Revolution (Tsarist Autocracy, 1917 Bolshevik Revolution, Lenin & Collectivisation)",
      "3: Nazism and the Rise of Hitler (Weimar Republic, Nazi Ideology, Holocaust & Propaganda Machinery)",
      "4: Forest Society and Colonialism (Deforestation, Scientific Forestry, Bastar & Java Rebellions)",
      "5: Pastoralists in the Modern World (Nomadic Pastoralists of India & Maasai Community of Africa)"
    ],
    "Social Science (Geography)": [
      "1: India – Size and Location (Latitudinal/Longitudinal Extent, Standard Meridian & Strategic Oceanic Position)",
      "2: Physical Features of India (Himalayas, Northern Plains, Peninsular Plateau, Indian Desert, Coastal Plains & Islands)",
      "3: Drainage (Himalayan vs Peninsular River Systems, Lakes, Economic Importance & River Pollution)",
      "4: Climate (Monsoon Mechanism, Jet Streams, Western Cyclonic Disturbances & Seasons in India)",
      "5: Natural Vegetation and Wildlife (Tropical Evergreen/Deciduous Forests, Thorn Forests, Mangroves & Wildlife Sanctuaries)",
      "6: Population (Size, Distribution, Population Growth, Age Composition & National Population Policy)"
    ],
    "Social Science (Civics)": [
      "1: What is Democracy? Why Democracy? (Key Features, Broader Meaning & Democratic Arguments)",
      "2: Constitutional Design (Democratic Constitution in South Africa, Making of Indian Constitution & Preamble Values)",
      "3: Electoral Politics (Why Elections?, Election Commission of India, Free & Fair Electoral Mechanism)",
      "4: Working of Institutions (Parliament, Prime Minister and Council of Ministers, President & Supreme Court)",
      "5: Democratic Rights (Life without Rights, Rights in the Indian Constitution & Expanding Scope of Rights)"
    ],
    "Social Science (Economics)": [
      "1: The Story of Village Palampur (Factors of Production: Land, Labour, Physical Capital & Human Capital)",
      "2: People as Resource (Economic Activities by Men/Women, Quality of Population: Education, Health & Unemployment)",
      "3: Poverty as a Challenge (Poverty Line Estimation, Vulnerability, Anti-Poverty Programmes: MGNREGA)",
      "4: Food Security in India (Buffer Stock, Public Distribution System (PDS), Food Insecurity & Cooperatives)"
    ],
    "English (Beehive & Moments)": [
      "1: The Fun They Had (Isaac Asimov) & The Road Not Taken (Robert Frost)",
      "2: The Sound of Music (Evelyn Glennie & Bismillah Khan) & Wind",
      "3: The Little Girl (Katherine Mansfield) & Rain on the Roof",
      "4: A Truly Beautiful Mind (Albert Einstein) & The Lake Isle of Innisfree",
      "5: The Snake and the Mirror & A Legend of the Northland",
      "6: My Childhood (A.P.J. Abdul Kalam) & No Men Are Foreign",
      "7: Reach for the Top (Santosh Yadav & Maria Sharapova) & On Killing a Tree",
      "8: Kathmandu (Vikram Seth) & A Slumber Did My Spirit Seal",
      "9: If I Were You (Douglas James)",
      "10: The Lost Child (Mulk Raj Anand)",
      "11: The Adventures of Toto (Ruskin Bond)",
      "12: Iswaran the Storyteller (R.K. Laxman)",
      "13: In the Kingdom of Fools (A.K. Ramanujan)",
      "14: The Happy Prince (Oscar Wilde)",
      "15: The Last Leaf (O. Henry)",
      "16: A House Is Not a Home (Zan Gaudioso)",
      "17: The Beggar (Anton Chekhov)"
    ],
    "Hindi (Kshitij & Kritika - Course A)": [
      "1: दो बैलों की कथा (प्रेमचंद)",
      "2: ल्हासा की ओर (राहुल सांकृत्यायन)",
      "3: उपभोक्तावाद की संस्कृति (श्यामाचरण दुबे)",
      "4: साँवले सपनों की याद (जाबिर हुसैन)",
      "5: प्रेमचंद के फटे जूते (हरिशंकर परसाई)",
      "6: मेरे बचपन के दिन (महादेवी वर्मा)",
      "7: साखियाँ एवं सबद (कबीरदास)",
      "8: वाख (ललद्यद)",
      "9: सवैये (रसखान)",
      "10: कैदी और कोकिला (माखनलाल चतुर्वेदी)",
      "11: ग्राम श्री (सुमित्रानंदन पंत)",
      "12: मेघ आए (सर्वेश्वर दयाल सक्सेना)",
      "13: बच्चे काम पर जा रहे हैं (राजेश जोशी)",
      "14: माता का अँचल (शिवपूजन सहाय)",
      "15: जॉर्ज पंचम की नाक (कमलेश्वर)",
      "16: साना-साना हाथ जोड़ि (मधु कांकरिया)"
    ],
    "Hindi (Sparsh & Sanchayan - Course B)": [
      "1: दुःख का अधिकार (यशपाल)",
      "2: एवरेस्ट: मेरी शिखर यात्रा (बचेंद्री पाल)",
      "3: तुम कब जाओगे, अतिथि (शरद जोशी)",
      "4: वैज्ञानिक चेतना के वाहक: सी.वी. रामन",
      "5: शुक्रतारे के समान (स्वामी आनंद)",
      "6: रैदास के पद (अब कैसे छूटे नाम...)",
      "7: रहीम के दोहे",
      "8: गीत-अगीत (रामधारी सिंह 'दिनकर')",
      "9: अग्नि पथ (हरिवंशराय बच्चन)",
      "10: नए इलाके में / खुशबू रचते हैं हाथ (अरुण कमल)",
      "11: गिल्लू (महादेवी वर्मा)",
      "12: स्मृति (श्रीराम शर्मा)",
      "13: कल्लू कुम्हार की उनाकोटी (के. विक्रम सिंह)",
      "14: मेरा छोटा-सा निजी पुस्तकालय (धर्मवीर भारती)"
    ],
    "Sanskrit (Shemushi / Manika)": [
      "1: भारतीवसन्तगीतिः (सरल गीतिः)",
      "2: स्वर्णकाकः (नीतिकथा)",
      "3: गोदोहनम् (नाट्यांशः)",
      "4: कल्पतरुः (वेतालपञ्चविंशतितः)",
      "5: सूक्तिमौक्तिकम् (सदाचारपरक श्लोकाः)",
      "6: भ्रान्तो बालः (कथा)",
      "7: प्रत्यभिज्ञानम् (भासरचित नाटक)",
      "8: लौहतुला (पञ्चतन्त्रकथा)",
      "9: सिकतासेतुः (नाट्यांशः)",
      "10: जटायोः शौर्यम् (रामायण प्रसंगः)",
      "11: पर्यावरणम् (निबन्धः)",
      "12: वाङ्मनःप्राणस्वरूपम् (उपनिषत्संवादः)"
    ],
    "Information Technology (Code 402)": [
      "Unit 1: Communication Skills-I (Verbal, Non-Verbal & Perspectives)",
      "Unit 2: Self-Management Skills-I (Self-Confidence & Positive Thinking)",
      "Unit 3: ICT Skills-I (Computer Basics, Operating Systems & Internet Safety)",
      "Unit 4: Entrepreneurial Skills-I (Types of Businesses & Entrepreneurship)",
      "Unit 5: Green Skills-I (Environment Conservation & Sustainable Growth)",
      "Unit 6: Introduction to IT-ITeS Industry (BPO, BPM, IT Applications)",
      "Unit 7: Data Entry and Keyboarding Skills (Ergonomics, Touch Typing & RapidTyping)",
      "Unit 8: Digital Documentation (Word Processing, Formatting, Tables & Mail Merge)",
      "Unit 9: Electronic Spreadsheet (LibreOffice Calc / Excel, Formulas, Functions & Charts)",
      "Unit 10: Digital Presentation (Slide Design, Animations, Transitions & Slide Shows)"
    ]
  },
  "Class 10": {
    "Mathematics": [
      "1: Real Numbers (Fundamental Theorem of Arithmetic, Proof of Irrationality of √2, √3, √5 & Decimal Expansions)",
      "2: Polynomials (Geometrical Meaning of Zeroes, Relationship between Zeroes and Coefficients of Quadratic Polynomials)",
      "3: Pair of Linear Equations in Two Variables (Graphical Method, Substitution Method, Elimination Method & Consistency Conditions)",
      "4: Quadratic Equations (Standard Form ax^2+bx+c=0, Factorisation, Quadratic Formula, Discriminant D=b^2-4ac & Nature of Roots)",
      "5: Arithmetic Progressions (nth Term an=a+(n-1)d, Sum of First n Terms Sn=n/2[2a+(n-1)d] & Word Problem Applications)",
      "6: Triangles (Basic Proportionality Theorem - Thales Theorem, Criteria for Similarity of Triangles: AAA, SAS, SSS & Areas/Altitudes)",
      "7: Coordinate Geometry (Distance Formula, Section Formula for Internal Division & Mid-point Formula)",
      "8: Introduction to Trigonometry (Trigonometric Ratios, Values of Ratios for 0°, 30°, 45°, 60°, 90° & Trigonometric Identities: sin^2θ+cos^2θ=1, 1+tan^2θ=sec^2θ, 1+cot^2θ=cosec^2θ)",
      "9: Some Applications of Trigonometry (Heights and Distances, Line of Sight, Angles of Elevation and Depression)",
      "10: Circles (Tangent to a Circle at Point of Contact is Perpendicular to Radius, Lengths of Tangents drawn from External Point are Equal)",
      "11: Areas Related to Circles (Area of Sector of Angle θ: (θ/360)×πr^2, Length of Arc: (θ/360)×2πr, Area of Segment of Circle)",
      "12: Surface Areas and Volumes (Surface Area and Volume of Combinations of Solids: Cubes, Cuboids, Spheres, Hemispheres, Right Circular Cylinders & Cones)",
      "13: Statistics (Mean of Grouped Data by Direct/Assumed Mean Method, Mode of Grouped Data, Median of Grouped Data & Empirical Formula: 3 Median = Mode + 2 Mean)",
      "14: Probability (Classical Theoretical Probability P(E)=n(E)/n(S), Single Events, Impossible and Sure Events & Complementary Events P(E)+P(not E)=1)"
    ],
    "Science": [
      "1: Chemical Reactions and Equations (Chemical Equations Balancing, Types: Combination, Decomposition, Displacement, Double Displacement, Oxidation and Reduction Redox, Corrosion & Rancidity)",
      "2: Acids, Bases and Salts (Chemical Properties, Reaction with Metals & Carbonates, pH Scale, Universal Indicator, Salts: Bleaching Powder Ca(OCl)2, Baking Soda NaHCO3, Washing Soda Na2CO3.10H2O & Plaster of Paris CaSO4.1/2H2O)",
      "3: Metals and Non-metals (Physical/Chemical Properties, Reactivity Series, Formation and Properties of Ionic Compounds, Metallurgy: Roasting, Calcination, Refining of Copper & Corrosion Prevention)",
      "4: Carbon and its Compounds (Covalent Bonding, Versatile Nature of Carbon: Catenation & Tetravalency, Homologous Series, Nomenclature of Functional Groups, Saturated vs Unsaturated, Chemical Properties: Combustion, Oxidation, Addition, Substitution, Ethanol and Ethanoic Acid Properties, Soaps and Detergents Micelle Structure)",
      "5: Life Processes (Autotrophic Photosynthesis & Heterotrophic Nutrition, Human Alimentary Canal and Digestion, Aerobic and Anaerobic Respiration, ATP, Human Respiratory System, Circulatory System: Heart Anatomy, Double Circulation, Blood Vessels, Lymph, Transportation in Plants: Xylem and Phloem, Excretory System: Nephron Structure and Urine Formation)",
      "6: Control and Coordination (Nervous System, Neuron Structure, Synapse, Reflex Action and Reflex Arc, Human Brain: Forebrain, Midbrain, Hindbrain, Plant Movements: Tropic & Nastic, Plant Hormones: Auxin, Gibberellin, Cytokinin, Abscisic Acid, Animal Endocrine Glands: Pituitary, Thyroid, Adrenal, Pancreas, Testis, Ovary & Feedback Mechanism)",
      "7: How do Organisms Reproduce? (Asexual Reproduction: Binary/Multiple Fission, Fragmentation, Regeneration, Budding, Vegetative Propagation, Spore Formation, Sexual Reproduction in Flowering Plants: Stamen, Carpel, Pollination, Double Fertilisation, Seed and Fruit Formation, Human Reproductive System: Male and Female Organs, Menstrual Cycle, Fertilisation and Implantation, Contraception Methods: Barrier, Chemical, Surgical & Sexually Transmitted Infections)",
      "8: Heredity and Evolution (Accumulation of Variations, Mendel's Experiments: Monohybrid Cross, Dihybrid Cross, Law of Dominance, Segregation, Independent Assortment & Sex Determination in Human Beings: XX and XY Chromosomes)",
      "9: Light – Reflection and Refraction (Laws of Reflection, Concave and Convex Mirrors Ray Diagrams, Mirror Formula 1/v+1/u=1/f, Magnification, Refraction through Glass Slab, Snell's Law, Refractive Index, Spherical Lenses Ray Diagrams, Lens Formula 1/v-1/u=1/f & Power of a Lens P=1/f in Dioptres)",
      "10: The Human Eye and the Colourful World (Structure of Human Eye, Accommodation Power, Vision Defects: Myopia, Hypermetropia, Presbyopia and Correction with Spherical Lenses, Refraction of Light through a Triangular Glass Prism, Dispersion of White Light & Spectrum, Atmospheric Refraction: Twinkling of Stars, Advance Sunrise and Delayed Sunset, Scattering of Light: Tyndall Effect, Blue Sky, Red Sunset/Sunrise)",
      "11: Electricity (Electric Current I=Q/t, Electric Potential and Potential Difference V=W/Q, Ohm's Law V=IR, Resistance Factors: Length, Cross-sectional Area, Resistivity ρ, Resistors in Series Rs=R1+R2+R3 and Parallel 1/Rp=1/R1+1/R2+1/R3, Joule's Heating Law H=I^2Rt, Electric Power P=VI=I^2R=V^2/R, Commercial Unit of Electrical Energy: 1 kWh = 3.6×10^6 J)",
      "12: Magnetic Effects of Electric Current (Magnetic Field and Field Lines Properties, Magnetic Field due to Current through Straight Conductor, Circular Loop, Solenoid, Fleming's Left-Hand Rule, Force on Current-Carrying Conductor in Magnetic Field, Electric Motor Principles, Domestic Electric Circuits: Live, Neutral, Earth Wires, Short Circuiting, Overloading & Electric Fuse)",
      "13: Our Environment (Ecosystem Components: Biotic and Abiotic, Food Chains and Food Webs, Trophic Levels, 10 Percent Energy Transfer Law, Biological Magnification, Ozone Layer Depletion by CFCs, International Action UNEP & Waste Management: Biodegradable and Non-Biodegradable)"
    ],
    "Social Science (History - India & The Contemporary World II)": [
      "1: The Rise of Nationalism in Europe (French Revolution Legacy, Liberal Nationalism, Unification of Germany & Italy, Romanticism & Visualising the Nation)",
      "2: Nationalism in India (First World War Impact, Rowlatt Satyagraha, Non-Cooperation Movement, Civil Disobedience Movement, Salt March & Sense of Collective Belonging)",
      "3: The Making of a Global World (Pre-modern World, Silk Routes, Great Depression of 1929, Post-war Settlement & Bretton Woods Institutions)",
      "4: The Age of Industrialisation (Before the Industrial Revolution, Hand Labour and Steam Power, Industrialisation in Colonies & Market for Goods)",
      "5: Print Culture and the Modern World (First Printed Books, Print Revolution in Europe, Religious Reforms, Print Culture in India & Public Debate)"
    ],
    "Social Science (Geography - Contemporary India II)": [
      "1: Resources and Development (Classification, Resource Planning in India, Land Utilisation, Land Degradation & Soil Types: Alluvial, Black, Red-Yellow, Laterite, Arid)",
      "2: Forest and Wildlife Resources (Flora and Fauna in India, IUCN Categories: Endangered, Vulnerable, Rare, Joint Forest Management (JFM) & Project Tiger)",
      "3: Water Resources (Water Scarcity, Multi-purpose River Valley Projects, Dams Benefits and Critiques & Traditional Rainwater Harvesting Techniques: Rooftop, Khadins, Johads)",
      "4: Agriculture (Types of Farming: Primitive Subsistence, Intensive Subsistence, Commercial, Cropping Patterns: Rabi, Kharif, Zaid, Major Crops: Rice, Wheat, Millets, Pulses, Sugarcane, Tea, Coffee, Rubber, Cotton, Jute & Institutional Reforms: Green and White Revolution)",
      "5: Minerals and Energy Resources (Ferrous Minerals: Iron Ore, Manganese, Non-ferrous: Copper, Bauxite, Non-metallic: Mica, Conventional Energy: Coal, Petroleum, Natural Gas, Non-conventional: Solar, Wind, Biogas, Tidal & Geothermal Energy)",
      "6: Manufacturing Industries (Importance of Manufacturing, Industrial Location Factors, Agro-based: Textile, Sugar, Mineral-based: Iron and Steel, Aluminium Smelting, Chemical, Fertilizer, Cement, Automobile, Information Technology & Electronics, Industrial Pollution and Environmental Degradation Control)",
      "7: Lifelines of National Economy (Roadways: Golden Quadrilateral, National Highways, Railways, Pipelines, Waterways, Major Sea Ports of India, Airways & International Trade and Tourism)"
    ],
    "Social Science (Political Science - Democratic Politics II)": [
      "1: Power Sharing (Case Studies of Belgium and Sri Lanka, Majoritarianism in Sri Lanka, Accommodation in Belgium, Why is Power Sharing Desirable?, Forms of Power Sharing: Horizontal, Vertical, Community & Coalition)",
      "2: Federalism (What is Federalism?, Key Features, What makes India a Federal Country?, Union, State, Concurrent & Residuary Lists, Federal Practice: Linguistic States, Language Policy, Centre-State Relations & Decentralisation in India: 73rd and 74th Amendments)",
      "3: Gender, Religion and Caste (Gender and Politics, Public/Private Division, Women's Political Representation, Religion, Communalism and Politics, Secular State, Caste and Politics, Caste Inequalities & Caste in Politics)",
      "4: Political Parties (Why do we need Political Parties?, Functions of Political Parties, How Many Parties should we have?, National Parties of India: BJP, INC, AAP, BSP, CPI(M), State Parties & Challenges and Reforms in Political Parties)",
      "5: Outcomes of Democracy (How do we Assess Democracy's Outcomes?, Accountable, Responsive and Legitimate Government, Economic Growth and Development, Reduction of Inequality and Poverty, Accommodation of Social Diversity & Dignity and Freedom of Citizens)"
    ],
    "Social Science (Economics - Understanding Economic Development)": [
      "1: Development (What Development Promises - Different People, Different Goals, National Income and Per Capita Income, World Bank and UNDP Criteria, Human Development Index (HDI), Public Facilities & Sustainable Development)",
      "2: Sectors of the Indian Economy (Primary, Secondary, Tertiary Sectors, Comparing the Three Sectors, Historical Changes, Rising Importance of Tertiary Sector, Disguised Unemployment / Underemployment, Creating More Employment: MGNREGA & Organised vs Unorganised Sectors)",
      "3: Money and Credit (Money as a Medium of Exchange, Barter System and Double Coincidence of Wants, Modern Forms of Money: Currency and Bank Deposits, Loan Activities of Banks, Two Different Credit Situations, Terms of Credit, Formal vs Informal Credit Sector in India & Self-Help Groups (SHGs) for the Poor)",
      "4: Globalisation and the Indian Economy (Production Across Countries: MNCs, Interlinking Production across Countries, Foreign Trade and Integration of Markets, What is Globalisation?, Factors Enabling Globalisation: Technology & Liberalisation, World Trade Organisation (WTO), Impact of Globalisation in India & The Struggle for Fair Globalisation)",
      "5: Consumer Rights (The Consumer in the Marketplace, Consumer Exploitation, Consumer Movement in India, Consumer Protection Act (COPRA), Consumer Rights: Safety, Information, Choice, Redressal, Consumer Awareness & Standardization Marks: ISI, AGMARK, Hallmark)"
    ],
    "English (First Flight & Footprints without Feet)": [
      "1: A Letter to God (G.L. Fuentes) & Dust of Snow, Fire and Ice (Robert Frost)",
      "2: Nelson Mandela: Long Walk to Freedom & A Tiger in the Zoo (Leslie Norris)",
      "3: Two Stories about Flying (His First Flight & Black Aeroplane) & How to Tell Wild Animals",
      "4: From the Diary of Anne Frank & Amanda! (Robin Klein)",
      "5: Glimpses of India (A Baker from Goa, Coorg, Tea from Assam) & The Trees (Adrienne Rich)",
      "6: Mijbil the Otter (Gavin Maxwell) & Fog (Carl Sandburg)",
      "7: Madam Rides the Bus (Vallikkannan) & The Tale of Custard the Dragon (Ogden Nash)",
      "8: The Sermon at Benares (Betty Renshaw) & For Anne Gregory (W.B. Yeats)",
      "9: The Proposal (Anton Chekhov - One Act Play)",
      "10: A Triumph of Surgery (James Herriot - Dr. Herriot and Tricki)",
      "11: The Thief's Story (Ruskin Bond - Hari Singh and Anil)",
      "12: The Midnight Visitor (Robert Arthur - Ausable, Fowler and Max)",
      "13: A Question of Trust (Victor Canning - Horace Danby)",
      "14: Footprints without Feet (H.G. Wells - Griffin the Invisible Scientist)",
      "15: The Making of a Scientist (Robert W. Peterson - Richard Ebright)",
      "16: The Necklace (Guy de Maupassant - Mathilde Loisel and Madame Forestier)",
      "17: Bholi (K.A. Abbas - Sulekha's Transformation)",
      "18: The Book That Saved the Earth (Claire Boiko - Think-Tank and Martian Invasion)"
    ],
    "Hindi (Kshitij & Kritika - Course A)": [
      "1: सूरदास के पद (उधौ, तुम हौ अति बड़भागी...)",
      "2: राम-लक्ष्मण-परशुराम संवाद (तुलसीदास - रामचरितमानस)",
      "3: आत्मकथ्य (जयशंकर प्रसाद)",
      "4: उत्साह और अट नहीं रही है (सूर्यकांत त्रिपाठी 'निराला')",
      "5: यह दंतुरित मुसकान और फसल (नागार्जुन)",
      "6: संगतकार (मंगलेश डबराल)",
      "7: नेताजी का चश्मा (स्वयं प्रकाश - कैप्टन चश्मेवाला)",
      "8: बालगोबिन भगत (रामवृक्ष बेनीपुरी)",
      "9: लखनवी अंदाज़ (यशपाल - नवाब साहब)",
      "10: एक कहानी यह भी (मन्नू भंडारी)",
      "11: नौबतखाने में इबादत (यतींद्र मिश्र - उस्ताद बिस्मिल्ला खाँ)",
      "12: संस्कृति (भदंत आनंद कौसल्यायन - सभ्यता और संस्कृति)",
      "13: माता का आँचल (शिवपूजन सहाय - देहाती दुनिया)",
      "14: साना-साना हाथ जोड़ि (मधु कांकरिया - गंगटोक यात्रा)",
      "15: मैं क्यों लिखता हूँ? (स.ही. वात्स्यायन 'अज्ञेय' - हिरोशिमा)"
    ],
    "Hindi (Sparsh & Sanchayan - Course B)": [
      "1: साखी (कबीरदास)",
      "2: पद (मीराबाई)",
      "3: मनुष्यता (मैथिलीशरण गुप्त)",
      "4: पर्वत प्रदेश में पावस (सुमित्रानंदन पंत)",
      "5: तोप (वीरेन डंगवाल)",
      "6: कर चले हम फ़िदा (कैफ़ी आज़मी)",
      "7: आत्मत्राण (रवींद्रनाथ ठाकुर)",
      "8: बड़े भाई साहब (प्रेमचंद)",
      "9: डायरी का एक पन्ना (सीताराम सेकसरिया)",
      "10: ततांरा-वामीरो कथा (लीलाधर मंडलोई)",
      "11: तीसरी कसम के शिल्पकार शैलेंद्र (प्रह्लाद अग्रवाल)",
      "12: अब कहाँ दूसरे के दुख से दुखी होने वाले (निदा फ़ाज़ली)",
      "13: पतझर में टूटी पत्तियाँ: गिन्नी का सोना और झेन की देन (रवींद्र केलेकर)",
      "14: कारतूस (हबीब तनवीर)",
      "15: हरिहर काका (मिथिलेश्वर)",
      "16: सपनों के-से दिन (गुरदयाल सिंह)",
      "17: टोपी शुक्ला (राही मासूम रज़ा)"
    ],
    "Sanskrit (Shemushi / Manika)": [
      "1: शुचिपर्यावरणम् (पर्यावरण संरक्षणम्)",
      "2: बुद्धिर्बलवती सदा (शुकसप्ततिकथा)",
      "3: शिशुलालनम् (कुन्दमाला नाट्यांशः)",
      "4: जननी तुल्यवत्सला (महाभारत प्रसङ्गः)",
      "5: सुभाषितानि (नीतिश्लोकाः)",
      "6: सौहार्दं प्रकृतेः शोभा (प्राणिनां संवादः)",
      "7: विचित्रः साक्षी (न्यायाधीश बंकिमचन्द्रकथा)",
      "8: सूक्तयः (तिरुक्कुरल् नीतिवचनानि)",
      "9: अन्योक्तयः (अलङ्कारिक श्लोकाः)"
    ],
    "Information Technology (Code 402)": [
      "Unit 1: Communication Skills-II (Methods, Barriers & Principles of Communication)",
      "Unit 2: Self-Management Skills-II (Stress Management, Self-Awareness & Motivation)",
      "Unit 3: ICT Skills-II (Operating Systems, File Management & Computer Maintenance)",
      "Unit 4: Entrepreneurial Skills-II (Characteristics, Roles & Rewards of Entrepreneurs)",
      "Unit 5: Green Skills-II (Sustainable Development Goals & Green Economy)",
      "Unit 6: Digital Documentation Advanced (Styles, Inserting Images, Templates & Table of Contents)",
      "Unit 7: Electronic Spreadsheet Advanced (Consolidate Data, Subtotals, What-if Scenarios, Goal Seek, Macros & Linking)",
      "Unit 8: Database Management System (DBMS, RDBMS, Tables, Primary Key, SQL Queries, Forms and Reports)",
      "Unit 9: Web Applications and Security (Network Fundamentals, Instant Messaging, Online Transactions, Workplace Safety & Cyber Security)"
    ]
  },
  "Class 11": {
    "Mathematics": [
      "1: Sets (Empty Set, Subsets, Power Set, Universal Set, Venn Diagrams & Set Operations)",
      "2: Relations and Functions (Cartesian Product, Domain, Codomain, Range & Real Valued Functions)",
      "3: Trigonometric Functions (Radian Measure, Graphs of Trig Functions & Compound Angle Identities)",
      "4: Complex Numbers and Quadratic Equations (Algebra of Complex Numbers, Argand Plane & Modulus)",
      "5: Linear Inequalities (Algebraic Solutions of Linear Inequalities in One Variable)",
      "6: Permutations and Combinations (Fundamental Principle of Counting, nPr & nCr Formulas)",
      "7: Binomial Theorem (Binomial Expansion for Positive Integral Index & General Terms)",
      "8: Sequences and Series (Arithmetic Progression, Geometric Progression & Sum of n Terms)",
      "9: Straight Lines (Slope of Line, Various Forms of Equations of Lines & Distance of Point from Line)",
      "10: Conic Sections (Sections of Cone: Circle, Parabola, Ellipse, Hyperbola & Standard Equations)",
      "11: Introduction to Three Dimensional Geometry (Coordinate Axes and Planes, Distance Formula & Section Formula)",
      "12: Limits and Derivatives (Intuitive Idea of Limits, Standard Limits & Derivative Rules)",
      "13: Statistics (Measures of Dispersion: Mean Deviation, Variance & Standard Deviation)",
      "14: Probability (Axiomatic Approach, Events, Mutually Exclusive & Exhaustive Events)"
    ],
    "Physics": [
      "1: Units and Measurements (SI Units, Fundamental/Derived Units, Significant Figures & Dimensional Analysis)",
      "2: Motion in a Straight Line (Frame of Reference, Position-Time Graphs, Instantaneous Velocity & Equations of Motion)",
      "3: Motion in a Plane (Scalars and Vectors, Vector Addition, Resolution, Projectile Motion & Uniform Circular Motion)",
      "4: Laws of Motion (Newton's Laws, Inertia, Momentum, Impulse, Law of Conservation of Linear Momentum & Friction)",
      "5: Work, Energy and Power (Kinetic/Potential Energy, Work-Energy Theorem, Conservative Forces & Elastic Collisions)",
      "6: System of Particles and Rotational Motion (Centre of Mass, Torque, Angular Momentum, Moment of Inertia & Rolling Motion)",
      "7: Gravitation (Kepler's Laws, Universal Law of Gravitation, Gravitational Potential Energy & Escape Velocity)",
      "8: Mechanical Properties of Solids (Stress-Strain Curve, Hooke's Law, Young's Modulus & Bulk Modulus)",
      "9: Mechanical Properties of Fluids (Pascal's Law, Bernoulli's Principle, Viscosity, Surface Tension & Capillarity)",
      "10: Thermal Properties of Matter (Heat Transfer: Conduction, Convection, Radiation, Newton's Law of Cooling & Calorimetry)",
      "11: Thermodynamics (Thermal Equilibrium, Zeroth Law, First Law, Heat Engines, Refrigerators & Second Law)",
      "12: Kinetic Theory of Gases (Equation of State of Perfect Gas, Pressure of Gas, Degrees of Freedom & Law of Equipartition of Energy)",
      "13: Oscillations (Simple Harmonic Motion (SHM), Periodic Functions, Simple Pendulum & Forced Oscillations)",
      "14: Waves (Wave Motion, Longitudinal and Transverse Waves, Speed of Wave, Principle of Superposition, Standing Waves & Beats)"
    ],
    "Chemistry": [
      "1: Some Basic Concepts of Chemistry (Mole Concept, Molar Mass, Stoichiometry & Empirical/Molecular Formulas)",
      "2: Structure of Atom (Bohr's Model, Quantum Mechanical Model, De Broglie, Heisenberg Uncertainty & Electronic Configuration)",
      "3: Classification of Elements and Periodicity in Properties (Modern Periodic Table, Periodic Trends: IE, EA, EN, Atomic Radii)",
      "4: Chemical Bonding and Molecular Structure (Lewis Structures, VSEPR Theory, Valence Bond Theory, Hybridisation & Molecular Orbital Theory)",
      "5: Chemical Thermodynamics (First Law, Enthalpy, Hess's Law, Entropy, Gibbs Free Energy & Spontaneity Criteria)",
      "6: Equilibrium (Law of Chemical Equilibrium, Le Chatelier's Principle, Ionic Equilibrium, pH, Buffer Solutions & Solubility Product)",
      "7: Redox Reactions (Oxidation Number Rules, Balancing Redox Reactions: Ion-Electron and Oxidation Number Methods)",
      "8: Organic Chemistry – Some Basic Principles and Techniques (IUPAC Nomenclature, Isomerism, Reaction Mechanisms, Inductive/Mesomeric Effects)",
      "9: Hydrocarbons (Alkanes, Alkenes, Alkynes: Preparation, Chemical Reactions, Markownikoff's Rule, Aromatic Hydrocarbons & Electrophilic Substitution)"
    ],
    "Biology": [
      "1: The Living World (Diversity in Living Organisms, Binomial Nomenclature, Taxonomic Hierarchy)",
      "2: Biological Classification (Five Kingdom Classification: Monera, Protista, Fungi, Plantae, Animalia, Viruses & Lichens)",
      "3: Plant Kingdom (Algae, Bryophytes, Pteridophytes, Gymnosperms, Angiosperms & Alternation of Generations)",
      "4: Animal Kingdom (Non-chordates to Chordates: Porifera to Mammalia Key Characteristics)",
      "5: Morphology of Flowering Plants (Root, Stem, Leaf, Inflorescence, Flower, Fruit, Seed & Floral Formulas)",
      "6: Anatomy of Flowering Plants (Meristematic and Permanent Tissues, Internal Anatomy of Dicot/Monocot Root, Stem & Leaf)",
      "7: Structural Organisation in Animals (Animal Tissues: Epithelial, Connective, Muscular, Nervous & Frog Anatomy)",
      "8: Cell: The Unit of Life (Prokaryotic vs Eukaryotic Cells, Endomembrane System, Mitochondria, Plastids & Nucleus)",
      "9: Biomolecules (Carbohydrates, Proteins, Lipids, Nucleic Acids, Enzymes: Action, Kinetics & Inhibition)",
      "10: Cell Cycle and Cell Division (Mitosis Phases, Meiosis I and II Stages & Biological Significance)",
      "11: Photosynthesis in Higher Plants (Chloroplast, Pigments, Light Reactions, Calvin Cycle C3, Hatch-Slack C4 Pathway & Photorespiration)",
      "12: Respiration in Plants (Glycolysis, Fermentation, Krebs Cycle, Electron Transport System (ETS) & Respiratory Quotient)",
      "13: Plant Growth and Development (Plant Hormones: Auxin, Gibberellin, Cytokinin, Ethylene, Abscisic Acid, Photoperiodism)",
      "14: Breathing and Exchange of Gases (Respiratory Organs, Mechanism of Breathing, Respiratory Volumes & Gas Transport)",
      "15: Body Fluids and Circulation (Blood Composition, ABO Blood Groups, Human Heart, Cardiac Cycle, ECG & Double Circulation)",
      "16: Excretory Products and their Elimination (Nephron, Urine Formation, Counter-Current Mechanism & Renin-Angiotensin System)",
      "17: Locomotion and Movement (Types of Movement, Skeletal System, Sliding Filament Theory of Muscle Contraction & Joints)",
      "18: Neural Control and Coordination (Human Neural System, Generation and Conduction of Nerve Impulse & Synaptic Transmission)",
      "19: Chemical Coordination and Integration (Endocrine Glands, Hormones, Mechanism of Hormone Action & Disorders)"
    ],
    "English (Hornbill & Snapshots)": [
      "1: The Portrait of a Lady (Khushwant Singh) & A Photograph (Shirley Toulson)",
      "2: We're Not Afraid to Die... If We Can All Be Together",
      "3: Discovering Tut: The Saga Continues (A.R. Williams) & The Laburnum Top (Ted Hughes)",
      "4: The Voice of the Rain (Walt Whitman) & Childhood (Markus Natten)",
      "5: The Adventure (Jayant Narlikar) & Silk Road (Nick Middleton)",
      "6: Father to Son (Elizabeth Jennings)",
      "7: The Summer of the Beautiful White Horse (William Saroyan)",
      "8: The Address (Marga Minco)",
      "9: Mother's Day (J.B. Priestley)",
      "10: Birth (A.J. Cronin)",
      "11: The Tale of Melon City (Vikram Seth)"
    ],
    "Accountancy": [
      "1: Introduction to Accounting (Objectives, Qualitative Characteristics & Accounting Terms)",
      "2: Theory Base of Accounting, Concepts, Principles and Accounting Standards",
      "3: Recording of Transactions – I (Accounting Equation, Rules of Debit and Credit, Journal & Cash Book)",
      "4: Recording of Transactions – II (Special Purpose Books, Purchases, Sales Book, Petty Cash Book)",
      "5: Bank Reconciliation Statement (Causes of Difference & Preparation)",
      "6: Trial Balance and Rectification of Errors (Suspense Account & Classification of Errors)",
      "7: Depreciation, Provisions and Reserves (Straight Line Method & Written Down Value Method)",
      "8: Financial Statements – I (Trading Account, Profit and Loss Account & Balance Sheet)",
      "9: Financial Statements – II (Adjustments in Financial Statements: Outstanding, Prepaid, Depreciation)"
    ],
    "Economics": [
      "1: Statistics: Introduction & Collection of Data",
      "2: Statistics: Organisation and Presentation of Data (Tables, Bar Graphs, Pie Charts)",
      "3: Statistics: Measures of Central Tendency (Arithmetic Mean, Median and Mode)",
      "4: Statistics: Correlation (Karl Pearson's Coefficient & Scatter Diagrams)",
      "5: Statistics: Index Numbers (Consumer Price Index & Wholesale Price Index)",
      "6: Microeconomics: Introduction and Production Possibility Frontier (PPF)",
      "7: Microeconomics: Consumer's Equilibrium and Theory of Demand",
      "8: Microeconomics: Producer Behaviour and Supply (Production Function & Cost/Revenue Curves)",
      "9: Microeconomics: Forms of Market and Price Determination under Perfect Competition"
    ],
    "Political Science": [
      "1: Constitution: Why and How? & Philosophy of the Constitution",
      "2: Rights in the Indian Constitution (Fundamental Rights, Directive Principles & Duties)",
      "3: Election and Representation (First-Past-the-Post vs Proportional Representation)",
      "4: Executive (Presidential vs Parliamentary Executive & Bureaucracy)",
      "5: Legislature (Need for Bicameralism & Parliamentary Committees)",
      "6: Judiciary (Independence of Judiciary, Judicial Activism & PIL)",
      "7: Federalism (Division of Powers, Autonomy Demands & Inter-state Conflicts)",
      "8: Local Governments (73rd and 74th Constitutional Amendments)",
      "9: Political Theory: An Introduction, Freedom, Equality & Social Justice",
      "10: Rights, Citizenship, Nationalism & Secularism"
    ]
  },
  "Class 12": {
    "Mathematics": [
      "1: Relations and Functions (Types of Relations: Equivalence, Functions: Invertible & Bijective)",
      "2: Inverse Trigonometric Functions (Definition, Range, Domain, Principal Value Branches)",
      "3: Matrices (Operations on Matrices, Transpose, Symmetric/Skew-Symmetric & Invertible Matrices)",
      "4: Determinants (Minors, Cofactors, Adjoint and Inverse of Matrix & Solving System of Linear Equations)",
      "5: Continuity and Differentiability (Chain Rule, Derivatives of Implicit/Logarithmic Functions & Second Order Derivatives)",
      "6: Applications of Derivatives (Rate of Change, Increasing/Decreasing Functions, Maxima and Minima)",
      "7: Integrals (Integration by Substitution, Partial Fractions, By Parts & Definite Integrals Properties)",
      "8: Applications of Integrals (Area under Simple Curves: Parabolas, Ellipses, Circles)",
      "9: Differential Equations (Order and Degree, General/Particular Solutions, Variable Separable & Linear Differential Equations)",
      "10: Vector Algebra (Vectors and Scalars, Dot Product, Cross Product & Direction Cosines)",
      "11: Three Dimensional Geometry (Direction Ratios, Equation of Line in Space, Shortest Distance between Skew Lines)",
      "12: Linear Programming (Mathematical Formulation, Graphical Method & Feasible Region)",
      "13: Probability (Conditional Probability, Multiplication Theorem, Independent Events, Bayes' Theorem)"
    ],
    "Physics": [
      "1: Electric Charges and Fields (Coulomb's Law, Electric Field Lines, Electric Dipole & Gauss's Law Applications)",
      "2: Electrostatic Potential and Capacitance (Equipotential Surfaces, Electric Potential Energy, Capacitors & Dielectrics)",
      "3: Current Electricity (Ohm's Law, Drift Velocity, Resistivity, Kirchhoff's Laws & Wheatstone Bridge)",
      "4: Moving Charges and Magnetism (Biot-Savart Law, Ampere's Circuital Law, Lorentz Force & Moving Coil Galvanometer)",
      "5: Magnetism and Matter (Bar Magnet, Magnetic Dipole Moment, Diamagnetic, Paramagnetic & Ferromagnetic Substances)",
      "6: Electromagnetic Induction (Faraday's Laws, Lenz's Law, Eddy Currents, Self and Mutual Inductance & AC Generator)",
      "7: Alternating Current (Peak and RMS Value, LCR Series Circuit, Resonance, Power in AC Circuits & Transformer)",
      "8: Electromagnetic Waves (Displacement Current, Electromagnetic Spectrum: Radio, Micro, Infrared, Visible, UV, X-rays, Gamma)",
      "9: Ray Optics and Optical Instruments (Refraction, Total Internal Reflection, Lenses, Lens Maker's Formula, Microscopes & Astronomical Telescopes)",
      "10: Wave Optics (Huygens Principle, Wavefronts, Interference of Light, Young's Double Slit Experiment & Diffraction at Single Slit)",
      "11: Dual Nature of Radiation and Matter (Photoelectric Effect, Hertz/Lenard Observations, Einstein's Photoelectric Equation & De Broglie Wavelength)",
      "12: Atoms (Alpha-Particle Scattering Experiment, Rutherford Model & Bohr Model of Hydrogen Atom)",
      "13: Nuclei (Composition and Size of Nucleus, Mass Defect, Binding Energy per Nucleon & Nuclear Fission/Fusion)",
      "14: Semiconductor Electronics (Energy Bands in Conductors/Semiconductors/Insulators, p-n Junction Diode, V-I Characteristics, Half/Full Wave Rectifiers)"
    ],
    "Chemistry": [
      "1: Solutions (Types of Solutions, Raoult's Law, Ideal/Non-ideal Solutions, Colligative Properties & Van 't Hoff Factor)",
      "2: Electrochemistry (Galvanic Cells, Nernst Equation, Kohlrausch's Law, Electrolysis, Batteries & Fuel Cells)",
      "3: Chemical Kinetics (Rate of Reaction, Order and Molecularity, Integrated Rate Equations: Zero/First Order, Arrhenius Equation & Activation Energy)",
      "4: The d- and f-Block Elements (Transition Elements Trends: Atomic Radii, Oxidation States, Magnetic Properties, Lanthanoid Contraction & Potassium Permanganate/Dichromate)",
      "5: Coordination Compounds (Werner's Theory, IUPAC Nomenclature, Isomerism, Valence Bond Theory & Crystal Field Theory (CFT))",
      "6: Haloalkanes and Haloarenes (Nomenclature, SN1 and SN2 Reaction Mechanisms, Optical Activity & Polyhalogen Compounds)",
      "7: Alcohols, Phenols and Ethers (Preparation, Chemical Reactions, Acidity, Hydroboration-Oxidation, Reimer-Tiemann Reaction & Williamson Ether Synthesis)",
      "8: Aldehydes, Ketones and Carboxylic Acids (Nucleophilic Addition Reactions, Aldol Condensation, Cannizzaro Reaction & Carboxylic Acid Acidity)",
      "9: Amines (Classification, Preparation, Gabriel Phthalimide Synthesis, Basicity, Carbylamine Test & Diazonium Salts Reactions)",
      "10: Biomolecules (Carbohydrates: Glucose, Fructose, Disaccharides, Proteins: Amino Acids, Peptide Bond, Primary/Secondary Structure, Nucleic Acids: DNA, RNA & Vitamins)"
    ],
    "Biology": [
      "1: Sexual Reproduction in Flowering Plants (Flower Structure, Microsporogenesis, Megasporogenesis, Pollination, Double Fertilisation, Endosperm & Embryo Development)",
      "2: Human Reproduction (Male and Female Reproductive Systems, Gametogenesis: Spermatogenesis & Oogenesis, Menstrual Cycle, Fertilisation, Implantation, Pregnancy & Parturition)",
      "3: Reproductive Health (Population Explosion, Contraceptive Methods, MTP, STIs, Infertility & Assisted Reproductive Technologies: IVF, ZIFT, GIFT)",
      "4: Principles of Inheritance and Variation (Mendelian Genetics, Incomplete Dominance, Codominance, Multiple Alleles, Chromosomal Theory, Sex Determination, Linkage & Genetic Disorders)",
      "5: Molecular Basis of Inheritance (DNA Structure, Packaging, Griffith/Avery Experiments, Hershey-Chase, Replication, Transcription, Genetic Code, Translation, Lac Operon & Human Genome Project)",
      "6: Evolution (Origin of Life, Evidences of Evolution, Darwin's Theory, Hardy-Weinberg Principle, Adaptive Radiation & Human Evolution)",
      "7: Human Health and Disease (Pathogens: Malaria, Typhoid, Pneumonia, Ringworm, Innate/Acquired Immunity, Vaccines, HIV/AIDS, Cancer & Drug Abuse)",
      "8: Microbes in Human Welfare (Microbes in Household Food Processing, Industrial Products, Antibiotics, Sewage Treatment, Biogas Production & Biofertilisers)",
      "9: Biotechnology: Principles and Processes (Restriction Enzymes, Recombinant DNA Technology, Cloning Vectors: pBR322, PCR & Bioreactors)",
      "10: Biotechnology and its Applications (Bt Cotton, RNA Interference, Genetically Engineered Insulin, Gene Therapy, Transgenic Animals & Ethical Issues)",
      "11: Organisms and Populations (Abiotic Factors, Adaptations, Population Attributes, Growth Models & Population Interactions: Mutualism, Competition, Parasitism)",
      "12: Ecosystem (Ecosystem Structure, Productivity, Decomposition, Energy Flow: Ecological Pyramids & Nutrient Cycles)",
      "13: Biodiversity and Conservation (Patterns of Biodiversity, Species-Area Relationship, Loss of Biodiversity, In-situ and Ex-situ Conservation & Hotspots)"
    ],
    "English (Flamingo & Vistas)": [
      "1: The Last Lesson (Alphonse Daudet) & My Mother at Sixty-Six (Kamala Das)",
      "2: Lost Spring (Anees Jung) & Keeping Quiet (Pablo Neruda)",
      "3: Deep Water (William Douglas) & A Thing of Beauty (John Keats)",
      "4: The Rattrap (Selma Lagerlöf) & A Roadside Stand (Robert Frost)",
      "5: Indigo (Louis Fischer) & Aunt Jennifer's Tigers (Adrienne Rich)",
      "6: Poets and Pancakes (Asokamitran)",
      "7: The Interview (Christopher Silvester)",
      "8: Going Places (A.R. Barton)",
      "9: The Third Level (Jack Finney)",
      "10: The Tiger King (Kalki)",
      "11: Journey to the End of the Earth (Tishani Doshi)",
      "12: The Enemy (Pearl S. Buck)",
      "13: On the Face of It (Susan Hill)",
      "14: Memories of Childhood (Zitkala-Sa & Bama)"
    ],
    "Accountancy": [
      "1: Accounting for Partnership: Basic Concepts (Partnership Deed, Profit & Loss Appropriation, Capital Accounts)",
      "2: Reconstitution of Partnership: Admission of a Partner (Goodwill Valuation, Revaluation Account & Capital Adjustments)",
      "3: Reconstitution of Partnership: Retirement and Death of a Partner",
      "4: Dissolution of a Partnership Firm (Realisation Account, Settlement of Accounts)",
      "5: Accounting for Share Capital (Issue of Shares at Par/Premium, Forfeiture & Reissue of Shares)",
      "6: Issue and Redemption of Debentures (Types of Debentures, Interest & Discount Writing-off)",
      "7: Financial Statements of a Company (Balance Sheet & Statement of Profit and Loss under Schedule III)",
      "8: Financial Statement Analysis (Comparative and Common-size Statements)",
      "9: Accounting Ratios (Liquidity, Solvency, Activity & Profitability Ratios)",
      "10: Cash Flow Statement (Cash Flow from Operating, Investing & Financing Activities under AS-3)"
    ],
    "Economics": [
      "1: Macroeconomics: National Income Accounting (Circular Flow, GDP, GNP, NNP & Measurement Methods)",
      "2: Macroeconomics: Money and Banking (Money Creation by Commercial Banks & Functions of Central Bank/RBI)",
      "3: Macroeconomics: Determination of Income and Employment (Aggregate Demand/Supply, Propensity to Consume, Investment Multiplier)",
      "4: Macroeconomics: Government Budget and the Economy (Revenue/Capital Receipts and Expenditures, Fiscal Deficit)",
      "5: Macroeconomics: Open Economy Macroeconomics (Balance of Payments, Foreign Exchange Rate: Fixed vs Flexible)",
      "6: Indian Economic Development: Development Policies and Experience (1947–1990) & Five Year Plans",
      "7: Indian Economic Development: Economic Reforms Since 1991 (LPG: Liberalisation, Privatisation, Globalisation)",
      "8: Indian Economic Development: Current Challenges (Human Capital Formation, Rural Development, Employment & Sustainable Development)",
      "9: Indian Economic Development: Comparative Development Experiences of India, Pakistan and China"
    ],
    "Political Science": [
      "1: Contemporary World Politics: The End of Bipolarity (Soviet Collapse, Shock Therapy & Post-Communist Regimes)",
      "2: Contemporary World Politics: Contemporary Centres of Power (European Union, ASEAN, SAARC, China & India)",
      "3: Contemporary World Politics: Contemporary South Asia (Conflicts and Peace in South Asia & Democracy in Pakistan/Bangladesh)",
      "4: Contemporary World Politics: International Organisations (UN Restructuring, Security Council Reform & Global Agencies)",
      "5: Contemporary World Politics: Security in the Contemporary World (Traditional vs Non-traditional Notions of Security)",
      "6: Contemporary World Politics: Environment and Natural Resources (Global Commons, Kyoto Protocol & Climate Justice)",
      "7: Contemporary World Politics: Globalisation (Manifestations: Cultural, Political, Economic & Anti-globalisation Movements)",
      "8: Politics in India Since Independence: Challenges of Nation Building (Partition, Integration of Princely States & States Reorganisation)",
      "9: Politics in India Since Independence: Era of One-Party Dominance & Politics of Planned Development",
      "10: Politics in India Since Independence: India's External Relations (Non-Alignment, 1962 China War, Indo-Pak Conflicts)",
      "11: Politics in India Since Independence: Challenges to and Restoration of the Congress System & The Crisis of Democratic Order (Emergency 1975)",
      "12: Politics in India Since Independence: Regional Aspirations & Recent Developments in Indian Politics (Coalition Era & Mandal Commission)"
    ]
  }
};

// Both 2025-26 and 2026-27 share the exact same unified official NCERT curriculum
const rawData2026_27 = rawNCERTData;
const rawData2025_26 = rawNCERTData;

// Flatten helper
const flattenRawData = (data: Record<string, Record<string, string[]>>, year: SyllabusYear): NCERTEntry[] => {
  const flattened: NCERTEntry[] = [];
  for (const className in data) {
    const subjects = data[className];
    for (const subjectName in subjects) {
      const chapters = subjects[subjectName];
      chapters.forEach((chapter: string) => {
        flattened.push({
          className,
          subjectName,
          chapterName: chapter,
          syllabusYear: year
        });
      });
    }
  }
  return flattened;
};

export const NCERT_DATA_2026_27: NCERTEntry[] = flattenRawData(rawData2026_27, '2026-27');
export const NCERT_DATA_2025_26: NCERTEntry[] = flattenRawData(rawData2025_26, '2025-26');

// Default is the latest 2026-27 dataset
export const NCERT_DATA: NCERTEntry[] = NCERT_DATA_2026_27;

export const getSyllabusData = (year: SyllabusYear = '2026-27'): NCERTEntry[] => {
  return year === '2025-26' ? NCERT_DATA_2025_26 : NCERT_DATA_2026_27;
};

const sortClasses = (entries: NCERTEntry[]): string[] => {
  return Array.from(new Set(entries.map(d => d.className))).sort((a, b) => {
    const numA = parseInt(a.split(' ')[1]);
    const numB = parseInt(b.split(' ')[1]);
    return numA - numB;
  });
};

export const CLASSES_2026_27 = sortClasses(NCERT_DATA_2026_27);
export const CLASSES_2025_26 = sortClasses(NCERT_DATA_2025_26);
export const CLASSES = CLASSES_2026_27;

export const STRENGTHS = ['Easy', 'Medium', 'Hard'];
