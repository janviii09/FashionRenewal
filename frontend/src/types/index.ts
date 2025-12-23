// Types for the Wardrobe Marketplace

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  location?: string;
  bio?: string;
  trustScore: number;
  subscriptionTier: 'BASIC' | 'PREMIUM';
  createdAt: string;
  updatedAt: string;
}

export interface WardrobeItem {
  id: string;
  userId: string;
  user?: User;
  title: string;
  description: string;
  brand: string;
  category: ItemCategory;
  size: ItemSize;
  condition: ItemCondition;
  images: string[];
  rentPricePerDay?: number;
  sellPrice?: number;
  isAvailableForRent: boolean;
  isAvailableForSale: boolean;
  isAvailableForSwap: boolean;
  status: 'AVAILABLE' | 'RENTED' | 'SOLD' | 'UNAVAILABLE';
  views: number;
  favorites: number;
  createdAt: string;
  updatedAt: string;
}

export type ItemCategory = 
  | 'SHIRT'
  | 'PANTS'
  | 'DRESS'
  | 'JACKET'
  | 'COAT'
  | 'SKIRT'
  | 'SHOES'
  | 'ACCESSORIES'
  | 'BAG'
  | 'OTHER';

export type ItemSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'ONE_SIZE';

export type ItemCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'WORN';

export type OrderStatus = 
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'IN_USE'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface Order {
  id: string;
  itemId: string;
  item?: WardrobeItem;
  renterId: string;
  renter?: User;
  ownerId: string;
  owner?: User;
  type: 'RENT' | 'PURCHASE';
  status: OrderStatus;
  startDate: string;
  endDate: string;
  totalPrice: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  reviewer?: User;
  revieweeId: string;
  reviewee?: User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'BASIC' | 'PREMIUM';
  rentalsUsed: number;
  rentalsLimit: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface ItemFilters {
  category?: ItemCategory;
  size?: ItemSize;
  condition?: ItemCondition;
  minPrice?: number;
  maxPrice?: number;
  availability?: 'rent' | 'sale' | 'swap';
  search?: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface CreateItemFormData {
  title: string;
  description: string;
  brand: string;
  category: ItemCategory;
  size: ItemSize;
  condition: ItemCondition;
  images: File[];
  rentPricePerDay?: number;
  sellPrice?: number;
  isAvailableForRent: boolean;
  isAvailableForSale: boolean;
  isAvailableForSwap: boolean;
}

export interface RentalRequestFormData {
  itemId: string;
  startDate: Date;
  endDate: Date;
}
