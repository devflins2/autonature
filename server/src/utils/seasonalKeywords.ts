export const getSeasonalKeywords = (): string[] => {
  const month = new Date().getMonth(); // 0 = Jan, 11 = Dec

  // Common high-quality nature keywords that work year-round
  const evergreen = ['wildlife', 'landscape', 'macro nature', 'starry night', 'milky way', 'volcano', 'coral reef'];

  // Winter (December, January, February)
  if (month === 11 || month === 0 || month === 1) {
    return [...evergreen, 'snow mountains', 'winter landscape', 'frozen lake', 'aurora borealis', 'pine forest snow', 'ice cave', 'arctic animals'];
  }
  
  // Spring (March, April, May)
  if (month >= 2 && month <= 4) {
    return [...evergreen, 'spring flowers', 'green meadows', 'cherry blossoms', 'fresh forest', 'mountain river', 'nature landscape', 'wild flowers', 'butterfly', 'tulips', 'daffodils'];
  }

  // Summer (June, July, August)
  if (month >= 5 && month <= 7) {
    return [...evergreen, 'tropical beach', 'ocean waves', 'summer sunset', 'waterfalls', 'palm trees', 'island life', 'underwater world', 'desert dunes'];
  }

  // Autumn (September, October, November)
  if (month >= 8 && month <= 10) {
    return [...evergreen, 'autumn leaves', 'fall forest', 'foggy mountains', 'orange trees', 'misty lake', 'harvest moon', 'rainy forest'];
  }

  return ['nature', 'wildlife', 'landscape', 'forest', 'ocean']; // Absolute Fallback
};
