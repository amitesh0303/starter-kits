/**
 * SQLite repository for local data persistence.
 */

export interface SQLiteRepository {
  initialize(): void;
  getPreference(key: string): string | null;
  setPreference(key: string, value: string): void;
  getUsageRecords(toolId: string): Array<{ id: string; toolId: string; timestamp: string; durationMs: number }>;
  addUsageRecord(toolId: string, durationMs: number): void;
}

export function createSQLiteRepository(): SQLiteRepository {
  return {
    initialize(): void {
      // SQLite table creation handled by expo-sqlite
    },
    getPreference(_key: string): string | null {
      return null;
    },
    setPreference(_key: string, _value: string): void {
      // no-op in fake
    },
    getUsageRecords(_toolId: string) {
      return [];
    },
    addUsageRecord(_toolId: string, _durationMs: number): void {
      // no-op in fake
    },
  };
}
