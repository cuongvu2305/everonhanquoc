// Shared helpers for the news posts stored in the locale dictionary (dict.newsPosts).

// Accepts the current object shape and the legacy [title, summary] tuple shape.
export function normalizeNewsPost(post) {
  if (Array.isArray(post)) {
    const [title, summary] = post;
    return { title, summary, image: undefined, date: undefined };
  }
  return { title: post?.title, summary: post?.summary, image: post?.image, date: post?.date };
}

function timestamp(date) {
  const value = Date.parse(date ?? "");
  return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value;
}

// Newest first; undated posts sink to the end and otherwise keep their order.
export function sortNewsByDate(posts = []) {
  return posts
    .map(normalizeNewsPost)
    .map((post, index) => ({ post, index }))
    .sort((a, b) => timestamp(b.post.date) - timestamp(a.post.date) || a.index - b.index)
    .map(({ post }) => post);
}

export function getLatestNews(posts = [], limit = 4) {
  return sortNewsByDate(posts).slice(0, limit);
}

// Dates are stored as "YYYY-MM-DD"; format in UTC so the day never shifts with the viewer's timezone.
export function formatNewsDate(date, locale = "vi-VN") {
  const value = timestamp(date);
  if (!Number.isFinite(value)) return "";
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(value);
}
