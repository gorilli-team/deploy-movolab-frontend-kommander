import React, { useState } from 'react';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';
import { TextField } from '../Form/TextField';

const SearchAddress = ({ returnAddress, onChange, startAddress = '', ...props }) => {
  const [address, setAddress] = useState(null);

  const getComponent = (address_components, type) => {
    return address_components?.find((component) => component.types.includes(type));
  };

  const handleChange = (address) => {
    setAddress(address);
    
    if (onChange) {
      onChange(address);
    }
  };

  const handleSelect = (address) => {
    setAddress(address);
    geocodeByAddress(address)
      .then((results) => {
        const address_components = {
          street: getComponent(results[0].address_components, 'route')?.long_name,
          houseNumber: getComponent(results[0].address_components, 'street_number')?.long_name,
          city: getComponent(results[0].address_components, 'locality')?.long_name,
          province: getComponent(results[0].address_components, 'administrative_area_level_2')
            ?.short_name,
          nation: getComponent(results[0].address_components, 'country')?.long_name,
          zipCode: getComponent(results[0].address_components, 'postal_code')?.long_name,
        };

        returnAddress(results[0].formatted_address, address_components, results[0]?.geometry?.location);
      })
      .catch((error) => {
        console.error('Error', error);
      });
  };

  return (
    <PlacesAutocomplete value={address !== null ? address : startAddress} onChange={handleChange} onSelect={handleSelect}>
      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
        <div>
          <TextField {...getInputProps({ ...props })} />
          {suggestions.length > 0 && (
            <div className="autocomplete-dropdown-container border border-black rounded-b overflow-hidden">
              {loading && <div className="px-3 py-1 bg-white">Caricamento...</div>}
              {suggestions.map((suggestion) =>
                <div
                  {...getSuggestionItemProps(suggestion, { className: `px-3 py-1 cursor-pointer ${suggestion.active ? 'bg-slate-100' : 'bg-white'}` })}
                >{suggestion.description}</div>
              )}
            </div>
          )}
        </div>
      )}
    </PlacesAutocomplete>
  );
};

export default SearchAddress;
