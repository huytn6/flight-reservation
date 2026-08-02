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
  startDate: number;
  endDate: number;
  startMonthName: string;
  endMonthName: string;
}

export interface FlightSearchParams {
  flightType: FlightType;
  leavingFrom: Airport;
  goingTo: Airport | null;
  dates: DateRangeState;
  passengers: PassengerState;
  bundleStay: boolean;
}
