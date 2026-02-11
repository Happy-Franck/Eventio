// User & Auth Types
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  prestation_types?: PrestationType[];
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  bio?: string;
  website?: string;
  business_type?: 'individual' | 'company';
  company_name?: string;
  is_active?: boolean;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PrestationType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  is_active: boolean;
  order: number;
  parent?: Category;
  children?: Category[];
  children_count?: number;
}

export interface ProviderService {
  id: number;
  user_id: number;
  prestation_type_id: number;
  price_min?: number;
  price_max?: number;
  price_range?: string;
  description?: string;
  portfolio_images?: string[];
  experience_years?: number;
  is_available: boolean;
  provider?: User;
  prestation_type?: PrestationType;
}

export interface Budget {
  id: number;
  user_id: number;
  event_name: string;
  event_date?: string;
  total_budget_min: number;
  total_budget_max: number;
  budget_range: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  notes?: string;
  items?: BudgetItem[];
  items_count?: number;
  total_allocated_min?: number;
  total_allocated_max?: number;
  total_actual_cost?: number;
  is_exceeded?: boolean;
}

export interface BudgetItem {
  id: number;
  budget_id: number;
  prestation_type_id: number;
  allocated_min: number;
  allocated_max: number;
  allocated_range: string;
  actual_cost?: number;
  notes?: string;
  prestation_type?: PrestationType;
  is_over_budget?: boolean;
  variance?: number;
}

export interface Team {
  id: number;
  user_id: number;
  event_name: string;
  event_date?: string;
  event_location?: string;
  expected_guests?: number;
  status: 'draft' | 'active' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  selections?: TeamSelection[];
  selections_count?: number;
  total_estimated_price?: number;
  confirmed_count?: number;
  pending_count?: number;
}

export interface TeamSelection {
  id: number;
  team_id: number;
  provider_id: number;
  prestation_type_id: number;
  estimated_price?: number;
  status: 'pending' | 'confirmed' | 'rejected';
  notes?: string;
  provider?: User;
  prestation_type?: PrestationType;
}

export interface Collection {
  id: number;
  user_id: number;
  category_id?: number;
  name: string;
  description?: string;
  is_public: boolean;
  cover_image?: string;
  category?: Category;
  items?: CollectionItem[];
  items_count?: number;
}

export interface CollectionItem {
  id: number;
  collection_id: number;
  provider_id: number;
  prestation_type_id: number;
  order: number;
  notes?: string;
  provider?: User;
  prestation_type?: PrestationType;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
