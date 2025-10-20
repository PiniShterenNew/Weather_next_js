export interface OpenWeatherForecastItem {
  dt: number;
  dt_txt: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  visibility: number;
  pop?: number; // Probability of precipitation (0-1)
  sys?: {
    pod: string;
  };
}

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
  timezone?: {
    name: string;
    offset_STD: string;
  };
  result_type?: string;
}

// OneCall API response types
export interface OneCallResponse {
  current?: {
    uvi?: number; // UV Index
    // Other fields from OneCall API
    temp?: number;
    feels_like?: number;
    humidity?: number;
    wind_speed?: number;
    wind_deg?: number;
    pressure?: number;
    visibility?: number;
    clouds?: number;
    sunrise?: number;
    sunset?: number;
    timezone?: number;
  };
}
