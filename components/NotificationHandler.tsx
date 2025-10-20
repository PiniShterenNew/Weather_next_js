'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeatherStore } from '@/store/useWeatherStore';

interface NotificationData {
  city: string;
  temperature: number;
  description: string;
  timestamp: number;
  timeOfDay?: string;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  iconCode?: string;
}

export default function NotificationHandler() {
  const router = useRouter();
  const showToast = useWeatherStore((state) => state.showToast);

  useEffect(() => {
    // Listen for messages from Service Worker
    const handleMessage = (event: MessageEvent) => {
      // eslint-disable-next-line no-console
      console.log('Received message from Service Worker:', event.data);
      
      if (event.data?.type === 'NOTIFICATION_CLICKED') {
        const data: NotificationData = event.data.data;
        // eslint-disable-next-line no-console
        console.log('Notification clicked, data:', data);
        
        // Play notification sound
        playNotificationSound('default');
        
        // Show enhanced toast with weather info
        const tempText = Math.round(data.temperature);
        const timeText = data.timeOfDay === 'morning' ? 'בוקר' : data.timeOfDay === 'evening' ? 'ערב' : '';
        const greeting = timeText ? `${timeText} טוב! ` : '';
        
        let weatherDetails = `${data.city}: ${tempText}°C, ${data.description}`;
        if (data.humidity && data.windSpeed) {
          weatherDetails += ` | לחות: ${data.humidity}% | רוח: ${Math.round(data.windSpeed)} קמ״ש`;
        }
        
        showToast({
          message: `${greeting}${weatherDetails}`,
          type: 'info',
          duration: 6000,
        });
        
        // Navigate to main page to show weather info
        router.push('/');
      } else if (event.data?.type === 'PLAY_NOTIFICATION_SOUND') {
        const soundType = event.data.data?.type || 'weather';
        // eslint-disable-next-line no-console
        console.log('Playing notification sound for type:', soundType);
        playNotificationSound(soundType);
      }
    };

    // Set up service worker message listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, [router, showToast]);

  return null; // This component doesn't render anything
}

// Function to play notification sound based on type
function playNotificationSound(type: 'morning' | 'evening' | 'weather' | 'default' = 'default') {
  try {
    // Create audio context for notification sound
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    const playTone = (frequency: number, startTime: number, duration: number, volume: number = 0.3) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Set volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration);
      
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };

    switch (type) {
      case 'morning':
        // Pleasant morning sound - ascending tone
        playTone(600, 0, 0.2, 0.25);
        playTone(800, 0.15, 0.2, 0.25);
        playTone(1000, 0.3, 0.3, 0.3);
        break;
        
      case 'evening':
        // Calm evening sound - descending tone
        playTone(800, 0, 0.2, 0.25);
        playTone(600, 0.15, 0.2, 0.25);
        playTone(400, 0.3, 0.4, 0.3);
        break;
        
      case 'weather':
        // Quick weather alert sound
        playTone(800, 0, 0.15, 0.2);
        playTone(1200, 0.1, 0.15, 0.2);
        playTone(800, 0.2, 0.15, 0.2);
        break;
        
      default:
        // Default notification sound
        playTone(800, 0, 0.3, 0.3);
        break;
    }
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Could not play notification sound:', error);
  }
}
