import { AppLocale } from "@/types/i18n";
import { CityInfo } from "@/types/reverse";


export async function fetchReverse(lat: number, lon: number, lang: AppLocale): Promise<CityInfo> {
  const response = await fetch(`/api/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&lang=${encodeURIComponent(lang)}`);
  if (!response.ok) throw new Error('Failed to fetch city suggestions');

  const data: CityInfo = await response.json();
  return data;
}
