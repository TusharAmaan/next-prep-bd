"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LocationTracker() {
  
  useEffect(() => {
    const trackLocation = async () => {
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 2. Check existing profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('location_updated_at, city')
        .eq('id', user.id)
        .single();

      // 3. Logic: Update only if 'city' is missing OR data is older than 7 days
      const daysSinceUpdate = profile?.location_updated_at 
        ? (new Date().getTime() - new Date(profile.location_updated_at).getTime()) / (1000 * 3600 * 24)
        : 999;

      if (!profile?.city || daysSinceUpdate > 7) {
        requestAndSaveLocation(user.id);
      }
    };

    trackLocation();
  }, []);

  const requestAndSaveLocation = (userId: string) => {
    // This line triggers the Browser's "Allow Location?" prompt
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        // 4. Reverse Geocoding (Convert Coords -> City Name)
        // Using BigDataCloud's free client-side API
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();

        // Extract readable location
        const city = data.city || data.locality || "Unknown City";
        const country = data.countryName || "";
        const readableLocation = `${city}, ${country}`;

        // 5. Save to Supabase (Secretly/Background)
        await supabase
          .from('profiles')
          .update({ 
            city: readableLocation,
            location_updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        console.log("Location silently updated:", readableLocation);

      } catch (error) {
        console.error("Error fetching city:", error);
      }
    });
  };

  return null; // This component is invisible
}