import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, UserX, Eye, MapPin, Clock, Wifi, WifiOff, Trash2, UserMinus } from "lucide-react";

interface TrackedUser {
  userId: string;
  lastSeen: string;
  location: string;
  coordinates: string;
  trackingDuration: number;
  isActive: boolean;
  deviceInfo: string;
  sessionStart: string;
}

export const AdminDashboard = () => {
  const [trackedUsers, setTrackedUsers] = useState<TrackedUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [stopCommand, setStopCommand] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load tracked users from localStorage (simulated real-time data)
    const loadTrackedUsers = () => {
      const saved = localStorage.getItem('admin_tracked_users');
      if (saved) {
        setTrackedUsers(JSON.parse(saved));
      }
    };

    loadTrackedUsers();
    // Refresh every 30 seconds to simulate real-time updates
    const interval = setInterval(loadTrackedUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const addMockUsers = () => {
    const mockUsers: TrackedUser[] = [
      {
        userId: 'USR-001-ADV',
        lastSeen: new Date().toISOString(),
        location: 'Lucknow, Uttar Pradesh, India',
        coordinates: '26.7795°, 80.9760°',
        trackingDuration: 7200, // 2 hours
        isActive: true,
        deviceInfo: 'Chrome on Android',
        sessionStart: new Date(Date.now() - 7200000).toISOString()
      },
      {
        userId: 'USR-002-EXP',
        lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        location: 'Mumbai, Maharashtra, India',
        coordinates: '19.0760°, 72.8777°',
        trackingDuration: 14400, // 4 hours
        isActive: true,
        deviceInfo: 'Safari on iPhone',
        sessionStart: new Date(Date.now() - 14400000).toISOString()
      },
      {
        userId: 'USR-003-TRK',
        lastSeen: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        location: 'Delhi, India',
        coordinates: '28.6139°, 77.2090°',
        trackingDuration: 3600, // 1 hour
        isActive: false,
        deviceInfo: 'Firefox on Windows',
        sessionStart: new Date(Date.now() - 5400000).toISOString()
      }
    ];
    
    setTrackedUsers(mockUsers);
    localStorage.setItem('admin_tracked_users', JSON.stringify(mockUsers));
    toast({
      title: "📊 Sample Data Loaded",
      description: "Mock tracking data added for demonstration.",
    });
  };

  const stopUserTracking = async (userId: string) => {
    try {
      // Send stop command via form endpoint
      const formData = new FormData();
      formData.append('command_type', 'stop_tracking');
      formData.append('target_user_id', userId);
      formData.append('admin_command', 'STOP_TRACKING_24H');
      formData.append('timestamp', new Date().toISOString());
      formData.append('admin_session', 'admin_control_panel');

      await fetch('https://formspree.io/f/xwpbjvky', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      // Update local state
      setTrackedUsers(prev => prev.map(user => 
        user.userId === userId 
          ? { ...user, isActive: false, lastSeen: new Date().toISOString() }
          : user
      ));

      toast({
        title: "🛑 Tracking Stopped",
        description: `Successfully stopped tracking for user ${userId}`,
      });
    } catch (error) {
      toast({
        title: "❌ Command Failed", 
        description: "Failed to send stop command. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendCustomCommand = async () => {
    if (!selectedUserId || !stopCommand) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please select a user and enter a command.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('command_type', 'custom_admin_command');
      formData.append('target_user_id', selectedUserId);
      formData.append('admin_command', stopCommand);
      formData.append('timestamp', new Date().toISOString());
      formData.append('admin_session', 'custom_control');

      await fetch('https://formspree.io/f/xwpbjvky', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      toast({
        title: "📡 Command Sent",
        description: `Custom command sent to user ${selectedUserId}`,
      });

      setStopCommand('');
      setSelectedUserId('');
    } catch (error) {
      toast({
        title: "❌ Command Failed",
        description: "Failed to send custom command.",
        variant: "destructive",
      });
    }
  };

  const removeUser = async (userId: string) => {
    try {
      // Send remove command via form endpoint
      const formData = new FormData();
      formData.append('command_type', 'remove_user');
      formData.append('target_user_id', userId);
      formData.append('admin_command', 'REMOVE_USER_PERMANENTLY');
      formData.append('timestamp', new Date().toISOString());
      formData.append('admin_session', 'admin_control_panel');

      await fetch('https://formspree.io/f/xwpbjvky', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      // Remove from local state
      setTrackedUsers(prev => prev.filter(user => user.userId !== userId));
      
      // Update localStorage
      const updatedUsers = trackedUsers.filter(user => user.userId !== userId);
      localStorage.setItem('admin_tracked_users', JSON.stringify(updatedUsers));

      toast({
        title: "🗑️ User Removed",
        description: `Successfully removed user ${userId} from tracking`,
      });
    } catch (error) {
      toast({
        title: "❌ Remove Failed", 
        description: "Failed to remove user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const clearAllUsers = () => {
    setTrackedUsers([]);
    localStorage.removeItem('admin_tracked_users');
    toast({
      title: "🗑️ Data Cleared",
      description: "All tracking data has been cleared.",
    });
  };

  return (
    <Card className="explorer-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            👥 Active User Tracking Dashboard
          </span>
          <div className="flex gap-2">
            <Button onClick={addMockUsers} variant="outline" size="sm">
              📊 Load Sample Data
            </Button>
            <Button onClick={clearAllUsers} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Monitor and control live user tracking sessions across all devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Active</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              {trackedUsers.filter(u => u.isActive).length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Inactive</span>
            </div>
            <p className="text-xl font-bold text-red-600">
              {trackedUsers.filter(u => !u.isActive).length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Total</span>
            </div>
            <p className="text-xl font-bold text-blue-600">{trackedUsers.length}</p>
          </div>
        </div>

        {/* Tracked Users List */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            🎯 Currently Tracked Users
          </h4>
          
          {trackedUsers.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              📭 No users currently being tracked. Click "Load Sample Data" to see demo.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trackedUsers.map((user) => (
                <div 
                  key={user.userId}
                  className={`p-4 rounded-xl border transition-all ${
                    user.isActive 
                      ? 'bg-green-50 border-green-200 shadow-sm' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {user.isActive ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        <span className="font-mono text-sm font-semibold">{user.userId}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.isActive ? '🟢 LIVE' : '🔴 OFFLINE'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>📍 {user.location}</p>
                        <p>🗺️ {user.coordinates}</p>
                        <p>⏱️ Duration: {formatDuration(user.trackingDuration)}</p>
                        <p>📱 {user.deviceInfo}</p>
                        <p>🕐 Last Seen: {new Date(user.lastSeen).toLocaleTimeString()}</p>
                      </div>
                     </div>
                     <div className="flex flex-col gap-2">
                       <Button
                         onClick={() => stopUserTracking(user.userId)}
                         variant="destructive"
                         size="sm"
                         disabled={!user.isActive}
                         className="text-xs"
                       >
                         <UserX className="h-3 w-3" />
                         Stop
                       </Button>
                       <Button
                         onClick={() => removeUser(user.userId)}
                         variant="outline"
                         size="sm"
                         className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                       >
                         <UserMinus className="h-3 w-3" />
                         Remove
                       </Button>
                       <Button
                         onClick={() => {
                           const mapUrl = `https://www.google.com/maps?q=${user.coordinates.replace('°', '').replace(' ', '')}`;
                           window.open(mapUrl, '_blank');
                         }}
                         variant="outline"
                         size="sm"
                         className="text-xs"
                       >
                         <MapPin className="h-3 w-3" />
                         Map
                       </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Command Section */}
        <div className="space-y-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <h4 className="font-semibold flex items-center gap-2 text-yellow-800">
            <Clock className="h-4 w-4" />
            ⚡ Remote Control Commands
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userSelect">🎯 Select User to Control</Label>
              <select
                id="userSelect"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="">Choose a user...</option>
                {trackedUsers.filter(u => u.isActive).map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.userId} - {user.location}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="commandInput">📡 Command</Label>
              <Input
                id="commandInput"
                value={stopCommand}
                onChange={(e) => setStopCommand(e.target.value)}
                placeholder="e.g., STOP_TRACKING, PAUSE_SESSION"
                className="bg-white"
              />
            </div>
          </div>
          
          <Button 
            onClick={sendCustomCommand}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            disabled={!selectedUserId || !stopCommand}
          >
            📡 Send Remote Command
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => {
              trackedUsers.filter(u => u.isActive).forEach(user => {
                stopUserTracking(user.userId);
              });
            }}
            variant="destructive"
            className="flex-1"
          >
            🛑 Stop All Active Tracking
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="bg-white/80 hover:bg-white"
          >
            🔄 Refresh Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};