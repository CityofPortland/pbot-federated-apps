export type PagedMaximoUsers = {
  pageNumber: number;
  pageSize: number;
  firstPage: string;
  lastPage: string;
  totalPages: number;
  totalRecords: number;
  nextPage: string;
  previousPage: string;
  data: MaximoUser[];
  succeeded: boolean;
  errors?: string;
  message?: string;
};

export type MaximoUser = {
  username: string;
  personId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  pbotCostCenter: string;
  pbotOrgUnit: string;
  emailAddress: string;
};
