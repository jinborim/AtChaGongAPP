export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message: string | null;
};

export type ApiErrorResponse = {
  status: number;
  code: string;
  message: string;
  timestamp?: string;
};

export type ApiFailureResponse = {
  success: false;
  data: null;
  error: ApiErrorResponse;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiQuery = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  query?: ApiQuery;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

export class ApiError extends Error {
  status: number;
  code: string;
  timestamp?: string;

  constructor({
    status,
    code,
    message,
    timestamp,
  }: ApiErrorResponse) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.timestamp = timestamp;
  }
}

export class ApiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiConfigurationError";
  }
}

export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
