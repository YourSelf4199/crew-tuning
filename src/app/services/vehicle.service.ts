import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Observable, map, from, switchMap } from 'rxjs';
import { getUrl } from '@aws-amplify/storage';
import { VehicleCategory, VehicleImage, VehicleType } from '../models/vehicle.model';
import { S3Service } from './s3.service';

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
  constructor(
    private apollo: Apollo,
    private s3Service: S3Service,
  ) {}

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
                this.s3Service.getSignedUrl(vehicle.s3_image_url).then((signedUrl) => ({
                  ...vehicle,
                  signedUrl,
                })),
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
