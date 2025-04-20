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
import { Observable, forkJoin } from 'rxjs';
import { AuthService } from '../services/auth.service';

interface GetVehicleConfigurationsResponse {
  vehicle_configuration: Array<{
    id: string;
    vehicle_images_names_id: string;
    vehicle_types_id: string;
    cognito_sub_id: string;
    global_settings_id: string;
    specific_settings_id: string;
    specific_settings_boat_id: string | null;
    vehicle_images_name: {
      id: string;
      name: string;
      s3_image_url: string;
      vehicle_type_code: string;
    };
  }>;
}

const INSERT_GLOBAL_SETTINGS = gql`
  mutation InsertGlobalSettings($settings: vehicle_global_settings_insert_input!) {
    insert_vehicle_global_settings_one(object: $settings) {
      id
    }
  }
`;

const INSERT_SPECIFIC_SETTINGS = gql`
  mutation InsertSpecificSettings($settings: vehicle_specific_settings_insert_input!) {
    insert_vehicle_specific_settings_one(object: $settings) {
      id
    }
  }
`;

const INSERT_VEHICLE_CONFIGURATION = gql`
  mutation InsertVehicleConfiguration($config: vehicle_configuration_insert_input!) {
    insert_vehicle_configuration_one(object: $config) {
      id
    }
  }
`;

const GET_VEHICLE_CONFIGURATIONS = gql`
  query GetVehicleConfigurations($cognito_sub_id: String!) {
    vehicle_configuration(where: { cognito_sub_id: { _eq: $cognito_sub_id } }) {
      id
      vehicle_images_names_id
      vehicle_types_id
      cognito_sub_id
      global_settings_id
      specific_settings_id
      specific_settings_boat_id
      vehicle_images_name {
        id
        name
        s3_image_url
        vehicle_type_code
      }
    }
  }
`;

const UPDATE_GLOBAL_SETTINGS = gql`
  mutation UpdateGlobalSettings($id: uuid!, $settings: vehicle_global_settings_set_input!) {
    update_vehicle_global_settings_by_pk(pk_columns: { id: $id }, _set: $settings) {
      id
    }
  }
`;

const UPDATE_SPECIFIC_SETTINGS = gql`
  mutation UpdateSpecificSettings($id: uuid!, $settings: vehicle_specific_settings_set_input!) {
    update_vehicle_specific_settings_by_pk(pk_columns: { id: $id }, _set: $settings) {
      id
    }
  }
`;

const UPDATE_VEHICLE_CONFIGURATION = gql`
  mutation UpdateVehicleConfiguration($id: uuid!, $config: vehicle_configuration_set_input!) {
    update_vehicle_configuration_by_pk(pk_columns: { id: $id }, _set: $config) {
      id
    }
  }
`;

const GET_VEHICLE_CONFIGURATION = gql`
  query GetVehicleConfiguration($vehicle_images_names_id: Int!) {
    vehicle_configuration(where: { vehicle_images_names_id: { _eq: $vehicle_images_names_id } }) {
      id
      vehicle_images_names_id
      vehicle_types_id
      cognito_sub_id
      global_settings_id
      specific_settings_id
      specific_settings_boat_id
    }
  }
`;

const GET_GLOBAL_SETTINGS = gql`
  query GetGlobalSettings($id: uuid!) {
    vehicle_global_settings(where: { id: { _eq: $id } }) {
      id
      abs
      drift_assist
      esp
      traction_control
    }
  }
`;

const GET_SPECIFIC_SETTINGS = gql`
  query GetSpecificSettings($id: uuid!) {
    vehicle_specific_settings(where: { id: { _eq: $id } }) {
      id
      aero_distribution
      arb_front
      arb_rear
      brake_balance
      brake_power
      gearbox
      susp_comp_front
      susp_comp_rear
      susp_geom_camber_front
      susp_geom_camber_rear
      susp_reb_front
      susp_reb_rear
      tire_grip_front
      tire_grip_rear
    }
  }
`;

const DELETE_GLOBAL_SETTINGS = gql`
  mutation DeleteGlobalSettings($id: uuid!) {
    delete_vehicle_global_settings_by_pk(id: $id) {
      id
    }
  }
`;

const DELETE_SPECIFIC_SETTINGS = gql`
  mutation DeleteSpecificSettings($id: uuid!) {
    delete_vehicle_specific_settings_by_pk(id: $id) {
      id
    }
  }
`;

const DELETE_VEHICLE_CONFIGURATION = gql`
  mutation DeleteVehicleConfiguration($vehicle_images_names_id: Int!, $cognito_sub_id: String!) {
    delete_vehicle_configuration(
      where: {
        vehicle_images_names_id: { _eq: $vehicle_images_names_id }
        cognito_sub_id: { _eq: $cognito_sub_id }
      }
    ) {
      affected_rows
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class VehicleConfigurationService {
  constructor(
    private apollo: Apollo,
    private s3Service: S3Service,
  ) {}

  getVehicleConfigurations(cognito_sub_id: string) {
    return this.apollo
      .watchQuery<GetVehicleConfigurationsResponse>({
        query: GET_VEHICLE_CONFIGURATIONS,
        variables: { cognito_sub_id },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(
        map((result) => result.data.vehicle_configuration),
        switchMap(async (configs) => {
          const configsWithUrls = await Promise.all(
            configs.map(async (config) => {
              const signedUrl = await this.s3Service.getSignedUrl(
                config.vehicle_images_name.s3_image_url,
              );
              return {
                ...config,
                signedUrl,
              };
            }),
          );
          return configsWithUrls;
        }),
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
