export const normalizeSearchValue = (value: string): string =>
  value.trim().toLowerCase();

export const toMongoTextSearch = (value: string): string =>
  (value.match(/[\p{L}\p{N}]+/gu) ?? []).join(" ");
