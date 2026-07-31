export interface MapsAdapter { geocode(address: string): Promise<{ lat: number; lng: number } | null>; reverseGeocode(lat: number, lng: number): Promise<string | null>; }
export function createFakeMapsAdapter(): MapsAdapter {
  return {
    async geocode(_a) { return { lat: 40.7128, lng: -74.006 }; },
    async reverseGeocode(_lat, _lng) { return "123 Fake St, New York, NY"; },
  };
}
