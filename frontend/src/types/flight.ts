import type { Airport } from './airport';

export type FlightType = 'roundtrip' | 'one-way' | 'multi-city';

export interface PassengerState {
  adults: number;
  children: number;
  infantsLap: number;
  infantsSeat: number;
  cabinClass: string;
}

export interface DateRangeState {
  /** ISO date string, e.g. "2026-09-12" */
  startDate: string;
  /** ISO date string, e.g. "2026-09-19" */
  endDate: string;
}

export interface FlightSearchParams {
  flightType: FlightType;
  leavingFrom: Airport;
  goingTo: Airport | null;
  dates: DateRangeState;
  passengers: PassengerState;
  bundleStay: boolean;
}
