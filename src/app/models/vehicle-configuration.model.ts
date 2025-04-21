import { VehicleCategory, VehicleImage, VehicleType } from './vehicle.model';

export interface VehicleConfiguration {
  id: string;
  vehicle_images_names_id: string;
  vehicle_types_id: string;
  cognito_sub_id: string;
  global_settings_id: string;
  specific_settings_id: string;
  specific_settings_boat_id: string | null;
  vehicle_images_name: VehicleImage;
  vehicleType: VehicleType;
  vehicleCategory: VehicleCategory;
}
