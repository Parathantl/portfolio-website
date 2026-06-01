import { API_BASE_URL } from './config';

// Portfolio API
export const portfolioAPI = {
  // Projects
  getProjects: async () => {
    const response = await fetch(`${API_BASE_URL}/portfolio/projects`);
    return response.json();
  },

  getFeaturedProjects: async () => {
    const response = await fetch(`${API_BASE_URL}/portfolio/projects/featured`);
    return response.json();
  },

  getProject: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/portfolio/projects/${id}`);
    return response.json();
  },

  // Skills
  getSkills: async () => {
    const response = await fetch(`${API_BASE_URL}/portfolio/skills`);
    return response.json();
  },

  // Experience
  getExperience: async () => {
    const response = await fetch(`${API_BASE_URL}/portfolio/experience`);
    return response.json();
  },

  // About
  getAbout: async () => {
    const response = await fetch(`${API_BASE_URL}/portfolio/about`);
    return response.json();
  },
};

// Blog API
export const blogAPI = {
  // Posts
  // Admin-only listing. Sends the JWT cookie so the backend includes drafts;
  // public pages use getPostsPaginated / serverFetch (no cookie -> published only).
  getPosts: async (filters?: any) => {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    const response = await fetch(`${API_BASE_URL}/post${params}`, {
      credentials: 'include',
    });
    return response.json();
  },

  getPostsPaginated: async (params: {
    page: number;
    limit?: number;
    q?: string;
    masterCategory?: string;
    category?: string;
  }) => {
    const search = new URLSearchParams();
    search.set('page', String(params.page));
    search.set('limit', String(params.limit ?? 9));
    if (params.q) search.set('q', params.q);
    if (params.masterCategory) search.set('masterCategory', params.masterCategory);
    if (params.category) search.set('category', params.category);
    const response = await fetch(`${API_BASE_URL}/post?${search.toString()}`);
    return response.json();
  },

  getPostById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/post/${id}`);
    return response.json();
  },

  createPost: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create post' }));
      throw error;
    }

    return response.json();
  },

  updatePost: async (slug: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/post/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update post' }));
      throw error;
    }

    return response.json();
  },

  deletePost: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/post/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.json();
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/post/upload-photo`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return response.json();
  },

  generateExcerpt: async (title: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/post/generate-excerpt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to generate excerpt' }));
      throw error;
    }

    return response.json();
  },

  // Categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/category`);
    return response.json();
  },

  createCategory: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateCategory: async (id: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/category/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update category' }));
      throw error;
    }

    return response.json();
  },

  deleteCategory: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/category/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.json();
  },

  reorderCategories: async (categories: Array<{ id: number; displayOrder: number }>) => {
    const response = await fetch(`${API_BASE_URL}/category/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(categories),
    });
    return response.json();
  },

  // Master Categories
  getMasterCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/master-categories`);
    return response.json();
  },

  createMasterCategory: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/master-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create master category' }));
      throw error;
    }

    return response.json();
  },

  updateMasterCategory: async (id: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/master-categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update master category' }));
      throw error;
    }

    return response.json();
  },

  deleteMasterCategory: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/master-categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete master category' }));
      throw error;
    }

    return response.json();
  },
};

// Media API (admin only — JWT required by backend)
export const mediaAPI = {
  list: async (params: { folder?: string; cursor?: string; limit?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.folder) search.set('folder', params.folder);
    if (params.cursor) search.set('cursor', params.cursor);
    if (params.limit) search.set('limit', String(params.limit));
    const qs = search.toString();
    const response = await fetch(`${API_BASE_URL}/media${qs ? `?${qs}` : ''}`, {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to list media (${response.status})`);
    }
    return response.json();
  },

  delete: async (publicId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/media/${encodeURIComponent(publicId)}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to delete media (${response.status})`);
    }
    return response.json();
  },
};

// Contact API
export const contactAPI = {
  submitContact: async (data: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
