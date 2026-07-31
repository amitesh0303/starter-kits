export interface SearchResult { id: string; title: string; price: number; }
export interface SearchAdapter { search(query: string): Promise<SearchResult[]>; }
export function createFakeSearchAdapter(): SearchAdapter {
  return { async search(q) { return [{ id: "l1", title: "Item matching: " + q, price: 19.99 }]; } };
}
