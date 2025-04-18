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
}
