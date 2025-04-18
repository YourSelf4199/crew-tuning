import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Observable, map, from, switchMap } from 'rxjs';
import { getUrl } from '@aws-amplify/storage';
import { VehicleCategory, VehicleImage, VehicleType } from '../models/vehicle.model';

const GET_VEHICLE_IMAGES = gql`
  query GetVehicleImages {
    vehicle_images_names {
      id
      name
      s3_image_url
      vehicle_type_code
    }
  }
`;

const GET_VEHICLE_CATEGORIES = gql`
  query GetVehicleCategory {
    vehicle_category {
      id
      label
      slug
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  constructor(private apollo: Apollo) {}

  private fixImagePath(path: string): string {
    if (path.endsWith('jpg') && !path.endsWith('.jpg')) {
      return path.replace('jpg', '.jpg');
    }
    return path;
  }

  getVehicleImages(): Observable<VehicleImage[]> {
    return this.apollo
      .watchQuery<{ vehicle_images_names: VehicleImage[] }>({
        query: GET_VEHICLE_IMAGES,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((result) => result.data.vehicle_images_names),
        switchMap((vehicles) =>
          from(
            Promise.all(
              vehicles.map((vehicle) =>
                getUrl({ path: this.fixImagePath(vehicle.s3_image_url) })
                  .then((signed) => ({
                    ...vehicle,
                    signedUrl: signed.url.toString(),
                  }))
                  .catch((err) => {
                    console.error(`Failed to get signed URL for ${vehicle.name}`, err);
                    return { ...vehicle, signedUrl: '' };
                  }),
              ),
            ),
          ),
        ),
      );
  }

  getVehicleCategories(): Observable<VehicleCategory[]> {
    return this.apollo
      .watchQuery<{ vehicle_category: VehicleCategory[] }>({
        query: GET_VEHICLE_CATEGORIES,
      })
      .valueChanges.pipe(map((result) => result.data.vehicle_category));
  }

  getVehicleTypes(): Observable<VehicleType[]> {
    return this.apollo
      .query<{ vehicle_types: VehicleType[] }>({
        query: gql`
          query GetVehicleTypes {
            vehicle_types {
              id
              code
              label
              category_id
            }
          }
        `,
      })
      .pipe(map((result) => result.data.vehicle_types));
  }
}
