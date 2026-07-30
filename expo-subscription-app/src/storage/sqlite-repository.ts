/**
 * SQLite repository for local cache and persistent queue.
 */

import * as SQLite from "expo-sqlite";
import {
  PendingAction,
  PendingActionState,
  Profile,
  Feature,
  Entitlement,
} from "../domain/entities";

export interface SQLiteRepository {
  initialize(): void;
  // Profile cache
  getCachedProfile(id: string): Profile | null;
  cacheProfile(profile: Profile): void;
  // Features cache
  getCachedFeatures(): Feature[];
  cacheFeatures(features: Feature[]): void;
  // Entitlements cache
  getCachedEntitlements(profileId: string): Entitlement[];
  cacheEntitlements(profileId: string, entitlements: Entitlement[]): void;
  // Queue operations
  getQueuedActions(): PendingAction[];
  insertAction(action: PendingAction): void;
  updateActionState(id: string, state: PendingActionState): void;
  incrementAttempts(id: string): void;
  getActionById(id: string): PendingAction | null;
  clearAppliedActions(): void;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_premium INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS entitlements (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  expires_at TEXT,
  purchased_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'revenuecat'
);

CREATE TABLE IF NOT EXISTS pending_actions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

/**
 * Creates a SQLite repository backed by expo-sqlite.
 */
export function createSQLiteRepository(
  dbName: string = "app.db"
): SQLiteRepository {
  const db = SQLite.openDatabaseSync(dbName);

  return {
    initialize(): void {
      db.execSync(SCHEMA_SQL);
    },

    getCachedProfile(id: string): Profile | null {
      const rows = db.getAllSync<{
        id: string;
        email: string;
        display_name: string | null;
        avatar_url: string | null;
        created_at: string;
        updated_at: string;
      }>("SELECT * FROM profiles WHERE id = ?", [id]);
      if (rows.length === 0) return null;
      const row = rows[0];
      return {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },

    cacheProfile(profile: Profile): void {
      db.runSync(
        `INSERT OR REPLACE INTO profiles (id, email, display_name, avatar_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          profile.id,
          profile.email,
          profile.displayName,
          profile.avatarUrl,
          profile.createdAt,
          profile.updatedAt,
        ]
      );
    },

    getCachedFeatures(): Feature[] {
      const rows = db.getAllSync<{
        id: string;
        name: string;
        description: string;
        is_premium: number;
      }>("SELECT * FROM features");
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        isPremium: row.is_premium === 1,
      }));
    },

    cacheFeatures(features: Feature[]): void {
      db.runSync("DELETE FROM features");
      for (const f of features) {
        db.runSync(
          "INSERT INTO features (id, name, description, is_premium) VALUES (?, ?, ?, ?)",
          [f.id, f.name, f.description, f.isPremium ? 1 : 0]
        );
      }
    },

    getCachedEntitlements(profileId: string): Entitlement[] {
      const rows = db.getAllSync<{
        id: string;
        profile_id: string;
        product_id: string;
        is_active: number;
        expires_at: string | null;
        purchased_at: string;
        source: string;
      }>("SELECT * FROM entitlements WHERE profile_id = ?", [profileId]);
      return rows.map((row) => ({
        id: row.id,
        profileId: row.profile_id,
        productId: row.product_id,
        isActive: row.is_active === 1,
        expiresAt: row.expires_at,
        purchasedAt: row.purchased_at,
        source: row.source as "revenuecat",
      }));
    },

    cacheEntitlements(profileId: string, entitlements: Entitlement[]): void {
      db.runSync("DELETE FROM entitlements WHERE profile_id = ?", [profileId]);
      for (const e of entitlements) {
        db.runSync(
          `INSERT INTO entitlements (id, profile_id, product_id, is_active, expires_at, purchased_at, source)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            e.id,
            profileId,
            e.productId,
            e.isActive ? 1 : 0,
            e.expiresAt,
            e.purchasedAt,
            e.source,
          ]
        );
      }
    },

    getQueuedActions(): PendingAction[] {
      const rows = db.getAllSync<{
        id: string;
        kind: string;
        payload: string;
        state: string;
        attempts: number;
        created_at: string;
        updated_at: string;
      }>("SELECT * FROM pending_actions ORDER BY created_at ASC");
      return rows.map((row) => ({
        id: row.id,
        kind: row.kind,
        payload: JSON.parse(row.payload),
        state: row.state as PendingActionState,
        attempts: row.attempts,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    },

    insertAction(action: PendingAction): void {
      db.runSync(
        `INSERT INTO pending_actions (id, kind, payload, state, attempts, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          action.id,
          action.kind,
          JSON.stringify(action.payload),
          action.state,
          action.attempts,
          action.createdAt,
          action.updatedAt,
        ]
      );
    },

    updateActionState(id: string, state: PendingActionState): void {
      db.runSync(
        "UPDATE pending_actions SET state = ?, updated_at = ? WHERE id = ?",
        [state, new Date().toISOString(), id]
      );
    },

    incrementAttempts(id: string): void {
      db.runSync(
        "UPDATE pending_actions SET attempts = attempts + 1, updated_at = ? WHERE id = ?",
        [new Date().toISOString(), id]
      );
    },

    getActionById(id: string): PendingAction | null {
      const rows = db.getAllSync<{
        id: string;
        kind: string;
        payload: string;
        state: string;
        attempts: number;
        created_at: string;
        updated_at: string;
      }>("SELECT * FROM pending_actions WHERE id = ?", [id]);
      if (rows.length === 0) return null;
      const row = rows[0];
      return {
        id: row.id,
        kind: row.kind,
        payload: JSON.parse(row.payload),
        state: row.state as PendingActionState,
        attempts: row.attempts,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },

    clearAppliedActions(): void {
      db.runSync("DELETE FROM pending_actions WHERE state = 'applied'");
    },
  };
}
