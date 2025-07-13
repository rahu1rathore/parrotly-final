import api from "../../../lib/axios";
import {
  Module,
  Subscription,
  Organization,
  ModuleFormData,
  SubscriptionFormData,
  OrganizationFormData,
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

// Organization API endpoints
export const organizationAPI = {
  // Get all organizations
  getAll: (): Promise<{ data: Organization[] }> =>
    api.get("/admin/organizations"),

  // Get organization by ID
  getById: (id: string): Promise<{ data: Organization }> =>
    api.get(`/admin/organizations/${id}`),

  // Create organization
  create: (data: OrganizationFormData): Promise<{ data: Organization }> =>
    api.post("/admin/organizations", data),

  // Update organization
  update: (
    id: string,
    data: OrganizationFormData,
  ): Promise<{ data: Organization }> =>
    api.put(`/admin/organizations/${id}`, data),

  // Delete organization
  delete: (id: string): Promise<void> =>
    api.delete(`/admin/organizations/${id}`),
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
  {
    id: "2",
    name: "Pro Plan",
    description: "Advanced features for growing businesses",
    price: 79.99,
    validity: 30,
    modules: [
      {
        module_id: "1",
        module_name: "User Management",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
      {
        module_id: "2",
        module_name: "Analytics Dashboard",
        permissions: { view: true, edit: false, delete: false, create: false },
      },
    ],
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Enterprise Plan",
    description: "Full feature set for large organizations",
    price: 199.99,
    validity: 30,
    modules: [
      {
        module_id: "1",
        module_name: "User Management",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "2",
        module_name: "Analytics Dashboard",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
      {
        module_id: "3",
        module_name: "Billing System",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
    ],
    created_at: "2024-01-01T00:00:00Z",
  },
];

export const mockOrganizations: Organization[] = [
  {
    id: "1",
    name: "TechCorp Inc.",
    description: "Leading technology solutions provider",
    address: "123 Tech Street",
    city: "San Francisco",
    state: "California",
    country: "United States",
    postal_code: "94105",
    email: "info@techcorp.com",
    website: "https://www.techcorp.com",
    established_date: "2020-01-15",
    logo: "https://via.placeholder.com/150x150/1976d2/ffffff?text=TC",
    phone_number: "+1-555-123-4567",
    subscription_id: "2",
    subscription_name: "Pro Plan",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Global Enterprises Ltd.",
    description: "International business solutions",
    address: "456 Business Avenue",
    city: "New York",
    state: "New York",
    country: "United States",
    postal_code: "10001",
    email: "contact@globalent.com",
    website: "https://www.globalent.com",
    established_date: "2018-03-20",
    logo: "https://via.placeholder.com/150x150/388e3c/ffffff?text=GE",
    phone_number: "+1-555-987-6543",
    subscription_id: "3",
    subscription_name: "Enterprise Plan",
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    name: "StartupXYZ",
    description: "Innovative startup in fintech space",
    address: "789 Innovation Drive",
    city: "Austin",
    state: "Texas",
    country: "United States",
    postal_code: "73301",
    email: "hello@startupxyz.com",
    website: "https://www.startupxyz.com",
    established_date: "2022-06-10",
    logo: "https://via.placeholder.com/150x150/f57c00/ffffff?text=XYZ",
    phone_number: "+1-555-456-7890",
    subscription_id: "1",
    subscription_name: "Basic Plan",
    created_at: "2024-01-03T00:00:00Z",
  },
];
