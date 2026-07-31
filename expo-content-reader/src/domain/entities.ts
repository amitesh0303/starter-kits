export interface Article { id: string; title: string; slug: string; excerpt: string; body: string; category: string; author: string; imageUrl: string | null; publishedAt: string; readTimeMinutes: number; }
export interface Category { id: string; name: string; slug: string; articleCount: number; }
export interface Bookmark { id: string; articleId: string; createdAt: string; }
export interface ReadingProgress { articleId: string; scrollPercent: number; completed: boolean; lastReadAt: string; }
export type PendingActionState = "pending" | "syncing" | "applied" | "conflict" | "failed" | "cancelled";
export interface PendingAction { id: string; kind: string; payload: Record<string, unknown>; state: PendingActionState; attempts: number; createdAt: string; updatedAt: string; }
