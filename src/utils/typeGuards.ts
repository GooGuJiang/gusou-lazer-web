export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return String(error);
};

export const getApiErrorMessage = (error: unknown): string | undefined => {
  if (!isRecord(error)) return undefined;
  const response = error.response;
  if (!isRecord(response)) return undefined;
  const data = response.data;
  if (!isRecord(data)) return undefined;
  const message = data.message;
  return typeof message === 'string' ? message : undefined;
};

export const getApiErrorStatus = (error: unknown): number | undefined => {
  if (!isRecord(error)) return undefined;
  const response = error.response;
  if (!isRecord(response)) return undefined;
  const status = response.status;
  return typeof status === 'number' ? status : undefined;
};
