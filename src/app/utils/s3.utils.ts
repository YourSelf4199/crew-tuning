/**
 * Handles S3 image loading errors by replacing failed images with a placeholder
 * @param event The error event from the img element
 * @param imageId The ID of the image that failed to load
 * @param imageName The name of the image for logging purposes
 * @param failedImages Set to track which images have already failed
 */
export function handleS3ImageError(
  event: Event,
  imageId: string,
  imageName: string,
  failedImages: Set<string>,
): void {
  if (failedImages.has(imageId)) return;

  const imgElement = event.target as HTMLImageElement;
  failedImages.add(imageId);
  imgElement.src = 'assets/images/placeholder.jpg';
  console.error(`Failed to load image: ${imageName}`);
}
