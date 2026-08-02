export interface FlightLeg {
  departureTime: string;
  arrivalTime: string;
  departureCode: string;
  arrivalCode: string;
  departureCity: string;
  arrivalCity: string;
  duration: string;
  stops: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  aircraft: string;
}

export interface FlightResult {
  id: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  departureCity: string;
  arrivalCity: string;
  duration: string;
  stops: string;
  price: number;
  currency: string;
  cabinClass: string;
  baggageIncluded: boolean;
  refundable: boolean;
  ecoBadge?: string;
  legs?: FlightLeg[];
}

export interface DatePriceOption {
  date: string;
  dayName: string;
  price: number;
  isSelected?: boolean;
}
