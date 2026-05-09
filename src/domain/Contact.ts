export type Phone = {
  id?: number;
  phoneType: string;
  phoneNumber: string;
  isPrimary: boolean;
};

export type Email = {
  id?: number;
  emailType: string;
  emailAddress: string;
  isPrimary: boolean;
};

export type Address = {
  id?: number;
  addressType: string;
  postalCode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
};

export type Contact = {
  id: number;
  name: string;
  nickname?: string | null;
  memo?: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;

  phones: Phone[];
  emails: Email[];
  addresses: Address[];
  tags: string[];
  groups: string[];
};

export type ContactInput = {
  name: string;
  nickname?: string;
  memo?: string;
  phone?: string;
  email?: string;
  address?: string;
  tags?: string[];
  groups?: string[];
};