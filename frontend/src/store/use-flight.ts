import { create } from 'zustand';
import type { Airport } from '@/types/airport';
import type { FlightType, PassengerState, DateRangeState } from '@/types/flight';

const DEFAULT_ORIGIN_AIRPORT: Airport = {
  code: 'SGN',
  city: 'Ho Chi Minh City',
  name: 'Tan Son Nhat International Airport',
  sublabel: 'Tan Son Nhat Intl., Vietnam',
};

interface FlightStoreState {
  flightType: FlightType;
  leavingFrom: Airport;
  goingTo: Airport | null;
  dateRange: DateRangeState;
  passengers: PassengerState;
  bundleStay: boolean;

  setFlightType: (type: FlightType) => void;
  setLeavingFrom: (airport: Airport) => void;
  setGoingTo: (airport: Airport | null) => void;
  setDateRange: (range: DateRangeState) => void;
  updateAdults: (delta: number) => void;
  updateChildren: (delta: number) => void;
  updateInfantsLap: (delta: number) => void;
  updateInfantsSeat: (delta: number) => void;
  setCabinClass: (cabinClass: string) => void;
  setBundleStay: (bundleStay: boolean) => void;
  handleSwap: () => void;
}

export const useFlightStore = create<FlightStoreState>((set, get) => ({
  flightType: 'roundtrip',
  leavingFrom: DEFAULT_ORIGIN_AIRPORT,
  goingTo: null,

  dateRange: {
    startDate: 12,
    endDate: 19,
    startMonthName: 'August 2026',
    endMonthName: 'September 2026',
  },

  passengers: {
    adults: 1,
    children: 0,
    infantsLap: 0,
    infantsSeat: 0,
    cabinClass: 'Economy',
  },

  bundleStay: false,

  setFlightType: (flightType) => set({ flightType }),
  setLeavingFrom: (leavingFrom) => set({ leavingFrom }),
  setGoingTo: (goingTo) => set({ goingTo }),
  setDateRange: (dateRange) => set({ dateRange }),

  updateAdults: (delta) =>
    set((state) => ({
      passengers: {
        ...state.passengers,
        adults: Math.max(1, state.passengers.adults + delta),
      },
    })),

  updateChildren: (delta) =>
    set((state) => ({
      passengers: {
        ...state.passengers,
        children: Math.max(0, state.passengers.children + delta),
      },
    })),

  updateInfantsLap: (delta) =>
    set((state) => ({
      passengers: {
        ...state.passengers,
        infantsLap: Math.max(0, state.passengers.infantsLap + delta),
      },
    })),

  updateInfantsSeat: (delta) =>
    set((state) => ({
      passengers: {
        ...state.passengers,
        infantsSeat: Math.max(0, state.passengers.infantsSeat + delta),
      },
    })),

  setCabinClass: (cabinClass) =>
    set((state) => ({
      passengers: { ...state.passengers, cabinClass },
    })),

  setBundleStay: (bundleStay) => set({ bundleStay }),

  handleSwap: () => {
    const { leavingFrom, goingTo } = get();
    if (goingTo) {
      set({ leavingFrom: goingTo, goingTo: leavingFrom });
    }
  },
}));
