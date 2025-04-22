import { gql } from 'apollo-angular';

export const GET_VEHICLE_IMAGES = gql`
  query GetVehicleImages {
    vehicle_images_names {
      id
      name
      s3_image_url
      vehicle_type_code
    }
    vehicle_types {
      id
      code
      label
      category_id
    }
    vehicle_category {
      id
      label
      slug
    }
  }
`;

export const GET_VEHICLE_CATEGORIES = gql`
  query GetVehicleCategory {
    vehicle_category {
      id
      label
      slug
    }
  }
`;

export const GET_VEHICLE_TYPES = gql`
  query GetVehicleTypes {
    vehicle_types {
      id
      code
      label
      category_id
    }
  }
`;
