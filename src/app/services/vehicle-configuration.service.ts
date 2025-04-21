import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { GlobalSettings } from '../models/settings.model';
import { SpecificSettings } from '../models/settings.model';
import {
  GlobalSettingsResponse,
  SpecificSettingsResponse,
  VehicleConfigurationResponse,
} from '../models/vehicle-response.model';
import { S3Service } from './s3.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable, forkJoin, from } from 'rxjs';
import { VehicleConfiguration } from '../models/vehicle-configuration.model';
import { VehicleCategory, VehicleType } from '../models/vehicle.model';
import {
  UPDATE_GLOBAL_SETTINGS,
  UPDATE_SPECIFIC_SETTINGS,
} from '../graphql/mutations/settings.mutations';
import {
  GET_VEHICLE_CONFIGURATIONS,
  GET_GLOBAL_SETTINGS,
  GET_SPECIFIC_SETTINGS,
  GET_VEHICLE_CONFIGURATION,
} from '../graphql/queries/vehicle_configuration.queries';
import {
  INSERT_GLOBAL_SETTINGS,
  INSERT_SPECIFIC_SETTINGS,
  INSERT_VEHICLE_CONFIGURATION,
  UPDATE_VEHICLE_CONFIGURATION,
  DELETE_GLOBAL_SETTINGS,
  DELETE_SPECIFIC_SETTINGS,
  DELETE_VEHICLE_CONFIGURATION,
} from '../graphql/mutations/vehicle_configuration.mutations';

@Injectable({
  providedIn: 'root',
})
export class VehicleConfigurationService {
  constructor(
    private apollo: Apollo,
    private s3Service: S3Service,
  ) {}

  getVehicleConfigurations(cognito_sub_id: string): Observable<VehicleConfiguration[]> {
    return this.apollo
      .watchQuery<{
        vehicle_configuration: Array<
          Omit<VehicleConfiguration, 'vehicle_type' | 'vehicle_category'>
        >;
        vehicle_types: VehicleType[];
        vehicle_category: VehicleCategory[];
      }>({
        query: GET_VEHICLE_CONFIGURATIONS,
        variables: { cognito_sub_id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((result) => {
          const { vehicle_configuration, vehicle_types, vehicle_category } = result.data;
          return vehicle_configuration.map((config) => {
            const type = vehicle_types.find(
              (t) => t.code === config.vehicle_images_name.vehicle_type_code,
            );
            const category = type
              ? vehicle_category.find((c) => c.id === parseInt(type.category_id))
              : null;

            return {
              ...config,
              vehicleType: type || ({} as VehicleType),
              vehicleCategory: category || ({} as VehicleCategory),
            };
          });
        }),
        switchMap((configurations) =>
          from(
            Promise.all(
              configurations.map(async (config) => {
                const signedUrl = await this.s3Service.getSignedUrl(
                  config.vehicle_images_name.s3_image_url,
                );
                return {
                  ...config,
                  vehicle_images_name: {
                    ...config.vehicle_images_name,
                    signedUrl,
                  },
                };
              }),
            ),
          ),
        ),
      );
  }

  insertGlobalSettings(settings: GlobalSettings) {
    return this.apollo.mutate<GlobalSettingsResponse>({
      mutation: INSERT_GLOBAL_SETTINGS,
      variables: {
        settings: {
          abs: settings.abs,
          drift_assist: settings.drift_assist,
          esp: settings.esp,
          traction_control: settings.traction_control,
        },
      },
    });
  }

  insertSpecificSettings(settings: SpecificSettings) {
    return this.apollo.mutate<SpecificSettingsResponse>({
      mutation: INSERT_SPECIFIC_SETTINGS,
      variables: {
        settings: {
          aero_distribution: settings.aero_distribution,
          arb_front: settings.arb_front,
          arb_rear: settings.arb_rear,
          brake_balance: settings.brake_balance,
          brake_power: settings.brake_power,
          gearbox: settings.gearbox,
          susp_comp_front: settings.susp_comp_front,
          susp_comp_rear: settings.susp_comp_rear,
          susp_geom_camber_front: settings.susp_geom_camber_front,
          susp_geom_camber_rear: settings.susp_geom_camber_rear,
          susp_reb_front: settings.susp_reb_front,
          susp_reb_rear: settings.susp_reb_rear,
          tire_grip_front: settings.tire_grip_front,
          tire_grip_rear: settings.tire_grip_rear,
        },
      },
    });
  }

  insertVehicleConfiguration(config: {
    vehicle_images_names_id: string;
    vehicle_types_id: string;
    cognito_sub_id: string;
    global_settings_id: string;
    specific_settings_id: string;
  }) {
    return this.apollo.mutate<VehicleConfigurationResponse>({
      mutation: INSERT_VEHICLE_CONFIGURATION,
      variables: {
        config,
      },
    });
  }

  updateGlobalSettings(id: string, settings: GlobalSettings) {
    return this.apollo.mutate<GlobalSettingsResponse>({
      mutation: UPDATE_GLOBAL_SETTINGS,
      variables: {
        id,
        settings: {
          abs: settings.abs,
          drift_assist: settings.drift_assist,
          esp: settings.esp,
          traction_control: settings.traction_control,
        },
      },
      refetchQueries: [
        {
          query: GET_GLOBAL_SETTINGS,
          variables: { id },
        },
      ],
    });
  }

  updateSpecificSettings(id: string, settings: SpecificSettings) {
    return this.apollo.mutate<SpecificSettingsResponse>({
      mutation: UPDATE_SPECIFIC_SETTINGS,
      variables: {
        id,
        settings: {
          aero_distribution: settings.aero_distribution,
          arb_front: settings.arb_front,
          arb_rear: settings.arb_rear,
          brake_balance: settings.brake_balance,
          brake_power: settings.brake_power,
          gearbox: settings.gearbox,
          susp_comp_front: settings.susp_comp_front,
          susp_comp_rear: settings.susp_comp_rear,
          susp_geom_camber_front: settings.susp_geom_camber_front,
          susp_geom_camber_rear: settings.susp_geom_camber_rear,
          susp_reb_front: settings.susp_reb_front,
          susp_reb_rear: settings.susp_reb_rear,
          tire_grip_front: settings.tire_grip_front,
          tire_grip_rear: settings.tire_grip_rear,
        },
      },
      refetchQueries: [
        {
          query: GET_SPECIFIC_SETTINGS,
          variables: { id },
        },
      ],
    });
  }

  updateVehicleConfiguration(
    id: string,
    config: {
      vehicle_images_names_id?: string;
      vehicle_types_id?: string;
      global_settings_id?: string;
      specific_settings_id?: string;
    },
  ) {
    return this.apollo.mutate<VehicleConfigurationResponse>({
      mutation: UPDATE_VEHICLE_CONFIGURATION,
      variables: {
        id,
        config,
      },
    });
  }

  getVehicleConfiguration(vehicle_images_names_id: number) {
    return this.apollo
      .query<{
        vehicle_configuration: Array<{
          id: string;
          vehicle_images_names_id: string;
          vehicle_types_id: string;
          cognito_sub_id: string;
          global_settings_id: string;
          specific_settings_id: string;
          specific_settings_boat_id: string | null;
        }>;
      }>({
        query: GET_VEHICLE_CONFIGURATION,
        variables: { vehicle_images_names_id },
        fetchPolicy: 'network-only',
      })
      .pipe(
        switchMap((result) => {
          const config = result.data.vehicle_configuration[0];

          if (!config) {
            throw new Error('Configuration not found');
          }

          // Get global settings using the global_settings_id
          const globalSettings$ = this.apollo
            .query<{
              vehicle_global_settings: Array<{
                id: string;
                abs: number;
                drift_assist: number;
                esp: number;
                traction_control: number;
              }>;
            }>({
              query: GET_GLOBAL_SETTINGS,
              variables: { id: config.global_settings_id },
            })
            .pipe(map((result) => result.data.vehicle_global_settings[0]));

          // Get specific settings using the specific_settings_id
          const specificSettings$ = this.apollo
            .query<{
              vehicle_specific_settings: Array<{
                id: string;
                aero_distribution: number;
                arb_front: number;
                arb_rear: number;
                brake_balance: number;
                brake_power: number;
                gearbox: number;
                susp_comp_front: number;
                susp_comp_rear: number;
                susp_geom_camber_front: number;
                susp_geom_camber_rear: number;
                susp_reb_front: number;
                susp_reb_rear: number;
                tire_grip_front: number;
                tire_grip_rear: number;
              }>;
            }>({
              query: GET_SPECIFIC_SETTINGS,
              variables: { id: config.specific_settings_id },
            })
            .pipe(map((result) => result.data.vehicle_specific_settings[0]));

          return forkJoin({
            globalSettings: globalSettings$,
            specificSettings: specificSettings$,
          }).pipe(
            map(({ globalSettings, specificSettings }) => ({
              ...config,
              vehicle_global_settings: globalSettings,
              vehicle_specific_settings: specificSettings,
            })),
          );
        }),
      );
  }

  deleteVehicleConfiguration(vehicle_images_names_id: number) {
    return this.apollo
      .query<{
        vehicle_configuration: Array<{
          id: string;
          global_settings_id: string;
          specific_settings_id: string;
          cognito_sub_id: string;
        }>;
      }>({
        query: GET_VEHICLE_CONFIGURATION,
        variables: { vehicle_images_names_id },
        fetchPolicy: 'network-only',
      })
      .pipe(
        switchMap((result) => {
          const config = result.data.vehicle_configuration[0];

          if (!config) {
            console.error('Service: Configuration not found');
            throw new Error('Configuration not found');
          }

          // Delete global settings
          const deleteGlobalSettings$ = this.apollo.mutate({
            mutation: DELETE_GLOBAL_SETTINGS,
            variables: { id: config.global_settings_id },
            refetchQueries: ['GetVehicleConfigurations'],
          });

          // Delete specific settings
          const deleteSpecificSettings$ = this.apollo.mutate({
            mutation: DELETE_SPECIFIC_SETTINGS,
            variables: { id: config.specific_settings_id },
            refetchQueries: ['GetVehicleConfigurations'],
          });

          // First delete both settings, then delete the configuration
          return forkJoin([deleteGlobalSettings$, deleteSpecificSettings$]).pipe(
            switchMap(() => {
              return this.apollo.mutate({
                mutation: DELETE_VEHICLE_CONFIGURATION,
                variables: {
                  vehicle_images_names_id,
                  cognito_sub_id: config.cognito_sub_id,
                },
                refetchQueries: ['GetVehicleConfigurations'],
              });
            }),
          );
        }),
      );
  }
}
