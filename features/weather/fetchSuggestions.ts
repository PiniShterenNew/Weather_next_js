import { CitySuggestion } from '@/types/suggestion';

export async function fetchSuggestions(query: string): Promise<CitySuggestion[]> {
  const response = await fetch(`/api/suggest?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Failed to fetch city suggestions');

  const data: CitySuggestion[] = await response.json();
  return data;
}
