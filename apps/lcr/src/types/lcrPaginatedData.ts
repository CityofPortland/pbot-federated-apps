export type LcrPaginatedData<T> = {
  pageNumber: number;
  pageSize: number;
  firstPage: string;
  lastPage: string;
  totalPages: number;
  totalRecords: number;
  nextPage: string;
  previousPage: string;
  data: T[];
  succeeded: boolean;
  errors?: string;
  message?: string;
};
