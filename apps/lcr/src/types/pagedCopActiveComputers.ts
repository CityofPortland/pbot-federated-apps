export type PagedCopActiveComputers = {
  pageNumber: number;
  pageSize: number;
  firstPage: string;
  lastPage: string;
  totalPages: number;
  totalRecords: number;
  nextPage: string;
  previousPage: string;
  data: PagedCopActiveComputer[];
  succeeded: boolean;
  errors?: string;
  message?: string;
};

export type PagedCopActiveComputer = {
  computerName: string;
  computerType: string;
  replacementStatus: string;
  costCenter?: string;
  deploymentDate: string;
  pbotPrimaryUser: string;
  primaryUser: string;
  primaryUserName: string;
  lastLogonUser: string;
  deviceLocation: string;
  lastCommunication: string;
  osName: string;
  serialNumber: string;
  manufacturer: string;
  pcModel: string;
  cpuType: string;
  cpuNumber: string;
  cpuSpeed: string;
  totalPhysicalMemory: string;
  workstationNotes: string;
  replacementQuarter: string;
  pbotDivision: string;
  pbotGroup: string;
  serviceNowTicketNumber: string;
  sharedDevice: string;
  serviceTagNumber: string;
  copActiveComputersHistory?: CopActiveComputersHistory[];
};

export type CopActiveComputersHistory = {
  computerName: string;
  importDate: string;
  replacementStatus: string;
  primaryUser: string;
  lastLogonUser: string;
  deviceLocation: string;
  lastCommunication: string;
};

export type CopActiveComputer = {
  computerName: string;
  computerType: string;
  replacementStatus: string;
  costCenter: string;
  deploymentDate: string;
  pbotPrimaryUser: string;
  primaryUser: string;
  primaryUserName: string;
  lastLogonUser: string;
  deviceLocation: string;
  lastCommunication: string;
  osName: string;
  serialNumber: string;
  manufacturer: string;
  pcModel: string;
  cpuType: string;
  cpuNumber: string;
  cpuSpeed: string;
  totalPhysicalMemory: string;
  workstationNotes?: string;
  replacementQuarter: string;
  serviceNowTicketNumber: string;
  sharedDevice: string;
  serviceTagNumber: string;
  copActiveComputersHistory?: CopActiveComputersHistory[];
};

export type ActiveComputersSearchFilter = {
  computerName?: string;
  pbotPrimaryUser: string;
  primaryUser?: string;
  primaryUserName?: string;
  lastLogonUser?: string;
  pbotGroup?: string;
  replacementQuarter?: string;
  serviceNowTicketNumber?: string;
};
