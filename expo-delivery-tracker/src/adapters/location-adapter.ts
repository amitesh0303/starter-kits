export interface LocationAdapter { startTracking(callback: (loc: {lat:number;lng:number;speed:number}) => void): () => void; getCurrentLocation(): Promise<{lat:number;lng:number}>; }
export function createFakeLocationAdapter(): LocationAdapter {
  return { startTracking(_cb) { return () => {}; }, async getCurrentLocation() { return { lat: 40.7128, lng: -74.006 }; } };
}
