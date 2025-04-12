import { GlobalSettings } from './VehicleGlobalSettings/GlobalSettings';
import { SpecificSettings } from './VehicleSpecificSettings/SpecificSettings';

export interface SelectedVehicle {
  selectedVehicleId: number | null;
  selectedVehicleType: string | null;
  globalSettings: GlobalSettings | null;
  specificSettings: SpecificSettings | null;
  step: string | null;
}
