// Master Category types
export interface MasterCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
  showInRecentPosts: boolean;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
}

// Category types
export interface Category {
  id: number;
  title: string;
  description: string;
  slug: string;
  displayOrder: number;
  masterCategoryId: number;
  masterCategory?: MasterCategory;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User {
  id: number;
  username: string;
  firstname?: string;
  lastname?: string;
  profilePic?: string;
  email?: string;
}

// Paginated response shape for /post when `page` is set
export interface PaginatedPosts {
  items: Post[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Post types
export interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  mainImageUrl?: string;
  excerpt?: string;
  userId: number;
  user?: User;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
  createdOn?: string; // Actual DB column name
  modifiedOn?: string; // Actual DB column name
}

// DTOs for creating/updating
export interface CreatePostDto {
  title: string;
  content: string;
  mainImageUrl?: string;
  categoryIds: number[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  mainImageUrl?: string;
  categoryIds?: number[];
}

export interface CreateCategoryDto {
  title: string;
  description: string;
  slug?: string;
  displayOrder?: number;
  masterCategoryId: number;
}

export interface UpdateCategoryDto {
  title?: string;
  description?: string;
  slug?: string;
  displayOrder?: number;
  masterCategoryId?: number;
}

export interface CreateMasterCategoryDto {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
  showInRecentPosts?: boolean;
}

export interface UpdateMasterCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
  showInRecentPosts?: boolean;
}
