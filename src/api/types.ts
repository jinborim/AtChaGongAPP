export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message: string | null;
};

export type ApiFailureResponse = {
  success: false;
  data: null;
  error: {
    status: number;
    code: string;
    message: string;
    timestamp?: string;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  code: string;
  timestamp?: string;

  constructor({
    status,
    code,
    message,
    timestamp,
  }: ApiFailureResponse["error"]) {
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
