import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Users, Share2, MessageCircle, Mail, Copy, LogOut, UserCheck, Gift } from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";

const countryOptions = [
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine" },
  { code: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+32", flag: "🇧🇪", name: "Belgium" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+43", flag: "🇦🇹", name: "Austria" },
  { code: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "+358", flag: "🇫🇮", name: "Finland" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+30", flag: "🇬🇷", name: "Greece" },
  { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+36", flag: "🇭🇺", name: "Hungary" },
  { code: "+40", flag: "🇷🇴", name: "Romania" },
  { code: "+359", flag: "🇧🇬", name: "Bulgaria" },
  { code: "+385", flag: "🇭🇷", name: "Croatia" },
  { code: "+386", flag: "🇸🇮", name: "Slovenia" },
  { code: "+421", flag: "🇸🇰", name: "Slovakia" },
  { code: "+372", flag: "🇪🇪", name: "Estonia" },
  { code: "+371", flag: "🇱🇻", name: "Latvia" },
  { code: "+370", flag: "🇱🇹", name: "Lithuania" },
  { code: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "+98", flag: "🇮🇷", name: "Iran" },
  { code: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "+961", flag: "🇱🇧", name: "Lebanon" },
  { code: "+963", flag: "🇸🇾", name: "Syria" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+95", flag: "🇲🇲", name: "Myanmar" },
  { code: "+855", flag: "🇰🇭", name: "Cambodia" },
  { code: "+856", flag: "🇱🇦", name: "Laos" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "+51", flag: "🇵🇪", name: "Peru" },
  { code: "+58", flag: "🇻🇪", name: "Venezuela" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "+595", flag: "🇵🇾", name: "Paraguay" },
  { code: "+212", flag: "🇲🇦", name: "Morocco" },
  { code: "+213", flag: "🇩🇿", name: "Algeria" },
  { code: "+216", flag: "🇹🇳", name: "Tunisia" },
  { code: "+218", flag: "🇱🇾", name: "Libya" },
  { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+250", flag: "🇷🇼", name: "Rwanda" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+225", flag: "🇨🇮", name: "Ivory Coast" },
  { code: "+221", flag: "🇸🇳", name: "Senegal" },
  { code: "+220", flag: "🇬🇲", name: "Gambia" },
  { code: "+224", flag: "🇬🇳", name: "Guinea" },
  { code: "+226", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "+227", flag: "🇳🇪", name: "Niger" },
  { code: "+228", flag: "🇹🇬", name: "Togo" },
  { code: "+229", flag: "🇧🇯", name: "Benin" },
  { code: "+230", flag: "🇲🇺", name: "Mauritius" },
  { code: "+231", flag: "🇱🇷", name: "Liberia" },
  { code: "+232", flag: "🇸🇱", name: "Sierra Leone" },
  { code: "+235", flag: "🇹🇩", name: "Chad" },
  { code: "+236", flag: "🇨🇫", name: "Central African Republic" },
  { code: "+237", flag: "🇨🇲", name: "Cameroon" },
  { code: "+238", flag: "🇨🇻", name: "Cape Verde" },
  { code: "+239", flag: "🇸🇹", name: "São Tomé" },
  { code: "+240", flag: "🇬🇶", name: "Equatorial Guinea" },
  { code: "+241", flag: "🇬🇦", name: "Gabon" },
  { code: "+242", flag: "🇨🇬", name: "Republic of Congo" },
  { code: "+243", flag: "🇨🇩", name: "DR Congo" },
  { code: "+244", flag: "🇦🇴", name: "Angola" },
  { code: "+245", flag: "🇬🇼", name: "Guinea-Bissau" },
  { code: "+246", flag: "🇮🇴", name: "British Indian Ocean Territory" },
  { code: "+248", flag: "🇸🇨", name: "Seychelles" },
  { code: "+249", flag: "🇸🇩", name: "Sudan" },
  { code: "+252", flag: "🇸🇴", name: "Somalia" },
  { code: "+253", flag: "🇩🇯", name: "Djibouti" },
  { code: "+257", flag: "🇧🇮", name: "Burundi" },
  { code: "+258", flag: "🇲🇿", name: "Mozambique" },
  { code: "+260", flag: "🇿🇲", name: "Zambia" },
  { code: "+261", flag: "🇲🇬", name: "Madagascar" },
  { code: "+262", flag: "🇷🇪", name: "Reunion" },
  { code: "+263", flag: "🇿🇼", name: "Zimbabwe" },
  { code: "+264", flag: "🇳🇦", name: "Namibia" },
  { code: "+265", flag: "🇲🇼", name: "Malawi" },
  { code: "+266", flag: "🇱🇸", name: "Lesotho" },
  { code: "+267", flag: "🇧🇼", name: "Botswana" },
  { code: "+268", flag: "🇸🇿", name: "Eswatini" },
  { code: "+269", flag: "🇰🇲", name: "Comoros" },
  { code: "+290", flag: "🇸🇭", name: "Saint Helena" },
];

export const TravelBuddyPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [shareLink, setShareLink] = useState('');
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsLoggedIn(true);
      setShowLogin(false);
      setPassword('');
      toast({
        title: "🎉 Welcome, Travel Guide!",
        description: "Ready to share amazing destinations with friends!",
        variant: "default",
      });
    } else {
      toast({
        title: "🚫 Access Denied",
        description: "Wrong password! Only travel guides allowed.",
        variant: "destructive",
      });
    }
  };

  const generateLink = () => {
    const link = window.location.href;
    setShareLink(link);
    toast({
      title: "🔗 Share Link Ready!",
      description: "Adventure destination link generated successfully.",
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast({
        title: "📋 Copied!",
        description: "Adventure link copied to clipboard.",
      });
    } catch {
      toast({
        title: "❌ Copy Failed",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  const sendWhatsApp = () => {
    const cleanCountryCode = countryCode.replace('+', '');
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    let url = 'https://wa.me/';
    if (cleanNumber) {
      url += cleanCountryCode + cleanNumber + '?text=';
    } else {
      url += '?text=';
    }
    url += encodeURIComponent(`🗺️ Hey! Check out this amazing adventure destination I found! ${shareLink}`);
    window.open(url, '_blank');
  };

  const sendSMS = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const url = `sms:${countryCode}${cleanNumber}?body=${encodeURIComponent(`🏔️ Amazing adventure spot discovered! Check it out: ${shareLink}`)}`;
    window.open(url, '_blank');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPassword('');
    setPhoneNumber('');
    setShareLink('');
    toast({
      title: "👋 Logged Out",
      description: "Thanks for being an awesome travel guide!",
    });
  };

  if (!isLoggedIn && !showLogin) {
    return (
      <Card className="explorer-card">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Gift className="h-5 w-5 text-accent" />
            🎁 Share the Adventure
          </CardTitle>
          <CardDescription>
            Become a travel guide and share amazing destinations with friends!
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            variant="admin" 
            onClick={() => setShowLogin(true)}
            className="w-full bg-accent hover:bg-accent/90"
          >
            <UserCheck className="h-4 w-4" />
            Join as Travel Guide
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isLoggedIn && showLogin) {
    return (
      <Card className="explorer-card">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            🧑‍✈️ Travel Guide Login
          </CardTitle>
          <CardDescription>Enter your guide credentials to start sharing adventures</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Guide Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your guide password"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="admin" className="flex-1">
                Login
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowLogin(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="explorer-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            🗺️ Travel Guide Dashboard
          </span>
          <Button variant="destructive" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Share this amazing destination with fellow adventurers via WhatsApp or SMS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sharing" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sharing">📤 Share Adventures</TabsTrigger>
            <TabsTrigger value="tracking">👥 Track Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sharing" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="country">🌍 Select Country</Label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="bg-white/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-border shadow-lg z-50">
                    {countryOptions.map((option) => (
                      <SelectItem key={option.code} value={option.code} className="cursor-pointer hover:bg-accent/10">
                        {option.flag} {option.code} ({option.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="phone">📱 Friend's Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter phone number"
                  maxLength={15}
                  className="bg-white/50"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={generateLink} 
                variant="admin" 
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold"
              >
                <Share2 className="h-4 w-4" />
                🚀 Generate Adventure Link
              </Button>
              
              {shareLink && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      value={shareLink} 
                      readOnly 
                      className="flex-1 text-xs bg-white/50"
                      placeholder="Adventure link will appear here..."
                    />
                    <Button variant="outline" size="sm" onClick={copyLink} className="bg-white/80 hover:bg-white">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="success" onClick={sendWhatsApp} className="bg-green-500 hover:bg-green-600 text-white">
                      <MessageCircle className="h-4 w-4" />
                      📱 WhatsApp
                    </Button>
                    <Button variant="outline" onClick={sendSMS} className="bg-blue-50 hover:bg-blue-100 border-blue-200">
                      <Mail className="h-4 w-4" />
                      💬 SMS
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="tracking">
            <AdminDashboard />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Keep the old export name for compatibility
export const AdminPanel = TravelBuddyPanel;