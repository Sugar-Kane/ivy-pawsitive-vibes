import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import '../types/google-places.d.ts';

// Load Google Places API script using edge function to get API key
const loadGooglePlacesScript = async (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      resolve();
      return;
    }

    try {
      // Get API key from edge function
      const response = await fetch(`https://oqvqctgewpbzgbawyosj.supabase.co/functions/v1/get-google-places-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdnFjdGdld3BiemdiYXd5b3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NTgyNDcsImV4cCI6MjA3MTAzNDI0N30.sKbyfH_zvzxT4KaZVggORzVJzR2HGV1mkNXx0l2F4Uk`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get API key');
      }
      
      const { apiKey } = await response.json();
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Places API'));
      document.head.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
};

interface AddressComponents {
  street_number?: string;
  route?: string;
  locality?: string;
  administrative_area_level_1?: string;
  postal_code?: string;
  country?: string;
}

interface StructuredAddress {
  street_line1: string;
  street_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  lat?: number;
  lng?: number;
  place_id?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (structuredAddress: StructuredAddress) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Enter address...",
  className,
  disabled,
  required,
  name,
  id
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasManualEntry, setHasManualEntry] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize Google Places API
  useEffect(() => {
    let isMounted = true;
    
    loadGooglePlacesScript()
      .then(() => {
        if (isMounted && window.google) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService();
          
          // Create a hidden div for PlacesService
          const mapDiv = document.createElement('div');
          mapDiv.style.display = 'none';
          document.body.appendChild(mapDiv);
          const map = new window.google.maps.Map(mapDiv);
          placesService.current = new window.google.maps.places.PlacesService(map);
          
          setIsScriptLoaded(true);
        }
      })
      .catch((error) => {
        console.warn('Google Places API failed to load:', error);
        setIsScriptLoaded(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced search function
  const searchPlaces = useCallback((query: string) => {
    if (!autocompleteService.current || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    const request = {
      input: query,
      componentRestrictions: { country: 'us' }, // US bias
      types: ['address']
    };

    autocompleteService.current.getPlacePredictions(request, (predictions: any, status: any) => {
      setIsLoading(false);
      
      if (status === 'OK' && predictions) {
        setSuggestions(predictions);
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    });
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHasManualEntry(true);
    setSelectedIndex(-1);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only search if script is loaded
    if (isScriptLoaded) {
      debounceTimer.current = setTimeout(() => {
        searchPlaces(newValue);
      }, 300);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (prediction: any) => {
    if (!placesService.current) return;

    onChange(prediction.description);
    setShowDropdown(false);
    setHasManualEntry(false);
    setSuggestions([]);

    // Get detailed place information
    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['address_components', 'geometry', 'place_id']
      },
      (place: any, status: any) => {
        if (status === 'OK' && place && onAddressSelect) {
          const components: AddressComponents = {};
          
          place.address_components?.forEach((component) => {
            const types = component.types;
            if (types.includes('street_number')) {
              components.street_number = component.long_name;
            } else if (types.includes('route')) {
              components.route = component.long_name;
            } else if (types.includes('locality')) {
              components.locality = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              components.administrative_area_level_1 = component.short_name;
            } else if (types.includes('postal_code')) {
              components.postal_code = component.long_name;
            } else if (types.includes('country')) {
              components.country = component.short_name;
            }
          });

          const structuredAddress: StructuredAddress = {
            street_line1: [components.street_number, components.route].filter(Boolean).join(' '),
            city: components.locality || '',
            state: components.administrative_area_level_1 || '',
            postal_code: components.postal_code || '',
            country: components.country || 'US',
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
            place_id: place.place_id
          };

          onAddressSelect(structuredAddress);
        }
      }
    );
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? suggestions.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show warning for manual entry
  const showManualEntryWarning = hasManualEntry && value.length > 0 && !isLoading && suggestions.length === 0 && isScriptLoaded;

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          className,
          showManualEntryWarning && "border-orange-300 focus-visible:ring-orange-500"
        )}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        autoComplete="off"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        role="combobox"
        aria-autocomplete="list"
      />

      {/* Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              className={cn(
                "px-3 py-2 cursor-pointer text-sm hover:bg-accent hover:text-accent-foreground",
                selectedIndex === index && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleSuggestionSelect(suggestion)}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
              <div className="text-xs text-muted-foreground">
                {suggestion.structured_formatting.secondary_text}
              </div>
            </div>
          ))}
          
          {/* Powered by Google badge */}
          <div className="px-3 py-2 border-t border-border bg-muted/50">
            <div className="text-xs text-muted-foreground text-right">
              Powered by Google
            </div>
          </div>
        </div>
      )}

      {/* Manual entry warning */}
      {showManualEntryWarning && (
        <div className="mt-1 text-xs text-orange-600">
          ⚠️ Manual address entry - please verify spelling
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;