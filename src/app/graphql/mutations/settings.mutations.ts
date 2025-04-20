import { gql } from 'apollo-angular';

export const UPDATE_GLOBAL_SETTINGS = gql`
  mutation UpdateGlobalSettings($id: uuid!, $settings: vehicle_global_settings_set_input!) {
    update_vehicle_global_settings_by_pk(pk_columns: { id: $id }, _set: $settings) {
      id
      abs
      drift_assist
      esp
      traction_control
    }
  }
`;

export const UPDATE_SPECIFIC_SETTINGS = gql`
  mutation UpdateSpecificSettings($id: uuid!, $settings: vehicle_specific_settings_set_input!) {
    update_vehicle_specific_settings_by_pk(pk_columns: { id: $id }, _set: $settings) {
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
