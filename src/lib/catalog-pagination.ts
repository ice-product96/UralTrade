/** Номера страниц для пагинации: 1 2 3 4 … 12 */
export function buildCatalogPageRange(page: number, pages: number): Array<number | "ellipsis"> {
  if (pages <= 1) return [];
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, "ellipsis", pages];
  }

  if (page >= pages - 3) {
    return [1, "ellipsis", pages - 3, pages - 2, pages - 1, pages];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pages];
}
