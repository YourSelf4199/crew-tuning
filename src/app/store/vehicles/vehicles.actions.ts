import { createAction, props } from '@ngrx/store';
import { VehicleWithSignedUrl } from '../../models/VehicleWithSignedUrl';
import { SelectedVehicle } from '../../models/SelectedVehicle';
import { GlobalSettings } from '../../models/VehicleGlobalSettings/GlobalSettings';
import { SpecificSettings } from '../../models/VehicleSpecificSettings/SpecificSettings';
import { VehicleTypeWithCategory } from '../../models/VehicleTypeWithCategory';
import { Boats } from '../../models/VehicleSpecificSettings/Boats';
import { VehicleConfigurations } from '../../models/VehicleConfigurations';

export const loadVehicles = createAction('[Vehicle] Load Vehicles');
export const loadTypesAndCategories = createAction('[Vehicle] Load Vehicle Types and Categories');

export const loadVehiclesSuccess = createAction(
  '[Vehicle] Load Vehicles Success',
  props<{ vehicles: VehicleWithSignedUrl[] }>(),
);

export const loadTypesAndCategoriesSuccess = createAction(
  '[Vehicle] Load Vehicle Types and Categories Success',
  props<{ typesAndCategories: VehicleTypeWithCategory[] }>(), // Change this to 'typesAndCategories'
);

export const updateSelectedVehicle = createAction(
  '[Vehicle] Update Selected Vehicle',
  props<{ updates: Partial<SelectedVehicle> }>(),
);

export const setSelectedVehicleId = createAction(
  '[Vehicle] Set Selected Vehicle ID',
  props<{ selectedVehicleId: number; selectedVehicleType: string }>(),
);

export const setGlobalSettings = createAction(
  '[Vehicle] Select Global Settings',
  props<{ globalSettings: GlobalSettings }>(),
);

export const setSpecificSettings = createAction(
  '[Vehicle] Select Specific Settings',
  props<{ specificSettings: SpecificSettings }>(),
);

export const setBoatSpecificSettings = createAction(
  '[Vehicle] Select Specific Settings',
  props<{ boatSpecificSettings: Boats }>(),
);

export const submitSelectedVehicle = createAction('[Vehicle] Submit Selected Vehicle');

export const submitSelectedVehicleSuccess = createAction('[Vehicle] Submit Vehicle Success');

export const resetSelectedVehicle = createAction('[Vehicle] Reset Selected Vehicle');

export const getUserVehicleConfigurations = createAction(
  '[Vehicle] Get User Vehicle Configurations',
  props<{ userId: string }>(),
);

export const getUserVehicleConfigurationsSuccess = createAction(
  '[Vehicle] Get User Vehicle Configurations Success',
  props<{ vehicleConfigurations: VehicleConfigurations[] }>(),
);

export const selectUserVehicleConfiguration = createAction(
  '[Vehicle] Select User Vehicle Configuration',
  props<{ vehicleConfiguration: VehicleConfigurations }>(),
);

export const goToSpecificSettings = createAction('[Vehicle] Go To Specific Settings');

export const updateVehicleConfiguration = createAction(
  '[Vehicle] Update Vehicle Configuration',
  props<{
    selectedVehicleId: number;
    globalSettings: GlobalSettings;
    specificSettings: SpecificSettings;
  }>(),
);

export const updateVehicleConfigurationSuccess = createAction(
  '[Vehicle] Update Vehicle Configuration Success',
);
