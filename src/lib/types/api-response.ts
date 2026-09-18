export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse<
  TErrors extends Record<string, unknown> = Record<string, unknown>,
> = {
  success: false;
  message: string;
  errors?: TErrors;
};

export type ApiResponse<
  TData,
  TErrors extends Record<string, unknown> = Record<string, unknown>,
> = ApiSuccessResponse<TData> | ApiErrorResponse<TErrors>;

export type LaravelResourceResponse<TData> = {
  data: TData;
};
