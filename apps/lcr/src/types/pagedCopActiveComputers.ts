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
  copActiveComputersHistory?: CopActiveComputersHistory[];
};

export type ActiveComputersSearchFilter = {
  computerName?: string;
  primaryUser?: string;
  primaryUserName?: string;
  lastLogonUser?: string;
  pbotGroup?: string;
  replacementQuarter?: string;
};
