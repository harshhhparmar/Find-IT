import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const salCollegeCoords = { lat: 23.0772, lng: 72.5272 };

interface LocationPickerProps {
  coordinates: { lat: number, lng: number } | null;
  onChange: (coords: { lat: number, lng: number }) => void;
}

export default function LocationPicker({ coordinates, onChange }: LocationPickerProps) {
  if (!hasValidKey) {
    return (
      <div className="w-full h-48 border border-dashed border-[#1A1A1A]/20 bg-gray-50 flex items-center justify-center p-4 text-center">
        <p className="text-xs opacity-60">Map picker unavailable without Google Maps API Key.</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="w-full h-64 border border-[#1A1A1A]/20 relative">
        <Map
          defaultCenter={salCollegeCoords}
          defaultZoom={17}
          mapId="LOCATION_PICKER_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          onClick={(e) => {
            if (e.detail.latLng) {
              onChange({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
            }
          }}
          disableDefaultUI={true}
          zoomControl={true}
        >
          {coordinates && (
            <AdvancedMarker position={coordinates}>
              <Pin background="#D44A32" glyphColor="#fff" />
            </AdvancedMarker>
          )}
        </Map>
        {!coordinates && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 shadow-md text-[10px] uppercase tracking-widest font-bold">
            Tap map to set location
          </div>
        )}
      </div>
    </APIProvider>
  );
}
