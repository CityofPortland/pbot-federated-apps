export type PagedCopActiveComputers = {
  pageNumber: number;
  pageSize: number;
  firstPage: string;
  lastPage: string;
  totalPages: number;
  totalRecords: number;
  nextPage: string;
  previousPage: string;
  data: CopActiveComputers[];
  succeeded: boolean;
  errors?: string;
  message?: string;
};

export type CopActiveComputers = {
  computerName: string;
  costCenter: string;
  deploymentDate: string;
  primaryUser: string;
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
};
