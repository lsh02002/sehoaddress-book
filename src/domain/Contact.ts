export type Phone = {
  id?: number;
  contactId: number;
  phoneType: string;
  phoneNumber: string;
  isPrimary: boolean;
  createdAt?: string;
};

export type Email = {
  id?: number;
  contactId: number;
  emailType: string;
  emailAddress: string;
  isPrimary: boolean;
  createdAt?: string;
};

export type Address = {
  id?: number;
  contactId: number;
  addressType: string;
  postalCode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  isPrimary: boolean;
  createdAt?: string;
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
  phones?: string[];
  emails?: string[];
  addresses?: string[];
  tags?: string[];
  groups?: string[];
};
