import api from "../../../lib/axios";
import {
  Module,
  Subscription,
  ModuleFormData,
  SubscriptionFormData,
} from "../types";

// Module API endpoints
export const moduleAPI = {
  // Get all modules
  getAll: (): Promise<{ data: Module[] }> => api.get("/admin/modules"),

  // Get active modules only
  getActive: (): Promise<{ data: Module[] }> =>
    api.get("/admin/modules?is_active=true"),

  // Create module
  create: (data: ModuleFormData): Promise<{ data: Module }> =>
    api.post("/admin/modules", data),

  // Update module
  update: (
    id: string,
    data: Partial<ModuleFormData>,
  ): Promise<{ data: Module }> => api.put(`/admin/modules/${id}`, data),

  // Toggle module active status
  toggleActive: (id: string, is_active: boolean): Promise<{ data: Module }> =>
    api.patch(`/admin/modules/${id}/toggle`, { is_active }),

  // Delete module (if needed in future)
  delete: (id: string): Promise<void> => api.delete(`/admin/modules/${id}`),
};

// Subscription API endpoints
export const subscriptionAPI = {
  // Get all subscriptions
  getAll: (): Promise<{ data: Subscription[] }> =>
    api.get("/admin/subscriptions"),

  // Get subscription by ID
  getById: (id: string): Promise<{ data: Subscription }> =>
    api.get(`/admin/subscriptions/${id}`),

  // Create subscription
  create: (data: SubscriptionFormData): Promise<{ data: Subscription }> =>
    api.post("/admin/subscriptions", data),

  // Update subscription
  update: (
    id: string,
    data: SubscriptionFormData,
  ): Promise<{ data: Subscription }> =>
    api.put(`/admin/subscriptions/${id}`, data),

  // Delete subscription
  delete: (id: string): Promise<void> =>
    api.delete(`/admin/subscriptions/${id}`),
};

// Mock data for development (remove when backend is ready)
export const mockModules: Module[] = [
  {
    id: "1",
    name: "User Management",
    description: "Manage users, roles and permissions",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Analytics Dashboard",
    description: "View analytics and reports",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    name: "Billing System",
    description: "Handle billing and invoicing",
    is_active: false,
    created_at: "2024-01-03T00:00:00Z",
  },
];

export const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Basic Plan",
    description: "Basic features for small teams",
    price: 29.99,
    validity: 30,
    modules: [
      {
        module_id: "1",
        module_name: "User Management",
        permissions: { view: true, edit: false, delete: false, create: false },
      },
    ],
    created_at: "2024-01-01T00:00:00Z",
  },
];
