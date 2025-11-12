/**
 * Convert timezone string to offset in seconds
 * @param timezone - timezone string (e.g., 'Asia/Jerusalem')
 * @returns timezone offset in seconds
 */
export function getTimezoneOffset(timezone: string): number {
  if (!timezone) return 0;
  
  try {
    // Get current time
    const now = new Date();
    
    // Get the same moment in the target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0';
    
    // Create a date in the target timezone
    const tzDate = new Date(
      parseInt(getValue('year')),
      parseInt(getValue('month')) - 1,
      parseInt(getValue('day')),
      parseInt(getValue('hour')),
      parseInt(getValue('minute')),
      parseInt(getValue('second'))
    );
    
    // Calculate offset in seconds
    // The offset is the difference between the timezone time and UTC time
    const offset = (tzDate.getTime() - now.getTime()) / 1000;
    return offset;
  } catch {
    return 0;
  }
}

/**
 * Check if city timezone matches user's timezone
 * @param cityTz - city timezone (string or offset in seconds)
 * @param userTz - user timezone offset in seconds
 * @returns true if timezones are the same
 */
export function isSameTimezone(cityTz: string | number, userTz: number): boolean {
  // Handle undefined or null values
  if (cityTz === undefined || cityTz === null || userTz === undefined || userTz === null) {
    return false;
  }
  
  // If cityTz is a string (timezone name), compare by formatting the same time in both timezones
  if (typeof cityTz === 'string') {
    try {
      const now = new Date();
      
      // Format time in city timezone
      const cityTime = formatTimeWithTimezone(Math.floor(now.getTime() / 1000), cityTz);
      
      // Format time in user timezone (by calculating user's timezone name)
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const userTime = formatTimeWithTimezone(Math.floor(now.getTime() / 1000), userTimezone);
      
      // If times are the same, timezones are the same
      return cityTime === userTime;
    } catch {
      return false;
    }
  }
  
  // If cityTz is a number (offset), compare offsets
  return Math.abs(cityTz - userTz) <= 60; // Allow up to 1 minute difference for rounding
}

/**
 * Format time for a specific timezone offset - FIXED VERSION
 * @param timestamp - UTC timestamp in seconds
 * @param offset - timezone offset in seconds
 * @returns formatted time string (HH:MM)
 */
export function formatTimeWithOffset(timestamp: number, offsetSeconds: number, userOffsetSeconds?: number): string {
  // Validate inputs
  if (timestamp === null || timestamp === undefined || isNaN(timestamp) || isNaN(offsetSeconds)) {
    return '--:--';
  }

  // If user offset is provided and different from city offset, show both times
  if (userOffsetSeconds !== undefined && userOffsetSeconds !== offsetSeconds) {
    const cityTime = new Date(timestamp * 1000 + offsetSeconds * 1000);
    const userTime = new Date(timestamp * 1000 + userOffsetSeconds * 1000);
    
    const cityHours = cityTime.getUTCHours().toString().padStart(2, '0');
    const cityMinutes = cityTime.getUTCMinutes().toString().padStart(2, '0');
    const userHours = userTime.getUTCHours().toString().padStart(2, '0');
    const userMinutes = userTime.getUTCMinutes().toString().padStart(2, '0');
    
    return `${cityHours}:${cityMinutes} (${userHours}:${userMinutes})`;
  }

  const date = new Date(timestamp * 1000 + offsetSeconds * 1000);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '--:--';
  }

  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * Format time for Open-Meteo timezone string
 * @param timestamp - UTC timestamp in seconds
 * @param timezone - timezone string (e.g., 'Asia/Jerusalem')
 * @returns formatted time string (HH:MM)
 */
export function formatTimeWithTimezone(timestamp: number, timezone: string): string {
  if (timestamp === null || timestamp === undefined || isNaN(timestamp) || !timezone) {
    return '--:--';
  }

  try {
    const date = new Date(timestamp * 1000);
    const timeString = date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return timeString;
  } catch {
    return '--:--';
  }
}

/**
 * Format date for a specific timezone offset
 * @param timestamp - UTC timestamp in seconds
 * @param locale - locale string (e.g., 'he', 'en')
 * @param offsetSec - timezone offset in seconds (optional)
 * @returns formatted date string
 */
export function formatDate(timestamp: number, locale: string, offsetSec?: number): string {
  const utcDate = new Date(timestamp * 1000);

  if (offsetSec) {
    // Calculate city time by adding offset
    const cityTime = new Date(utcDate.getTime() + offsetSec * 1000);

    // Format using local time since we already calculated the city time
    
    // For Hebrew, show day with Hebrew letter
    if (locale === 'he') {
      const dayOfWeek = cityTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hebrewDays = ['יום א\'', 'יום ב\'', 'יום ג\'', 'יום ד\'', 'יום ה\'', 'יום ו\'', 'יום ש\''];
      return hebrewDays[dayOfWeek];
    }
    // For English, show day number and abbreviated day
    const dayNumber = cityTime.getDate();
    const shortWeekday = cityTime.toLocaleDateString(locale, { weekday: 'short' });
    return `${dayNumber} ${shortWeekday}`;
  }

  // No offset - use user's local time
  
  // For Hebrew, show day with Hebrew letter
  if (locale === 'he') {
    const dayOfWeek = utcDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hebrewDays = ['יום א\'', 'יום ב\'', 'יום ג\'', 'יום ד\'', 'יום ה\'', 'יום ו\'', 'יום ש\''];
    return hebrewDays[dayOfWeek];
  }
  // For English, show day number and abbreviated day
  const dayNumber = utcDate.getDate();
  const shortWeekday = utcDate.toLocaleDateString(locale, { weekday: 'short' });
  return `${dayNumber} ${shortWeekday}`;
}

