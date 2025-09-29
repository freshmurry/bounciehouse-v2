import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
let L = null;

// Create custom price marker icon
const createPriceIcon = (price, priceUnit) => {
  const priceText = price ? `$${price}/${priceUnit === 'daily' ? 'day' : 'hr'}` : 'Price TBD';

  if (!L) {
    // Fallback when leaflet isn't available: return a simple object that react-leaflet
    // will ignore during SSR/build or when dynamic imports fail.
    return {
      options: {},
      toString: () => priceText,
    };
  }

  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div style="
        background: white;
        border: 2px solid #ef4444;
        border-radius: 20px;
        padding: 6px 12px;
        font-weight: bold;
        font-size: 14px;
        color: #1f2937;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        white-space: nowrap;
        min-width: 60px;
        text-align: center;
      ">
        ${priceText}
      </div>
    `,
    iconSize: [null, 32],
    iconAnchor: [30, 16],
    popupAnchor: [0, -16]
  });
};

export default function MapView({ listings }) {
  // Filter listings to only include those with valid coordinates
  const validListings = listings ? listings.filter(listing => 
    listing.location?.latitude && 
    listing.location?.longitude &&
    !isNaN(listing.location.latitude) &&
    !isNaN(listing.location.longitude)
  ) : [];

  // Calculate bounds to show all listings
  const getBounds = () => {
    if (validListings.length === 0) {
      // Default bounds for entire US if no listings
      return [
        [25.0, -125.0], // Southwest corner
        [49.0, -66.0]   // Northeast corner
      ];
    }

    if (validListings.length === 1) {
      // If only one listing, center on it with some padding
      const listing = validListings[0];
      return [
        [listing.location.latitude - 0.1, listing.location.longitude - 0.1],
        [listing.location.latitude + 0.1, listing.location.longitude + 0.1]
      ];
    }

    // Calculate bounds from all listing locations
    let minLat = validListings[0].location.latitude;
    let maxLat = validListings[0].location.latitude;
    let minLng = validListings[0].location.longitude;
    let maxLng = validListings[0].location.longitude;

    validListings.forEach(listing => {
      minLat = Math.min(minLat, listing.location.latitude);
      maxLat = Math.max(maxLat, listing.location.latitude);
      minLng = Math.min(minLng, listing.location.longitude);
      maxLng = Math.max(maxLng, listing.location.longitude);
    });

    // Add some padding around the bounds
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;

    return [
      [minLat - latPadding, minLng - lngPadding],
      [maxLat + latPadding, maxLng + lngPadding]
    ];
  };

  const bounds = getBounds();
  const [leafletComponents, setLeafletComponents] = useState(null);

  useEffect(() => {
    // Dynamically import react-leaflet and CSS only in the browser to avoid build-time peer
    // dependency resolution issues (react-leaflet v5 requires React 19).
    let mounted = true;
    (async () => {
    try {
      const rl = await import('react' + '-leaflet');
      const leaflet = await import('leaf' + 'let');
      await import('leaf' + 'let/dist/leaflet.css');
      L = leaflet.default || leaflet;
      if (mounted) setLeafletComponents(rl);
      } catch (err) {
        // If import fails (package not installed), leave leafletComponents as null.
        console.warn('react-leaflet not available, rendering static placeholder map.', err);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // If react-leaflet couldn't be loaded, render an informative placeholder so the app still builds.
  if (!leafletComponents) {
    return (
      <div className="border rounded-lg p-6 bg-gray-50 text-center">
        <p className="text-gray-600">Map view is unavailable in this environment.</p>
        {validListings.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {validListings.map(listing => (
              <div key={listing.id} className="p-3 border rounded">
                <h4 className="font-semibold">{listing.title || 'Bounce House'}</h4>
                <p className="text-sm text-gray-600">{listing.location?.city}, {listing.location?.state}</p>
                <p className="text-red-600 font-bold">{listing.pricing_model === 'daily' ? `$${listing.price_per_day}/day` : `$${listing.price_per_hour}/hr`}</p>
                <Link to={createPageUrl(`Listing?id=${listing.id}`)}>
                  <Button size="sm" className="mt-2">View Details</Button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">No listings available to display on the map.</p>
        )}
      </div>
    );
  }

  const { MapContainer: RLMapContainer, TileLayer: RLTileLayer, Marker: RLMarker, Popup: RLPopup } = leafletComponents;

  return (
    <RLMapContainer 
      bounds={bounds}
      scrollWheelZoom={true} 
      style={{ height: '100%', width: '100%' }}
      className="map-container"
    >
      <RLTileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {validListings.map(listing => {
        const price = listing.pricing_model === 'daily' ? listing.price_per_day : listing.price_per_hour;
        const priceUnit = listing.pricing_model || 'daily';
        
        return (
          <RLMarker 
            key={listing.id} 
            position={[listing.location.latitude, listing.location.longitude]}
            icon={createPriceIcon(price, priceUnit)}
          >
            <RLPopup>
              <div className="w-48 p-2">
                <h3 className="font-bold text-lg mb-2">{listing.title || 'Bounce House'}</h3>
                <p className="text-gray-600 mb-2">
                  {listing.location?.city}, {listing.location?.state}
                </p>
                <p className="text-lg font-semibold text-red-600 mb-3">
                  {price 
                    ? `$${price}/${priceUnit === 'daily' ? 'day' : 'hour'}`
                    : 'Price available upon request'
                  }
                </p>
                {listing.capacity && (
                  <p className="text-sm text-gray-500 mb-3">
                    Capacity: {listing.capacity} people
                  </p>
                )}
                <Link to={createPageUrl(`Listing?id=${listing.id}`)}>
                  <Button size="sm" className="w-full bg-red-500 hover:bg-red-600">
                    View Details
                  </Button>
                </Link>
              </div>
            </RLPopup>
          </RLMarker>
        );
      })}
    </RLMapContainer>
  );
}