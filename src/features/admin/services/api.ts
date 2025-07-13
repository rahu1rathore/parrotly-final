import api from "../../../lib/axios";
import {
  Module,
  Subscription,
  Organization,
  Customer,
  FormConfiguration,
  ModuleFormData,
  SubscriptionFormData,
  OrganizationFormData,
  CustomerFormData,
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

// Form Configuration API endpoints
export const formConfigurationAPI = {
  // Get all form configurations
  getAll: (): Promise<{ data: FormConfiguration[] }> =>
    api.get("/admin/form-configurations"),

  // Get form configurations by organization
  getByOrganization: (
    organizationId: string,
  ): Promise<{ data: FormConfiguration[] }> =>
    api.get(`/admin/form-configurations?organization_id=${organizationId}`),

  // Get form configuration by ID
  getById: (id: string): Promise<{ data: FormConfiguration }> =>
    api.get(`/admin/form-configurations/${id}`),

  // Create form configuration
  create: (
    data: Omit<FormConfiguration, "id" | "created_at" | "updated_at">,
  ): Promise<{ data: FormConfiguration }> =>
    api.post("/admin/form-configurations", data),

  // Update form configuration
  update: (
    id: string,
    data: Partial<FormConfiguration>,
  ): Promise<{ data: FormConfiguration }> =>
    api.put(`/admin/form-configurations/${id}`, data),

  // Delete form configuration
  delete: (id: string): Promise<void> =>
    api.delete(`/admin/form-configurations/${id}`),
};

// Customer API endpoints
export const customerAPI = {
  // Get all customers
  getAll: (): Promise<{ data: Customer[] }> => api.get("/admin/customers"),

  // Get customers by organization
  getByOrganization: (organizationId: string): Promise<{ data: Customer[] }> =>
    api.get(`/admin/customers?organization_id=${organizationId}`),

  // Get customer by ID
  getById: (id: string): Promise<{ data: Customer }> =>
    api.get(`/admin/customers/${id}`),

  // Create customer
  create: (data: CustomerFormData): Promise<{ data: Customer }> =>
    api.post("/admin/customers", data),

  // Update customer
  update: (id: string, data: CustomerFormData): Promise<{ data: Customer }> =>
    api.put(`/admin/customers/${id}`, data),

  // Delete customer
  delete: (id: string): Promise<void> => api.delete(`/admin/customers/${id}`),
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

export const mockFormConfigurations: FormConfiguration[] = [
  {
    id: "1",
    organization_id: "1",
    organization_name: "TechCorp Inc.",
    name: "Basic Customer Form",
    description: "Standard customer information form",
    fields: [
      {
        id: "1",
        name: "first_name",
        label: "First Name",
        type: "text",
        required: true,
        placeholder: "Enter first name",
        order: 1,
      },
      {
        id: "2",
        name: "last_name",
        label: "Last Name",
        type: "text",
        required: true,
        placeholder: "Enter last name",
        order: 2,
      },
      {
        id: "3",
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "Enter email address",
        order: 3,
      },
      {
        id: "4",
        name: "company",
        label: "Company",
        type: "text",
        required: false,
        placeholder: "Enter company name",
        order: 4,
      },
      {
        id: "5",
        name: "status",
        label: "Customer Status",
        type: "select",
        required: true,
        options: ["Active", "Inactive", "Pending", "Suspended"],
        order: 5,
      },
    ],
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    organization_id: "2",
    organization_name: "Global Enterprises Ltd.",
    name: "Enterprise Customer Form",
    description: "Comprehensive customer form for enterprise clients",
    fields: [
      {
        id: "6",
        name: "full_name",
        label: "Full Name",
        type: "text",
        required: true,
        placeholder: "Enter full name",
        order: 1,
      },
      {
        id: "7",
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "Enter email",
        order: 2,
      },
      {
        id: "8",
        name: "business_name",
        label: "Business Name",
        type: "text",
        required: true,
        placeholder: "Enter business name",
        order: 3,
      },
      {
        id: "9",
        name: "industry",
        label: "Industry",
        type: "select",
        required: true,
        options: [
          "Technology",
          "Healthcare",
          "Finance",
          "Manufacturing",
          "Retail",
          "Other",
        ],
        order: 4,
      },
      {
        id: "10",
        name: "annual_revenue",
        label: "Annual Revenue",
        type: "number",
        required: false,
        placeholder: "Enter annual revenue",
        order: 5,
      },
      {
        id: "11",
        name: "contract_start_date",
        label: "Contract Start Date",
        type: "date",
        required: false,
        order: 6,
      },
      {
        id: "12",
        name: "is_premium",
        label: "Premium Customer",
        type: "boolean",
        required: false,
        order: 7,
      },
    ],
    created_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    organization_id: "3",
    organization_name: "StartupXYZ",
    name: "Simple Contact Form",
    description: "Basic contact information form",
    fields: [
      {
        id: "13",
        name: "name",
        label: "Name",
        type: "text",
        required: true,
        placeholder: "Enter name",
        order: 1,
      },
      {
        id: "14",
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        placeholder: "Enter email",
        order: 2,
      },
      {
        id: "15",
        name: "interest_level",
        label: "Interest Level",
        type: "select",
        required: true,
        options: ["High", "Medium", "Low"],
        order: 3,
      },
      {
        id: "16",
        name: "notes",
        label: "Notes",
        type: "textarea",
        required: false,
        placeholder: "Additional notes...",
        order: 4,
      },
    ],
    created_at: "2024-01-03T00:00:00Z",
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "1",
    organization_id: "1",
    organization_name: "TechCorp Inc.",
    form_configuration_id: "1",
    phone_number: "+1-555-123-4567",
    data: {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      company: "ABC Corp",
      status: "Active",
    },
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    organization_id: "1",
    organization_name: "TechCorp Inc.",
    form_configuration_id: "1",
    phone_number: "+1-555-987-6543",
    data: {
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      company: "XYZ Inc",
      status: "Pending",
    },
    created_at: "2024-01-16T00:00:00Z",
  },
  {
    id: "3",
    organization_id: "2",
    organization_name: "Global Enterprises Ltd.",
    form_configuration_id: "2",
    phone_number: "+1-555-456-7890",
    data: {
      full_name: "Robert Johnson",
      email: "robert.johnson@enterprise.com",
      business_name: "Johnson Enterprises",
      industry: "Manufacturing",
      annual_revenue: 5000000,
      contract_start_date: "2024-01-01",
      is_premium: true,
    },
    created_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "4",
    organization_id: "3",
    organization_name: "StartupXYZ",
    form_configuration_id: "3",
    phone_number: "+1-555-789-0123",
    data: {
      name: "Sarah Wilson",
      email: "sarah.wilson@startup.com",
      interest_level: "High",
      notes: "Very interested in our fintech solutions",
    },
    created_at: "2024-01-25T00:00:00Z",
  },
  {
    id: "5",
    organization_id: "1",
    organization_name: "TechCorp Inc.",
    form_configuration_id: "1",
    phone_number: "+1-555-234-5678",
    data: {
      first_name: "Michael",
      last_name: "Brown",
      email: "michael.brown@techstart.com",
      company: "TechStart Solutions",
      status: "Active",
    },
    created_at: "2024-01-30T00:00:00Z",
  },
];
