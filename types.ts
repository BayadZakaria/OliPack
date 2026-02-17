
export type UserRole = 'ADMIN' | 'TECHNICIEN' | 'COLLECTEUR' | 'HUILERIE' | 'ACHETEUR' | 'VENDEUR';
export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface UserProfile {
  id?: string;
  nom: string;
  prenom: string;
  cin: string;
  telephone: string;
  email: string;
  ville: string;
  password?: string;
  fonction: string;
  role: UserRole;
  status: UserStatus;
  isVVIP?: boolean;
  deletionRequested?: boolean;
}

export interface ProductReview {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  img: string;
  category: string;
}

export const AppSection = {
  HOME: 'home',
  DASHBOARD: 'dashboard',
  STRATEGY: 'strategy',
  STUDIO: 'studio',
  ASSISTANT: 'assistant',
  ADMIN_CONTROL: 'admin_control',
  SALES_CONTROL: 'sales_control',
  ML_PREDICT: 'ml_predict',
  QUALITY_CONTROL: 'quality_control',
  SCAN: 'scan',
  IMPACT: 'impact',
  ATELIER: 'atelier',
  PROFILE: 'profile',
  COLLECTION: 'collection',
  PRODUCTS: 'products',
  USER_MANAGEMENT: 'user_management'
} as const;

export type AppSection = typeof AppSection[keyof typeof AppSection];
