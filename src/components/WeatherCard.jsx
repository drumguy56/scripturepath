import { useEffect, useState } from 'react';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  MapPin,
  Moon,
  Sun,
} from 'lucide-react';
import { functions } from '@/api/client';

// Used when the visitor declines (or the browser has no) location access.
const FALLBACK = { latitude: 39.7392, longitude: -104.9903 };

function requestPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 30 * 60 * 1000 }
    );
  });
}

function iconFor(code, isDay) {
  if (code === 0) return isDay ? Sun : Moon;
  if (code === 1 || code === 2) return CloudSun;
  if (code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code === 85 || code === 86) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

export default function WeatherCard() {
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    (async () => {
      const position = (await requestPosition()) || FALLBACK;
      try {
        const response = await functions.invoke('getWeather', position);
        if (active && response.data && !response.data.error) setWeather(response.data);
      } finally {
        if (active) setStatus('ready');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (status === 'loading') {
    return <div className="mt-4 h-[86px] animate-pulse rounded-[16px] bg-secondary" />;
  }
  if (!weather) return null;

  const Icon = iconFor(weather.code, weather.is_day);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-3 rounded-[16px] border border-border/80 bg-card px-7 py-5 sm:px-10">
      <div className="flex items-center gap-4">
        <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
        <p className="font-heading text-[30px] leading-none">{weather.temperature}°</p>
      </div>

      <div>
        <p className="text-[13.5px] text-foreground/85">{weather.condition}</p>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          <MapPin className="h-3 w-3" /> {weather.place}
        </p>
      </div>

      <p className="ml-auto text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        Feels {weather.feels_like}° · H {weather.high}° · L {weather.low}°
      </p>
    </div>
  );
}