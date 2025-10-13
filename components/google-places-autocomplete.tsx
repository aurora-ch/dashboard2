"use client";
import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  website?: string;
  phone?: string;
  types: string[];
}

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export function GooglePlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Search for your business...",
  className = "",
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        setOptions({
          key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          v: "weekly",
          libraries: ["places"],
        });

        await importLibrary("places");
        setIsLoaded(true);

        if (inputRef.current && !autocompleteRef.current) {
          autocompleteRef.current = new google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ["establishment"],
              fields: ["place_id", "name", "formatted_address", "website", "formatted_phone_number", "types"],
            }
          );

          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.place_id) {
              const result: PlaceResult = {
                place_id: place.place_id,
                name: place.name || "",
                formatted_address: place.formatted_address || "",
                website: place.website,
                phone: place.formatted_phone_number,
                types: place.types || [],
              };
              onPlaceSelect(result);
            }
          });
        }
      } catch (err) {
        setError("Failed to load Google Maps");
        console.error("Google Maps error:", err);
      }
    };

    initAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect]);

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        placeholder={isLoaded ? placeholder : "Loading Google Maps..."}
        disabled={!isLoaded}
        className="w-full rounded-md border bg-background p-3 pr-10"
      />
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
