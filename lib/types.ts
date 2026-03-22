// Core TypeScript interfaces for the SnapGrid

export interface Preset {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  afterImage: string;
  beforeImage?: string;
  coverImage?: string;
  downloadUrl?: string;
}

export interface CartItem extends Preset {}

export interface UserPreset {
  userId: string;
  presetId: string;
  type: "purchased" | "downloaded";
  createdAt: Date;
}

export interface Purchase {
  userId: string;
  presetId: string;
  paymentId: string;
  createdAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  displayName?: string;
  photoURL?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}
