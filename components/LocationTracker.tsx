"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LocationTracker() {
  
  useEffect(() => {
    const trackLocation = async () => {
      // 1. Check LocalStorage first (The "Suspicious" Fix)
      // This ensures we strictly obey the 7-day rule even if the user denied permission previously.
      const lastPromptStr = localStorage.getItem("last_location_prompt");
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

      if (lastPromptStr) {
        const lastPrompt = parseInt(lastPromptStr);
        // If less than 7 days have passed since we LAST ASKED, stop here.
        if (now - lastPrompt < SEVEN_DAYS_MS) {
          return; 
        }
      }

      // 2. Mark this attempt in LocalStorage immediately
      // We do this BEFORE asking. This prevents the loop if the user denies/ignores the prompt.
      localStorage.setItem("last_location_prompt", now.toString());

      // 3. Check if user is logged in (Don't track guests)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 4. Request Location from Browser
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 5. Reverse Geocoding
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();

          // Extract readable location
          const city = data.city || data.locality || "Unknown City";
          const country = data.countryName || "";
          const readableLocation = `${city}, ${country}`;

          // 6. Save to Supabase
          await supabase
            .from('profiles')
            .update({ 
              city: readableLocation,
              location_updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          console.log("Location updated:", readableLocation);

        } catch (error) {
          console.error("Error fetching city:", error);
        }
      }, (error) => {
          // If user denies, we catch it here. 
          // Since we already set the localStorage item above, we won't ask again for 7 days.
          console.log("Location permission denied or unavailable.");
      });
    };

    trackLocation();
  }, []);

  return null; // Invisible component
}