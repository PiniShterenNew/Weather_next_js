import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/renderWithIntl';
import * as weatherModule from '@/features/weather';
import SearchBar from './SearchBar';
import type { CitySuggestion } from '@/types/suggestion';
import type { CityWeather } from '@/types/weather';
import { act } from 'react';

vi.mock('@/lib/useDebounce', () => ({ useDebounce: (v: unknown) => v }));

const stateMock = {
  addCity: vi.fn(),
  addOrReplaceCurrentLocation: vi.fn(),
  autoLocationCityId: null as string | null,
  showToast: vi.fn(),
  cities: [] as CityWeather[],
  unit: 'metric',
  setIsLoading: vi.fn(),
};

vi.mock('@/stores/useWeatherStore', () => ({
  useWeatherStore: (selector: any) => selector(stateMock),
  getState: () => stateMock,
}));

const londonSuggestion: CitySuggestion = {
  id: '1',
  city: { en: 'London', he: 'London' },
  country: { en: 'GB', he: 'GB' },
  lat: 51.5,
  lon: -0.12,
};

const londonWeather: CityWeather = {
  id: '1',
  lat: 51.5,
  lon: -0.12,
  currentEn: {
    current: {
      codeId: 1,
      temp: 20,
      feelsLike: 19,
      desc: 'Sunny',
      icon: '01d',
      humidity: 50,
      wind: 5,
      windDeg: 90,
      pressure: 1012,
      visibility: 10000,
      clouds: 0,
      sunrise: 1,
      sunset: 1,
      timezone: 7200,
    },
    forecast: [],
    lastUpdated: Date.now(),
    unit: 'metric',
    lat: 51.5,
    lon: -0.12,
  },
  currentHe: {
    current: {
      codeId: 1,
      temp: 20,
      feelsLike: 19,
      desc: 'Sunny',
      icon: '01d',
      humidity: 50,
      wind: 5,
      windDeg: 90,
      pressure: 1012,
      visibility: 10000,
      clouds: 0,
      sunrise: 1,
      sunset: 1,
      timezone: 7200,
    },
    forecast: [],
    lastUpdated: Date.now(),
    unit: 'metric',
    lat: 51.5,
    lon: -0.12,
  },
  lastUpdated: Date.now(),
  name: { en: 'London', he: 'London' },
  country: { en: 'GB', he: 'GB' },
};

const mockSuggestions = (...s: CitySuggestion[]) =>
  vi.spyOn(weatherModule, 'fetchSuggestions').mockResolvedValue(s);

const mockWeatherSuccess = (w: CityWeather) =>
  vi.spyOn(weatherModule, 'fetchWeather').mockResolvedValue(w);

const mockWeatherError = (e = new Error('API error')) =>
  vi.spyOn(weatherModule, 'fetchWeather').mockRejectedValue(e);

let onSelectMock: ReturnType<typeof vi.fn>;

const renderSearchBar = () => render(<SearchBar onSelect={onSelectMock} />);
const getInput = () => screen.getByPlaceholderText('Search for a city');
const typeSearch = async (value: string) => {
  await act(() => Promise.resolve()); // ensure debounce + updates
  fireEvent.change(getInput(), { target: { value } });
};

beforeEach(() => {
  onSelectMock = vi.fn();
  Object.values(stateMock).forEach((v) => {
    if (typeof v === 'function') v.mockClear();
  });
  stateMock.cities = [];
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SearchBar', () => {
  it('allows typing', async () => {
    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })
    expect(getInput()).toHaveValue('Lon');
  });

  it('does not show suggestions for less than 3 chars', async () => {
    renderSearchBar();
    await typeSearch('Lo');
    await waitFor(() => {
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  it('shows and clears suggestions', async () => {
    mockSuggestions(londonSuggestion);
    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })
    await screen.findByText(/London/);
    await typeSearch('');
    await waitFor(() => expect(screen.queryByText(/London/)).not.toBeInTheDocument());
  });

  it('selects suggestion via mouse and adds city', async () => {
    mockSuggestions(londonSuggestion);
    mockWeatherSuccess(londonWeather);
    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })
    await screen.findByText(/London/);
    await act(async () => {
      fireEvent.click(screen.getByText(/London/));
    })
    await waitFor(() => expect(stateMock.addCity).toHaveBeenCalled());
    expect(onSelectMock).toHaveBeenCalled();
  });

  it('selects suggestion via keyboard and adds city', async () => {
    mockSuggestions(londonSuggestion);
    mockWeatherSuccess(londonWeather);
    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })
    await screen.findByText(/London/);
    await act(async () => {
      fireEvent.keyDown(getInput(), { key: 'ArrowDown' });
    });
    await act(async () => {
      fireEvent.keyDown(getInput(), { key: 'Enter' });
    })
    await waitFor(() => expect(stateMock.addCity).toHaveBeenCalled());
  });

  it('avoids adding existing city', async () => {
    stateMock.cities = [londonWeather];
    mockSuggestions(londonSuggestion);
    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })
    await screen.findByText(/London/);
    await act(async () => {
      fireEvent.click(screen.getByText(/London/));
    })
    await waitFor(() => expect(stateMock.addCity).not.toHaveBeenCalled());
  });

  it('shows loader and handles weather error', async () => {
    mockSuggestions(londonSuggestion);
    mockWeatherError();
    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })
    await screen.findByText(/London/);
    await act(async () => {
      fireEvent.click(screen.getByText(/London/));
    })
    await waitFor(() => {
      expect(stateMock.setIsLoading).toHaveBeenCalledWith(true);
      expect(stateMock.setIsLoading).toHaveBeenCalledWith(false);
      expect(stateMock.showToast).toHaveBeenCalled();
    });
  });

  it('closes dropdown on outside click', async () => {
    mockSuggestions(londonSuggestion);
    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })
    await screen.findByText(/London/);

    const outside = document.createElement('div');
    document.body.appendChild(outside);

    await act(async () => {
      fireEvent.mouseDown(outside);
      return Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.queryByText(/London/)).not.toBeInTheDocument();
    });
  });
});

describe('SearchBar ­– extra UX', () => {
  it('✕ button clears text and dropdown', async () => {
    mockSuggestions(londonSuggestion);
    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })
    await screen.findByText(/London/);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    })
    expect(screen.getByRole('textbox')).toHaveValue('');
    await waitFor(() => {
      expect(screen.queryByText(/London/)).not.toBeInTheDocument();
    });
  });

  it('shows loading icon while suggestions pending', async () => {
    let resolve!: (v: CitySuggestion[]) => void;
    vi.spyOn(weatherModule, 'fetchSuggestions')
      .mockImplementation(() => new Promise(r => { resolve = r; }));

    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })

    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    await act(async () => {
      resolve([londonSuggestion]);
    })
    await screen.findByText(/London/);
  });

  it('index navigation stops at bounds', async () => {
    mockSuggestions(londonSuggestion);
    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })
    await screen.findByText(/London/);

    await act(async () => {
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowUp' });
    });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    })
    expect(screen.queryByText(/London/)).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });
    });
    await act(async () => {
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });
    });
  });

  it('RTL layout places icons on correct sides', async () => {
    render(<SearchBar onSelect={() => { }} />, { locale: 'he' });
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('text-right');
  });

  it('shows loader and then check icon when adding a city', async () => {
    mockSuggestions(londonSuggestion);
    
    let resolveWeather!: (w: CityWeather) => void;
    vi.spyOn(weatherModule, 'fetchWeather')
      .mockImplementation(() => new Promise(r => { resolveWeather = r; }));
  
    renderSearchBar();
    await act(async () => {
      await typeSearch('Lon');
    })
    await screen.findByText(/London/);
  
    act(() => {
      fireEvent.click(screen.getByText(/London/));
    });
  
    await waitFor(() => {
      expect(screen.getByTestId('suggestion-loader')).toBeInTheDocument();
    });
    
    act(() => {
      resolveWeather(londonWeather);
    });
    
    await waitFor(() => {
      expect(stateMock.addCity).toHaveBeenCalled();
    });
  });

  it('accessibility - input has accessible name', () => {
    renderSearchBar();
    expect(screen.getByRole('textbox')).toHaveAccessibleName('Search for a city');
  });
});