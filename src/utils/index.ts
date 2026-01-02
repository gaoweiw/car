// Load all images from assets/images
// The path is relative to this file (src/utils/index.ts -> src/assets/images)
// 支持子目录（如 assets/images/logistics/*）
const images = import.meta.glob('../assets/images/**/*.png', { eager: true, import: 'default' });

/**
 * Get the URL for an image asset by filename
 * @param filename The name of the file in src/assets/images/ (e.g., 'img (1).png' or 'logistics/map.png')
 * @returns The resolved URL of the image
 */
export const getAssetUrl = (filename: string) => {
  const path = `../assets/images/${filename}`;
  return (images[path] as string) || '';
};

