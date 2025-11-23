export interface Facility {
  id: string;
  providerId: string;
  name: string;
  category: string;
  address?: string;
  phone?: string;
  reservationPageUrl?: string;
  reservationSystemId?: string;
}

export interface Availability {
  date: string; // YYYY-MM-DD
  period: "morning" | "afternoon" | "night";
  status: "available" | "few" | "full" | "closed";
  remaining?: number;
}

export interface FacilityProvider {
  id: string;
  name: string;
  fetchFacilities(): Promise<Facility[]>;
  fetchAvailability(
    facilityId: string,
    from: Date,
    to: Date,
    options?: any
  ): Promise<Availability[]>;
}
