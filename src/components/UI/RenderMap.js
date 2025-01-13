import React, { useMemo, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const RenderMap = ({ children, ...props }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) return <div>Loading...</div>;

  return <Map {...props} />;
};

const defaultMapOptions = {
  fullscreenControl: false,
  mapTypeControl: false,
  styles: [
    {
      elementType: 'labels',
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }],
    },
    {
      elementType: 'labels',
      featureType: 'poi.place_of_worship',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export function Map({ className = '', fitMarkers = true, ...props }) {
  const center = useMemo(() => props.location, [props.location]);
  const [activeMarker, setActiveMarker] = useState(null);
  const mapRef = useRef(null);

  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  return (
    <div className={className} style={{ height: props.height || '550px' }}>
      <GoogleMap
        ref={mapRef}
        zoom={props.zoom ? props.zoom : 12}
        center={center}
        options={defaultMapOptions}
        mapContainerClassName="w-full h-full"

        /* onLoad={fitMarkers ? (map) => {
          const bounds = new window.google.maps.LatLngBounds();
          props.markers.forEach((location) => {
            bounds.extend({lat:parseFloat(location.lat),lng:parseFloat(location.lng)});
          })
          map.fitBounds(bounds);
        } : () => {}} */
      >
        {props.markers.map((marker, index) => {
          if (!marker || !marker.lat || !marker.lng) {
            return null;
          }

          return (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => handleActiveMarker(index)}
              icon="/nolo_pin.svg"
            >
              {activeMarker === index ? (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div>
                    <div className="font-bold">{marker.rentalLocation}</div>
                    <div>{marker.address}</div>
                  </div>
                </InfoWindow>
              ) : null}
            </Marker>
          );
        })}
      </GoogleMap>
    </div>
  );
}

export default RenderMap;
