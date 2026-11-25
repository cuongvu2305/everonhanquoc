import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

vi.mock("../src/lib/runtime.js", async (importOriginal) => ({
  ...(await importOriginal()),
  navigateToTopPage: vi.fn(),
}));

const { navigateToTopPage } = await import("../src/lib/runtime.js");
const { formatNewsDate, getLatestNews, normalizeNewsPost, sortNewsByDate } = await import("../src/lib/news.js");
const { HOME_NEWS_LIMIT, HomeLatestNews } = await import("../src/components/home/HomeLatestNews.jsx");
const { NewsPage } = await import("../src/components/pages/NewsPage.jsx");

const dict = JSON.parse(readFileSync(join(process.cwd(), "src", "locales", "vi", "storefront.json"), "utf8"));

// jsdom has no matchMedia; Ant Design's responsive Row subscribes to it on mount.
window.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("locale news posts carry title, summary, an existing image and an ISO date", () => {
  expect(dict.newsPosts.length).toBeGreaterThan(HOME_NEWS_LIMIT);
  for (const post of dict.newsPosts) {
    expect(post).toEqual({
      title: expect.any(String),
      summary: expect.any(String),
      image: expect.stringMatching(/^\/assets\/news\/.+\.svg$/),
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
    expect(existsSync(join(process.cwd(), "public", post.image))).toBe(true);
  }
});

test("getLatestNews returns the newest posts first, undated ones last", () => {
  const posts = [
    { title: "old", date: "2026-01-01" },
    ["legacy", "tuple summary"],
    { title: "new", date: "2026-03-01" },
    { title: "mid", date: "2026-02-01" },
  ];

  expect(getLatestNews(posts, 3).map((post) => post.title)).toEqual(["new", "mid", "old"]);
  expect(sortNewsByDate(posts).at(-1)).toEqual(normalizeNewsPost(["legacy", "tuple summary"]));
});

test("formatNewsDate keeps the stored day regardless of timezone", () => {
  expect(formatNewsDate("2026-11-22", "vi-VN")).toBe("22/11/2026");
  expect(formatNewsDate(undefined)).toBe("");
});

test("home block shows the 4 latest posts with image, date, title and summary", () => {
  const { container, getByRole } = render(<HomeLatestNews dict={dict} />);
  const expected = getLatestNews(dict.newsPosts, HOME_NEWS_LIMIT);

  expect(getByRole("heading", { name: dict.latestNewsTitle })).toBeTruthy();
  const cards = [...container.querySelectorAll(".home-news-card")];
  expect(cards).toHaveLength(HOME_NEWS_LIMIT);
  cards.forEach((card, index) => {
    const post = expected[index];
    expect(card.querySelector(".home-news-card-title").textContent).toBe(post.title);
    expect(card.querySelector(".home-news-summary").textContent).toBe(post.summary);
    expect(card.querySelector("img").getAttribute("src")).toBe(post.image);
    expect(card.querySelector("time").getAttribute("datetime")).toBe(post.date);
  });

  const oldest = sortNewsByDate(dict.newsPosts).at(-1);
  expect(container.textContent).not.toContain(oldest.title);
});

test("grid uses 1 column on phones, 2 on tablets and 4 on desktop", () => {
  const { container } = render(<HomeLatestNews dict={dict} />);
  const col = container.querySelector(".home-news-card").closest(".ant-col");

  expect(col.className).toContain("ant-col-xs-24");
  expect(col.className).toContain("ant-col-sm-12");
  expect(col.className).toContain("ant-col-xl-6");
});

test("'Xem tất cả' opens the news page", () => {
  const { getByRole } = render(<HomeLatestNews dict={dict} />);

  fireEvent.click(getByRole("button", { name: dict.viewAll }));

  expect(navigateToTopPage).toHaveBeenCalledWith("news");
});

test("home block is hidden when there are no posts", () => {
  const { container } = render(<HomeLatestNews dict={{ ...dict, newsPosts: [] }} />);
  expect(container.innerHTML).toBe("");
});

test("news page still renders every post from the shared source", () => {
  const { container } = render(<NewsPage dict={dict} />);
  expect(container.querySelectorAll(".content-card")).toHaveLength(dict.newsPosts.length);
});
