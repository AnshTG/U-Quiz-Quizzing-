
import { NCERTEntry } from './types';

const rawData: any = {
  "Class 1": {
    "Maths": ["1: Shapes and Space", "2: Numbers form One to Nine", "3: Addition", "4: Subtraction", "5: Number form Ten to Twenty", "6: Time", "7: Measurement", "8: Numbers form Twenty one to Fifty", "9: Data Handing", "10: Patterns", "11: Numbers", "12: Money", "13: How Many"],
    "English": ["1: A Happy Child", "2: After a Bath", "3: One Little Kitten", "4: Once I Saw a Little Bird", "5: Merry-Go-Round", "6: If I Were an Apple", "7: A Kite", "8: A Little Turtle", "9: Clouds", "10: Flying Man"],
    "Raindrops": ["1: Clap, Clap, Clap", "2: One, Two", "3: The Little Bird", "4: Bubbles", "5: Chhotu", "6: Animals and Birds", "7: Fruits and Vegetables", "8: Who Am I?", "9: Hide and Seek"],
    "Hindi": ["1: झूला", "2: आम की कहानी", "3: आम की टोकरी", "4: पत्ते ही पत्ते", "5: पकौड़ी", "6: छुक-छुक गाड़ी", "7: रसोईघर", "8: चूहो! म्याऊँ सो रही है", "9: बंदर और गिलहरी", "10: पगड़ी", "11: पतंग", "12: गेंद-बल्ला", "13: बंदर गया खेत में भाग", "14: एक बुढ़िया", "15: मैं भी", "16: लालू और पीलू", "17: चकई के चकदुम", "18: छोटी का कमाल", "19: चार चने", "20: भगदड़", "21: हलीम चला चाँद पर", "22: हाथी चल्लम चल्लम", "23: सात पूँछ का चूहा"]
  },
  "Class 2": {
    "Maths": ["1: What is Long, What is Round?", "2: Counting in Groups", "3: How Much Can You Carry?", "4: Counting in Tens", "5: Patterns", "6: Footprints", "7: Jugs and Mugs", "8: Tens and Ones", "9: My Funday", "10: Add our Points", "11: Lines and Lines", "12: Give and Take", "13: The Longest Step", "14: Birds Come, Birds Go", "15: How Many Ponytails?"],
    "English": ["1: First Day at School", "2: I am Lucky!", "3: A Smile", "4: Rain", "5: Zoo Manners", "6: Mr Nobody", "7: On My Blackboard I can Draw", "8: I am the Music Man", "9: Granny Granny Please Comb my Hair", "10: Strange Talk"],
    "Raindrops": ["1: Action Song", "2: Our Day", "3: My Family", "4: Whats Going On?", "5: Mohan, The Potter", "6: Rain in Summer", "7: My Village", "8: The Work People Do", "9: Work", "10: Our National Symbols", "11: The Festivals of India", "12: The Monkey and The Elephant", "13: Going to the Fair", "14: Colours", "15: Sikkim"],
    "Hindi": ["1: ऊँट चला", "2: भालू ने खेली फुटबॉल", "3: म्याऊँ, म्याऊँ !!", "4: अधिक बलवान कौन?", "5: दोस्त की मदद", "6: बहुत हुआ", "7: मेरी किताब", "8: तितली और कली", "9: बुलबुल", "10: मीठी सारंगी", "11: टेसू राजा बीच बाजार", "12: बस के नीचे बाघ", "13: सूरज जल्दी आना जी", "14: नटखट चूहा", "15: एक्की-दोक्की"]
  },
  "Class 3": {
    "Maths": ["1: Where to Look From", "2: Fun with Numbers", "3: Give and Take", "4: Long and Short", "5: Shapes and Designs", "6: Fun with Give and Take", "7: Time Goes On", "8: Who is Heavier?", "9: How Many Times?", "10: Play with Patterns", "11: Jugs and Mugs", "12: Can we Share?", "13: Smart Charts!", "14: Rupees and Paise"],
    "English": ["1: Good Morning", "2: Bird Talk", "3: Little by Little", "4: Sea Song", "5: The Balloon Man", "6: Trains", "7: Puppy and I", "8: What’s in the Mailbox?", "9: Don’t Tell", "10: How Creatures Move"],
    "EVS": ["1: Poonam’s Day out", "2: The Plant Fairy", "3: Water O’ Water!", "4: Our First School", "5: Chhotu’s House", "6: Foods We Eat", "7: Saying without Speaking", "8: Flying High", "9: It’s Raining", "10: What is Cooking", "11: From Here to There", "12: Work We Do", "13: Sharing Our Feelings", "14: The Story of Food", "15: Making Pots", "16: Games We Play", "17: Here comes a Letter", "18: A House Like This", "19: Our Friends – Animals", "20: Drop by Drop", "21: Families can be Different", "22: Left-Right", "23: A Beautiful Cloth", "24: Web of Life"],
    "Hindi": ["1: कक्कू", "2: शेखीबाज़ मक्खी", "3: चाँद वाली अम्मा", "4: मन करता है", "5: बहादुर बित्तो", "6: हमसे सब कहते", "7: टिपतिपवा", "8: बंदर बाँट", "9: अक्ल बड़ी या भैंस", "10: क्योंजीमल और कैसे कैसलिया", "11: मीरा बहन और बाघ", "12: जब मुझे साँप ने काटा", "13: मिर्च का मजा", "14: सबसे अच्छा पेड़", "15: पेड़ पत्ते ही पत्ते"]
  },
  "Class 4": {
    "Maths": ["1: Building with Bricks", "2: Long and Short", "3: A Trip to Bhopal", "4: Tick-Tick-Tick", "5: The Way The World Looks", "6: The Junk Seller", "7: Jugs and Mugs", "8: Carts and Wheels", "9: Halves and Quarters", "10: Play with Patterns", "11: Tables and Shares", "12: How Heavy? How Light?", "13: Fields and Fences", "14: Smart Charts"],
    "English": ["1: Wake Up!", "2: Noses", "3: Run!", "4: Why?", "5: Don’t be Afraid of the Dark", "6: Hiawatha", "7: A Watering Rhyme", "8: The Giving Tree", "9: Books", "10: Going to Buy a Book"],
    "EVS": ["1: Going to School", "2: Ear to Ear", "3: A Day with Nandu", "4: The Story of Amrita", "5: Anita and the Honeybees", "6: Omana’s Journey", "7: From the Window", "8: Reaching Grandmother’s House", "9: Changing Families", "10: Hu Tu Tu, Hu Tu Tu", "11: The Valley of Flowers", "12: Changing Times", "13: A River’s Tale", "14: Basva’s Farm", "15: From Market to Home", "16: A Busy Month", "17: Nandita in Mumbai", "18: Too Much Water, Too Little Water", "19: Abdul in the Garden", "20: Eating Together", "21: Food and Fun", "22: The World in My Home", "23: Pochampalli", "24: Home and Abroad", "25: Spicy Riddles", "26: Defence Officer: Wahida", "27: Chuskit Goes to School"],
    "Hindi": ["1: मन के भोले-भाले बादल", "2: जैसा सवाल वैसा जवाब", "3: किरमिच की गेंद", "4: पापा जब बच्चे थे", "5: दोस्त की पोशाक", "6: नाव बनाओ नाव बनाओ", "7: दान का हिसाब", "8: कौन?", "9: स्वतंत्रता की ओर", "10: थप्प रोटी थप्प दाल", "11: पढ़क्कू की सूझ", "12: सुनिता की पहिया कुर्सी", "13: हुदहुद", "14: मुफ़्त ही मुफ़्त"]
  },
  "Class 5": {
    "Maths": ["1: The Fish Tale", "2: Shapes and Angles", "3: How Many Squares?", "4: Parts and Wholes", "5: Does it Look the Same?", "6: Be My Multiple, I’ll Be Your Factor", "7: Can You See the Pattern?", "8: Mapping Your Way", "9: Boxes and Sketches", "10: Tenths and Hundredths", "11: Area and its Boundary", "12: Smart Charts", "13: Ways to Multiply and Divide", "14: How Big? How Heavy?"],
    "English": ["1: Ice-cream Man", "2: Wonderful Waste!", "3: Teamwork", "4: Flying Together", "5: My Shadow", "6: Robinson Crusoe Discovers a Footprint", "7: Crying", "8: My Elder Brother", "9: The Lazy Frog", "10: Rip Van Winkle"],
    "EVS": ["1: Super Senses", "2: A Snake Charmer’s Story", "3: From Tasting to Digesting", "4: Mangoes Round the Year", "5: Seeds and Seeds", "6: Every Drop Counts", "7: Experiments with Water", "8: A Treat for Mosquitoes", "9: Up You Go!", "10: Walls Tell Stories", "11: Sunita in Space", "12: What if it Finishes…?", "13: A Shelter so High!", "14: When the Earth Shook!", "15: Blow Hot, Blow Cold", "16: Who Will Do This Work?", "17: Across the Wall", "18: No Place for Us?", "19: A Seed Tells a Farmer’s Story", "20: Whose Forests?", "21: Like Father, Like Daughter", "22: On the Move Again"],
    "Hindi": ["1: राख की रस्सी", "2: फसलों के त्योहार", "3: खिलौनेवाला", "4: नन्हा फनकार", "5: जहाँ चाह वहाँ राह", "6: चिट्ठी का सफ़र", "7: डाकिए की कहानी", "8: वे दिन भी क्या दिन थे", "9: एक माँ की बेबसी", "10: एक दिन की बादशाहत", "11: चावल की रोटियाँ", "12: गुरु और चेला", "13: स्वामी की दादी", "14: बाघ आया उस रात"]
  },
  "Class 6": {
    "Maths": ["1: Knowing Our Numbers", "2: Whole Numbers", "3: Playing with Numbers", "4: Basic Geometrical Ideas", "5: Understanding Elementary Shapes", "6: Integers", "7: Fractions", "8: Decimals", "9: Data Handling", "10: Mensuration", "11: Algebra", "12: Ratio and Proportion", "13: Symmetry", "14: Practical Geometry"],
    "English": ["1: Who Did Patrick’s Homework?", "2: How the Dog Found Himself a New Master!", "3: Taros Reward", "4: An Indian-American Woman in Space", "5: A Different Kind of School", "6: Who I Am", "7: Fair Play", "8: A Game of Chance", "9: Desert Animals", "10: The Banyan Tree"],
    "Science": ["1: Food: Where Does It Come From?", "2: Components of Food", "3: Fibre to Fabric", "4: Sorting Materials into Groups", "5: Separation of Substances", "6: Changes Around Us", "7: Getting to Know Plants", "8: Body Movements", "9: The Living Organisms and Their Surroundings", "10: Motion and Measurement of Distances", "11: Light, Shadows and Reflections", "12: Electricity and Circuits", "13: Fun with Magnets", "14: Water", "15: Air Around Us", "16: Garbage In, Garbage Out"],
    "Social Science (History)": ["1: What, Where, How and When?", "2: On the Trail of the Earliest People", "3: From Gathering to Growing Food", "4: In the Earliest Cities", "5: What Books and Burials Tell Us", "6: Kingdoms, Kings and an Early Republic", "7: New Questions and Ideas", "8: Ashoka, the Emperor Who Gave Up War", "9: Vital Villages, Thriving Towns", "10: Traders, Kings and Pilgrims"],
    "Social Science (Geography)": ["1: The Earth in the Solar System", "2: Globe: Latitudes and Longitudes", "3: Motions of the Earth", "4: Maps"],
    "Social Science (Civics)": ["1: Understanding Diversity", "2: Diversity and Discrimination", "3: What is Government?", "4: Key Elements of a Democratic Government", "5: Panchayati Raj"],
    "Hindi": ["1: वह चिड़िया जो", "2: बचपन", "3: नादान दोस्त", "4: चाँद से थोड़ी-सी गप्पें", "5: अक्षरों का महत्व", "6: पार नज़र के", "7: साथी हाथ बढ़ाना", "8: ऐसे-ऐसे", "9: टिकट-अलबम", "10: झाँसी की रानी", "11: जो देखकर भी नहीं देखते", "12: संसार पुस्तक है"]
  },
  "Class 7": {
    "Maths": ["1: Integers", "2: Fractions and Decimals", "3: Data Handling", "4: Simple Equations", "5: Lines and Angles", "6: The Triangle and its Properties", "7: Congruence of Triangles", "8: Comparing Quantities", "9: Rational Numbers", "10: Practical Geometry", "11: Perimeter and Area", "12: Algebraic Expressions", "13: Exponents and Powers", "14: Symmetry", "15: Visualising Solid Shapes"],
    "Science": ["1: Nutrition in Plants", "2: Nutrition in Animals", "3: Fibre to Fabric", "4: Heat", "5: Acids, Bases and Salts", "6: Physical and Chemical Changes", "7: Weather, Climate and Adaptations of Animals", "8: Winds, Storms and Cyclones", "9: Soil", "10: Respiration in Organisms", "11: Transportation in Animals and Plants", "12: Reproduction in Plants", "13: Motion and Time", "14: Electric Current and its Effects", "15: Light", "16: Water: A Precious Resource", "17: Forests: Our Lifeline", "18: Wastewater Story"],
    "Social Science (History)": ["1: Tracing Changes Through a Thousand Years", "2: New Kings and Kingdoms", "3: The Delhi Sultans", "4: The Mughal Empire", "5: Rulers and Buildings", "6: Towns, Traders and Craftspersons", "7: Tribes, Nomads and Settled Communities", "8: Devotional Paths to the Divine", "9: The Making of Regional Cultures", "10: Eighteenth-Century Political Formations"],
    "Social Science (Geography)": ["1: Environment", "2: Inside Our Earth", "3: Our Changing Earth", "4: Air", "5: Water", "6: Natural Vegetation and Wildlife", "7: Human Environment – Settlement, Transport and Communication", "8: Human Environment Interactions – The Tropical and the Subtropical Region", "9: Life in the Temperate Grasslands", "10: Life in the Deserts"],
    "Social Science (Civics)": ["1: On Equality", "2: Role of the Government in Health", "3: How the State Government Works", "4: Growing up as Boys and Girls", "5: Women Change the World", "6: Understanding Media", "7: Understanding Advertising", "8: Markets Around Us", "9: A Shirt in the Market", "10: Struggles for Equality"],
    "Hindi": ["1: हम पंछी उन्मुक्त गगन के", "2: दादी माँ", "3: हिमालय की बेटियाँ", "4: कठपुतली", "5: मिठाईवाला", "6: रक्त और हमारा शरीर", "7: पापा खो गए", "8: शाम – एक किसान", "9: चिड़िया की बच्ची", "10: अपूर्व अनुभव", "11: रहीम के दोहे", "12: कंचा", "13: एक तिनका", "14: खानपान की बदलती तस्वीर", "15: नीलकंठ"]
  },
  "Class 8": {
    "Maths": ["1: Rational Numbers", "2: Linear Equations in One Variable", "3: Understanding Quadrilaterals", "4: Practical Geometry", "5: Data Handling", "6: Squares and Square Roots", "7: Cubes and Cube Roots", "8: Comparing Quantities", "9: Algebraic Expressions and Identities", "10: Visualising Solid Shapes", "11: Mensuration", "12: Exponents and Powers", "13: Direct and Inverse Proportions", "14: Factorisation", "15: Introduction to Graphs", "16: Playing with Numbers"],
    "Science": ["1: Crop Production and Management", "2: Microorganisms: Friend and Foe", "3: Synthetic Fibres and Plastics", "4: Materials: Metals and Non-Metals", "5: Coal and Petroleum", "6: Combustion and Flame", "7: Conservation of Plants and Animals", "8: Cell – Structure and Functions", "9: Reproduction in Animals", "10: Reaching the Age of Adolescence", "11: Force and Pressure", "12: Friction", "13: Sound", "14: Chemical Effects of Electric Current", "15: Some Natural Phenomena", "16: Light", "17: Stars and the Solar System", "18: Pollution of Air and Water"],
    "Social Science (History)": ["1: How, When and Where", "2: From Trade to Territory", "3: Ruling the Countryside", "4: Tribals, Dikus and the Vision of a Golden Age", "5: When People Rebel", "6: Colonialism and the City", "7: Weavers, Iron Smelters and Factory Owners", "8: Civilising the Native, Educating the Nation"],
    "Social Science (Geography)": ["1: Resources", "2: Land, Soil, Water, Natural Vegetation and Wildlife Resources", "3: Mineral and Power Resources", "4: Agriculture", "5: Industries", "6: Human Resources"],
    "Social Science (Civics)": ["1: The Indian Constitution", "2: Understanding Secularism", "3: Why Do We Need a Parliament?", "4: Understanding Laws", "5: Judiciary", "6: Understanding Our Criminal Justice System", "7: Understanding Marginalisation", "8: Confronting Marginalisation", "9: Public Facilities", "10: Law and Social Justice"],
    "Hindi": ["1: ध्वनि", "2: लाख की चूड़ियाँ", "3: बस की यात्रा", "4: दीवानों की हस्ती", "5: चिट्ठियों की अनूठी दुनिया", "6: भगवान के डाकिए", "7: क्या निराश हुआ जाए", "8: यह सबसे कठिन समय नहीं", "9: कबीर की साखियाँ", "10: कामचोर", "11: जब सिनेमा ने बोलना सीखा", "12: सुदामा चरित", "13: जहाँ पहिया है", "14: अकबरी लोटा"]
  },
  "Class 9": {
    "Maths": ["1: Number Systems", "2: Polynomials", "3: Coordinate Geometry", "4: Linear Equations in Two Variables", "5: Introduction to Euclid’s Geometry", "6: Lines and Angles", "7: Triangles", "8: Quadrilaterals", "9: Areas of Parallelograms and Triangles", "10: Circles", "11: Constructions", "12: Heron’s Formula", "13: Surface Areas and Volumes", "14: Statistics", "15: Probability"],
    "Science": ["1: Matter in Our Surroundings", "2: Is Matter Around Us Pure?", "3: Atoms and Molecules", "4: Structure of the Atom", "5: The Fundamental Unit of Life", "6: Tissues", "7: Diversity in Living Organisms", "8: Motion", "9: Force and Laws of Motion", "10: Gravitation", "11: Work and Energy", "12: Sound", "13: Why Do We Fall Ill?", "14: Natural Resources", "15: Improvement in Food Resources"],
    "Social Science (History)": ["1: The French Revolution", "2: Socialism in Europe and the Russian Revolution", "3: Nazism and the Rise of Hitler"],
    "Social Science (Geography)": ["1: India – Size and Location", "2: Physical Features of India", "3: Drainage", "4: Climate", "5: Natural Vegetation and Wildlife", "6: Population"],
    "Social Science (Civics)": ["1: What is Democracy? Why Democracy?", "2: Constitutional Design", "3: Electoral Politics", "4: Working of Institutions", "5: Democratic Rights"],
    "Social Science (Economics)": ["1: The Story of Village Palampur", "2: People as Resource", "3: Poverty as a Challenge", "4: Food Security in India"],
    "Hindi": ["1: दो बैलों की कथा", "2: ल्हासा की ओर", "3: उपभोक्तावाद की संस्कृति", "4: साँवले सपनों की याद", "5: नाना साहब की पुत्री देवी मैना को भस्म कर दिया गया", "6: प्रेमचंद के फटे जूते", "7: मेरे बचपन के दिन", "8: एक कुत्ता और एक मैना", "9: साखियाँ और सबद", "10: वाख"]
  },
  "Class 10": {
    "Maths": ["1: Real Numbers", "2: Polynomials", "3: Pair of Linear Equations in Two Variables", "4: Quadratic Equations", "5: Arithmetic Progressions", "6: Triangles", "7: Coordinate Geometry", "8: Trigonometric Identities", "9: Some Applications of Trigonometry", "10: Circles", "11: Constructions", "12: Areas Related to Circles", "13: Surface Areas and Volumes", "14: Statistics", "15: Probability"],
    "Science": ["1: Chemical Reactions and Equations", "2: Acids, Bases and Salts", "3: Metals and Non-metals", "4: Carbon and its Compounds", "5: Life Processes", "6: Control and Coordination", "7: How do Organisms Reproduce", "8: Heredity and Evolution", "9: Light – Reflection and Refraction", "10: The Human Eye and the Colourful World", "11: Electricity", "12: Magnetic Effects of Electric Current", "13: Sources of Energy", "14: Our Environment", "15: Management of Natural Resources"],
    "Social Science (History)": ["1: The Rise of Nationalism in Europe", "2: Nationalism in India", "3: The Making of a Global World", "4: The Age of Industrialisation", "5: Print Culture and the Modern World"],
    "Social Science (Geography)": ["1: Resources and Development", "2: Forest and Wildlife Resources", "3: Water Resources", "4: Agriculture", "5: Minerals and Energy Resources", "6: Manufacturing Industries", "7: Lifelines of National Economy"],
    "Social Science (Civics)": ["1: Power Sharing", "2: Federalism", "3: Democracy and Diversity", "4: Gender, Religion and Caste", "5: Popular Struggles and Movements", "6: Political Parties", "7: Outcomes of Democracy", "8: Challenges to Democracy"],
    "Social Science (Economics)": ["1: Development", "2: Sectors of the Indian Economy", "3: Money and Credit", "4: Globalisation and the Indian Economy", "5: Consumer Rights"],
    "Hindi": ["1: सूरदास के पद", "2: तुलसीदास के दोहे", "3: आत्मकथ्य", "4: तोप", "5: कर चले हम फ़िदा", "6: बड़े भाई साहब", "7: डायरी का एक पन्ना", "8: तीसरी कसम के शिल्पकार शैलेंद्र", "9: अब कहाँ दूसरे के दुख से दुखी होने वाले", "10: गिरगिट"]
  },
  "Class 11": {
    "Maths": ["Sets", "Relations and Functions", "Trigonometric Functions", "Principle of Mathematical Induction", "Complex Numbers and Quadratic Equations", "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem", "Sequences and Series", "Straight Lines", "Conic Sections", "Introduction to Three Dimensional Geometry", "Limits and Derivatives", "Mathematical Reasoning", "Statistics", "Probability"],
    "Physics": ["Physical World and Measurement", "Kinematics", "Laws of Motion", "Work, Energy and Power", "Motion of System of Particles and Rigid Body", "Gravitation", "Properties of Bulk Matter", "Thermodynamics", "Behaviour of Perfect Gas and Kinetic Theory", "Oscillations and Waves"],
    "Chemistry": ["Some Basic Concepts of Chemistry", "Structure of Atom", "States of Matter", "Chemical Thermodynamics", "Equilibrium", "Redox Reactions", "Organic Chemistry – Basic Principles and Techniques", "Hydrocarbons", "Classification of Elements and Periodicity in Properties", "Chemical Bonding and Molecular Structure", "Hydrogen", "The s-Block Element", "Some p-Block Elements", "Environmental Chemistry"],
    "Biology": ["The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Morphology of Flowering Plants", "Anatomy of Flowering Plants", "Structural Organisation in Animals", "Cell: The Unit of Life", "Biomolecules", "Cell Cycle and Cell Division", "Transport in Plants", "Mineral Nutrition", "Photosynthesis in Higher Plants", "Respiration in Plants", "Plant Growth and Development", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products and their Elimination", "Locomotion and Movement", "Neural Control and Coordination", "Chemical Coordination and Integration"],
    "English (Hornbill)": ["The Portrait of a Lady", "We’re Not Afraid to Die…", "Discovering Tut: The Saga Continues", "Landscape of the Soul", "The Ailing Planet", "The Browning Version", "The Adventure", "Silk Road"],
    "English (Snapshots)": ["The Summer of the Beautiful White Horse", "The Address", "Ranga’s Marriage", "Albert Einstein at School", "Mother’s Day", "The Ghat of the Only World", "Birth", "The Tale of Melon City"],
    "Hindi (Aroh)": ["कबीर", "मीरा", "भिखारीदास", "बिहारी", "तुलसीदास", "जयशंकर प्रसाद", "निराला", "महादेवी वर्मा"],
    "Hindi (Vitan)": ["भारतीय गायिकाएँ", "मैंने देखा", "सिक्किम की लोककथाएँ", "जलियांवाला बाग", "सड़कों के लिए"]
  },
  "Class 12": {
    "Maths": ["Relations and Functions", "Inverse Trigonometric Functions", "Matrices", "Determinants", "Continuity and Differentiability", "Applications of Derivatives", "Integrals", "Applications of Integrals", "Differential Equations", "Vector Algebra", "Three Dimensional Geometry", "Linear Programming", "Probability"],
    "Physics": ["Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Current Electricity", "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics and Optical Instruments", "Wave Optics", "Dual Nature of Radiation and Matter", "Atoms", "Nuclei", "Semiconductor Electronics"],
    "Chemistry": ["The Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry", "General Principles and Processes of Isolation of Elements", "The p-Block Elements", "The d and f Block Elements", "Coordination Compounds", "Haloalkanes and Haloarenes", "Alcohols, Phenols and Ethers", "Aldehydes, Ketones and Carboxylic Acids", "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life"],
    "Biology": ["Reproduction in Organisms", "Sexual Reproduction in Flowering Plants", "Human Reproduction", "Reproductive Health", "Principles of Inheritance and Variation", "Molecular Basis of Inheritance", "Evolution", "Human Health and Disease", "Strategies for Enhancement in Food Production", "Microbes in Human Welfare", "Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem", "Biodiversity and Conservation", "Environmental Issues"],
    "English (Flamingo)": ["The Last Lesson", "Lost Spring", "Deep Water", "The Rattrap", "Indigo", "Poets and Pancakes", "The Interview", "Going Places"],
    "English (Vistas)": ["The Third Level", "The Tiger King", "Journey to the End of the Earth", "The Enemy", "Should Wizard Hit Mommy?", "On the Face of It", "Evans Tries an O-Level", "Memories of Childhood"],
    "Hindi (Aroh)": ["सूरदास", "तुलसीदास", "देव", "निराला", "नागार्जुन", "मुक्तिबोध", "अज्ञेय", "हरिवंश राय बच्चन"],
    "Hindi (Vitan)": ["सिल्वर वैडिंग", "जूझ", "अतीत में दबे पाँव", "डायरी के पन्ने", "चंपा काले-काले अक्षर नहीं पहचानती"]
  }
};

// Flatten the nested data into an array of NCERTEntry objects
const flattenData = (): NCERTEntry[] => {
  const flattened: NCERTEntry[] = [];
  
  for (const className in rawData) {
    const subjects = rawData[className];
    for (const subjectName in subjects) {
      const chapters = subjects[subjectName];
      
      // Handle nested subjects (like Social Science subcategories)
      if (!Array.isArray(chapters)) {
        for (const subSubject in chapters) {
          const subChapters = chapters[subSubject];
          const combinedSubjectName = `${subjectName} (${subSubject})`;
          subChapters.forEach((chapter: string) => {
            flattened.push({ className, subjectName: combinedSubjectName, chapterName: chapter });
          });
        }
      } else {
        chapters.forEach((chapter: string) => {
          flattened.push({ className, subjectName, chapterName: chapter });
        });
      }
    }
  }
  
  return flattened;
};

export const NCERT_DATA: NCERTEntry[] = flattenData();

export const CLASSES = Array.from(new Set(NCERT_DATA.map(d => d.className))).sort((a, b) => {
    const numA = parseInt(a.split(' ')[1]);
    const numB = parseInt(b.split(' ')[1]);
    return numA - numB;
});

export const STRENGTHS = ['Easy', 'Medium', 'Hard'];
