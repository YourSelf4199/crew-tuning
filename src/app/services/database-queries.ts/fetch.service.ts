import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { selectAuthStateFull } from '../../store/auth/auth.selectors';

@Injectable({
  providedIn: 'root',
})
export class FetchService {
  private readonly hasuraUrl = 'https://immune-octopus-96.hasura.app/v1/graphql';

  constructor(
    private http: HttpClient,
    private store: Store,
  ) {}

  getAllVehicleImagesAndNames(): Observable<
    { id: number; name: string; vehicle_type_code: string; s3_image_url: string }[]
  > {
    const authState = this.store.selectSignal(selectAuthStateFull);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authState().idToken}`,
    });

    return this.http
      .post<any>(
        this.hasuraUrl,
        {
          query: `
        query AllVehicleImagesAndNames {
          vehicle_images_names {
            id
            name
            vehicle_type_code
            s3_image_url
          }
        }
      `,
        },
        {
          headers, // ✅ This is the correct usage
        },
      )
      .pipe(
        tap((res) => console.log('GraphQL response:', res)), // 👈 Add this line
        map((res) => res.data?.vehicle_images_names ?? []),
      );
  }

  getAllVehicleTypesAndCategories(): Observable<
    {
      id: number;
      code: string;
      label: string;
      category: {
        id: number;
        label: string;
        slug: string;
      };
    }[]
  > {
    const authState = this.store.selectSignal(selectAuthStateFull);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authState().idToken}`,
    });

    return this.http
      .post<any>(
        this.hasuraUrl,
        {
          query: `
        query GetAllVehicleTypesAndCategories {
          vehicle_types {
            id
            code
            label
            vehicle_category {
              id
              label
              slug
            }
          }
        }
      `,
        },
        {
          headers,
        },
      )
      .pipe(
        tap((res) => console.log('GraphQL response:', res)),
        map((res) => res.data?.vehicle_types ?? []),
      );
  }

  getUserVehicleConfigurations(): Observable<any> {
    const query = `
      query GetUserVehicleConfigurations($userId: String!) {
        vehicle_configuration(where: { cognito_sub_id: { _eq: $userId } }) {
          id
          vehicle_images_names_id
          vehicle_types_id
          global_settings_id
          specific_settings_id
  
          vehicle_global_setting {
            id
            traction_control
            abs
            esp
            drift_assist
          }
  
          vehicle_specific_setting {
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
  
          vehicle_type {
            id
            code
          }
  
          vehicle_images_name {
            id
            s3_image_url
            name
          }
        }
      }
    `;

    const authState = this.store.selectSignal(selectAuthStateFull);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authState().idToken}`,
      'X-Hasura-User-Id': authState().userId,
    });

    const variables = {
      userId: authState().userId,
    };

    return this.http.post<any>(this.hasuraUrl, { query, variables }, { headers }).pipe(
      tap((res) => console.log('📦 Vehicle Configurations:', res)),
      map((res) => res.data.vehicle_configuration),
    );
  }

  fetchSettingsIds(
    vehicleId: number,
  ): Observable<{ globalSettingsId: string | null; specificSettingsId: string | null }> {
    const GET_SETTINGS_IDS_QUERY = `
      query GetVehicleSettingsIds($vehicleId: Int!) {
        vehicle_configuration(where: { vehicle_images_names_id: { _eq: $vehicleId } }) {
          global_settings_id
          specific_settings_id
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
          query: GET_SETTINGS_IDS_QUERY,
          variables: { vehicleId },
        },
        { headers },
      )
      .pipe(
        map((response) => ({
          globalSettingsId: response.data.vehicle_configuration[0]?.global_settings_id ?? null,
          specificSettingsId: response.data.vehicle_configuration[0]?.specific_settings_id ?? null,
        })),
        catchError((error) => {
          console.error('Error fetching settings IDs:', error);
          return of({ globalSettingsId: null, specificSettingsId: null });
        }),
      );
  }
}
