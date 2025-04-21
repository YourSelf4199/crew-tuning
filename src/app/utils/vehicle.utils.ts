/**
 * Returns the border color based on the vehicle category label
 * @param label The category label (e.g., 'street-race')
 * @returns The border color value
 */
export function getVehicleCategoryColor(label: string): string {
  return label === 'street-race' ? '1px #fbbf24' : '1px #3b82f6';
}
