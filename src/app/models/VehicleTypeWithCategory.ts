export interface VehicleCategory {
  id: number;
  label: string;
  slug: string;
}

export interface VehicleTypeWithCategory {
  id: number;
  code: string;
  label: string;
  category: VehicleCategory;
}
