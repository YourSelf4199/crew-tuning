import { gql } from 'apollo-angular';

export const GET_VEHICLE_CONFIGURATION = gql`
  query GetVehicleConfiguration($vehicle_images_names_id: Int!) {
    vehicle_configuration(where: { vehicle_images_names_id: { _eq: $vehicle_images_names_id } }) {
      id
      vehicle_images_names_id
      vehicle_types_id
      cognito_sub_id
      global_settings_id
      specific_settings_id
      specific_settings_boat_id
      vehicle_global_settings {
        id
        abs
        drift_assist
        esp
        traction_control
      }
      vehicle_specific_settings {
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
  }
`;
