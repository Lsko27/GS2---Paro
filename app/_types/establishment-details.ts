export type EstablishmentDetailsData = {
  id: number;
  name: string;
  description: string | null;
  accessConditions: string | null;
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
};

export type EstablishmentResourceData = {
  id: number;
  resourceId: number;
  name: string;
  description: string | null;
  available: boolean;
  free: boolean;
  condition: string | null;
};

export type OpeningHour = {
  id: number;
  establishmentId: number;
  dayOfWeek: number;
  openingTime: string | null;
  closingTime: string | null;
  closed: boolean;
};

export type EstablishmentReview = {
  id: number;
  establishmentId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type ReviewSummary = {
  establishmentId: number;
  average: number | null;
  totalReviews: number;
};
