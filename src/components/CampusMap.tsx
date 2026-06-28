import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Item } from '../types';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const salCollegeCoords = { lat: 23.0772, lng: 72.5272 };

interface CampusMapProps {
  items: Item[];
  onItemClick: (item: Item) => void;
}

function MarkerWithInfoWindow({ item, onClick, key }: { item: Item, onClick: () => void, key?: string }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  if (!item.coordinates) return null;

  return (
    <>
      <AdvancedMarker 
        ref={markerRef} 
        position={item.coordinates} 
        onClick={() => {
          setOpen(true);
        }}
      >
        <Pin background={item.type === 'lost' ? '#D44A32' : '#1A1A1A'} glyphColor="#fff" />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="p-2 max-w-[200px]" onClick={onClick} style={{ cursor: 'pointer' }}>
            <h4 className="font-serif italic font-bold mb-1">{item.title}</h4>
            <p className="text-xs opacity-70 mb-2">{item.location}</p>
            <span className="text-[10px] uppercase tracking-widest font-black text-[#D44A32] group-hover:underline">View Details &rarr;</span>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function CampusMap({ items, onItemClick }: CampusMapProps) {
  if (!hasValidKey) {
    return (
      <div className="w-full h-full min-h-[400px] border border-[#1A1A1A]/10 bg-white flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h3 className="font-serif text-2xl italic mb-4">Map Service Unavailable</h3>
          <p className="text-sm opacity-60 mb-6">A Google Maps API Key is required to view the campus map.</p>
          <ul className="text-left text-xs space-y-2 opacity-80 bg-gray-50 p-4 border border-[#1A1A1A]/5">
            <li>1. Open <strong>Settings</strong> (⚙️ gear icon, top-right)</li>
            <li>2. Select <strong>Secrets</strong></li>
            <li>3. Add <code>GOOGLE_MAPS_PLATFORM_KEY</code></li>
            <li>4. Paste your API key and press Enter</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="w-full h-[600px] border border-[#1A1A1A]/10 bg-[#E5E5E1]">
        <Map
          defaultCenter={salCollegeCoords}
          defaultZoom={17}
          mapId="CAMPUS_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {items.map(item => (
            <MarkerWithInfoWindow 
              key={item.id} 
              item={item} 
              onClick={() => onItemClick(item)} 
            />
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}
