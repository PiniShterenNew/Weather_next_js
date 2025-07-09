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
