export interface SpecificSettings {
  aero_distribution: number | null;
  gearbox: number | null;
  tire_grip_front: number | null;
  tire_grip_rear: number | null;
  brake_power: number | null;
  brake_balance: number | null;
  susp_comp_front: number | null;
  susp_reb_front: number | null;
  susp_comp_rear: number | null;
  susp_reb_rear: number | null;
  susp_geom_camber_front?: number | null;
  susp_geom_camber_rear?: number | null;
  arb_front?: number | null;
  arb_rear?: number | null;
}
