import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAuthStateFull } from '../../store/auth/auth.selectors';
import { map, Observable, switchMap, tap } from 'rxjs';
import { SelectedVehicle } from '../../models/SelectedVehicle';

@Injectable({
  providedIn: 'root',
})
export class InsertService {
  private readonly hasuraUrl = 'https://immune-octopus-96.hasura.app/v1/graphql';

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  /**
   * Insert user into Hasura with GraphQL + Cognito ID token
   */
  async insertUserIntoHasura(userId: string, email: string, name: string) {
    const mutation = `
      mutation InsertUser($email: String!, $sub: String!, $name: String) {
          insert_users_one(
            object: { email: $email, cognito_sub: $sub, name: $name },
            on_conflict: {
              constraint: users_cognito_sub_key,
              update_columns: []
            }
          ) {
            id
          }
        }
      `;

    const variables = {
      email: email,
      sub: userId,
      name: name,
    };

    const body = {
      query: mutation,
      variables: variables,
    };

    const authState = this.store.selectSignal(selectAuthStateFull);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authState().idToken}`,
      'X-Hasura-User-Id': authState().userId,
    });

    try {
      await this.http.post(this.hasuraUrl, JSON.stringify(body), { headers });
    } catch (error) {
      console.error('❌ Mutation failed:', error);
      throw error;
    }
  }

  submitFullVehicleConfiguration(selectedVehicle: SelectedVehicle): Observable<any> {
    return this.getVehicleTypeId(selectedVehicle.selectedVehicleType).pipe(
      switchMap((vehicleTypeId) =>
        this.insertGlobalAndSpecificSettings(
          selectedVehicle.globalSettings,
          selectedVehicle.specificSettings,
        ).pipe(
          switchMap(({ globalId, specificId }) => {
            const insertConfigMutation = `
              mutation InsertVehicleConfig(
                $vehicle_images_names_id: Int!,
                $vehicle_types_id: Int!,
                $global_settings_id: uuid!,
                $specific_settings_id: uuid!,
                $cognito_sub_id: String!
              ) {
                insert_vehicle_configuration_one(
                  object: {
                    vehicle_images_names_id: $vehicle_images_names_id,
                    vehicle_types_id: $vehicle_types_id,
                    global_settings_id: $global_settings_id,
                    specific_settings_id: $specific_settings_id,
                    cognito_sub_id: $cognito_sub_id
                  }
                ) {
                  id
                }
              }
            `;

            const authState = this.store.selectSignal(selectAuthStateFull);
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authState().idToken}`,
              'X-Hasura-User-Id': authState().userId,
            });

            const configVars = {
              vehicle_images_names_id: selectedVehicle.selectedVehicleId,
              vehicle_types_id: vehicleTypeId,
              global_settings_id: globalId,
              specific_settings_id: specificId,
              cognito_sub_id: authState().userId,
            };

            return this.http.post<any>(
              this.hasuraUrl,
              { query: insertConfigMutation, variables: configVars },
              { headers },
            );
          }),
        ),
      ),
      map((res) => res.data),
    );
  }

  private getVehicleTypeId(vehicleTypeCode: string | null): Observable<any> {
    const GET_VEHICLE_TYPE_ID = `
      query GetVehicleTypeId($vehicleTypeCode: String!) {
        vehicle_types(where: { code: { _eq: $vehicleTypeCode } }) {
          id
        }
      }
    `;

    const authState = this.store.selectSignal(selectAuthStateFull);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authState().idToken}`,
    });

    return this.http
      .post<any>(
        this.hasuraUrl,
        {
          query: GET_VEHICLE_TYPE_ID,
          variables: { vehicleTypeCode },
        },
        { headers },
      )
      .pipe(
        tap((res) => console.log('🚀 Vehicle Type ID response:', res)),
        map((res) => res.data.vehicle_types[0]?.id),
      );
  }

  private insertGlobalAndSpecificSettings(
    global: any,
    specific: any,
  ): Observable<{ globalId: string; specificId: string }> {
    const mutation = `
      mutation InsertGlobalAndSpecific(
        $global: vehicle_global_settings_insert_input!,
        $specific: vehicle_specific_settings_insert_input!
      ) {
        global: insert_vehicle_global_settings_one(object: $global) {
          id
        }
        specific: insert_vehicle_specific_settings_one(object: $specific) {
          id
        }
      }
    `;

    const variables = { global, specific };

    const authState = this.store.selectSignal(selectAuthStateFull);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authState().idToken}`,
    });

    return this.http.post<any>(this.hasuraUrl, { query: mutation, variables }, { headers }).pipe(
      tap((res) => console.log('✅ Inserted global/specific settings:', res)),
      map((res) => {
        const globalId = res.data.global.id;
        const specificId = res.data.specific.id;
        return { globalId, specificId };
      }),
    );
  }

  //////////
  updateVehicleSettings(
    globalSettingsId: string,
    specificSettingsId: string,
    globalSettings: any,
    specificSettings: any,
  ): Observable<any> {
    console.log();

    const updateMutation = `
      mutation UpdateVehicleSettings(
        $globalSettingsId: uuid!,
        $specificSettingsId: uuid!,
        $globalSettings: vehicle_global_settings_set_input!,
        $specificSettings: vehicle_specific_settings_set_input!
      ) {
        update_vehicle_global_settings_by_pk(
          pk_columns: { id: $globalSettingsId },
          _set: $globalSettings
        ) {
          id
          traction_control
          abs
          esp
          drift_assist
        }
        update_vehicle_specific_settings_by_pk(
          pk_columns: { id: $specificSettingsId },
          _set: $specificSettings
        ) {
          id
          aero_distribution
          gearbox
          tire_grip_front
          tire_grip_rear
          brake_power
          brake_balance
          susp_comp_front
          susp_reb_front
          susp_comp_rear
          susp_reb_rear
          susp_geom_camber_front
          susp_geom_camber_rear
          arb_front
          arb_rear
        }
      }
    `;

    const authState = this.store.selectSignal(selectAuthStateFull);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authState().idToken}`,
    });

    console.log(globalSettings);
    console.log(specificSettings);

    return this.http
      .post<any>(
        this.hasuraUrl,
        {
          query: updateMutation,
          variables: {
            globalSettingsId,
            specificSettingsId,
            globalSettings: globalSettings,
            specificSettings: specificSettings,
          },
        },
        { headers },
      )
      .pipe(
        map((response) => {
          console.log('GraphQL response:', response); // Log the full response
          return response.data; // Return the response data
        }),
      );
  }
}
