// MVP-Compliant Types matching backend schema

export enum ItemAvailability {
  PERSONAL_ONLY = 'PERSONAL_ONLY',
  AVAILABLE_FOR_RENT = 'AVAILABLE_FOR_RENT',
  AVAILABLE_FOR_SALE = 'AVAILABLE_FOR_SALE',
  AVAILABLE_FOR_SWAP = 'AVAILABLE_FOR_SWAP',
}

export enum ItemCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  WORN = 'WORN',
}

export enum OrderStatus {
  REQUESTED = 'REQUESTED',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OrderType {
  RENT = 'RENT',
  SELL = 'SELL',
  SWAP = 'SWAP',
}

export enum ValidationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export enum Role {
  USER = 'USER',
  VALIDATOR = 'VALIDATOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface User {
  id: number;
  email: string;
  name?: string;
  location?: string;
  trustScore: number;
  role: Role;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WardrobeItem {
  id: number;
  ownerId: number;
  owner?: User;
  title: string;
  description?: string;
  category: string;
  brand?: string;
  size?: string;
  condition: ItemCondition;
  images: string[];
  availability: ItemAvailability;
  rentPricePerDay?: number;
  sellPrice?: number;
  wearCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  renterId: number;
  renter?: User;
  ownerId: number;
  owner?: User;
  itemId: number;
  item?: WardrobeItem;
  type: OrderType;
  status: OrderStatus;
  startDate?: string;
  endDate?: string;
  totalPrice?: number;
  requiresValidation: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  orderId: number;
  order?: Order;
  reviewerId: number;
  reviewer?: User;
  revieweeId: number;
  reviewee?: User;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Validation {
  id: number;
  orderId: number;
  order?: Order;
  itemId: number;
  item?: WardrobeItem;
  validatorId?: number;
  validator?: User;
  status: ValidationStatus;
  reason?: string;
  notes?: string;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface Delivery {
  id: number;
  orderId: number;
  order?: Order;
  status: DeliveryStatus;
  trackingNumber?: string;
  notes?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name?: string;
  email: string;
  password: string;
}

export interface CreateItemFormData {
  title: string;
  description?: string;
  category: string;
  brand?: string;
  size?: string;
  condition: ItemCondition;
  images: string[]; // Required: images array must always be provided
  availability?: ItemAvailability;
  rentPricePerDay?: number;
  sellPrice?: number;
}

export interface UpdateItemFormData {
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
  size?: string;
  condition?: ItemCondition;
  images?: string[];
  availability?: ItemAvailability;
  rentPricePerDay?: number;
  sellPrice?: number;
}

export interface CreateReviewFormData {
  rating: number;
  comment?: string;
}

export interface ItemFilters {
  availability?: ItemAvailability;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}
