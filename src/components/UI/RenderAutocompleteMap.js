import React from 'react';
import Autocomplete from 'react-google-autocomplete';

export default function AutocompleteMap({ updateLocation = () => {}, ...props }) {
  return (
    <Autocomplete
      apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      style={{
        width: '100%',
        border: '1px solid #000',
        padding: '0.25rem 0.75rem',
        borderRadius: '0.25rem',
      }}
      onPlaceSelected={(place) => {
        updateLocation({
          address: place.formatted_address,
          lat: place?.geometry?.location.lat(),
          lng: place?.geometry?.location.lng(),
        });
      }}
      options={{
        libraries: ['places'],
        language: 'it',
        componentRestrictions: { country: 'it' },
      }}
      {...props}
    />
  );
}
