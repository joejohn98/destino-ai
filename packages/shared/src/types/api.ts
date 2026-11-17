export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  status: "success";
  results: number;
  totalDestinations?: number;
  totalPages: number;
  currentPage: number;
  data: T[];
}
