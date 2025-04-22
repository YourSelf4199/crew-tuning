export interface Vehicle {
  vehicleImage: VehicleImage;
  vehicleType: VehicleType;
  vehicleCategory: VehicleCategory;
  isConfigured?: boolean;
}

export interface VehicleImage {
  id: string;
  name: string;
  s3_image_url: string;
  vehicle_type_code: string;
  signedUrl?: string;
}

export interface VehicleType {
  id: string;
  code: string;
  label: string;
  category_id: string;
}

export interface VehicleCategory {
  id: number;
  label: string;
  slug: string;
}
