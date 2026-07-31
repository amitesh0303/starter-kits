import { Post, Comment } from "./entities";

/** Maximum content length for posts. */
export const MAX_POST_LENGTH = 2000;
/** Maximum content length for comments. */
export const MAX_COMMENT_LENGTH = 500;

/** Validate post content. */
export function isValidPostContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_POST_LENGTH;
}

/** Validate comment content. */
export function isValidCommentContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_COMMENT_LENGTH;
}

/** Check if a user can delete a post (must be author). */
export function canDeletePost(post: Post, userId: string): boolean {
  return post.authorId === userId;
}

/** Check if a user can delete a comment (must be author or post owner). */
export function canDeleteComment(comment: Comment, userId: string, postAuthorId: string): boolean {
  return comment.authorId === userId || postAuthorId === userId;
}

/** Sort posts by recency. */
export function sortPostsByRecent(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
