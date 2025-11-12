import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchOpenMeteo } from '@/lib/weather/openMeteoClient';
import { WeatherBundle } from '@/types/weather';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchOpenMeteo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch weather data from Open-Meteo API', async () => {
    const mockResponse = {
      latitude: 32.0853,
      longitude: 34.7818,
      timezone: 'Asia/Jerusalem',
      timezone_abbreviation: 'IDT',
      utc_offset_seconds: 10800,
      current_weather: {
        temperature: 25.5,
        windspeed: 12.3,
        winddirection: 180,
        weathercode: 0,
        time: '2024-01-01T12:00'
      },
      hourly: {
        time: ['2024-01-01T12:00', '2024-01-01T13:00'],
        temperature_2m: [25.5, 26.0],
        apparent_temperature: [24.0, 25.0],
        relative_humidity_2m: [65, 60],
        dew_point_2m: [18.0, 19.0],
        pressure_msl: [1013, 1012],
        cloud_cover: [0, 10],
        precipitation: [0, 0],
        precipitation_probability: [0, 5],
        rain: [0, 0],
        snowfall: [0, 0],
        wind_speed_10m: [12.3, 13.0],
        wind_gusts_10m: [15.0, 16.0],
        wind_direction_10m: [180, 185],
        uv_index: [5.0, 4.5],
        is_day: [1, 1],
        weathercode: [0, 1],
        visibility: [10000, 9500]
      },
      daily: {
        time: ['2024-01-01', '2024-01-02'],
        temperature_2m_max: [28.0, 29.0],
        temperature_2m_min: [18.0, 19.0],
        apparent_temperature_max: [27.0, 28.0],
        apparent_temperature_min: [17.0, 18.0],
        precipitation_sum: [0, 2.5],
        precipitation_probability_max: [0, 30],
        sunrise: ['2024-01-01T06:30', '2024-01-02T06:31'],
        sunset: ['2024-01-01T18:30', '2024-01-02T18:31'],
        uv_index_max: [6.0, 6.5],
        windspeed_10m_max: [15.0, 16.0],
        windgusts_10m_max: [20.0, 22.0],
        weathercode: [0, 1]
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await fetchOpenMeteo(32.0853, 34.7818);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.open-meteo.com/v1/forecast'),
      expect.objectContaining({
        next: { revalidate: 1800 }
      })
    );

    expect(result).toEqual({
      current: {
        time: '2024-01-01T12:00',
        temp: 25.5,
        feels_like: 24.0,
        wind_speed: 12.3,
        wind_deg: 180,
        wind_gust: 15.0,
        humidity: 65,
        pressure: 1013,
        clouds: 0,
        pop: 0,
        visibility: 10000,
        uvi: 5.0,
        dew_point: 18.0,
        weather_code: 0,
        is_day: true,
        sunrise: '2024-01-01T06:30',
        sunset: '2024-01-01T18:30'
      },
      hourly: [
        {
          time: '2024-01-01T12:00',
          temp: 25.5,
          feels_like: 24.0,
          humidity: 65,
          pressure: 1013,
          clouds: 0,
          pop: 0,
          precip_mm: 0,
          rain_mm: 0,
          snow_mm: 0,
          wind_speed: 12.3,
          wind_gust: 15.0,
          wind_deg: 180,
          uvi: 5.0,
          dew_point: 18.0,
          visibility: 10000,
          weather_code: 0,
          is_day: true
        },
        {
          time: '2024-01-01T13:00',
          temp: 26.0,
          feels_like: 25.0,
          humidity: 60,
          pressure: 1012,
          clouds: 10,
          pop: 5,
          precip_mm: 0,
          rain_mm: 0,
          snow_mm: 0,
          wind_speed: 13.0,
          wind_gust: 16.0,
          wind_deg: 185,
          uvi: 4.5,
          dew_point: 19.0,
          visibility: 9500,
          weather_code: 1,
          is_day: true
        }
      ],
      daily: [
        {
          date: '2024-01-01',
          min: 18.0,
          max: 28.0,
          feels_like_min: 17.0,
          feels_like_max: 27.0,
          pop_max: 0,
          precip_sum_mm: 0,
          wind_speed_max: 15.0,
          wind_gust_max: 20.0,
          sunrise: '2024-01-01T06:30',
          sunset: '2024-01-01T18:30',
          uvi_max: 6.0,
          weather_code: 0
        },
        {
          date: '2024-01-02',
          min: 19.0,
          max: 29.0,
          feels_like_min: 18.0,
          feels_like_max: 28.0,
          pop_max: 30,
          precip_sum_mm: 2.5,
          wind_speed_max: 16.0,
          wind_gust_max: 22.0,
          sunrise: '2024-01-02T06:31',
          sunset: '2024-01-02T18:31',
          uvi_max: 6.5,
          weather_code: 1
        }
      ],
      meta: {
        lat: 32.0853,
        lon: 34.7818,
        tz: 'Asia/Jerusalem',
        currentHourIndex: expect.any(Number),
        offsetSec: 10800
      }
    });
  });

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(fetchOpenMeteo(32.0853, 34.7818)).rejects.toThrow('Open-Meteo API error: 500 Internal Server Error');
  });

  it('should handle network timeouts', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValueOnce(abortError);

    await expect(fetchOpenMeteo(32.0853, 34.7818)).rejects.toThrow('Open-Meteo API timeout');
  });

  it('should handle missing data gracefully', async () => {
    const mockResponse = {
      latitude: 32.0853,
      longitude: 34.7818,
      timezone: 'Asia/Jerusalem',
      current_weather: {
        temperature: 25.5,
        windspeed: 12.3,
        winddirection: 180,
        weathercode: 0,
        time: '2024-01-01T12:00'
      },
      hourly: {
        time: ['2024-01-01T12:00'],
        temperature_2m: [25.5],
        apparent_temperature: [null],
        relative_humidity_2m: [null],
        dew_point_2m: [null],
        pressure_msl: [null],
        cloud_cover: [null],
        precipitation: [null],
        precipitation_probability: [null],
        rain: [null],
        snowfall: [null],
        wind_speed_10m: [null],
        wind_gusts_10m: [null],
        wind_direction_10m: [null],
        uv_index: [null],
        is_day: [null],
        weathercode: [null],
        visibility: [null]
      },
      daily: {
        time: ['2024-01-01'],
        temperature_2m_max: [28.0],
        temperature_2m_min: [18.0],
        apparent_temperature_max: [null],
        apparent_temperature_min: [null],
        precipitation_sum: [null],
        precipitation_probability_max: [null],
        sunrise: [null],
        sunset: [null],
        uv_index_max: [null],
        windspeed_10m_max: [null],
        windgusts_10m_max: [null],
        weathercode: [null]
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await fetchOpenMeteo(32.0853, 34.7818);

    expect(result.current.feels_like).toBeNull();
    expect(result.current.humidity).toBeNull();
    expect(result.current.pressure).toBeNull();
    expect(result.current.clouds).toBeNull();
    expect(result.current.pop).toBeNull();
    expect(result.current.visibility).toBeNull();
    expect(result.current.uvi).toBeNull();
    expect(result.current.dew_point).toBeNull();
    // is_day converts null to false (boolean conversion: null === 1 => false)
    expect(result.current.is_day).toBe(false);
    expect(result.current.sunrise).toBeNull();
    expect(result.current.sunset).toBeNull();
  });
});
