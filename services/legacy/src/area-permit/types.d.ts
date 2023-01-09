export type ZoneEnforcementInfo = {
  visitorLimit: string;
  enforcementHours: string;
};

export type AreaPermitZone = {
  id: string;
  name: string;
  displayName: string;
  subSection: string;
};

export type AreaPermit = {
  licensePlate: string;
  zone?: AreaPermitZone | null;
  isValid: boolean;
};
