export interface ApiResponse<T = any> {
  data: T;
  meta?: any;
  error?: null;
}

export interface ErrorResponse {
  data: null;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ListResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  error?: null;
}
