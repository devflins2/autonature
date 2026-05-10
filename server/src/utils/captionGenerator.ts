const templates: { [key: string]: string[] } = {
  general: [
    "In every walk with nature, one receives far more than he seeks. ✨🌿",
    "Study nature, love nature, stay close to nature. It will never fail you. 🌍💫",
    "Look deep into nature, and then you will understand everything better. 🌱🧘‍♂️",
    "Nature is not a place to visit. It is home. 🏡🌲",
    "The poetry of earth is never dead. 📖✨",
    "To be whole is to be part of the wild. 🦊🏔️",
    "Adopt the pace of nature: her secret is patience. ⏳🍃",
    "Nature's peace will flow into you as sunshine flows into trees. ☀️🌳",
    "Wildness is the preservation of the World. 🌎🐆",
    "Heaven is under our feet as well as over our heads. ✨🦶"
  ],
  forest: [
    "The clearest way into the Universe is through a forest wilderness. 🌲🌌",
    "Between every two pines is a door to a new world. 🌲🚪✨",
    "The forest is quiet, but it speaks a thousand languages. 🍃🤫",
    "Woodland whispers and emerald dreams. 🌳💎",
    "Find me where the wild things grow. 🌿🐾",
    "Escape into the emerald embrace. 🌲💚"
  ],
  mountain: [
    "Climb the mountains and get their good tidings. 🏔️🦅",
    "In the presença of mountains, we find our true size. 🏔️👣",
    "The best view comes after the hardest climb. 🏔️✨",
    "Mountains are the beginning and the end of all natural scenery. 🏔️🎨",
    "High altitudes, high spirits. 🏔️✨",
    "The mountains are calling, and I must go. 🏔️📞"
  ],
  water: [
    "The sea, once it casts its spell, holds one in its net of wonder forever. 🌊🧜‍♂️",
    "A lake is the landscape's most beautiful and expressive feature. 💧🌅",
    "Water is the driving force of all nature. 🌊💪",
    "Let the waves carry you where the light can find you. 🌊✨",
    "Drown out the noise with the sound of the waves. 🌊🤫",
    "Life is better by the ocean. 🌊💙"
  ],
  flower: [
    "Where flowers bloom, so does hope. 🌸✨",
    "Happiness radiates like the fragrance from a flower. 🌺💫",
    "The earth laughs in flowers. 🌼😄",
    "Flowers are the music of the ground. 🌸🎶",
    "Petals and peace. 🌸🕊️",
    "Bloom where you are planted. 🌼✨"
  ],
  rain: [
    "The best thing one can do when it's raining is to let it rain. 🌧️🧘‍♂️",
    "Rain is grace; rain is the sky descending to the earth. 🌧️✨",
    "Some people feel the rain. Others just get wet. 🌧️💫",
    "Life isn't about waiting for the storm to pass, it's about learning to dance in the rain. ⛈️💃"
  ]
};

const commonHashtags = [
  "#nature #aesthetic #naturelovers #wildlife #landscape #peace #naturegram #reels #viral",
  "#earthfocus #visualsofearth #roamtheplanet #stayandwander #discoverearth #wonderfulplaces",
  "#naturephotography #artofvisuals #earthpix #exploretocreate #beautifuldestinations",
  "#nature_perfection #planetearth #wildlifephotography #thegreatoutdoors #wildernessculture"
];

const categoryHashtags: { [key: string]: string } = {
  forest: "#forest #woods #trees #greenery #intothewild #forestlife #woodland",
  mountain: "#mountains #peak #hiking #adventure #climbing #mountainview #alps",
  water: "#ocean #sea #beach #waves #waterfall #lake #islandlife #blueocean",
  flower: "#flowers #floral #bloom #spring #garden #blossoms #botanical",
  rain: "#rain #storm #weather #raindrops #pluviophile #thunder #lightning"
};

export const generateAutoCaption = (keyword: string = 'nature') => {
  let category = 'general';
  const k = keyword.toLowerCase();

  if (k.includes('forest') || k.includes('tree') || k.includes('wood') || k.includes('jungle')) category = 'forest';
  else if (k.includes('mountain') || k.includes('snow') || k.includes('peak') || k.includes('hill')) category = 'mountain';
  else if (k.includes('ocean') || k.includes('beach') || k.includes('river') || k.includes('wave') || k.includes('water') || k.includes('lake')) category = 'water';
  else if (k.includes('flower') || k.includes('bloom') || k.includes('spring') || k.includes('blossom')) category = 'flower';
  else if (k.includes('rain') || k.includes('storm') || k.includes('thunder')) category = 'rain';

  const list = templates[category] || templates.general;
  const selectedCaption = list[Math.floor(Math.random() * list.length)];
  const randomCommon = commonHashtags[Math.floor(Math.random() * commonHashtags.length)];
  const catTags = categoryHashtags[category] || "";
  
  const keywordTag = `#${keyword.replace(/\s+/g, '')}`;
  
  return `${selectedCaption}\n.\n.\n${keywordTag} ${catTags} ${randomCommon}\n#naturephotography #peaceful #flora`;


};
