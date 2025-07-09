import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils/renderWithIntl';
import { SuggestionsList } from './SuggestionsList';
import type { CitySuggestion } from '@/types/suggestion';

const mockSuggestions: CitySuggestion[] = [
    {
        id: '1',
        city: { en: 'London', he: 'לונדון' },
        country: { en: 'GB', he: 'בריטניה' },
        lat: 51.5,
        lon: -0.12,
    },
    {
        id: '2',
        city: { en: 'Paris', he: 'פריז' },
        country: { en: 'FR', he: 'צרפת' },
        lat: 48.8566,
        lon: 2.3522,
    },
];

const handleSelect = vi.fn();

beforeEach(() => {
    handleSelect.mockClear();
});

describe('SuggestionsList', () => {
    it('renders loading state when loading is true', () => {
        render(
            <SuggestionsList
                suggestions={[]}
                loading
                hasSearched={false}
                selectedIndex={-1}
                isAdding={null}
                handleSelect={handleSelect}
            />
        );
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders list of suggestions when available', () => {
        render(
            <SuggestionsList
                suggestions={mockSuggestions}
                loading={false}
                hasSearched
                selectedIndex={1}
                isAdding={null}
                handleSelect={handleSelect}
            />
        );
        expect(screen.getByText('London')).toBeInTheDocument();
        expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    it('renders empty state when hasSearched is true and no suggestions', () => {
        render(
            <SuggestionsList
                suggestions={[]}
                loading={false}
                hasSearched
                selectedIndex={-1}
                isAdding={null}
                handleSelect={handleSelect}
            />
        );
        expect(screen.getByText('No cities found')).toBeInTheDocument();
        expect(screen.getByText('Try searching with a different spelling or city name')).toBeInTheDocument();
    });

    it('renders default prompt when nothing has been searched yet', () => {
        render(
            <SuggestionsList
                suggestions={[]}
                loading={false}
                hasSearched={false}
                selectedIndex={-1}
                isAdding={null}
                handleSelect={handleSelect}
            />
        );
        expect(screen.getByText('Type to search')).toBeInTheDocument();
        expect(screen.getByText('Start typing to search')).toBeInTheDocument();
    });
});
