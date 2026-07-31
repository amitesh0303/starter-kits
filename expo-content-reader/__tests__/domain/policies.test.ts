import { estimateReadTime, isArticleRead, isBookmarked, sortByDate } from "@/domain/policies";
import { ReadingProgress, Article, Bookmark } from "@/domain/entities";
describe("Reading progress policies", () => {
  it("estimates read time", () => { expect(estimateReadTime(1000)).toBe(5); expect(estimateReadTime(100)).toBe(1); });
  it("detects read articles", () => {
    expect(isArticleRead({ articleId: "a1", scrollPercent: 95, completed: false, lastReadAt: "" })).toBe(true);
    expect(isArticleRead({ articleId: "a1", scrollPercent: 50, completed: false, lastReadAt: "" })).toBe(false);
    expect(isArticleRead({ articleId: "a1", scrollPercent: 10, completed: true, lastReadAt: "" })).toBe(true);
  });
  it("checks bookmarks", () => {
    const bm: Bookmark[] = [{ id: "b1", articleId: "a1", createdAt: "" }];
    expect(isBookmarked("a1", bm)).toBe(true);
    expect(isBookmarked("a2", bm)).toBe(false);
  });
  it("sorts by date", () => {
    const articles = [{ id: "1", publishedAt: "2024-01-01T00:00:00Z" }, { id: "2", publishedAt: "2024-06-01T00:00:00Z" }] as Article[];
    expect(sortByDate(articles)[0].id).toBe("2");
  });
});
