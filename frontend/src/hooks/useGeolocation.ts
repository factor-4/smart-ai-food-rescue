import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the browser doesn't support geolocation
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    // Ask for position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        // User denied or something else went wrong
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: false, // faster, less battery drain
        timeout: 10000,            // wait max 10 seconds
        maximumAge: 60000,         // allow cached position up to 1 minute
      }
    );
  }, []);

  return { location, error, loading };
}