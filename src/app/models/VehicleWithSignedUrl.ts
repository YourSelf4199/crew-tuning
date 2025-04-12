export interface VehicleWithSignedUrl {
  id: number;
  name: string;
  vehicle_type_code: string;
  s3_image_url: string;
  signedUrl: string;
}
