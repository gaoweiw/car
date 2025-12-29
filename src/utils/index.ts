
// Load all images from assets/images
// The path is relative to this file (src/utils/index.ts -> src/assets/images)
const images = import.meta.glob('../assets/images/*.png', { eager: true, import: 'default' });

/**
 * Get the URL for an image asset by filename
 * @param filename The name of the file in src/assets/images/ (e.g., 'img (1).png')
 * @returns The resolved URL of the image
 */
export const getAssetUrl = (filename: string) => {
  // Construct the path relative to this file, matching the glob pattern
  const path = `../assets/images/${filename}`;
  return (images[path] as string) || '';
};
