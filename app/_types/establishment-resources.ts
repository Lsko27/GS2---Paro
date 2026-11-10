export type EstablishmentResource = {
  id: number;
  resourceId: number;
  name: string;
  description: string | null;
  available: boolean;
  free: boolean;
  condition: string | null;
};
