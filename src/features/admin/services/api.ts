import api from "../../../lib/axios";
import {
  Module,
  Subscription,
  Organization,
  Customer,
  FormConfiguration,
  Chat,
  ChatUser,
  ChatMessage,
  ModuleFormData,
  SubscriptionFormData,
  OrganizationFormData,
  CustomerFormData,
  ChatUserFormData,
  WhatsAppTemplate,
  WhatsAppTemplateFormData,
  TemplateInsights,
  TemplateInteraction,
  BulkSendRequest,
  BulkSendResult,
  UserSegment,
  DynamicForm,
  DynamicFormField,
  Campaign,
  CampaignFormData,
  Lead,
  LeadFormData,
  LeadFilter,
  LeadAssignment,
  Task,
  TaskFormData,
  ActivityLog,
  Agent,
  BulkUploadResult,
  LeadStats,
  CampaignStats,
  ChatbotFlow,
  ChatbotFlowFormData,
  ChatbotFlowNode,
  ChatbotFlowEdge,
  ChatbotFlowVersion,
  ChatbotNodeTemplate,
  ChatbotConversation,
  ChatbotAnalytics,
  ChatbotTestResult,
  ChatbotIntegration,
  ChatbotFilter,
  ChatbotFlowStats,
} from "../types";

// Module API interfaces
interface ModulePaginationParams {
  page: number;
  limit: number;
}

interface ModuleFilterParams {
  search?: string;
  status?: "all" | "active" | "inactive";
  category?: string;
  created_after?: string;
  created_before?: string;
  sort_by?: "name" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
}

interface ModuleListResponse {
  data: Module[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: ModuleFilterParams;
  summary: {
    total_modules: number;
    active_modules: number;
    inactive_modules: number;
    categories: { [key: string]: number };
  };
}

// Module API endpoints
export const moduleAPI = {
  // Get modules with pagination and filtering
  getAll: (
    params?: ModulePaginationParams & ModuleFilterParams,
  ): Promise<ModuleListResponse> => {
    // Simulate server-side processing
    return new Promise((resolve) => {
      setTimeout(() => {
        const {
          page = 1,
          limit = 10,
          search = "",
          status = "all",
          category = "",
          sort_by = "created_at",
          sort_order = "desc",
          created_after,
          created_before,
        } = params || {};

        let filteredData = [...mockModules];

        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filteredData = filteredData.filter(
            (module) =>
              module.name.toLowerCase().includes(searchLower) ||
              module.description.toLowerCase().includes(searchLower),
          );
        }

        // Apply status filter
        if (status !== "all") {
          filteredData = filteredData.filter((module) =>
            status === "active" ? module.is_active : !module.is_active,
          );
        }

        // Apply category filter
        if (category) {
          filteredData = filteredData.filter((module) => {
            const moduleCategory = getModuleCategory(
              mockModules.indexOf(module),
            );
            return moduleCategory === category;
          });
        }

        // Apply date filters
        if (created_after) {
          filteredData = filteredData.filter(
            (module) => new Date(module.created_at) >= new Date(created_after),
          );
        }
        if (created_before) {
          filteredData = filteredData.filter(
            (module) => new Date(module.created_at) <= new Date(created_before),
          );
        }

        // Apply sorting
        filteredData.sort((a, b) => {
          let aValue: any = a[sort_by as keyof Module];
          let bValue: any = b[sort_by as keyof Module];

          if (sort_by === "created_at" || sort_by === "updated_at") {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          } else {
            aValue = aValue?.toString().toLowerCase() || "";
            bValue = bValue?.toString().toLowerCase() || "";
          }

          if (sort_order === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        // Calculate pagination
        const total = filteredData.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        const total_pages = Math.ceil(total / limit);
        const has_next = page < total_pages;
        const has_prev = page > 1;

        // Calculate summary
        const summary = {
          total_modules: mockModules.length,
          active_modules: mockModules.filter((m) => m.is_active).length,
          inactive_modules: mockModules.filter((m) => !m.is_active).length,
          categories: mockModules.reduce(
            (acc, module, index) => {
              const cat = getModuleCategory(index);
              acc[cat] = (acc[cat] || 0) + 1;
              return acc;
            },
            {} as { [key: string]: number },
          ),
        };

        resolve({
          data: paginatedData,
          pagination: {
            total,
            page,
            limit,
            total_pages,
            has_next,
            has_prev,
          },
          filters_applied: params || {},
          summary,
        });
      }, 300); // Simulate network delay
    });
  },

  // Get active modules only
  getActive: (params?: ModulePaginationParams): Promise<ModuleListResponse> =>
    moduleAPI.getAll({ ...params, status: "active" }),

  // Get module by ID
  getById: (id: string): Promise<{ data: Module }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const module = mockModules.find((m) => m.id === id);
        if (module) {
          resolve({ data: module });
        } else {
          reject(new Error("Module not found"));
        }
      }, 100);
    });
  },

  // Create module
  create: (data: ModuleFormData): Promise<{ data: Module }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newModule: Module = {
          id: `module-${Date.now()}`,
          name: data.name,
          description: data.description,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockModules.unshift(newModule);
        resolve({ data: newModule });
      }, 200);
    });
  },

  // Update module
  update: (
    id: string,
    data: Partial<ModuleFormData>,
  ): Promise<{ data: Module }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const moduleIndex = mockModules.findIndex((m) => m.id === id);
        if (moduleIndex !== -1) {
          mockModules[moduleIndex] = {
            ...mockModules[moduleIndex],
            ...data,
            updated_at: new Date().toISOString(),
          };
          resolve({ data: mockModules[moduleIndex] });
        } else {
          reject(new Error("Module not found"));
        }
      }, 200);
    });
  },

  // Toggle module active status
  toggleActive: (id: string, is_active: boolean): Promise<{ data: Module }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const moduleIndex = mockModules.findIndex((m) => m.id === id);
        if (moduleIndex !== -1) {
          mockModules[moduleIndex] = {
            ...mockModules[moduleIndex],
            is_active,
            updated_at: new Date().toISOString(),
          };
          resolve({ data: mockModules[moduleIndex] });
        } else {
          reject(new Error("Module not found"));
        }
      }, 200);
    });
  },

  // Delete module
  delete: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const moduleIndex = mockModules.findIndex((m) => m.id === id);
        if (moduleIndex !== -1) {
          mockModules.splice(moduleIndex, 1);
          resolve();
        } else {
          reject(new Error("Module not found"));
        }
      }, 200);
    });
  },

  // Bulk operations
  bulkUpdate: (
    ids: string[],
    data: Partial<ModuleFormData>,
  ): Promise<{ data: Module[]; updated_count: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedModules: Module[] = [];
        ids.forEach((id) => {
          const moduleIndex = mockModules.findIndex((m) => m.id === id);
          if (moduleIndex !== -1) {
            mockModules[moduleIndex] = {
              ...mockModules[moduleIndex],
              ...data,
              updated_at: new Date().toISOString(),
            };
            updatedModules.push(mockModules[moduleIndex]);
          }
        });
        resolve({ data: updatedModules, updated_count: updatedModules.length });
      }, 300);
    });
  },

  bulkDelete: (ids: string[]): Promise<{ deleted_count: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let deletedCount = 0;
        ids.forEach((id) => {
          const moduleIndex = mockModules.findIndex((m) => m.id === id);
          if (moduleIndex !== -1) {
            mockModules.splice(moduleIndex, 1);
            deletedCount++;
          }
        });
        resolve({ deleted_count: deletedCount });
      }, 300);
    });
  },

  // Get categories
  getCategories: (): Promise<{ data: string[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const categories = Array.from(
          new Set(mockModules.map((_, index) => getModuleCategory(index))),
        );
        resolve({ data: categories });
      }, 100);
    });
  },

  // Export modules
  export: (
    format: "csv" | "excel" | "json",
    filters?: ModuleFilterParams,
  ): Promise<{ download_url: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate file generation
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `modules-export-${timestamp}.${format}`;
        resolve({
          download_url: `/api/admin/modules/export/${filename}`,
        });
      }, 1000);
    });
  },
};

// Subscription API interfaces
interface SubscriptionPaginationParams {
  page: number;
  limit: number;
}

interface SubscriptionFilterParams {
  search?: string;
  price_min?: number;
  price_max?: number;
  validity_min?: number;
  validity_max?: number;
  created_after?: string;
  created_before?: string;
  sort_by?: "name" | "price" | "validity" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
  plan_type?: "basic" | "pro" | "enterprise" | "all";
}

interface SubscriptionListResponse {
  data: Subscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: SubscriptionFilterParams;
  summary: {
    total_subscriptions: number;
    avg_price: number;
    avg_validity: number;
    plan_distribution: { [key: string]: number };
    price_ranges: {
      basic: { min: number; max: number; count: number };
      mid: { min: number; max: number; count: number };
      premium: { min: number; max: number; count: number };
    };
  };
}

// Subscription API endpoints
export const subscriptionAPI = {
  // Get subscriptions with pagination and filtering
  getAll: (
    params?: SubscriptionPaginationParams & SubscriptionFilterParams,
  ): Promise<SubscriptionListResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const {
          page = 1,
          limit = 10,
          search = "",
          price_min,
          price_max,
          validity_min,
          validity_max,
          sort_by = "created_at",
          sort_order = "desc",
          plan_type = "all",
          created_after,
          created_before,
        } = params || {};

        let filteredData = [...mockSubscriptions];

        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filteredData = filteredData.filter(
            (subscription) =>
              subscription.name.toLowerCase().includes(searchLower) ||
              subscription.description?.toLowerCase().includes(searchLower),
          );
        }

        // Apply price range filter
        if (price_min !== undefined) {
          filteredData = filteredData.filter((sub) => sub.price >= price_min);
        }
        if (price_max !== undefined) {
          filteredData = filteredData.filter((sub) => sub.price <= price_max);
        }

        // Apply validity range filter
        if (validity_min !== undefined) {
          filteredData = filteredData.filter(
            (sub) => sub.validity >= validity_min,
          );
        }
        if (validity_max !== undefined) {
          filteredData = filteredData.filter(
            (sub) => sub.validity <= validity_max,
          );
        }

        // Apply plan type filter
        if (plan_type !== "all") {
          filteredData = filteredData.filter((sub) => {
            const planName = sub.name.toLowerCase();
            switch (plan_type) {
              case "basic":
                return planName.includes("basic");
              case "pro":
                return planName.includes("pro");
              case "enterprise":
                return planName.includes("enterprise");
              default:
                return true;
            }
          });
        }

        // Apply date filters
        if (created_after) {
          filteredData = filteredData.filter(
            (sub) => new Date(sub.created_at!) >= new Date(created_after),
          );
        }
        if (created_before) {
          filteredData = filteredData.filter(
            (sub) => new Date(sub.created_at!) <= new Date(created_before),
          );
        }

        // Apply sorting
        filteredData.sort((a, b) => {
          let aValue: any = a[sort_by as keyof Subscription];
          let bValue: any = b[sort_by as keyof Subscription];

          if (sort_by === "created_at" || sort_by === "updated_at") {
            aValue = new Date(aValue || 0).getTime();
            bValue = new Date(bValue || 0).getTime();
          } else if (sort_by === "price" || sort_by === "validity") {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
          } else {
            aValue = aValue?.toString().toLowerCase() || "";
            bValue = bValue?.toString().toLowerCase() || "";
          }

          if (sort_order === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        // Calculate pagination
        const total = filteredData.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        const total_pages = Math.ceil(total / limit);
        const has_next = page < total_pages;
        const has_prev = page > 1;

        // Calculate summary statistics
        const allPrices = mockSubscriptions.map((s) => s.price);
        const allValidities = mockSubscriptions.map((s) => s.validity);
        const avgPrice =
          allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
        const avgValidity =
          allValidities.reduce((a, b) => a + b, 0) / allValidities.length;

        const planDistribution = mockSubscriptions.reduce(
          (acc, sub) => {
            const planName = sub.name.toLowerCase();
            if (planName.includes("basic")) acc.basic = (acc.basic || 0) + 1;
            else if (planName.includes("pro")) acc.pro = (acc.pro || 0) + 1;
            else if (planName.includes("enterprise"))
              acc.enterprise = (acc.enterprise || 0) + 1;
            else acc.other = (acc.other || 0) + 1;
            return acc;
          },
          {} as { [key: string]: number },
        );

        const priceRanges = {
          basic: {
            min: 0,
            max: 50,
            count: mockSubscriptions.filter((s) => s.price <= 50).length,
          },
          mid: {
            min: 51,
            max: 150,
            count: mockSubscriptions.filter(
              (s) => s.price > 50 && s.price <= 150,
            ).length,
          },
          premium: {
            min: 151,
            max: 1000,
            count: mockSubscriptions.filter((s) => s.price > 150).length,
          },
        };

        const summary = {
          total_subscriptions: mockSubscriptions.length,
          avg_price: Math.round(avgPrice * 100) / 100,
          avg_validity: Math.round(avgValidity),
          plan_distribution: planDistribution,
          price_ranges: priceRanges,
        };

        resolve({
          data: paginatedData,
          pagination: {
            total,
            page,
            limit,
            total_pages,
            has_next,
            has_prev,
          },
          filters_applied: params || {},
          summary,
        });
      }, 300); // Simulate network delay
    });
  },

  // Get subscription by ID
  getById: (id: string): Promise<{ data: Subscription }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const subscription = mockSubscriptions.find((s) => s.id === id);
        if (subscription) {
          resolve({ data: subscription });
        } else {
          reject(new Error("Subscription not found"));
        }
      }, 100);
    });
  },

  // Create subscription
  create: (data: SubscriptionFormData): Promise<{ data: Subscription }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSubscription: Subscription = {
          id: `subscription-${Date.now()}`,
          name: data.name,
          description: data.description,
          price: data.price,
          validity: data.validity,
          modules: data.modules,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockSubscriptions.unshift(newSubscription);
        resolve({ data: newSubscription });
      }, 200);
    });
  },

  // Update subscription
  update: (
    id: string,
    data: Partial<SubscriptionFormData>,
  ): Promise<{ data: Subscription }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const subscriptionIndex = mockSubscriptions.findIndex(
          (s) => s.id === id,
        );
        if (subscriptionIndex !== -1) {
          mockSubscriptions[subscriptionIndex] = {
            ...mockSubscriptions[subscriptionIndex],
            ...data,
            updated_at: new Date().toISOString(),
          };
          resolve({ data: mockSubscriptions[subscriptionIndex] });
        } else {
          reject(new Error("Subscription not found"));
        }
      }, 200);
    });
  },

  // Delete subscription
  delete: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const subscriptionIndex = mockSubscriptions.findIndex(
          (s) => s.id === id,
        );
        if (subscriptionIndex !== -1) {
          mockSubscriptions.splice(subscriptionIndex, 1);
          resolve();
        } else {
          reject(new Error("Subscription not found"));
        }
      }, 200);
    });
  },

  // Bulk operations
  bulkUpdate: (
    ids: string[],
    data: Partial<SubscriptionFormData>,
  ): Promise<{ data: Subscription[]; updated_count: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedSubscriptions: Subscription[] = [];
        ids.forEach((id) => {
          const subscriptionIndex = mockSubscriptions.findIndex(
            (s) => s.id === id,
          );
          if (subscriptionIndex !== -1) {
            mockSubscriptions[subscriptionIndex] = {
              ...mockSubscriptions[subscriptionIndex],
              ...data,
              updated_at: new Date().toISOString(),
            };
            updatedSubscriptions.push(mockSubscriptions[subscriptionIndex]);
          }
        });
        resolve({
          data: updatedSubscriptions,
          updated_count: updatedSubscriptions.length,
        });
      }, 300);
    });
  },

  bulkDelete: (ids: string[]): Promise<{ deleted_count: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let deletedCount = 0;
        ids.forEach((id) => {
          const subscriptionIndex = mockSubscriptions.findIndex(
            (s) => s.id === id,
          );
          if (subscriptionIndex !== -1) {
            mockSubscriptions.splice(subscriptionIndex, 1);
            deletedCount++;
          }
        });
        resolve({ deleted_count: deletedCount });
      }, 300);
    });
  },

  // Get plan types
  getPlanTypes: (): Promise<{ data: string[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const planTypes = ["basic", "pro", "enterprise"];
        resolve({ data: planTypes });
      }, 100);
    });
  },

  // Export subscriptions
  export: (
    format: "csv" | "excel" | "json",
    filters?: SubscriptionFilterParams,
  ): Promise<{ download_url: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `subscriptions-export-${timestamp}.${format}`;
        resolve({
          download_url: `/api/admin/subscriptions/export/${filename}`,
        });
      }, 1000);
    });
  },

  // Get subscription analytics
  getAnalytics: (): Promise<{
    data: {
      revenue_trend: { month: string; revenue: number }[];
      popular_plans: { plan: string; subscribers: number }[];
      churn_rate: number;
      growth_rate: number;
    };
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analytics = {
          revenue_trend: [
            { month: "Jan", revenue: 12000 },
            { month: "Feb", revenue: 15000 },
            { month: "Mar", revenue: 18000 },
            { month: "Apr", revenue: 22000 },
            { month: "May", revenue: 25000 },
            { month: "Jun", revenue: 28000 },
          ],
          popular_plans: [
            { plan: "Pro Plan", subscribers: 450 },
            { plan: "Basic Plan", subscribers: 320 },
            { plan: "Enterprise Plan", subscribers: 180 },
          ],
          churn_rate: 5.2,
          growth_rate: 15.8,
        };
        resolve({ data: analytics });
      }, 200);
    });
  },
};

// Organization API interfaces
interface OrganizationPaginationParams {
  page: number;
  limit: number;
}

interface OrganizationFilterParams {
  search?: string;
  country?: string;
  state?: string;
  city?: string;
  subscription_id?: string;
  established_after?: string;
  established_before?: string;
  sort_by?: "name" | "established_date" | "created_at" | "updated_at" | "city" | "country";
  sort_order?: "asc" | "desc";
  industry?: string;
  size?: "startup" | "small" | "medium" | "large" | "enterprise" | "all";
}

interface OrganizationListResponse {
  data: Organization[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: OrganizationFilterParams;
  summary: {
    total_organizations: number;
    countries: { [key: string]: number };
    subscription_distribution: { [key: string]: number };
    establishment_years: {
      last_year: number;
      last_3_years: number;
      last_5_years: number;
      older: number;
    };
    organization_sizes: {
      startup: number;
      small: number;
      medium: number;
      large: number;
      enterprise: number;
    };
  };
}

// Organization API endpoints
export const organizationAPI = {
  // Get organizations with pagination and filtering
  getAll: (params?: OrganizationPaginationParams & OrganizationFilterParams): Promise<OrganizationListResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const {
          page = 1,
          limit = 10,
          search = "",
          country = "",
          state = "",
          city = "",
          subscription_id = "",
          established_after,
          established_before,
          sort_by = "created_at",
          sort_order = "desc",
          industry = "",
          size = "all",
        } = params || {};

        let filteredData = [...mockOrganizations];

        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filteredData = filteredData.filter(
            (org) =>
              org.name.toLowerCase().includes(searchLower) ||
              org.description?.toLowerCase().includes(searchLower) ||
              org.email?.toLowerCase().includes(searchLower) ||
              org.address?.toLowerCase().includes(searchLower)
          );
        }

        // Apply country filter
        if (country) {
          filteredData = filteredData.filter(org =>
            org.country?.toLowerCase().includes(country.toLowerCase())
          );
        }

        // Apply state filter
        if (state) {
          filteredData = filteredData.filter(org =>
            org.state?.toLowerCase().includes(state.toLowerCase())
          );
        }

        // Apply city filter
        if (city) {
          filteredData = filteredData.filter(org =>
            org.city?.toLowerCase().includes(city.toLowerCase())
          );
        }

        // Apply subscription filter
        if (subscription_id) {
          filteredData = filteredData.filter(org => org.subscription_id === subscription_id);
        }

        // Apply industry filter (simulated based on organization name/description)
        if (industry) {
          filteredData = filteredData.filter(org => {
            const orgData = (org.name + " " + org.description).toLowerCase();
            switch (industry) {
              case "technology": return orgData.includes("tech") || orgData.includes("software") || orgData.includes("digital");
              case "finance": return orgData.includes("fintech") || orgData.includes("financial") || orgData.includes("bank");
              case "healthcare": return orgData.includes("health") || orgData.includes("medical") || orgData.includes("pharma");
              case "retail": return orgData.includes("retail") || orgData.includes("commerce") || orgData.includes("store");
              case "education": return orgData.includes("education") || orgData.includes("university") || orgData.includes("school");
              default: return true;
            }
          });
        }

        // Apply size filter (simulated based on organization name patterns)
        if (size !== "all") {
          filteredData = filteredData.filter(org => {
            const orgName = org.name.toLowerCase();
            switch (size) {
              case "startup": return orgName.includes("startup") || orgName.includes("xyz");
              case "small": return orgName.includes("small") || orgName.includes("local");
              case "medium": return orgName.includes("medium") || orgName.includes("solutions");
              case "large": return orgName.includes("corp") || orgName.includes("inc");
              case "enterprise": return orgName.includes("enterprise") || orgName.includes("global");
              default: return true;
            }
          });
        }

        // Apply date filters
        if (established_after) {
          filteredData = filteredData.filter(
            (org) => org.established_date && new Date(org.established_date) >= new Date(established_after)
          );
        }
        if (established_before) {
          filteredData = filteredData.filter(
            (org) => org.established_date && new Date(org.established_date) <= new Date(established_before)
          );
        }

        // Apply sorting
        filteredData.sort((a, b) => {
          let aValue: any = a[sort_by as keyof Organization];
          let bValue: any = b[sort_by as keyof Organization];

          if (sort_by === "created_at" || sort_by === "updated_at" || sort_by === "established_date") {
            aValue = new Date(aValue || 0).getTime();
            bValue = new Date(bValue || 0).getTime();
          } else {
            aValue = aValue?.toString().toLowerCase() || "";
            bValue = bValue?.toString().toLowerCase() || "";
          }

          if (sort_order === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        // Calculate pagination
        const total = filteredData.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        const total_pages = Math.ceil(total / limit);
        const has_next = page < total_pages;
        const has_prev = page > 1;

        // Calculate summary statistics
        const countries = mockOrganizations.reduce((acc, org) => {
          if (org.country) {
            acc[org.country] = (acc[org.country] || 0) + 1;
          }
          return acc;
        }, {} as { [key: string]: number });

        const subscriptionDistribution = mockOrganizations.reduce((acc, org) => {
          if (org.subscription_name) {
            acc[org.subscription_name] = (acc[org.subscription_name] || 0) + 1;
          }
          return acc;
        }, {} as { [key: string]: number });

        const currentYear = new Date().getFullYear();
        const establishmentYears = mockOrganizations.reduce((acc, org) => {
          if (org.established_date) {
            const estYear = new Date(org.established_date).getFullYear();
            const yearsAgo = currentYear - estYear;

            if (yearsAgo <= 1) acc.last_year++;
            else if (yearsAgo <= 3) acc.last_3_years++;
            else if (yearsAgo <= 5) acc.last_5_years++;
            else acc.older++;
          }
          return acc;
        }, { last_year: 0, last_3_years: 0, last_5_years: 0, older: 0 });

        // Simulate organization sizes based on naming patterns
        const organizationSizes = mockOrganizations.reduce((acc, org) => {
          const orgName = org.name.toLowerCase();
          if (orgName.includes("startup")) acc.startup++;
          else if (orgName.includes("small") || orgName.includes("local")) acc.small++;
          else if (orgName.includes("solutions")) acc.medium++;
          else if (orgName.includes("corp") || orgName.includes("inc")) acc.large++;
          else if (orgName.includes("enterprise") || orgName.includes("global")) acc.enterprise++;
          else acc.medium++; // default
          return acc;
        }, { startup: 0, small: 0, medium: 0, large: 0, enterprise: 0 });

        const summary = {
          total_organizations: mockOrganizations.length,
          countries,
          subscription_distribution: subscriptionDistribution,
          establishment_years: establishmentYears,
          organization_sizes: organizationSizes,
        };

        resolve({
          data: paginatedData,
          pagination: {
            total,
            page,
            limit,
            total_pages,
            has_next,
            has_prev,
          },
          filters_applied: params || {},
          summary,
        });
      }, 300); // Simulate network delay
    });
  },

  // Get organization by ID
  getById: (id: string): Promise<{ data: Organization }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const organization = mockOrganizations.find((o) => o.id === id);
        if (organization) {
          resolve({ data: organization });
        } else {
          reject(new Error("Organization not found"));
        }
      }, 100);
    });
  },

  // Create organization
  create: (data: OrganizationFormData): Promise<{ data: Organization }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrganization: Organization = {
          id: `org-${Date.now()}`,
          name: data.name,
          description: data.description,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postal_code: data.postal_code,
          email: data.email,
          website: data.website,
          established_date: data.established_date,
          logo: data.logo || `https://via.placeholder.com/150x150/2196f3/ffffff?text=${data.name.charAt(0)}`,
          phone_number: data.phone_number,
          subscription_id: data.subscription_id,
          subscription_name: data.subscription_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockOrganizations.unshift(newOrganization);
        resolve({ data: newOrganization });
      }, 200);
    });
  },

  // Update organization
  update: (
    id: string,
    data: Partial<OrganizationFormData>,
  ): Promise<{ data: Organization }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const organizationIndex = mockOrganizations.findIndex((o) => o.id === id);
        if (organizationIndex !== -1) {
          mockOrganizations[organizationIndex] = {
            ...mockOrganizations[organizationIndex],
            ...data,
            updated_at: new Date().toISOString(),
          };
          resolve({ data: mockOrganizations[organizationIndex] });
        } else {
          reject(new Error("Organization not found"));
        }
      }, 200);
    });
  },

  // Delete organization
  delete: (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const organizationIndex = mockOrganizations.findIndex((o) => o.id === id);
        if (organizationIndex !== -1) {
          mockOrganizations.splice(organizationIndex, 1);
          resolve();
        } else {
          reject(new Error("Organization not found"));
        }
      }, 200);
    });
  },

  // Bulk operations
  bulkUpdate: (
    ids: string[],
    data: Partial<OrganizationFormData>,
  ): Promise<{ data: Organization[]; updated_count: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedOrganizations: Organization[] = [];
        ids.forEach((id) => {
          const organizationIndex = mockOrganizations.findIndex((o) => o.id === id);
          if (organizationIndex !== -1) {
            mockOrganizations[organizationIndex] = {
              ...mockOrganizations[organizationIndex],
              ...data,
              updated_at: new Date().toISOString(),
            };
            updatedOrganizations.push(mockOrganizations[organizationIndex]);
          }
        });
        resolve({ data: updatedOrganizations, updated_count: updatedOrganizations.length });
      }, 300);
    });
  },

  bulkDelete: (ids: string[]): Promise<{ deleted_count: number }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let deletedCount = 0;
        ids.forEach((id) => {
          const organizationIndex = mockOrganizations.findIndex((o) => o.id === id);
          if (organizationIndex !== -1) {
            mockOrganizations.splice(organizationIndex, 1);
            deletedCount++;
          }
        });
        resolve({ deleted_count: deletedCount });
      }, 300);
    });
  },

  // Get countries
  getCountries: (): Promise<{ data: string[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const countries = Array.from(
          new Set(mockOrganizations.map((org) => org.country).filter(Boolean))
        );
        resolve({ data: countries });
      }, 100);
    });
  },

  // Get states for a country
  getStates: (country: string): Promise<{ data: string[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const states = Array.from(
          new Set(
            mockOrganizations
              .filter((org) => org.country === country)
              .map((org) => org.state)
              .filter(Boolean)
          )
        );
        resolve({ data: states });
      }, 100);
    });
  },

  // Get cities for a state
  getCities: (state: string): Promise<{ data: string[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const cities = Array.from(
          new Set(
            mockOrganizations
              .filter((org) => org.state === state)
              .map((org) => org.city)
              .filter(Boolean)
          )
        );
        resolve({ data: cities });
      }, 100);
    });
  },

  // Export organizations
  export: (format: "csv" | "excel" | "json", filters?: OrganizationFilterParams): Promise<{ download_url: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `organizations-export-${timestamp}.${format}`;
        resolve({
          download_url: `/api/admin/organizations/export/${filename}`
        });
      }, 1000);
    });
  },

  // Get analytics
  getAnalytics: (): Promise<{
    data: {
      growth_trend: { month: string; organizations: number }[];
      top_countries: { country: string; count: number }[];
      subscription_breakdown: { subscription: string; organizations: number }[];
      establishment_timeline: { year: number; count: number }[];
    }
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analytics = {
          growth_trend: [
            { month: "Jan", organizations: 45 },
            { month: "Feb", organizations: 52 },
            { month: "Mar", organizations: 61 },
            { month: "Apr", organizations: 68 },
            { month: "May", organizations: 75 },
            { month: "Jun", organizations: 82 },
          ],
          top_countries: [
            { country: "United States", count: 35 },
            { country: "Canada", count: 18 },
            { country: "United Kingdom", count: 12 },
            { country: "Germany", count: 8 },
            { country: "Australia", count: 7 },
          ],
          subscription_breakdown: [
            { subscription: "Enterprise Plan", organizations: 25 },
            { subscription: "Pro Plan", organizations: 35 },
            { subscription: "Basic Plan", organizations: 20 },
          ],
          establishment_timeline: [
            { year: 2020, count: 15 },
            { year: 2021, count: 22 },
            { year: 2022, count: 28 },
            { year: 2023, count: 18 },
            { year: 2024, count: 10 },
          ],
        };
        resolve({ data: analytics });
      }, 200);
    });
  },
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

// WhatsApp Template Mock Data
const mockWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: "template_1",
    name: "Welcome Message",
    category: "utility",
    language: "en",
    status: "approved",
    header: {
      type: "text",
      content: "Welcome to {{company_name}}!",
    },
    body: "Hi {{name}}, thank you for joining us! We're excited to have you on board. You can start exploring our features right away.",
    footer: "Best regards, Team {{company_name}}",
    buttons: [
      {
        id: "btn_1",
        type: "call_to_action",
        text: "Get Started",
        url: "https://example.com/get-started",
      },
      {
        id: "btn_2",
        type: "quick_reply",
        text: "Contact Support",
        payload: "CONTACT_SUPPORT",
      },
    ],
    createdDate: "2024-01-15T10:30:00Z",
    updatedDate: "2024-01-15T10:30:00Z",
    createdBy: "admin@example.com",
    variables: ["company_name", "name"],
  },
  {
    id: "template_2",
    name: "Order Confirmation",
    category: "utility",
    language: "en",
    status: "approved",
    header: {
      type: "image",
      content: "Order Confirmed #{{order_id}}",
      mediaUrl:
        "https://via.placeholder.com/400x200/4CAF50/white?text=Order+Confirmed",
    },
    body: "Your order #{{order_id}} has been confirmed! \\n\\nOrder Details:\\n- Total: {{total_amount}}\\n- Delivery Date: {{delivery_date}}\\n\\nTracking will be available soon.",
    footer: "Thank you for shopping with us!",
    buttons: [
      {
        id: "btn_3",
        type: "call_to_action",
        text: "Track Order",
        url: "https://example.com/track/{{order_id}}",
      },
    ],
    createdDate: "2024-01-20T14:15:00Z",
    updatedDate: "2024-01-22T09:20:00Z",
    createdBy: "admin@example.com",
    variables: ["order_id", "total_amount", "delivery_date"],
  },
  {
    id: "template_3",
    name: "Promotional Offer",
    category: "marketing",
    language: "en",
    status: "pending",
    header: {
      type: "video",
      content: "🎉 Special Offer Just for You!",
      mediaUrl:
        "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    },
    body: "Hi {{name}}, get {{discount}}% off on your next purchase! Use code: {{promo_code}} before {{expiry_date}}. Don't miss out!",
    footer: "Terms and conditions apply",
    buttons: [
      {
        id: "btn_4",
        type: "call_to_action",
        text: "Shop Now",
        url: "https://example.com/shop",
      },
      {
        id: "btn_5",
        type: "quick_reply",
        text: "View Catalog",
        payload: "VIEW_CATALOG",
      },
    ],
    createdDate: "2024-01-25T16:45:00Z",
    updatedDate: "2024-01-25T16:45:00Z",
    createdBy: "marketing@example.com",
    variables: ["name", "discount", "promo_code", "expiry_date"],
  },
  {
    id: "template_4",
    name: "Payment Reminder",
    category: "utility",
    language: "en",
    status: "approved",
    body: "Hi {{name}}, this is a friendly reminder that your payment of {{amount}} is due on {{due_date}}. Please make your payment to avoid any service interruption.",
    footer: "Need help? Contact our support team.",
    buttons: [
      {
        id: "btn_6",
        type: "call_to_action",
        text: "Pay Now",
        url: "https://example.com/pay/{{invoice_id}}",
      },
      {
        id: "btn_7",
        type: "call_to_action",
        text: "Call Support",
        phoneNumber: "+1234567890",
      },
    ],
    createdDate: "2024-01-18T11:20:00Z",
    updatedDate: "2024-01-20T08:15:00Z",
    createdBy: "billing@example.com",
    variables: ["name", "amount", "due_date", "invoice_id"],
  },
  {
    id: "template_5",
    name: "Account Verification",
    category: "authentication",
    language: "en",
    status: "rejected",
    body: "Your verification code is: {{code}}. This code will expire in 5 minutes. Do not share this code with anyone.",
    buttons: [],
    createdDate: "2024-01-12T09:10:00Z",
    updatedDate: "2024-01-14T13:25:00Z",
    createdBy: "security@example.com",
    variables: ["code"],
  },
];

const mockTemplateInsights: TemplateInsights[] = [
  {
    templateId: "template_1",
    totalSent: 1250,
    delivered: 1200,
    read: 980,
    clicked: 450,
    deliveryRate: 96.0,
    readRate: 81.7,
    clickRate: 45.9,
    lastSent: "2024-01-28T14:30:00Z",
  },
  {
    templateId: "template_2",
    totalSent: 890,
    delivered: 885,
    read: 820,
    clicked: 380,
    deliveryRate: 99.4,
    readRate: 92.7,
    clickRate: 46.3,
    lastSent: "2024-01-28T16:45:00Z",
  },
  {
    templateId: "template_3",
    totalSent: 0,
    delivered: 0,
    read: 0,
    clicked: 0,
    deliveryRate: 0,
    readRate: 0,
    clickRate: 0,
    lastSent: "",
  },
  {
    templateId: "template_4",
    totalSent: 560,
    delivered: 548,
    read: 489,
    clicked: 123,
    deliveryRate: 97.9,
    readRate: 89.3,
    clickRate: 25.1,
    lastSent: "2024-01-27T10:20:00Z",
  },
  {
    templateId: "template_5",
    totalSent: 0,
    delivered: 0,
    read: 0,
    clicked: 0,
    deliveryRate: 0,
    readRate: 0,
    clickRate: 0,
    lastSent: "",
  },
];

const mockTemplateInteractions: TemplateInteraction[] = [
  {
    id: "interaction_1",
    templateId: "template_1",
    userId: "user_1",
    userName: "John Doe",
    userPhone: "+1234567890",
    sentAt: "2024-01-28T14:30:00Z",
    deliveredAt: "2024-01-28T14:31:00Z",
    readAt: "2024-01-28T14:35:00Z",
    clickedAt: "2024-01-28T14:37:00Z",
    status: "clicked",
  },
  {
    id: "interaction_2",
    templateId: "template_1",
    userId: "user_2",
    userName: "Jane Smith",
    userPhone: "+1234567891",
    sentAt: "2024-01-28T14:30:00Z",
    deliveredAt: "2024-01-28T14:31:00Z",
    readAt: "2024-01-28T14:40:00Z",
    status: "read",
  },
  {
    id: "interaction_3",
    templateId: "template_2",
    userId: "user_3",
    userName: "Bob Johnson",
    userPhone: "+1234567892",
    sentAt: "2024-01-28T16:45:00Z",
    deliveredAt: "2024-01-28T16:46:00Z",
    readAt: "2024-01-28T16:50:00Z",
    clickedAt: "2024-01-28T16:52:00Z",
    status: "clicked",
  },
];

const mockUserSegments: UserSegment[] = [
  {
    id: "segment_1",
    name: "Premium Customers",
    description: "Customers with premium subscriptions",
    userCount: 245,
    criteria: { subscription_type: "premium", active: true },
    createdDate: "2024-01-10T08:00:00Z",
  },
  {
    id: "segment_2",
    name: "New Users",
    description: "Users who joined in the last 30 days",
    userCount: 89,
    criteria: { registration_date: "last_30_days" },
    createdDate: "2024-01-15T10:30:00Z",
  },
  {
    id: "segment_3",
    name: "Inactive Users",
    description: "Users who haven't logged in for 60+ days",
    userCount: 156,
    criteria: { last_login: "60_days_ago" },
    createdDate: "2024-01-20T14:15:00Z",
  },
];

const mockBulkSendResults: BulkSendResult[] = [
  {
    id: "bulk_1",
    templateId: "template_1",
    totalRecipients: 100,
    successCount: 98,
    failureCount: 2,
    status: "completed",
    createdAt: "2024-01-28T10:00:00Z",
    completedAt: "2024-01-28T10:15:00Z",
    errors: [
      "Invalid phone number: +1234567999",
      "User opted out: +1234567888",
    ],
  },
  {
    id: "bulk_2",
    templateId: "template_2",
    totalRecipients: 50,
    successCount: 50,
    failureCount: 0,
    status: "completed",
    createdAt: "2024-01-27T15:30:00Z",
    completedAt: "2024-01-27T15:45:00Z",
    errors: [],
  },
];

// Helper function to extract variables from template content
function extractVariables(...contents: (string | undefined)[]): string[] {
  const variables = new Set<string>();
  const regex = /\\{\\{([^}]+)\\}\\}/g;

  contents.forEach((content) => {
    if (content) {
      let match;
      while ((match = regex.exec(content)) !== null) {
        variables.add(match[1].trim());
      }
    }
  });

  return Array.from(variables);
}

export const whatsappTemplateAPI = {
  getAll: async (): Promise<WhatsAppTemplate[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockWhatsAppTemplates]), 500);
    });
  },

  getById: async (id: string): Promise<WhatsAppTemplate | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const template = mockWhatsAppTemplates.find((t) => t.id === id) || null;
        resolve(template);
      }, 300);
    });
  },

  create: async (
    templateData: WhatsAppTemplateFormData,
  ): Promise<WhatsAppTemplate> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTemplate: WhatsAppTemplate = {
          id: `template_${Date.now()}`,
          ...templateData,
          status: "pending",
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          createdBy: "admin@example.com",
          variables: extractVariables(
            templateData.body,
            templateData.header?.content,
            templateData.footer,
          ),
        };
        mockWhatsAppTemplates.push(newTemplate);
        resolve(newTemplate);
      }, 500);
    });
  },

  update: async (
    id: string,
    templateData: Partial<WhatsAppTemplateFormData>,
  ): Promise<WhatsAppTemplate> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockWhatsAppTemplates.findIndex((t) => t.id === id);
        if (index === -1) {
          reject(new Error("Template not found"));
          return;
        }

        const updatedTemplate = {
          ...mockWhatsAppTemplates[index],
          ...templateData,
          updatedDate: new Date().toISOString(),
        };

        if (templateData.body || templateData.header || templateData.footer) {
          updatedTemplate.variables = extractVariables(
            updatedTemplate.body,
            updatedTemplate.header?.content,
            updatedTemplate.footer,
          );
        }

        mockWhatsAppTemplates[index] = updatedTemplate;
        resolve(updatedTemplate);
      }, 500);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockWhatsAppTemplates.findIndex((t) => t.id === id);
        if (index === -1) {
          reject(new Error("Template not found"));
          return;
        }
        mockWhatsAppTemplates.splice(index, 1);
        resolve();
      }, 500);
    });
  },

  getInsights: async (templateId: string): Promise<TemplateInsights | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const insights =
          mockTemplateInsights.find((i) => i.templateId === templateId) || null;
        resolve(insights);
      }, 300);
    });
  },

  getInteractions: async (
    templateId: string,
  ): Promise<TemplateInteraction[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const interactions = mockTemplateInteractions.filter(
          (i) => i.templateId === templateId,
        );
        resolve(interactions);
      }, 400);
    });
  },

  sendBulk: async (request: BulkSendRequest): Promise<BulkSendResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result: BulkSendResult = {
          id: `bulk_${Date.now()}`,
          templateId: request.templateId,
          totalRecipients: request.recipients.length,
          successCount: Math.floor(request.recipients.length * 0.95), // 95% success rate
          failureCount: Math.ceil(request.recipients.length * 0.05), // 5% failure rate
          status: "processing",
          createdAt: new Date().toISOString(),
          errors: [],
        };
        mockBulkSendResults.push(result);

        // Simulate completion after 3 seconds
        setTimeout(() => {
          result.status = "completed";
          result.completedAt = new Date().toISOString();
        }, 3000);

        resolve(result);
      }, 1000);
    });
  },

  getBulkSendHistory: async (): Promise<BulkSendResult[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockBulkSendResults]), 400);
    });
  },
};

export const userSegmentAPI = {
  getAll: async (): Promise<UserSegment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockUserSegments]), 400);
    });
  },

  getById: async (id: string): Promise<UserSegment | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const segment = mockUserSegments.find((s) => s.id === id) || null;
        resolve(segment);
      }, 300);
    });
  },
};

// Lead Management Mock Data
const mockAgents: Agent[] = [
  {
    id: "agent_1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1234567890",
    role: "Senior Sales Agent",
    isActive: true,
    assignedLeadsCount: 45,
    convertedLeadsCount: 12,
    avatar: "https://via.placeholder.com/150x150/4f46e5/ffffff?text=JS",
    createdDate: "2024-01-15T08:00:00Z",
  },
  {
    id: "agent_2",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1234567891",
    role: "Sales Agent",
    isActive: true,
    assignedLeadsCount: 32,
    convertedLeadsCount: 8,
    avatar: "https://via.placeholder.com/150x150/16a34a/ffffff?text=SJ",
    createdDate: "2024-01-20T08:00:00Z",
  },
  {
    id: "agent_3",
    name: "Mike Davis",
    email: "mike.davis@example.com",
    phone: "+1234567892",
    role: "Lead Qualifier",
    isActive: true,
    assignedLeadsCount: 28,
    convertedLeadsCount: 5,
    avatar: "https://via.placeholder.com/150x150/dc2626/ffffff?text=MD",
    createdDate: "2024-01-25T08:00:00Z",
  },
];

const mockDynamicForms: DynamicForm[] = [
  {
    id: "form_1",
    name: "Real Estate Lead Form",
    description: "Capture real estate inquiries with property preferences",
    fields: [
      {
        id: "field_1",
        name: "phoneNumber",
        label: "Phone Number",
        type: "phone",
        required: true,
        order: 1,
        isSystem: true,
      },
      {
        id: "field_2",
        name: "fullName",
        label: "Full Name",
        type: "text",
        required: true,
        order: 2,
        validation: { minLength: 2, maxLength: 100 },
      },
      {
        id: "field_3",
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        order: 3,
      },
      {
        id: "field_4",
        name: "propertyType",
        label: "Property Type",
        type: "select",
        required: true,
        options: ["Apartment", "House", "Condo", "Townhouse", "Commercial"],
        order: 4,
      },
      {
        id: "field_5",
        name: "budget",
        label: "Budget Range",
        type: "select",
        required: false,
        options: ["Under $500K", "$500K-$1M", "$1M-$2M", "$2M+"],
        order: 5,
      },
      {
        id: "field_6",
        name: "location",
        label: "Preferred Location",
        type: "text",
        required: false,
        order: 6,
      },
      {
        id: "field_7",
        name: "timeline",
        label: "Purchase Timeline",
        type: "select",
        required: false,
        options: ["Immediately", "1-3 months", "3-6 months", "6+ months"],
        order: 7,
      },
      {
        id: "field_8",
        name: "additionalNotes",
        label: "Additional Requirements",
        type: "textarea",
        required: false,
        order: 8,
        validation: { maxLength: 500 },
      },
    ],
    createdBy: "admin@example.com",
    createdDate: "2024-01-10T10:00:00Z",
    updatedDate: "2024-01-15T14:30:00Z",
    isActive: true,
  },
  {
    id: "form_2",
    name: "Software Demo Request",
    description: "Capture software demo and trial requests",
    fields: [
      {
        id: "field_9",
        name: "phoneNumber",
        label: "Phone Number",
        type: "phone",
        required: true,
        order: 1,
        isSystem: true,
      },
      {
        id: "field_10",
        name: "companyName",
        label: "Company Name",
        type: "text",
        required: true,
        order: 2,
      },
      {
        id: "field_11",
        name: "contactName",
        label: "Contact Person",
        type: "text",
        required: true,
        order: 3,
      },
      {
        id: "field_12",
        name: "email",
        label: "Business Email",
        type: "email",
        required: true,
        order: 4,
      },
      {
        id: "field_13",
        name: "employeeCount",
        label: "Company Size",
        type: "select",
        required: true,
        options: ["1-10", "11-50", "51-200", "201-500", "500+"],
        order: 5,
      },
      {
        id: "field_14",
        name: "industry",
        label: "Industry",
        type: "select",
        required: false,
        options: [
          "Technology",
          "Healthcare",
          "Finance",
          "Education",
          "Retail",
          "Manufacturing",
          "Other",
        ],
        order: 6,
      },
      {
        id: "field_15",
        name: "currentSolution",
        label: "Current Solution",
        type: "text",
        required: false,
        order: 7,
      },
      {
        id: "field_16",
        name: "demoDate",
        label: "Preferred Demo Date",
        type: "date",
        required: false,
        order: 8,
      },
    ],
    createdBy: "admin@example.com",
    createdDate: "2024-01-12T09:00:00Z",
    updatedDate: "2024-01-12T09:00:00Z",
    isActive: true,
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: "campaign_1",
    name: "Q1 Real Estate Drive",
    description: "Targeting potential home buyers for Q1 property launches",
    startDate: "2024-01-01T00:00:00Z",
    endDate: "2024-03-31T23:59:59Z",
    status: "active",
    owner: "sarah.johnson@example.com",
    formId: "form_1",
    formName: "Real Estate Lead Form",
    leadCount: 156,
    convertedCount: 23,
    createdBy: "admin@example.com",
    createdDate: "2023-12-15T10:00:00Z",
    updatedDate: "2024-01-20T15:30:00Z",
  },
  {
    id: "campaign_2",
    name: "SaaS Demo Campaign",
    description: "Software demo requests for enterprise clients",
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2024-06-30T23:59:59Z",
    status: "active",
    owner: "john.smith@example.com",
    formId: "form_2",
    formName: "Software Demo Request",
    leadCount: 89,
    convertedCount: 12,
    createdBy: "admin@example.com",
    createdDate: "2024-01-10T14:00:00Z",
    updatedDate: "2024-01-25T09:15:00Z",
  },
  {
    id: "campaign_3",
    name: "Holiday Promotion",
    description: "Holiday season marketing campaign",
    startDate: "2023-11-01T00:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
    status: "completed",
    owner: "mike.davis@example.com",
    formId: "form_1",
    formName: "Real Estate Lead Form",
    leadCount: 234,
    convertedCount: 45,
    createdBy: "admin@example.com",
    createdDate: "2023-10-15T12:00:00Z",
    updatedDate: "2024-01-05T10:00:00Z",
  },
];

const mockLeads: Lead[] = [
  {
    id: "lead_1",
    campaignId: "campaign_1",
    campaignName: "Q1 Real Estate Drive",
    phoneNumber: "+1234567890",
    data: {
      fullName: "Alice Wilson",
      email: "alice.wilson@email.com",
      propertyType: "House",
      budget: "$500K-$1M",
      location: "Downtown",
      timeline: "1-3 months",
      additionalNotes: "Looking for a 3-bedroom house with garden",
    },
    status: "qualified",
    assignedTo: "agent_1",
    assignedBy: "admin@example.com",
    assignedDate: "2024-01-22T10:00:00Z",
    source: "Website Form",
    tags: ["hot-lead", "qualified"],
    priority: "high",
    lastContactDate: "2024-01-25T14:30:00Z",
    nextFollowUpDate: "2024-01-30T10:00:00Z",
    notes: "Very interested, scheduled property viewing",
    createdDate: "2024-01-20T09:30:00Z",
    updatedDate: "2024-01-25T14:30:00Z",
  },
  {
    id: "lead_2",
    campaignId: "campaign_2",
    campaignName: "SaaS Demo Campaign",
    phoneNumber: "+1234567891",
    data: {
      companyName: "TechCorp Inc",
      contactName: "Bob Johnson",
      email: "bob.johnson@techcorp.com",
      employeeCount: "51-200",
      industry: "Technology",
      currentSolution: "Legacy ERP system",
      demoDate: "2024-02-15",
    },
    status: "contacted",
    assignedTo: "agent_2",
    assignedBy: "admin@example.com",
    assignedDate: "2024-01-23T11:00:00Z",
    source: "LinkedIn Campaign",
    tags: ["enterprise", "demo-scheduled"],
    priority: "medium",
    lastContactDate: "2024-01-26T16:00:00Z",
    nextFollowUpDate: "2024-02-15T14:00:00Z",
    notes: "Demo scheduled for Feb 15th",
    createdDate: "2024-01-21T11:15:00Z",
    updatedDate: "2024-01-26T16:00:00Z",
  },
  {
    id: "lead_3",
    campaignId: "campaign_1",
    campaignName: "Q1 Real Estate Drive",
    phoneNumber: "+1234567892",
    data: {
      fullName: "Carol Smith",
      email: "carol.smith@email.com",
      propertyType: "Apartment",
      budget: "Under $500K",
      location: "Suburbs",
      timeline: "6+ months",
      additionalNotes: "First-time buyer, needs guidance",
    },
    status: "new",
    source: "Google Ads",
    tags: ["first-time-buyer"],
    priority: "low",
    createdDate: "2024-01-27T08:45:00Z",
    updatedDate: "2024-01-27T08:45:00Z",
  },
];

const mockTasks: Task[] = [
  {
    id: "task_1",
    leadId: "lead_1",
    title: "Schedule Property Viewing",
    description: "Arrange viewing for 3-bedroom houses in downtown area",
    dueDate: "2024-01-30T10:00:00Z",
    reminderDate: "2024-01-29T09:00:00Z",
    status: "pending",
    priority: "high",
    assignedTo: "agent_1",
    assignedToName: "John Smith",
    createdBy: "admin@example.com",
    createdByName: "Admin User",
    createdDate: "2024-01-25T15:00:00Z",
    updatedDate: "2024-01-25T15:00:00Z",
  },
  {
    id: "task_2",
    leadId: "lead_2",
    title: "Prepare Demo Environment",
    description: "Set up demo environment for TechCorp presentation",
    dueDate: "2024-02-14T16:00:00Z",
    reminderDate: "2024-02-13T10:00:00Z",
    status: "in_progress",
    priority: "medium",
    assignedTo: "agent_2",
    assignedToName: "Sarah Johnson",
    createdBy: "admin@example.com",
    createdByName: "Admin User",
    createdDate: "2024-01-26T17:00:00Z",
    updatedDate: "2024-01-27T10:30:00Z",
  },
];

const mockLeadAssignments: LeadAssignment[] = [
  {
    id: "assignment_1",
    leadId: "lead_1",
    assignedTo: "agent_1",
    assignedToName: "John Smith",
    assignedBy: "admin@example.com",
    assignedByName: "Admin User",
    assignedDate: "2024-01-22T10:00:00Z",
    notes: "High priority lead - qualified buyer",
    isActive: true,
  },
  {
    id: "assignment_2",
    leadId: "lead_2",
    assignedTo: "agent_2",
    assignedToName: "Sarah Johnson",
    assignedBy: "admin@example.com",
    assignedByName: "Admin User",
    assignedDate: "2024-01-23T11:00:00Z",
    notes: "Enterprise prospect - demo required",
    isActive: true,
  },
];

const mockActivityLogs: ActivityLog[] = [
  {
    id: "log_1",
    entityType: "lead",
    entityId: "lead_1",
    action: "assigned",
    description: "Lead assigned to John Smith",
    performedBy: "admin@example.com",
    performedByName: "Admin User",
    timestamp: "2024-01-22T10:00:00Z",
    metadata: { assignedTo: "agent_1", previousAssignee: null },
  },
  {
    id: "log_2",
    entityType: "lead",
    entityId: "lead_1",
    action: "status_updated",
    description: "Lead status changed from 'contacted' to 'qualified'",
    performedBy: "agent_1",
    performedByName: "John Smith",
    timestamp: "2024-01-25T14:30:00Z",
    metadata: { oldStatus: "contacted", newStatus: "qualified" },
  },
];

// Lead Management API Services
export const dynamicFormAPI = {
  getAll: async (): Promise<DynamicForm[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockDynamicForms]), 500);
    });
  },

  getById: async (id: string): Promise<DynamicForm | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const form = mockDynamicForms.find((f) => f.id === id) || null;
        resolve(form);
      }, 300);
    });
  },

  create: async (formData: Partial<DynamicForm>): Promise<DynamicForm> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newForm: DynamicForm = {
          id: `form_${Date.now()}`,
          name: formData.name || "",
          description: formData.description,
          fields: formData.fields || [],
          createdBy: "admin@example.com",
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          isActive: true,
        };
        mockDynamicForms.push(newForm);
        resolve(newForm);
      }, 500);
    });
  },

  update: async (
    id: string,
    formData: Partial<DynamicForm>,
  ): Promise<DynamicForm> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockDynamicForms.findIndex((f) => f.id === id);
        if (index === -1) {
          reject(new Error("Form not found"));
          return;
        }

        mockDynamicForms[index] = {
          ...mockDynamicForms[index],
          ...formData,
          updatedDate: new Date().toISOString(),
        };
        resolve(mockDynamicForms[index]);
      }, 500);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockDynamicForms.findIndex((f) => f.id === id);
        if (index === -1) {
          reject(new Error("Form not found"));
          return;
        }
        mockDynamicForms.splice(index, 1);
        resolve();
      }, 500);
    });
  },
};

export const campaignAPI = {
  getAll: async (): Promise<Campaign[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockCampaigns]), 500);
    });
  },

  getById: async (id: string): Promise<Campaign | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const campaign = mockCampaigns.find((c) => c.id === id) || null;
        resolve(campaign);
      }, 300);
    });
  },

  create: async (campaignData: CampaignFormData): Promise<Campaign> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const form = mockDynamicForms.find((f) => f.id === campaignData.formId);
        const newCampaign: Campaign = {
          id: `campaign_${Date.now()}`,
          ...campaignData,
          formName: form?.name,
          leadCount: 0,
          convertedCount: 0,
          owner: "admin@example.com",
          createdBy: "admin@example.com",
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        };
        mockCampaigns.push(newCampaign);
        resolve(newCampaign);
      }, 500);
    });
  },

  update: async (
    id: string,
    campaignData: Partial<CampaignFormData>,
  ): Promise<Campaign> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCampaigns.findIndex((c) => c.id === id);
        if (index === -1) {
          reject(new Error("Campaign not found"));
          return;
        }

        const form = campaignData.formId
          ? mockDynamicForms.find((f) => f.id === campaignData.formId)
          : null;
        mockCampaigns[index] = {
          ...mockCampaigns[index],
          ...campaignData,
          formName: form?.name || mockCampaigns[index].formName,
          updatedDate: new Date().toISOString(),
        };
        resolve(mockCampaigns[index]);
      }, 500);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCampaigns.findIndex((c) => c.id === id);
        if (index === -1) {
          reject(new Error("Campaign not found"));
          return;
        }
        mockCampaigns.splice(index, 1);
        resolve();
      }, 500);
    });
  },

  getStats: async (): Promise<CampaignStats> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats: CampaignStats = {
          totalCampaigns: mockCampaigns.length,
          activeCampaigns: mockCampaigns.filter((c) => c.status === "active")
            .length,
          totalLeads: mockCampaigns.reduce((sum, c) => sum + c.leadCount, 0),
          conversionRate: 15.2,
          topPerformingCampaign: mockCampaigns[0]?.name || "N/A",
          leadsBySource: {
            "Website Form": 45,
            "Google Ads": 32,
            "LinkedIn Campaign": 28,
            "Social Media": 15,
          },
        };
        resolve(stats);
      }, 400);
    });
  },
};

export const leadAPI = {
  getAll: async (filter?: LeadFilter): Promise<Lead[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredLeads = [...mockLeads];

        if (filter) {
          if (filter.campaignId) {
            filteredLeads = filteredLeads.filter(
              (l) => l.campaignId === filter.campaignId,
            );
          }
          if (filter.status) {
            filteredLeads = filteredLeads.filter(
              (l) => l.status === filter.status,
            );
          }
          if (filter.assignedTo) {
            filteredLeads = filteredLeads.filter(
              (l) => l.assignedTo === filter.assignedTo,
            );
          }
          if (filter.priority) {
            filteredLeads = filteredLeads.filter(
              (l) => l.priority === filter.priority,
            );
          }
        }

        resolve(filteredLeads);
      }, 500);
    });
  },

  getById: async (id: string): Promise<Lead | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lead = mockLeads.find((l) => l.id === id) || null;
        resolve(lead);
      }, 300);
    });
  },

  create: async (leadData: LeadFormData): Promise<Lead> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const campaign = mockCampaigns.find(
          (c) => c.id === leadData.campaignId,
        );
        const newLead: Lead = {
          id: `lead_${Date.now()}`,
          ...leadData,
          campaignName: campaign?.name,
          status: "new",
          source: leadData.source || "Manual Entry",
          tags: leadData.tags || [],
          priority: leadData.priority || "medium",
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        };
        mockLeads.push(newLead);
        resolve(newLead);
      }, 500);
    });
  },

  update: async (
    id: string,
    leadData: Partial<LeadFormData>,
  ): Promise<Lead> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex((l) => l.id === id);
        if (index === -1) {
          reject(new Error("Lead not found"));
          return;
        }

        mockLeads[index] = {
          ...mockLeads[index],
          ...leadData,
          updatedDate: new Date().toISOString(),
        };
        resolve(mockLeads[index]);
      }, 500);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockLeads.findIndex((l) => l.id === id);
        if (index === -1) {
          reject(new Error("Lead not found"));
          return;
        }
        mockLeads.splice(index, 1);
        resolve();
      }, 500);
    });
  },

  assign: async (
    leadId: string,
    assignedTo: string,
    notes?: string,
  ): Promise<LeadAssignment> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const agent = mockAgents.find((a) => a.id === assignedTo);
        const assignment: LeadAssignment = {
          id: `assignment_${Date.now()}`,
          leadId,
          assignedTo,
          assignedToName: agent?.name,
          assignedBy: "admin@example.com",
          assignedByName: "Admin User",
          assignedDate: new Date().toISOString(),
          notes,
          isActive: true,
        };
        mockLeadAssignments.push(assignment);

        // Update lead
        const leadIndex = mockLeads.findIndex((l) => l.id === leadId);
        if (leadIndex !== -1) {
          mockLeads[leadIndex].assignedTo = assignedTo;
          mockLeads[leadIndex].assignedBy = "admin@example.com";
          mockLeads[leadIndex].assignedDate = new Date().toISOString();
          mockLeads[leadIndex].updatedDate = new Date().toISOString();
        }

        resolve(assignment);
      }, 500);
    });
  },

  bulkAssign: async (
    leadIds: string[],
    assignedTo: string,
    notes?: string,
  ): Promise<LeadAssignment[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const agent = mockAgents.find((a) => a.id === assignedTo);
        const assignments: LeadAssignment[] = leadIds.map((leadId) => ({
          id: `assignment_${Date.now()}_${leadId}`,
          leadId,
          assignedTo,
          assignedToName: agent?.name,
          assignedBy: "admin@example.com",
          assignedByName: "Admin User",
          assignedDate: new Date().toISOString(),
          notes,
          isActive: true,
        }));

        mockLeadAssignments.push(...assignments);

        // Update leads
        leadIds.forEach((leadId) => {
          const leadIndex = mockLeads.findIndex((l) => l.id === leadId);
          if (leadIndex !== -1) {
            mockLeads[leadIndex].assignedTo = assignedTo;
            mockLeads[leadIndex].assignedBy = "admin@example.com";
            mockLeads[leadIndex].assignedDate = new Date().toISOString();
            mockLeads[leadIndex].updatedDate = new Date().toISOString();
          }
        });

        resolve(assignments);
      }, 1000);
    });
  },

  getStats: async (): Promise<LeadStats> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats: LeadStats = {
          totalLeads: mockLeads.length,
          newLeads: mockLeads.filter((l) => l.status === "new").length,
          contactedLeads: mockLeads.filter((l) => l.status === "contacted")
            .length,
          qualifiedLeads: mockLeads.filter((l) => l.status === "qualified")
            .length,
          convertedLeads: mockLeads.filter((l) => l.status === "converted")
            .length,
          droppedLeads: mockLeads.filter((l) => l.status === "dropped").length,
          conversionRate: 18.5,
          averageResponseTime: 4.2,
        };
        resolve(stats);
      }, 400);
    });
  },
};

export const taskAPI = {
  getAll: async (leadId?: string): Promise<Task[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredTasks = leadId
          ? mockTasks.filter((t) => t.leadId === leadId)
          : [...mockTasks];
        resolve(filteredTasks);
      }, 500);
    });
  },

  getById: async (id: string): Promise<Task | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const task = mockTasks.find((t) => t.id === id) || null;
        resolve(task);
      }, 300);
    });
  },

  create: async (taskData: TaskFormData): Promise<Task> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const agent = mockAgents.find((a) => a.id === taskData.assignedTo);
        const newTask: Task = {
          id: `task_${Date.now()}`,
          ...taskData,
          status: "pending",
          assignedToName: agent?.name,
          createdBy: "admin@example.com",
          createdByName: "Admin User",
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        };
        mockTasks.push(newTask);
        resolve(newTask);
      }, 500);
    });
  },

  update: async (
    id: string,
    taskData: Partial<
      TaskFormData & { status: Task["status"]; outcome?: string }
    >,
  ): Promise<Task> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTasks.findIndex((t) => t.id === id);
        if (index === -1) {
          reject(new Error("Task not found"));
          return;
        }

        const updatedTask = {
          ...mockTasks[index],
          ...taskData,
          updatedDate: new Date().toISOString(),
        };

        if (taskData.status === "completed") {
          updatedTask.completedDate = new Date().toISOString();
        }

        mockTasks[index] = updatedTask;
        resolve(updatedTask);
      }, 500);
    });
  },

  delete: async (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTasks.findIndex((t) => t.id === id);
        if (index === -1) {
          reject(new Error("Task not found"));
          return;
        }
        mockTasks.splice(index, 1);
        resolve();
      }, 500);
    });
  },
};

export const agentAPI = {
  getAll: async (): Promise<Agent[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockAgents]), 400);
    });
  },

  getById: async (id: string): Promise<Agent | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const agent = mockAgents.find((a) => a.id === id) || null;
        resolve(agent);
      }, 300);
    });
  },
};

export const activityLogAPI = {
  getAll: async (
    entityType?: string,
    entityId?: string,
  ): Promise<ActivityLog[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredLogs = [...mockActivityLogs];
        if (entityType) {
          filteredLogs = filteredLogs.filter(
            (l) => l.entityType === entityType,
          );
        }
        if (entityId) {
          filteredLogs = filteredLogs.filter((l) => l.entityId === entityId);
        }
        resolve(
          filteredLogs.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          ),
        );
      }, 400);
    });
  },
};

export const bulkUploadAPI = {
  upload: async (file: File, campaignId: string): Promise<BulkUploadResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result: BulkUploadResult = {
          id: `upload_${Date.now()}`,
          filename: file.name,
          totalRecords: 100,
          successCount: 95,
          errorCount: 5,
          status: "processing",
          errors: [
            { row: 15, field: "email", message: "Invalid email format" },
            { row: 23, field: "phoneNumber", message: "Phone number required" },
            {
              row: 45,
              field: "propertyType",
              message: "Invalid property type",
            },
            { row: 67, field: "budget", message: "Invalid budget range" },
            { row: 89, field: "email", message: "Duplicate email address" },
          ],
          createdBy: "admin@example.com",
          createdDate: new Date().toISOString(),
        };

        // Simulate completion after 3 seconds
        setTimeout(() => {
          result.status = "completed";
          result.completedDate = new Date().toISOString();
        }, 3000);

        resolve(result);
      }, 1000);
    });
  },

  getHistory: async (): Promise<BulkUploadResult[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockHistory: BulkUploadResult[] = [
          {
            id: "upload_1",
            filename: "leads_jan_2024.csv",
            totalRecords: 150,
            successCount: 148,
            errorCount: 2,
            status: "completed",
            errors: [
              { row: 15, field: "email", message: "Invalid email format" },
              {
                row: 89,
                field: "phoneNumber",
                message: "Invalid phone number",
              },
            ],
            createdBy: "admin@example.com",
            createdDate: "2024-01-25T10:00:00Z",
            completedDate: "2024-01-25T10:05:00Z",
          },
        ];
        resolve(mockHistory);
      }, 400);
    });
  },
};

// Chat API endpoints
export const chatAPI = {
  // Get all chats
  getAll: (): Promise<{ data: Chat[] }> => api.get("/admin/chats"),

  // Get chat by user ID
  getByUserId: (userId: string): Promise<{ data: Chat }> =>
    api.get(`/admin/chats/user/${userId}`),

  // Send message
  sendMessage: (
    chatId: string,
    message: string,
  ): Promise<{ data: ChatMessage }> =>
    api.post(`/admin/chats/${chatId}/messages`, { message }),

  // Mark messages as read
  markAsRead: (chatId: string): Promise<void> =>
    api.patch(`/admin/chats/${chatId}/read`),
};

// Chat User API endpoints
export const chatUserAPI = {
  // Get all chat users
  getAll: (): Promise<{ data: ChatUser[] }> => api.get("/admin/chat-users"),

  // Get chat user by ID
  getById: (id: string): Promise<{ data: ChatUser }> =>
    api.get(`/admin/chat-users/${id}`),

  // Update chat user
  update: (id: string, data: ChatUserFormData): Promise<{ data: ChatUser }> =>
    api.put(`/admin/chat-users/${id}`, data),

  // Update user status
  updateStatus: (
    id: string,
    status: "online" | "offline" | "away",
  ): Promise<{ data: ChatUser }> =>
    api.patch(`/admin/chat-users/${id}/status`, { status }),
};

// Mock data for development (remove when backend is ready)
export const mockModules: Module[] = [
  {
    id: "1",
    name: "User Management",
    description:
      "Manage users, roles and permissions with advanced security features",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Analytics Dashboard",
    description:
      "View comprehensive analytics, reports and business intelligence",
    is_active: true,
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    name: "Billing System",
    description: "Handle billing, invoicing and payment processing",
    is_active: false,
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-10T09:15:00Z",
  },
  {
    id: "4",
    name: "Chat Support",
    description: "Live chat support system with real-time messaging",
    is_active: true,
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-17T11:45:00Z",
  },
  {
    id: "5",
    name: "Email Marketing",
    description: "Email campaign management and automation tools",
    is_active: true,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-18T16:30:00Z",
  },
  {
    id: "6",
    name: "Inventory Management",
    description: "Track and manage inventory with automated alerts",
    is_active: false,
    created_at: "2024-01-06T00:00:00Z",
    updated_at: "2024-01-12T13:22:00Z",
  },
  {
    id: "7",
    name: "CRM System",
    description: "Customer relationship management with lead tracking",
    is_active: true,
    created_at: "2024-01-07T00:00:00Z",
    updated_at: "2024-01-19T08:15:00Z",
  },
  {
    id: "8",
    name: "Task Management",
    description: "Project and task management with team collaboration",
    is_active: true,
    created_at: "2024-01-08T00:00:00Z",
    updated_at: "2024-01-20T12:40:00Z",
  },
  {
    id: "9",
    name: "Report Generator",
    description: "Generate custom reports and export data in multiple formats",
    is_active: false,
    created_at: "2024-01-09T00:00:00Z",
    updated_at: "2024-01-11T15:30:00Z",
  },
  {
    id: "10",
    name: "API Gateway",
    description: "Secure API management with rate limiting and authentication",
    is_active: true,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-21T09:50:00Z",
  },
  {
    id: "11",
    name: "Document Storage",
    description: "Cloud document storage with version control and sharing",
    is_active: true,
    created_at: "2024-01-11T00:00:00Z",
    updated_at: "2024-01-22T14:10:00Z",
  },
  {
    id: "12",
    name: "Notification Center",
    description: "Multi-channel notification system for users and admins",
    is_active: false,
    created_at: "2024-01-12T00:00:00Z",
    updated_at: "2024-01-13T10:20:00Z",
  },
  {
    id: "13",
    name: "Security Monitor",
    description: "Real-time security monitoring and threat detection",
    is_active: true,
    created_at: "2024-01-13T00:00:00Z",
    updated_at: "2024-01-23T11:35:00Z",
  },
  {
    id: "14",
    name: "Backup Manager",
    description: "Automated backup and disaster recovery solutions",
    is_active: true,
    created_at: "2024-01-14T00:00:00Z",
    updated_at: "2024-01-24T13:25:00Z",
  },
  {
    id: "15",
    name: "Social Media Integration",
    description:
      "Integrate with social media platforms for marketing and support",
    is_active: false,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-16T17:45:00Z",
  },
];

// Helper function for module categories
const getModuleCategory = (index: number): string => {
  const categories = [
    "Core",
    "Communication",
    "Analytics",
    "E-commerce",
    "Productivity",
  ];
  return categories[index % categories.length];
};

export const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Basic Plan",
    description:
      "Perfect for small teams and startups getting started with essential features",
    price: 29.99,
    validity: 30,
    modules: [
      {
        module_id: "1",
        module_name: "User Management",
        permissions: { view: true, edit: false, delete: false, create: false },
      },
      {
        module_id: "4",
        module_name: "Chat Support",
        permissions: { view: true, edit: false, delete: false, create: false },
      },
    ],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Pro Plan",
    description:
      "Advanced features for growing businesses with enhanced capabilities",
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
      {
        module_id: "4",
        module_name: "Chat Support",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
      {
        module_id: "7",
        module_name: "CRM System",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
    ],
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    name: "Enterprise Plan",
    description:
      "Full feature set for large organizations with unlimited access",
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
      {
        module_id: "4",
        module_name: "Chat Support",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "7",
        module_name: "CRM System",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "8",
        module_name: "Task Management",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
    ],
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-17T11:45:00Z",
  },
  {
    id: "4",
    name: "Basic Annual",
    description: "Basic plan with annual billing for better value",
    price: 299.99,
    validity: 365,
    modules: [
      {
        module_id: "1",
        module_name: "User Management",
        permissions: { view: true, edit: false, delete: false, create: false },
      },
      {
        module_id: "4",
        module_name: "Chat Support",
        permissions: { view: true, edit: false, delete: false, create: false },
      },
    ],
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-18T16:30:00Z",
  },
  {
    id: "5",
    name: "Pro Annual",
    description: "Pro plan with annual billing and additional benefits",
    price: 799.99,
    validity: 365,
    modules: [
      {
        module_id: "1",
        module_name: "User Management",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
      {
        module_id: "2",
        module_name: "Analytics Dashboard",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
      {
        module_id: "4",
        module_name: "Chat Support",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
      {
        module_id: "7",
        module_name: "CRM System",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "5",
        module_name: "Email Marketing",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
    ],
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-19T08:15:00Z",
  },
  {
    id: "6",
    name: "Enterprise Annual",
    description: "Complete enterprise solution with annual commitment",
    price: 1999.99,
    validity: 365,
    modules: [
      {
        module_id: "1",
        module_name: "User Management",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "2",
        module_name: "Analytics Dashboard",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "3",
        module_name: "Billing System",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "4",
        module_name: "Chat Support",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "5",
        module_name: "Email Marketing",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "7",
        module_name: "CRM System",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "8",
        module_name: "Task Management",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "10",
        module_name: "API Gateway",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
    ],
    created_at: "2024-01-06T00:00:00Z",
    updated_at: "2024-01-20T12:40:00Z",
  },
  {
    id: "7",
    name: "Starter Plan",
    description: "Entry-level plan for individuals and freelancers",
    price: 9.99,
    validity: 30,
    modules: [
      {
        module_id: "1",
        module_name: "User Management",
        permissions: { view: true, edit: false, delete: false, create: false },
      },
    ],
    created_at: "2024-01-07T00:00:00Z",
    updated_at: "2024-01-21T09:50:00Z",
  },
  {
    id: "8",
    name: "Team Plan",
    description: "Perfect for medium-sized teams with collaboration features",
    price: 149.99,
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
        permissions: { view: true, edit: true, delete: false, create: false },
      },
      {
        module_id: "4",
        module_name: "Chat Support",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
      {
        module_id: "7",
        module_name: "CRM System",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "8",
        module_name: "Task Management",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
    ],
    created_at: "2024-01-08T00:00:00Z",
    updated_at: "2024-01-22T14:10:00Z",
  },
  {
    id: "9",
    name: "Premium Plan",
    description: "High-end features for demanding businesses",
    price: 299.99,
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
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "3",
        module_name: "Billing System",
        permissions: { view: true, edit: true, delete: false, create: true },
      },
      {
        module_id: "4",
        module_name: "Chat Support",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "5",
        module_name: "Email Marketing",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "7",
        module_name: "CRM System",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "8",
        module_name: "Task Management",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
    ],
    created_at: "2024-01-09T00:00:00Z",
    updated_at: "2024-01-23T11:35:00Z",
  },
  {
    id: "10",
    name: "Custom Enterprise",
    description: "Tailored enterprise solution with custom pricing",
    price: 499.99,
    validity: 90,
    modules: [
      {
        module_id: "1",
        module_name: "User Management",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "2",
        module_name: "Analytics Dashboard",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "3",
        module_name: "Billing System",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "10",
        module_name: "API Gateway",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
      {
        module_id: "13",
        module_name: "Security Monitor",
        permissions: { view: true, edit: true, delete: true, create: true },
      },
    ],
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-24T13:25:00Z",
  },
];

export const mockOrganizations: Organization[] = [
  {
    id: "1",
    name: "TechCorp Inc.",
    description: "Leading technology solutions provider specializing in cloud infrastructure and AI",
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
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Global Enterprises Ltd.",
    description: "International business solutions with focus on digital transformation",
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
    updated_at: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    name: "StartupXYZ",
    description: "Innovative fintech startup revolutionizing digital payments and blockchain",
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
    updated_at: "2024-01-17T11:45:00Z",
  },
  {
    id: "4",
    name: "HealthCare Solutions Corp",
    description: "Healthcare technology and medical software solutions",
    address: "101 Medical Center Blvd",
    city: "Boston",
    state: "Massachusetts",
    country: "United States",
    postal_code: "02101",
    email: "info@healthcaresolutions.com",
    website: "https://www.healthcaresolutions.com",
    established_date: "2019-05-12",
    logo: "https://via.placeholder.com/150x150/e91e63/ffffff?text=HC",
    phone_number: "+1-555-234-5678",
    subscription_id: "3",
    subscription_name: "Enterprise Plan",
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-18T16:30:00Z",
  },
  {
    id: "5",
    name: "EduTech Innovations",
    description: "Educational technology platform for K-12 and higher education",
    address: "555 Campus Drive",
    city: "Seattle",
    state: "Washington",
    country: "United States",
    postal_code: "98101",
    email: "contact@edutech.com",
    website: "https://www.edutech.com",
    established_date: "2021-09-01",
    logo: "https://via.placeholder.com/150x150/9c27b0/ffffff?text=EDU",
    phone_number: "+1-555-345-6789",
    subscription_id: "2",
    subscription_name: "Pro Plan",
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-19T08:15:00Z",
  },
  {
    id: "6",
    name: "RetailMax Solutions",
    description: "E-commerce and retail management platform for modern businesses",
    address: "777 Commerce Street",
    city: "Chicago",
    state: "Illinois",
    country: "United States",
    postal_code: "60601",
    email: "sales@retailmax.com",
    website: "https://www.retailmax.com",
    established_date: "2017-11-30",
    logo: "https://via.placeholder.com/150x150/ff5722/ffffff?text=RM",
    phone_number: "+1-555-567-8901",
    subscription_id: "2",
    subscription_name: "Pro Plan",
    created_at: "2024-01-06T00:00:00Z",
    updated_at: "2024-01-20T12:40:00Z",
  },
  {
    id: "7",
    name: "Northern Technologies",
    description: "Canadian technology consultancy specializing in AI and machine learning",
    address: "100 Innovation Way",
    city: "Toronto",
    state: "Ontario",
    country: "Canada",
    postal_code: "M5V 3A8",
    email: "info@northerntech.ca",
    website: "https://www.northerntech.ca",
    established_date: "2020-03-15",
    logo: "https://via.placeholder.com/150x150/607d8b/ffffff?text=NT",
    phone_number: "+1-416-555-0123",
    subscription_id: "3",
    subscription_name: "Enterprise Plan",
    created_at: "2024-01-07T00:00:00Z",
    updated_at: "2024-01-21T09:50:00Z",
  },
  {
    id: "8",
    name: "London Fintech Ltd",
    description: "Financial services and banking technology solutions",
    address: "25 Financial District",
    city: "London",
    state: "England",
    country: "United Kingdom",
    postal_code: "EC2V 6DN",
    email: "hello@londonfintech.co.uk",
    website: "https://www.londonfintech.co.uk",
    established_date: "2019-08-20",
    logo: "https://via.placeholder.com/150x150/3f51b5/ffffff?text=LF",
    phone_number: "+44-20-7946-0958",
    subscription_id: "3",
    subscription_name: "Enterprise Plan",
    created_at: "2024-01-08T00:00:00Z",
    updated_at: "2024-01-22T14:10:00Z",
  },
  {
    id: "9",
    name: "Berlin Software GmbH",
    description: "Enterprise software development and digital transformation services",
    address: "Unter den Linden 12",
    city: "Berlin",
    state: "Berlin",
    country: "Germany",
    postal_code: "10117",
    email: "kontakt@berlinsoftware.de",
    website: "https://www.berlinsoftware.de",
    established_date: "2018-12-05",
    logo: "https://via.placeholder.com/150x150/795548/ffffff?text=BS",
    phone_number: "+49-30-12345678",
    subscription_id: "2",
    subscription_name: "Pro Plan",
    created_at: "2024-01-09T00:00:00Z",
    updated_at: "2024-01-23T11:35:00Z",
  },
  {
    id: "10",
    name: "Sydney Digital Agency",
    description: "Creative digital marketing and web development agency",
    address: "88 Harbour Bridge Road",
    city: "Sydney",
    state: "New South Wales",
    country: "Australia",
    postal_code: "2000",
    email: "info@sydneydigital.com.au",
    website: "https://www.sydneydigital.com.au",
    established_date: "2021-02-14",
    logo: "https://via.placeholder.com/150x150/00bcd4/ffffff?text=SD",
    phone_number: "+61-2-9876-5432",
    subscription_id: "1",
    subscription_name: "Basic Plan",
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-24T13:25:00Z",
  },
  {
    id: "11",
    name: "DataScience Pro Inc",
    description: "Big data analytics and machine learning consulting firm",
    address: "999 Data Drive",
    city: "San Jose",
    state: "California",
    country: "United States",
    postal_code: "95110",
    email: "team@datasciencepro.com",
    website: "https://www.datasciencepro.com",
    established_date: "2020-07-22",
    logo: "https://via.placeholder.com/150x150/4caf50/ffffff?text=DS",
    phone_number: "+1-408-555-9876",
    subscription_id: "3",
    subscription_name: "Enterprise Plan",
    created_at: "2024-01-11T00:00:00Z",
    updated_at: "2024-01-25T16:15:00Z",
  },
  {
    id: "12",
    name: "Small Business Solutions",
    description: "Local business management software for small enterprises",
    address: "321 Main Street",
    city: "Portland",
    state: "Oregon",
    country: "United States",
    postal_code: "97201",
    email: "support@smallbizsolutions.com",
    website: "https://www.smallbizsolutions.com",
    established_date: "2023-01-10",
    logo: "https://via.placeholder.com/150x150/ffc107/ffffff?text=SB",
    phone_number: "+1-503-555-1234",
    subscription_id: "1",
    subscription_name: "Basic Plan",
    created_at: "2024-01-12T00:00:00Z",
    updated_at: "2024-01-26T09:30:00Z",
  },
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

export const mockChatUsers: ChatUser[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+1-555-123-4567",
    avatar: "https://via.placeholder.com/150x150/4f46e5/ffffff?text=AJ",
    status: "online",
    last_seen: "2024-02-01T10:30:00Z",
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    phone: "+1-555-987-6543",
    avatar: "https://via.placeholder.com/150x150/16a34a/ffffff?text=BS",
    status: "away",
    last_seen: "2024-02-01T09:45:00Z",
    created_at: "2024-01-16T00:00:00Z",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol.davis@example.com",
    phone: "+1-555-456-7890",
    avatar: "https://via.placeholder.com/150x150/dc2626/ffffff?text=CD",
    status: "offline",
    last_seen: "2024-01-31T18:20:00Z",
    created_at: "2024-01-17T00:00:00Z",
  },
  {
    id: "4",
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "+1-555-789-0123",
    avatar: "https://via.placeholder.com/150x150/ea580c/ffffff?text=DW",
    status: "online",
    last_seen: "2024-02-01T10:45:00Z",
    created_at: "2024-01-18T00:00:00Z",
  },
  {
    id: "5",
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    phone: "+1-555-234-5678",
    avatar: "https://via.placeholder.com/150x150/7c3aed/ffffff?text=ET",
    status: "online",
    last_seen: "2024-02-01T10:50:00Z",
    created_at: "2024-01-19T00:00:00Z",
  },
  {
    id: "6",
    name: "Frank Miller",
    email: "frank.miller@example.com",
    phone: "+1-555-345-6789",
    avatar: "https://via.placeholder.com/150x150/0891b2/ffffff?text=FM",
    status: "away",
    last_seen: "2024-02-01T08:30:00Z",
    created_at: "2024-01-20T00:00:00Z",
  },
];

export const mockChats: Chat[] = [
  {
    id: "1",
    user_id: "1",
    user_name: "Alice Johnson",
    user_avatar: "https://via.placeholder.com/150x150/4f46e5/ffffff?text=AJ",
    last_message: "Thank you for your help!",
    last_message_time: "2024-02-01T10:30:00Z",
    unread_count: 2,
    messages: [
      {
        id: "1",
        chat_id: "1",
        sender_id: "1",
        sender_type: "user",
        message: "Hi, I need help with my account settings",
        timestamp: "2024-02-01T10:00:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "2",
        chat_id: "1",
        sender_id: "admin",
        sender_type: "admin",
        message:
          "Hello Alice! I'd be happy to help you with your account settings. What specifically do you need assistance with?",
        timestamp: "2024-02-01T10:02:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "3",
        chat_id: "1",
        sender_id: "1",
        sender_type: "user",
        message:
          "I can't change my password. The form keeps giving me an error.",
        timestamp: "2024-02-01T10:05:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "4",
        chat_id: "1",
        sender_id: "admin",
        sender_type: "admin",
        message:
          "I see the issue. Please try using a password with at least 8 characters, including uppercase, lowercase, and numbers.",
        timestamp: "2024-02-01T10:07:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "5",
        chat_id: "1",
        sender_id: "1",
        sender_type: "user",
        message: "That worked! Thank you for your help!",
        timestamp: "2024-02-01T10:30:00Z",
        read: false,
        message_type: "text",
      },
    ],
    created_at: "2024-02-01T10:00:00Z",
  },
  {
    id: "2",
    user_id: "2",
    user_name: "Bob Smith",
    user_avatar: "https://via.placeholder.com/150x150/16a34a/ffffff?text=BS",
    last_message: "When will the new features be available?",
    last_message_time: "2024-02-01T09:45:00Z",
    unread_count: 1,
    messages: [
      {
        id: "6",
        chat_id: "2",
        sender_id: "2",
        sender_type: "user",
        message:
          "I heard about some new features coming to the platform. When will they be available?",
        timestamp: "2024-02-01T09:30:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "7",
        chat_id: "2",
        sender_id: "admin",
        sender_type: "admin",
        message:
          "Hi Bob! The new features are scheduled to roll out next week. I'll send you a detailed update once they're live.",
        timestamp: "2024-02-01T09:35:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "8",
        chat_id: "2",
        sender_id: "2",
        sender_type: "user",
        message: "When will the new features be available?",
        timestamp: "2024-02-01T09:45:00Z",
        read: false,
        message_type: "text",
      },
    ],
    created_at: "2024-02-01T09:30:00Z",
  },
  {
    id: "3",
    user_id: "3",
    user_name: "Carol Davis",
    user_avatar: "https://via.placeholder.com/150x150/dc2626/ffffff?text=CD",
    last_message: "Perfect, that's exactly what I needed!",
    last_message_time: "2024-01-31T18:20:00Z",
    unread_count: 0,
    messages: [
      {
        id: "9",
        chat_id: "3",
        sender_id: "3",
        sender_type: "user",
        message: "Can you help me understand how to export my data?",
        timestamp: "2024-01-31T18:00:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "10",
        chat_id: "3",
        sender_id: "admin",
        sender_type: "admin",
        message:
          "Absolutely! Go to Settings > Data Export, select the format you want, and click Download. The export will include all your data from the last 12 months.",
        timestamp: "2024-01-31T18:10:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "11",
        chat_id: "3",
        sender_id: "3",
        sender_type: "user",
        message: "Perfect, that's exactly what I needed!",
        timestamp: "2024-01-31T18:20:00Z",
        read: true,
        message_type: "text",
      },
    ],
    created_at: "2024-01-31T18:00:00Z",
  },
  {
    id: "4",
    user_id: "4",
    user_name: "David Wilson",
    user_avatar: "https://via.placeholder.com/150x150/ea580c/ffffff?text=DW",
    last_message: "Could you please check my billing issue?",
    last_message_time: "2024-02-01T10:45:00Z",
    unread_count: 3,
    messages: [
      {
        id: "12",
        chat_id: "4",
        sender_id: "4",
        sender_type: "user",
        message: "I was charged twice for my subscription this month",
        timestamp: "2024-02-01T10:30:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "13",
        chat_id: "4",
        sender_id: "admin",
        sender_type: "admin",
        message:
          "I'm sorry to hear about the billing issue. Let me check your account right away.",
        timestamp: "2024-02-01T10:35:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "14",
        chat_id: "4",
        sender_id: "4",
        sender_type: "user",
        message: "Could you please check my billing issue?",
        timestamp: "2024-02-01T10:45:00Z",
        read: false,
        message_type: "text",
      },
    ],
    created_at: "2024-02-01T10:30:00Z",
  },
  {
    id: "5",
    user_id: "5",
    user_name: "Emma Thompson",
    user_avatar: "https://via.placeholder.com/150x150/7c3aed/ffffff?text=ET",
    last_message: "Thanks! I'll try that solution.",
    last_message_time: "2024-02-01T10:50:00Z",
    unread_count: 0,
    messages: [
      {
        id: "15",
        chat_id: "5",
        sender_id: "5",
        sender_type: "user",
        message: "The mobile app keeps crashing when I try to upload photos",
        timestamp: "2024-02-01T10:40:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "16",
        chat_id: "5",
        sender_id: "admin",
        sender_type: "admin",
        message:
          "This is a known issue with photos larger than 10MB. Try compressing your images before uploading, or update to the latest app version.",
        timestamp: "2024-02-01T10:48:00Z",
        read: true,
        message_type: "text",
      },
      {
        id: "17",
        chat_id: "5",
        sender_id: "5",
        sender_type: "user",
        message: "Thanks! I'll try that solution.",
        timestamp: "2024-02-01T10:50:00Z",
        read: true,
        message_type: "text",
      },
    ],
    created_at: "2024-02-01T10:40:00Z",
  },
];

// Chatbot Flow Mock Data
export const mockChatbotFlows: ChatbotFlow[] = [
  {
    id: "1",
    name: "Welcome Flow",
    description: "Initial greeting and menu options for new users",
    trigger_keywords: ["hello", "hi", "start", "menu"],
    tags: ["welcome", "onboarding"],
    category: "general",
    access_permissions: "public",
    nodes: [
      {
        id: "welcome-1",
        type: "text",
        position: { x: 100, y: 100 },
        body: "Welcome! How can I help you today?",
        footer: "Choose an option below",
      },
      {
        id: "menu-1",
        type: "button",
        position: { x: 100, y: 200 },
        body: "What would you like to do?",
        buttons: [
          { id: "btn-1", text: "View Products", action: "products-1" },
          { id: "btn-2", text: "Contact Support", action: "support-1" },
          { id: "btn-3", text: "Account Info", action: "account-1" },
        ],
      },
      {
        id: "products-1",
        type: "list",
        position: { x: 300, y: 300 },
        body: "Our Product Categories",
        list_items: [
          {
            id: "list-1",
            title: "Electronics",
            description: "Phones, laptops, gadgets",
            action: "electronics-1",
          },
          {
            id: "list-2",
            title: "Clothing",
            description: "Fashion and accessories",
            action: "clothing-1",
          },
          {
            id: "list-3",
            title: "Home & Garden",
            description: "Furniture and decor",
            action: "home-1",
          },
        ],
      },
      {
        id: "support-1",
        type: "text",
        position: { x: 500, y: 200 },
        body: "Our support team is available 24/7. How can we assist you?",
        footer: "You can also call us at +1-555-SUPPORT",
      },
    ],
    edges: [
      { id: "e1", source: "welcome-1", target: "menu-1" },
      { id: "e2", source: "menu-1", target: "products-1", label: "Products" },
      { id: "e3", source: "menu-1", target: "support-1", label: "Support" },
    ],
    is_active: true,
    version: 1,
    created_by: "admin",
    created_by_name: "Admin User",
    created_date: "2024-01-15T00:00:00Z",
    updated_date: "2024-01-20T00:00:00Z",
    published_date: "2024-01-20T00:00:00Z",
    total_conversations: 1250,
    completion_rate: 85.5,
    average_completion_time: 45,
    languages: ["en"],
    default_language: "en",
  },
  {
    id: "2",
    name: "Product Inquiry Flow",
    description: "Helps users find and learn about products",
    trigger_keywords: ["product", "buy", "purchase", "price"],
    tags: ["sales", "products"],
    category: "sales",
    access_permissions: "public",
    nodes: [
      {
        id: "product-start",
        type: "text",
        position: { x: 100, y: 100 },
        body: "I'll help you find the perfect product!",
        footer: "What type of product are you looking for?",
      },
      {
        id: "product-categories",
        type: "button",
        position: { x: 100, y: 200 },
        body: "Select a category:",
        buttons: [
          {
            id: "electronics",
            text: "Electronics",
            action: "electronics-details",
          },
          { id: "clothing", text: "Fashion", action: "fashion-details" },
          { id: "books", text: "Books", action: "books-details" },
        ],
      },
      {
        id: "electronics-details",
        type: "catalog",
        position: { x: 300, y: 300 },
        body: "Featured Electronics",
        products: [
          {
            id: "phone-1",
            name: "Smartphone Pro",
            description: "Latest model with advanced features",
            price: 899,
            image_url:
              "https://via.placeholder.com/200x200/4f46e5/ffffff?text=Phone",
          },
          {
            id: "laptop-1",
            name: "Gaming Laptop",
            description: "High-performance laptop for gaming",
            price: 1299,
            image_url:
              "https://via.placeholder.com/200x200/16a34a/ffffff?text=Laptop",
          },
        ],
      },
    ],
    edges: [
      { id: "e1", source: "product-start", target: "product-categories" },
      {
        id: "e2",
        source: "product-categories",
        target: "electronics-details",
        label: "Electronics",
      },
    ],
    is_active: true,
    version: 2,
    created_by: "admin",
    created_by_name: "Admin User",
    created_date: "2024-01-18T00:00:00Z",
    updated_date: "2024-01-25T00:00:00Z",
    published_date: "2024-01-25T00:00:00Z",
    total_conversations: 890,
    completion_rate: 78.2,
    average_completion_time: 120,
    languages: ["en"],
    default_language: "en",
  },
  {
    id: "3",
    name: "Customer Support Flow",
    description: "Handles common support queries and escalation",
    trigger_keywords: ["help", "support", "issue", "problem"],
    tags: ["support", "help"],
    category: "support",
    access_permissions: "public",
    nodes: [
      {
        id: "support-start",
        type: "text",
        position: { x: 100, y: 100 },
        body: "I'm here to help! What issue are you experiencing?",
        footer: "Select the type of issue below",
      },
      {
        id: "issue-type",
        type: "list",
        position: { x: 100, y: 200 },
        body: "Common Issues",
        list_items: [
          {
            id: "login",
            title: "Login Problems",
            description: "Can't access your account",
            action: "login-help",
          },
          {
            id: "billing",
            title: "Billing Questions",
            description: "Issues with payments or charges",
            action: "billing-help",
          },
          {
            id: "technical",
            title: "Technical Issues",
            description: "App crashes or bugs",
            action: "tech-help",
          },
          {
            id: "other",
            title: "Other",
            description: "Something else",
            action: "human-agent",
          },
        ],
      },
      {
        id: "login-help",
        type: "text",
        position: { x: 300, y: 300 },
        body: "For login issues, try:\n1. Reset your password\n2. Clear browser cache\n3. Check your email for verification",
        footer: "Still having trouble? I can connect you with an agent.",
      },
      {
        id: "human-agent",
        type: "api_trigger",
        position: { x: 500, y: 400 },
        body: "I'm connecting you with a human agent...",
        api_config: {
          method: "POST",
          url: "/api/support/escalate",
          headers: { "Content-Type": "application/json" },
          body: {
            type: "escalation",
            user_id: "{{user_id}}",
            flow_id: "{{flow_id}}",
          },
        },
      },
    ],
    edges: [
      { id: "e1", source: "support-start", target: "issue-type" },
      { id: "e2", source: "issue-type", target: "login-help", label: "Login" },
      { id: "e3", source: "issue-type", target: "human-agent", label: "Other" },
    ],
    is_active: true,
    version: 1,
    created_by: "support-admin",
    created_by_name: "Support Admin",
    created_date: "2024-01-20T00:00:00Z",
    updated_date: "2024-01-22T00:00:00Z",
    published_date: "2024-01-22T00:00:00Z",
    total_conversations: 2100,
    completion_rate: 92.1,
    average_completion_time: 90,
    languages: ["en"],
    default_language: "en",
  },
];

export const mockChatbotNodeTemplates: ChatbotNodeTemplate[] = [
  {
    id: "template-1",
    name: "Welcome Message",
    description: "Standard welcome message for new users",
    type: "text",
    template_data: {
      body: "Welcome! How can I help you today?",
      footer: "Select an option to continue",
    },
    category: "greetings",
    is_public: true,
    created_by: "admin",
    created_date: "2024-01-10T00:00:00Z",
    usage_count: 45,
  },
  {
    id: "template-2",
    name: "Product Categories Menu",
    description: "Button menu for product categories",
    type: "button",
    template_data: {
      body: "Browse our product categories:",
      buttons: [
        { id: "electronics", text: "Electronics", action: "electronics-node" },
        { id: "fashion", text: "Fashion", action: "fashion-node" },
        { id: "home", text: "Home & Garden", action: "home-node" },
      ],
    },
    category: "menus",
    is_public: true,
    created_by: "admin",
    created_date: "2024-01-12T00:00:00Z",
    usage_count: 32,
  },
  {
    id: "template-3",
    name: "Support Escalation",
    description: "API call to escalate to human support",
    type: "api_trigger",
    template_data: {
      body: "Let me connect you with a support agent...",
      api_config: {
        method: "POST",
        url: "/api/support/escalate",
        headers: { "Content-Type": "application/json" },
        body: { type: "escalation", user_id: "{{user_id}}" },
      },
    },
    category: "support",
    is_public: true,
    created_by: "support-admin",
    created_date: "2024-01-14T00:00:00Z",
    usage_count: 28,
  },
];

export const mockChatbotConversations: ChatbotConversation[] = [
  {
    id: "conv-1",
    flow_id: "1",
    flow_name: "Welcome Flow",
    user_id: "user-1",
    user_name: "John Doe",
    user_phone: "+1-555-123-4567",
    current_node_id: "support-1",
    variables: { user_name: "John", selected_category: "support" },
    status: "active",
    messages: [
      {
        id: "msg-1",
        node_id: "welcome-1",
        message_type: "bot",
        content: "Welcome! How can I help you today?",
        timestamp: "2024-02-01T10:00:00Z",
      },
      {
        id: "msg-2",
        node_id: "menu-1",
        message_type: "bot",
        content: "What would you like to do?",
        timestamp: "2024-02-01T10:00:30Z",
      },
      {
        id: "msg-3",
        node_id: "menu-1",
        message_type: "user",
        content: "Contact Support",
        timestamp: "2024-02-01T10:01:00Z",
      },
    ],
    started_date: "2024-02-01T10:00:00Z",
    total_steps: 3,
    completion_rate: 60,
  },
  {
    id: "conv-2",
    flow_id: "2",
    flow_name: "Product Inquiry Flow",
    user_id: "user-2",
    user_name: "Jane Smith",
    user_phone: "+1-555-987-6543",
    current_node_id: undefined,
    variables: { selected_product: "smartphone-pro" },
    status: "completed",
    messages: [
      {
        id: "msg-4",
        node_id: "product-start",
        message_type: "bot",
        content: "I'll help you find the perfect product!",
        timestamp: "2024-02-01T11:00:00Z",
      },
      {
        id: "msg-5",
        node_id: "product-categories",
        message_type: "bot",
        content: "Select a category:",
        timestamp: "2024-02-01T11:00:15Z",
      },
      {
        id: "msg-6",
        node_id: "product-categories",
        message_type: "user",
        content: "Electronics",
        timestamp: "2024-02-01T11:00:45Z",
      },
    ],
    started_date: "2024-02-01T11:00:00Z",
    completed_date: "2024-02-01T11:05:30Z",
    total_steps: 5,
    completion_rate: 100,
  },
];

// Chatbot Flow API
export const chatbotFlowAPI = {
  // Get all flows
  getAll: (filter?: ChatbotFilter): Promise<{ data: ChatbotFlow[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredFlows = [...mockChatbotFlows];

        if (filter?.status) {
          if (filter.status === "active") {
            filteredFlows = filteredFlows.filter((f) => f.is_active);
          } else if (filter.status === "inactive") {
            filteredFlows = filteredFlows.filter((f) => !f.is_active);
          }
        }

        if (filter?.category) {
          filteredFlows = filteredFlows.filter(
            (f) => f.category === filter.category,
          );
        }

        if (filter?.tags && filter.tags.length > 0) {
          filteredFlows = filteredFlows.filter((f) =>
            filter.tags!.some((tag) => f.tags.includes(tag)),
          );
        }

        if (filter?.created_by) {
          filteredFlows = filteredFlows.filter(
            (f) => f.created_by === filter.created_by,
          );
        }

        resolve({ data: filteredFlows });
      }, 300);
    });
  },

  // Get flow by ID
  getById: (id: string): Promise<{ data: ChatbotFlow }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const flow = mockChatbotFlows.find((f) => f.id === id);
        if (flow) {
          resolve({ data: flow });
        } else {
          reject(new Error("Flow not found"));
        }
      }, 200);
    });
  },

  // Create new flow
  create: (data: ChatbotFlowFormData): Promise<{ data: ChatbotFlow }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFlow: ChatbotFlow = {
          id: `flow-${Date.now()}`,
          ...data,
          nodes: [],
          edges: [],
          is_active: false,
          version: 1,
          created_by: "current-user",
          created_by_name: "Current User",
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
          total_conversations: 0,
          completion_rate: 0,
          average_completion_time: 0,
          languages: ["en"],
          default_language: "en",
        };
        mockChatbotFlows.push(newFlow);
        resolve({ data: newFlow });
      }, 500);
    });
  },

  // Update flow
  update: (
    id: string,
    data: Partial<ChatbotFlowFormData>,
  ): Promise<{ data: ChatbotFlow }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockChatbotFlows.findIndex((f) => f.id === id);
        if (index !== -1) {
          mockChatbotFlows[index] = {
            ...mockChatbotFlows[index],
            ...data,
            updated_date: new Date().toISOString(),
          };
          resolve({ data: mockChatbotFlows[index] });
        } else {
          reject(new Error("Flow not found"));
        }
      }, 400);
    });
  },

  // Update flow structure (nodes and edges)
  updateStructure: (
    id: string,
    nodes: ChatbotFlowNode[],
    edges: ChatbotFlowEdge[],
  ): Promise<{ data: ChatbotFlow }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockChatbotFlows.findIndex((f) => f.id === id);
        if (index !== -1) {
          mockChatbotFlows[index] = {
            ...mockChatbotFlows[index],
            nodes,
            edges,
            updated_date: new Date().toISOString(),
          };
          resolve({ data: mockChatbotFlows[index] });
        } else {
          reject(new Error("Flow not found"));
        }
      }, 600);
    });
  },

  // Delete flow
  delete: (id: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockChatbotFlows.findIndex((f) => f.id === id);
        if (index !== -1) {
          mockChatbotFlows.splice(index, 1);
          resolve({ success: true });
        } else {
          reject(new Error("Flow not found"));
        }
      }, 300);
    });
  },

  // Publish flow
  publish: (id: string): Promise<{ data: ChatbotFlow }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockChatbotFlows.findIndex((f) => f.id === id);
        if (index !== -1) {
          mockChatbotFlows[index] = {
            ...mockChatbotFlows[index],
            is_active: true,
            published_date: new Date().toISOString(),
            updated_date: new Date().toISOString(),
          };
          resolve({ data: mockChatbotFlows[index] });
        } else {
          reject(new Error("Flow not found"));
        }
      }, 400);
    });
  },

  // Get flow statistics
  getStats: (): Promise<{ data: ChatbotFlowStats }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats: ChatbotFlowStats = {
          total_flows: mockChatbotFlows.length,
          active_flows: mockChatbotFlows.filter((f) => f.is_active).length,
          draft_flows: mockChatbotFlows.filter((f) => !f.is_active).length,
          total_conversations: mockChatbotFlows.reduce(
            (sum, f) => sum + f.total_conversations,
            0,
          ),
          average_completion_rate:
            mockChatbotFlows.reduce((sum, f) => sum + f.completion_rate, 0) /
            mockChatbotFlows.length,
          top_performing_flows: mockChatbotFlows
            .sort((a, b) => b.completion_rate - a.completion_rate)
            .slice(0, 5)
            .map((f) => ({
              id: f.id,
              name: f.name,
              completion_rate: f.completion_rate,
              total_conversations: f.total_conversations,
            })),
        };
        resolve({ data: stats });
      }, 200);
    });
  },
};

// Node Templates API
export const chatbotNodeTemplateAPI = {
  // Get all templates
  getAll: (): Promise<{ data: ChatbotNodeTemplate[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockChatbotNodeTemplates });
      }, 200);
    });
  },

  // Get templates by category
  getByCategory: (
    category: string,
  ): Promise<{ data: ChatbotNodeTemplate[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const templates = mockChatbotNodeTemplates.filter(
          (t) => t.category === category,
        );
        resolve({ data: templates });
      }, 200);
    });
  },

  // Create template
  create: (
    data: Omit<ChatbotNodeTemplate, "id" | "created_date" | "usage_count">,
  ): Promise<{ data: ChatbotNodeTemplate }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTemplate: ChatbotNodeTemplate = {
          ...data,
          id: `template-${Date.now()}`,
          created_date: new Date().toISOString(),
          usage_count: 0,
        };
        mockChatbotNodeTemplates.push(newTemplate);
        resolve({ data: newTemplate });
      }, 300);
    });
  },
};

// Conversations API
export const chatbotConversationAPI = {
  // Get all conversations
  getAll: (flowId?: string): Promise<{ data: ChatbotConversation[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let conversations = [...mockChatbotConversations];
        if (flowId) {
          conversations = conversations.filter((c) => c.flow_id === flowId);
        }
        resolve({ data: conversations });
      }, 300);
    });
  },

  // Get conversation analytics
  getAnalytics: (
    flowId: string,
    dateRange: { start: string; end: string },
  ): Promise<{ data: ChatbotAnalytics }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analytics: ChatbotAnalytics = {
          flow_id: flowId,
          date_range: dateRange,
          total_conversations: 150,
          completed_conversations: 120,
          abandoned_conversations: 30,
          completion_rate: 80,
          average_completion_time: 85,
          node_analytics: [
            {
              node_id: "welcome-1",
              node_type: "text",
              visits: 150,
              exits: 5,
              completion_rate: 96.7,
              average_time_spent: 15,
            },
            {
              node_id: "menu-1",
              node_type: "button",
              visits: 145,
              exits: 25,
              completion_rate: 82.8,
              average_time_spent: 30,
            },
          ],
          unique_users: 135,
          returning_users: 15,
          peak_usage_hours: [
            { hour: 9, count: 25 },
            { hour: 14, count: 30 },
            { hour: 20, count: 22 },
          ],
          popular_paths: [
            {
              path: ["welcome-1", "menu-1", "products-1"],
              count: 45,
              completion_rate: 85,
            },
            {
              path: ["welcome-1", "menu-1", "support-1"],
              count: 35,
              completion_rate: 92,
            },
          ],
        };
        resolve({ data: analytics });
      }, 400);
    });
  },
};

// Testing API
export const chatbotTestAPI = {
  // Run flow test
  runTest: (
    flowId: string,
    testType: "unit" | "integration" | "user_journey",
  ): Promise<{ data: ChatbotTestResult }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const testResult: ChatbotTestResult = {
          id: `test-${Date.now()}`,
          flow_id: flowId,
          test_type: testType,
          test_name: `${testType} test for flow ${flowId}`,
          status: Math.random() > 0.2 ? "passed" : "failed",
          execution_time: Math.floor(Math.random() * 5000) + 1000,
          executed_date: new Date().toISOString(),
          steps: [
            {
              step_number: 1,
              node_id: "welcome-1",
              input: "start",
              expected_output: "Welcome! How can I help you today?",
              actual_output: "Welcome! How can I help you today?",
              status: "passed",
            },
            {
              step_number: 2,
              node_id: "menu-1",
              input: "menu",
              expected_output: "What would you like to do?",
              actual_output: "What would you like to do?",
              status: "passed",
            },
          ],
          total_steps: 2,
          passed_steps: 2,
          failed_steps: 0,
          success_rate: 100,
        };
        resolve({ data: testResult });
      }, 2000);
    });
  },

  // Get test history
  getTestHistory: (flowId: string): Promise<{ data: ChatbotTestResult[] }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTests: ChatbotTestResult[] = [
          {
            id: "test-1",
            flow_id: flowId,
            test_type: "unit",
            test_name: "Unit test - Welcome Flow",
            status: "passed",
            execution_time: 1500,
            executed_date: "2024-02-01T10:00:00Z",
            steps: [],
            total_steps: 5,
            passed_steps: 5,
            failed_steps: 0,
            success_rate: 100,
          },
          {
            id: "test-2",
            flow_id: flowId,
            test_type: "integration",
            test_name: "Integration test - API calls",
            status: "failed",
            execution_time: 3200,
            executed_date: "2024-02-01T09:30:00Z",
            steps: [],
            total_steps: 8,
            passed_steps: 6,
            failed_steps: 2,
            success_rate: 75,
          },
        ];
        resolve({ data: mockTests });
      }, 300);
    });
  },
};