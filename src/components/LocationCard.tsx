import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Mountain, TreePine, Castle, Camera, Star } from "lucide-react";
import destinationBg from "@/assets/destination-bg.jpg";

interface LocationData {
  latitude: number;
  longitude: number;
  country?: string;
  state?: string;
  city?: string;
}

interface DestinationCardProps {
  locationData: LocationData | null;
  isLoading: boolean;
}

export const DestinationCard = ({ locationData, isLoading }: DestinationCardProps) => {
  if (isLoading) {
    return (
      <Card className="explorer-card">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Compass className="h-5 w-5 text-primary animate-spin" />
            🧭 Discovering Your Adventure Zone...
          </CardTitle>
          <CardDescription>Finding the perfect exploration spot for you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-primary/20 to-transparent rounded animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-accent/20 to-transparent rounded animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-primary/20 to-transparent rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!locationData) {
    return (
      <Card className="explorer-card">
        <div 
          className="absolute inset-0 opacity-10 rounded-3xl"
          style={{
            backgroundImage: `url(${destinationBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <CardHeader className="text-center relative z-10">
          <CardTitle className="flex items-center justify-center gap-2">
            <Mountain className="h-5 w-5 text-muted-foreground" />
            🏔️ Ready for Adventure?
          </CardTitle>
          <CardDescription>
            Discover amazing destinations and hidden gems around you!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="destination-card animate-float relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url(${destinationBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <CardHeader className="text-center relative z-10">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Star className="h-5 w-5 fill-primary" />
          ✨ Your Adventure Destination
        </CardTitle>
        <CardDescription>
          Perfect exploration spot discovered just for you!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="p-2 rounded-full gradient-adventure">
              <Compass className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">📍 Coordinates</p>
              <p className="text-xs text-muted-foreground">
                {locationData.latitude.toFixed(4)}°, {locationData.longitude.toFixed(4)}°
              </p>
            </div>
          </div>
          
          {locationData.city && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
              <div className="p-2 rounded-full bg-accent/20">
                <Castle className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold">🏛️ Local Area</p>
                <p className="text-xs text-muted-foreground">{locationData.city}</p>
              </div>
            </div>
          )}
          
          {locationData.state && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/10">
              <div className="p-2 rounded-full bg-success/20">
                <TreePine className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold">🌲 Region</p>
                <p className="text-xs text-muted-foreground">{locationData.state}</p>
              </div>
            </div>
          )}
          
          {locationData.country && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="p-2 rounded-full gradient-primary">
                <Mountain className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold">🌍 Country</p>
                <p className="text-xs text-muted-foreground">{locationData.country}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <Camera className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">📸 Perfect for photos and memories!</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Keep the old export name for compatibility
export const LocationCard = DestinationCard;