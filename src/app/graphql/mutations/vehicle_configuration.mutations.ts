import { gql } from 'apollo-angular';

export const INSERT_GLOBAL_SETTINGS = gql`
  mutation InsertGlobalSettings($settings: vehicle_global_settings_insert_input!) {
    insert_vehicle_global_settings_one(object: $settings) {
      id
    }
  }
`;

export const INSERT_SPECIFIC_SETTINGS = gql`
  mutation InsertSpecificSettings($settings: vehicle_specific_settings_insert_input!) {
    insert_vehicle_specific_settings_one(object: $settings) {
      id
    }
  }
`;

export const INSERT_VEHICLE_CONFIGURATION = gql`
  mutation InsertVehicleConfiguration($config: vehicle_configuration_insert_input!) {
    insert_vehicle_configuration_one(object: $config) {
      id
    }
  }
`;

export const UPDATE_GLOBAL_SETTINGS = gql`
  mutation UpdateGlobalSettings($id: uuid!, $settings: vehicle_global_settings_set_input!) {
    update_vehicle_global_settings_by_pk(pk_columns: { id: $id }, _set: $settings) {
      id
    }
  }
`;

export const UPDATE_SPECIFIC_SETTINGS = gql`
  mutation UpdateSpecificSettings($id: uuid!, $settings: vehicle_specific_settings_set_input!) {
    update_vehicle_specific_settings_by_pk(pk_columns: { id: $id }, _set: $settings) {
      id
    }
  }
`;

export const UPDATE_VEHICLE_CONFIGURATION = gql`
  mutation UpdateVehicleConfiguration($id: uuid!, $config: vehicle_configuration_set_input!) {
    update_vehicle_configuration_by_pk(pk_columns: { id: $id }, _set: $config) {
      id
    }
  }
`;

export const DELETE_GLOBAL_SETTINGS = gql`
  mutation DeleteGlobalSettings($id: uuid!) {
    delete_vehicle_global_settings_by_pk(id: $id) {
      id
    }
  }
`;

export const DELETE_SPECIFIC_SETTINGS = gql`
  mutation DeleteSpecificSettings($id: uuid!) {
    delete_vehicle_specific_settings_by_pk(id: $id) {
      id
    }
  }
`;

export const DELETE_VEHICLE_CONFIGURATION = gql`
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
