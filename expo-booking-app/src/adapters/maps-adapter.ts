export interface MapsAdapter { geocode(address: string): Promise<{ lat: number; lng: number } | null>; }
export function createFakeMapsAdapter(): MapsAdapter { return { async geocode(_a) { return { lat: 40.7128, lng: -74.006 }; } }; }
