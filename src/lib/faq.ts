export type FaqEntry = {
  question: string;
  answer: string;
};

/** Парсит старый формат FAQ из HTML (h3 + p). */
export function parseFaqHtml(html: string): FaqEntry[] {
  const items: FaqEntry[] = [];
  const blockRegex = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;

  for (const match of html.matchAll(blockRegex)) {
    const question = stripHtml(match[1]);
    const answer = stripHtml(match[2]);
    if (question && answer) items.push({ question, answer });
  }

  return items;
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
