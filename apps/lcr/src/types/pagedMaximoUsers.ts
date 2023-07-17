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
  pernr: string;
  userName: string;
  personId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  costCenter: string;
  orgUnit: string;
  emailAddress: string;
  supervisorName?: string;
  pbotGroup: string;
  pbotDivision: string;
  section: string;
  orgUnitDescription: string;
  computerNames: string;
  computerInfo: deployComputerInfo[];
  orgInfo: OrgUnitInfo;
};

export type MaximoUserSearchFilter = {
  userName?: string;
  firstName?: string;
  lastName?: string;
  device?: string;
  pbotGroup?: string;
  pbotDivision?: string;
  section?: string;
  orgUnit?: string;
  costCenter?: string;
  computerNames?: string;
  orderBy?: string;
  orderDirection?: string;
};

export type OrgUnitInfo = {
  costCenter: string;
  orgUnit: string;
  orgUnitDescription: string;
  pbotGroup: string;
  pbotDivision: string;
  section: string;
};

export type deployComputerInfo = {
  computerName: string;
  deploymentDate: Date;
};
