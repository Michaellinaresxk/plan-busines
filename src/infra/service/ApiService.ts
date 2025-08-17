import type { Timestamp } from 'firebase/firestore';

export type ApiService = {
  id: string;
  title: string;
  category: string;
  basePrice: number;
  currency: string;
  description?: string;
  isActive: boolean;
  variants?: any[];
  tags: string[];
  createdAt: Timestamp; // Firebase Timestamp, not any
  updatedAt: Timestamp; // Firebase Timestamp, not any
};

