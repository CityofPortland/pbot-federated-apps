export type PagedPbotLcrSchedule = {
  pageNumber: number;
  pageSize: number;
  firstPage: string;
  lastPage: string;
  totalPages: number;
  totalRecords: number;
  nextPage: string;
  previousPage: string;
  data: PbotLcrSchedule[];
  succeeded: boolean;
  errors?: string;
  message?: string;
};

export type PbotLcrSchedule = {
  computerName: string;
  computerType: string;
  costCenter: string;
  primaryUser: string;
  primaryUserName: string;
  lastLogonUser: string;
  deviceLocation: string;
  deploymentDate: string;
  lastCommunication: string;
  osName: string;
  serialNumber: string;
  manufacturer: string;
  pcModel: string;
  cpuType: string;
  cpuNumber: string;
  cpuSpeed: string;
  totalPhysicalMemory: string;
  lcrDate: string;
  quarterOrderDate: string;
};

export type PbotLcrScheduleSearchFilter = {
  computerName?: string;
  primaryUser?: string;
  lastLogonUser?: string;
  pbotDivision?: string;
  pbotGroup?: string;
  quarterOrderDate?: string;
  fromLcrDate?: string;
  toLcrDate?: string;
};

export type PbotLcrScheduleIndex = {
  computerName?: string;
  computerType?: string;
  primaryUser?: string;
  primaryUserName?: string;
  deploymentDate?: Date;
  lastCommunication?: Date;
  quarterOrderDate?: Date;
  pbotDivision?: string;
  pbotGroup?: string;
};
