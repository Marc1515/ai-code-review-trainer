import { describe, expect, it } from "vitest";

import { getPagination } from "@/modules/reviews/domain/pagination";

describe("getPagination", () => {
  it("returns the first page for an empty result", () => {
    expect(getPagination(1, 0, 5)).toEqual({
      page: 1,
      totalPages: 1,
      offset: 0,
      limit: 5,
    });
  });

  it("calculates the offset for the second page", () => {
    expect(getPagination(2, 10, 5)).toEqual({
      page: 2,
      totalPages: 2,
      offset: 5,
      limit: 5,
    });
  });

  it("clamps an out-of-range page to the last page", () => {
    expect(getPagination(99, 7, 5)).toMatchObject({
      page: 2,
      totalPages: 2,
      offset: 5,
    });
  });

  it("normalizes invalid requested pages to page one", () => {
    expect(getPagination(-1, 10, 5).page).toBe(1);
    expect(getPagination(Number.NaN, 10, 5).page).toBe(1);
  });

  it("rejects an invalid page size", () => {
    expect(() => getPagination(1, 10, 0)).toThrow(RangeError);
  });
});
