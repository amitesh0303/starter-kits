import { isValidPostContent, isValidCommentContent, canDeletePost, canDeleteComment, sortPostsByRecent } from "@/domain/policies";
import { Post, Comment } from "@/domain/entities";

describe("Content moderation policies", () => {
  it("validates post content", () => {
    expect(isValidPostContent("Hello")).toBe(true);
    expect(isValidPostContent("")).toBe(false);
    expect(isValidPostContent("a".repeat(2001))).toBe(false);
  });
  it("validates comment content", () => {
    expect(isValidCommentContent("Nice!")).toBe(true);
    expect(isValidCommentContent("")).toBe(false);
    expect(isValidCommentContent("a".repeat(501))).toBe(false);
  });
  it("author can delete own post", () => {
    const post: Post = { id: "p1", authorId: "u1", content: "hi", imageUrl: null, likesCount: 0, commentsCount: 0, createdAt: "" };
    expect(canDeletePost(post, "u1")).toBe(true);
    expect(canDeletePost(post, "u2")).toBe(false);
  });
  it("comment deletion by author or post owner", () => {
    const comment: Comment = { id: "c1", postId: "p1", authorId: "u2", content: "hi", createdAt: "" };
    expect(canDeleteComment(comment, "u2", "u1")).toBe(true);
    expect(canDeleteComment(comment, "u1", "u1")).toBe(true);
    expect(canDeleteComment(comment, "u3", "u1")).toBe(false);
  });
  it("sorts posts by recency", () => {
    const posts: Post[] = [
      { id: "1", authorId: "u", content: "a", imageUrl: null, likesCount: 0, commentsCount: 0, createdAt: "2024-01-01T00:00:00Z" },
      { id: "2", authorId: "u", content: "b", imageUrl: null, likesCount: 0, commentsCount: 0, createdAt: "2024-01-02T00:00:00Z" },
    ];
    const sorted = sortPostsByRecent(posts);
    expect(sorted[0].id).toBe("2");
  });
});
