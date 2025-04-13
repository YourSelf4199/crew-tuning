import { GlobalSettings } from './VehicleGlobalSettings/GlobalSettings';
import { VehicleImageAndName } from './VehicleImageAndName';
import { SpecificSettings } from './VehicleSpecificSettings/SpecificSettings';
import { VehicleTypeWithCategory } from './VehicleTypeWithCategory';

export interface VehicleConfigurations {
  imageAndName: VehicleImageAndName;
  vehicleTypeAndCategory: VehicleTypeWithCategory;
  globalSettings: GlobalSettings;
  specificSettings: SpecificSettings;
}
