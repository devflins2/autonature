/**
 * Generates a high-engagement nature caption based on a keyword.
 * Template-based system (Offline/No-API) for maximum stability.
 */
export const generateSmartCaption = async (keyword: string): Promise<string> => {
  const templates = [
    `The whispers of the wild are calling. 🌿✨ Let the peace of "${keyword}" fill your soul and guide you home. 🌍💫`,
    `Finding magic in the simple moments of nature. 🌸 "${keyword}" in its most vibrant form. Eternal beauty. ✨🌿`,
    `Nature doesn't hurry, yet everything is accomplished. 🍃 Capturing the serene essence of "${keyword}". 🌲✨`,
    `Lost in the rhythm of the wild. 🌊 The soul of "${keyword}" is where I find my peace. 🌍💫`,
    `Vibrant colors and eternal whispers. 🌳✨ Experience the awe-inspiring magic of "${keyword}". 🍃🌸`
  ];

  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  const hashtags = [
    '#nature', '#aesthetic', '#flora', '#peaceful', '#wilderness', 
    '#naturelovers', '#earth', '#vibrant', '#serene', '#explore',
    `#${keyword.replace(/\s+/g, '')}`, '#wildlife', '#scenery'
  ].join(' ');

  return `${randomTemplate}\n.\n.\n${hashtags}`;
};
