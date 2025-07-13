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
