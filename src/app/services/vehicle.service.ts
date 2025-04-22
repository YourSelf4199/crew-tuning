import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { Observable, map, from, switchMap, forkJoin, of } from 'rxjs';
import { getUrl } from '@aws-amplify/storage';
import { VehicleCategory, VehicleImage, VehicleType, Vehicle } from '../models/vehicle.model';
import { S3Service } from './s3.service';
import {
  GET_VEHICLE_IMAGES,
  GET_VEHICLE_CATEGORIES,
  GET_VEHICLE_TYPES,
} from '../graphql/queries/vehicle_queries';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  constructor(
    private apollo: Apollo,
    private s3Service: S3Service,
  ) {}

  private mapVehicles(
    images: VehicleImage[],
    types: VehicleType[],
    categories: VehicleCategory[],
  ): Vehicle[] {
    return images.map((vehicle) => {
      const type = types.find((t) => t.code === vehicle.vehicle_type_code);
      const category = type ? categories.find((c) => c.id === parseInt(type.category_id)) : null;
      return {
        vehicleImage: vehicle,
        vehicleType: type || ({} as VehicleType),
        vehicleCategory: category || ({} as VehicleCategory),
      };
    });
  }

  private addSignedUrls(vehicles: Vehicle[]): Observable<Vehicle[]> {
    return forkJoin(
      vehicles.map((vehicle) =>
        this.s3Service.getSignedUrl(vehicle.vehicleImage.s3_image_url).pipe(
          map((signedUrl) => ({
            ...vehicle,
            vehicleImage: {
              ...vehicle.vehicleImage,
              signedUrl,
            },
          })),
        ),
      ),
    );
  }

  getVehicleImages(): Observable<Vehicle[]> {
    return this.apollo
      .watchQuery<{
        vehicle_images_names: VehicleImage[];
        vehicle_types: VehicleType[];
        vehicle_category: VehicleCategory[];
      }>({
        query: GET_VEHICLE_IMAGES,
      })
      .valueChanges.pipe(
        map((result) =>
          this.mapVehicles(
            result.data.vehicle_images_names,
            result.data.vehicle_types,
            result.data.vehicle_category,
          ),
        ),
        switchMap((vehicles) => this.addSignedUrls(vehicles)),
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
        query: GET_VEHICLE_TYPES,
      })
      .pipe(map((result) => result.data.vehicle_types));
  }
}
