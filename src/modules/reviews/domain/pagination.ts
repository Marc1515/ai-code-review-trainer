export interface Pagination {
  page: number;
  totalPages: number;
  offset: number;
  limit: number;
}

export function getPagination(
  requestedPage: number,
  totalItems: number,
  pageSize: number,
): Pagination {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError("pageSize must be a positive integer");
  }

  const totalPages = Math.max(1, Math.ceil(Math.max(0, totalItems) / pageSize));
  const validRequestedPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const page = Math.min(validRequestedPage, totalPages);

  return {
    page,
    totalPages,
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}
