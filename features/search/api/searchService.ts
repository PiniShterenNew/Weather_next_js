/**
 * Search API Service
 * Handles search functionality with validation
 */

import { z } from 'zod';
import { SearchSuggestion, SearchInput, SearchResponse } from '../types';
import { AppLocale } from '@/types/i18n';

// Zod schemas for validation
const SearchSuggestionSchema = z.object({
  id: z.string(),
  city: z.object({
    he: z.string(),
    en: z.string(),
  }),
  country: z.object({
    he: z.string(),
    en: z.string(),
  }),
  lat: z.number(),
  lon: z.number(),
});

const SearchInputSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  locale: z.enum(['he', 'en']),
});

// Search API service class
export class SearchService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Search for city suggestions
   */
  async searchCities(input: SearchInput): Promise<SearchResponse> {
    try {
      // Validate input
      const validatedInput = SearchInputSchema.parse(input);

      const params = new URLSearchParams({
        q: validatedInput.query,
        lang: validatedInput.locale,
      });

      const response = await fetch(`${this.baseUrl}/suggest?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      
      // Validate response data
      const validatedData = z.array(SearchSuggestionSchema).parse(data);

      return {
        success: true,
        data: validatedData,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get reverse geocoding for coordinates
   */
  async reverseGeocode(lat: number, lon: number, locale: AppLocale): Promise<SearchResponse> {
    try {
      // Validate coordinates
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return {
          success: false,
          error: 'Invalid coordinates',
        };
      }

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        lang: locale,
      });

      const response = await fetch(`${this.baseUrl}/reverse?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      
      // Validate response data
      const validatedData = SearchSuggestionSchema.parse(data);

      return {
        success: true,
        data: [validatedData],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Validate search suggestion data
   */
  validateSearchSuggestion(data: unknown): data is SearchSuggestion {
    try {
      SearchSuggestionSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();
