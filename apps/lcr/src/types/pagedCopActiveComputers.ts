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
  costCenter?: string;
  deploymentDate?: string;
  primaryUser?: string;
  lastLogonUser?: string;
  deviceLocation?: string;
  lastCommunication?: string;
  osName?: string;
  serialNumber?: string;
  manufacturer?: string;
  pcModel?: string;
  cpuType?: string;
  cpuNumber?: string;
  cpuSpeed?: string;
  totalPhysicalMemory?: string;
};
