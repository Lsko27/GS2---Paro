export type EstablishmentSearchResult = {
  id: number;
  name: string;
  description: string | null;
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  imageUrl: string | null;
};
