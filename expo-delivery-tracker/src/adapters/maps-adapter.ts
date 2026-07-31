export interface MapsAdapter { getRoute(from: {lat:number;lng:number}, to: {lat:number;lng:number}): Promise<{distanceKm:number;durationMin:number}>; geocode(address: string): Promise<{lat:number;lng:number}|null>; }
export function createFakeMapsAdapter(): MapsAdapter {
  return { async getRoute(_f, _t) { return { distanceKm: 5.2, durationMin: 12 }; }, async geocode(_a) { return { lat: 40.7, lng: -74.0 }; } };
}
