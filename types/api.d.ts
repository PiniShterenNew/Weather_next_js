export interface GeoAPIResult {
  city: string;
  country: string;
  country_code: string;
  lat: number;
  lon: number;
  formatted?: string;
  state?: string;
  name?: string;
  place_id?: string;
  county?: string;
  address_line1?: string;
  suburb?: string;
  postcode?: string;
  timezone?: {
    name: string;
    offset_STD: string;
  };
  result_type?: string;
}
