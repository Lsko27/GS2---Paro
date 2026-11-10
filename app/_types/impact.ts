export interface ResourceImpact {
  name: string;
  totalEstablishments: number;
}

export interface ImpactSummary {
  totalEstablishments: number;
  totalNeighborhoods: number;
  resources: ResourceImpact[];
}
