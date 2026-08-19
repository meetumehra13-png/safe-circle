import { useState, useEffect, useCallback } from 'react';
import type { LocationData } from '../types';

interface GeolocationState {
  location: LocationData | null;
  error: string | null;
  loading: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
    permissionState: 'unknown',
  });

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const coords = position.coords;
    const locationData: LocationData = {
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      heading: coords.heading,
      speed: coords.speed,
      timestamp: position.timestamp,
    };

    setState({
      location: locationData,
      error: null,
      loading: false,
      permissionState: 'granted',
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMsg = 'Unable to retrieve location';
    let permState: GeolocationState['permissionState'] = 'unknown';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMsg = 'Location permission denied by user or browser.';
        permState = 'denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMsg = 'Location information is unavailable on this device.';
        break;
      case error.TIMEOUT:
        errorMsg = 'The request to get location timed out.';
        break;
    }

    // Set location to null on error - NO hardcoded fallback coordinates!
    setState(prev => ({
      ...prev,
      error: errorMsg,
      loading: false,
      permissionState: permState,
      location: null,
    }));
  }, []);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
        location: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [handleSuccess, handleError]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: 'Geolocation is not supported by your browser.',
        loading: false,
        permissionState: 'denied',
      });
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setState(prev => ({ ...prev, permissionState: result.state }));
        result.onchange = () => {
          setState(prev => ({ ...prev, permissionState: result.state }));
        };
      }).catch(() => {
        // Ignored permission query error
      });
    }

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [handleSuccess, handleError]);

  return {
    ...state,
    refreshLocation,
  };
}
