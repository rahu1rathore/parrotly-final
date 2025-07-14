export interface Module {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  view: boolean;
  edit: boolean;
  delete: boolean;
  create: boolean;
}

export interface ModulePermission {
  module_id: string;
  module_name: string;
  permissions: Permission;
}

export interface Subscription {
  id: string;
  name: string;
  description?: string;
  price: number;
  validity: number; // days
  modules: ModulePermission[];
  created_at?: string;
  updated_at?: string;
}

export interface ModuleFormData {
  name: string;
  description: string;
}

export interface SubscriptionFormData {
  name: string;
  description: string;
  price: number;
  validity: number;
  modules: ModulePermission[];
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  email: string;
  website?: string;
  established_date: string;
  logo?: string;
  phone_number: string;
  subscription_id?: string;
  subscription_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  email: string;
  website: string;
  established_date: string;
  logo: string;
  phone_number: string;
  subscription_id: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "number"
    | "date"
    | "select"
    | "textarea"
    | "boolean";
  required: boolean;
  options?: string[]; // For select fields
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  order: number;
}

export interface FormConfiguration {
  id: string;
  organization_id: string;
  organization_name?: string;
  name: string;
  description?: string;
  fields: FormField[];
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  organization_name?: string;
  form_configuration_id: string;
  phone_number: string; // Always present, special handling
  data: { [key: string]: any }; // Dynamic fields based on form configuration
  created_at?: string;
  updated_at?: string;
}

export interface CustomerFormData {
  organization_id: string;
  form_configuration_id: string;
  phone_number: string;
  data: { [key: string]: any };
}

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  last_seen?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_type: "admin" | "user";
  message: string;
  timestamp: string;
  read: boolean;
  message_type: "text" | "image" | "file";
  attachment_url?: string;
}

export interface Chat {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  messages: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

export interface ChatUserFormData {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export type FilterStatus = "all" | "active" | "inactive";

// WhatsApp Template Types
export interface WhatsAppTemplateButton {
  id: string;
  type: "call_to_action" | "quick_reply";
  text: string;
  url?: string;
  phoneNumber?: string;
  payload?: string;
}

export interface WhatsAppTemplateHeader {
  type: "text" | "image" | "video" | "document";
  content: string;
  mediaUrl?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: "marketing" | "utility" | "authentication";
  language: string;
  status: "approved" | "rejected" | "pending" | "disabled";
  header?: WhatsAppTemplateHeader;
  body: string;
  footer?: string;
  buttons: WhatsAppTemplateButton[];
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  variables?: string[];
}

export interface WhatsAppTemplateFormData {
  name: string;
  category: "marketing" | "utility" | "authentication";
  language: string;
  header?: WhatsAppTemplateHeader;
  body: string;
  footer?: string;
  buttons: WhatsAppTemplateButton[];
}

export interface TemplateInsights {
  templateId: string;
  totalSent: number;
  delivered: number;
  read: number;
  clicked: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
  lastSent: string;
}

export interface TemplateInteraction {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  userPhone: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  clickedAt?: string;
  status: "sent" | "delivered" | "read" | "clicked" | "failed";
}

export interface BulkSendRequest {
  templateId: string;
  recipients: {
    phone: string;
    name?: string;
    variables?: Record<string, string>;
  }[];
  scheduledAt?: string;
}

export interface BulkSendResult {
  id: string;
  templateId: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  errors?: string[];
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  criteria: Record<string, any>;
  createdDate: string;
}

// Lead Management Types
export interface DynamicFormField {
  id: string;
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "number"
    | "date"
    | "select"
    | "textarea"
    | "boolean"
    | "file";
  required: boolean;
  options?: string[]; // For select fields
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  order: number;
  isSystem?: boolean; // For non-editable fields like phone
}

export interface DynamicForm {
  id: string;
  name: string;
  description?: string;
  fields: DynamicFormField[];
  createdBy: string;
  createdDate: string;
  updatedDate: string;
  isActive: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  owner: string;
  formId?: string;
  formName?: string;
  leadCount: number;
  convertedCount: number;
  createdBy: string;
  createdDate: string;
  updatedDate: string;
}

export interface Lead {
  id: string;
  campaignId: string;
  campaignName?: string;
  phoneNumber: string; // Always required
  data: Record<string, any>; // Dynamic fields based on form
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "converted"
    | "dropped"
    | "nurturing";
  assignedTo?: string;
  assignedBy?: string;
  assignedDate?: string;
  source: string;
  tags: string[];
  priority: "low" | "medium" | "high";
  lastContactDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
  createdDate: string;
  updatedDate: string;
}

export interface LeadFormData {
  campaignId: string;
  phoneNumber: string;
  data: Record<string, any>;
  source?: string;
  tags?: string[];
  priority?: "low" | "medium" | "high";
  assignedTo?: string;
  notes?: string;
}

export interface LeadAssignment {
  id: string;
  leadId: string;
  leadData?: Lead;
  assignedTo: string;
  assignedToName?: string;
  assignedBy: string;
  assignedByName?: string;
  assignedDate: string;
  notes?: string;
  isActive: boolean;
}

export interface Task {
  id: string;
  leadId: string;
  leadData?: Lead;
  title: string;
  description?: string;
  dueDate: string;
  reminderDate?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  assignedTo: string;
  assignedToName?: string;
  createdBy: string;
  createdByName?: string;
  completedDate?: string;
  outcome?: string;
  createdDate: string;
  updatedDate: string;
}

export interface ActivityLog {
  id: string;
  entityType: "lead" | "campaign" | "task" | "assignment";
  entityId: string;
  action: string;
  description: string;
  performedBy: string;
  performedByName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  assignedLeadsCount: number;
  convertedLeadsCount: number;
  avatar?: string;
  createdDate: string;
}

export interface LeadFilter {
  campaignId?: string;
  status?: string;
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  priority?: string;
  tags?: string[];
  source?: string;
}

export interface BulkUploadResult {
  id: string;
  filename: string;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  status: "processing" | "completed" | "failed";
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  createdBy: string;
  createdDate: string;
  completedDate?: string;
}

export interface CampaignFormData {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: "draft" | "active" | "paused";
  formId?: string;
}

export interface TaskFormData {
  leadId: string;
  title: string;
  description?: string;
  dueDate: string;
  reminderDate?: string;
  priority: "low" | "medium" | "high";
  assignedTo: string;
}

export interface NotificationSettings {
  assignments: boolean;
  taskDeadlines: boolean;
  leadUpdates: boolean;
  campaignUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface LeadStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  droppedLeads: number;
  conversionRate: number;
  averageResponseTime: number;
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  conversionRate: number;
  topPerformingCampaign: string;
  leadsBySource: Record<string, number>;
}

// Chatbot Builder Types
export interface ChatbotFlowPosition {
  x: number;
  y: number;
}

export interface ChatbotFlowButton {
  id: string;
  text: string;
  action: string; // node_id to navigate to, or 'end_flow', 'api_call'
}

export interface ChatbotFlowNode {
  id: string;
  type:
    | "text"
    | "button"
    | "list"
    | "image"
    | "audio"
    | "video"
    | "product"
    | "catalog"
    | "api_trigger"
    | "condition"
    | "end";
  position: ChatbotFlowPosition;

  // Common fields
  header?: string;
  body: string;
  footer?: string;

  // Media fields
  media_url?: string;

  // Interactive fields
  buttons?: ChatbotFlowButton[];
  list_items?: Array<{
    id: string;
    title: string;
    description?: string;
    action: string;
  }>;

  // Product/Catalog fields
  products?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
  }>;

  // API trigger fields
  api_config?: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    url: string;
    headers?: Record<string, string>;
    body?: Record<string, any>;
    response_mapping?: Record<string, string>;
  };

  // Condition fields
  conditions?: Array<{
    field: string;
    operator:
      | "equals"
      | "not_equals"
      | "contains"
      | "greater_than"
      | "less_than";
    value: any;
    action: string; // node_id to navigate to
  }>;

  // Metadata
  metadata?: Record<string, any>;
}

export interface ChatbotFlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  type?: string;
}

export interface ChatbotFlow {
  id: string;
  name: string;
  description?: string;
  trigger_keywords: string[];
  tags: string[];
  category?: string;
  access_permissions: "public" | "private" | "role_based";
  allowed_roles?: string[];

  // Flow structure
  nodes: ChatbotFlowNode[];
  edges: ChatbotFlowEdge[];

  // Flow settings
  is_active: boolean;
  version: number;

  // Metadata
  created_by: string;
  created_by_name?: string;
  created_date: string;
  updated_date: string;
  published_date?: string;

  // Analytics
  total_conversations: number;
  completion_rate: number;
  average_completion_time: number;

  // Localization
  languages: string[];
  default_language: string;
}

export interface ChatbotFlowFormData {
  name: string;
  description?: string;
  trigger_keywords: string[];
  tags: string[];
  category?: string;
  access_permissions: "public" | "private" | "role_based";
  allowed_roles?: string[];
}

export interface ChatbotFlowVersion {
  id: string;
  flow_id: string;
  version: number;
  name: string;
  nodes: ChatbotFlowNode[];
  edges: ChatbotFlowEdge[];
  created_by: string;
  created_date: string;
  is_published: boolean;
  change_log?: string;
}

export interface ChatbotNodeTemplate {
  id: string;
  name: string;
  description: string;
  type: ChatbotFlowNode["type"];
  template_data: Partial<ChatbotFlowNode>;
  category: string;
  is_public: boolean;
  created_by: string;
  created_date: string;
  usage_count: number;
}

export interface ChatbotConversation {
  id: string;
  flow_id: string;
  flow_name?: string;
  user_id: string;
  user_name?: string;
  user_phone: string;

  // Conversation state
  current_node_id?: string;
  variables: Record<string, any>;
  status: "active" | "completed" | "abandoned" | "error";

  // Messages
  messages: Array<{
    id: string;
    node_id: string;
    message_type: "bot" | "user";
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;

  // Analytics
  started_date: string;
  completed_date?: string;
  abandoned_date?: string;
  total_steps: number;
  completion_rate: number;
}

export interface ChatbotAnalytics {
  flow_id: string;
  date_range: {
    start: string;
    end: string;
  };

  // Usage metrics
  total_conversations: number;
  completed_conversations: number;
  abandoned_conversations: number;
  completion_rate: number;
  average_completion_time: number;

  // Node performance
  node_analytics: Array<{
    node_id: string;
    node_type: string;
    visits: number;
    exits: number;
    completion_rate: number;
    average_time_spent: number;
  }>;

  // User engagement
  unique_users: number;
  returning_users: number;
  peak_usage_hours: Array<{
    hour: number;
    count: number;
  }>;

  // Popular paths
  popular_paths: Array<{
    path: string[];
    count: number;
    completion_rate: number;
  }>;
}

export interface ChatbotTestResult {
  id: string;
  flow_id: string;
  test_type: "unit" | "integration" | "user_journey";
  test_name: string;

  // Test execution
  status: "passed" | "failed" | "skipped";
  execution_time: number;
  executed_date: string;

  // Test steps
  steps: Array<{
    step_number: number;
    node_id: string;
    input: string;
    expected_output: string;
    actual_output: string;
    status: "passed" | "failed";
    error_message?: string;
  }>;

  // Overall results
  total_steps: number;
  passed_steps: number;
  failed_steps: number;
  success_rate: number;
}

export interface ChatbotIntegration {
  id: string;
  flow_id: string;
  integration_type:
    | "whatsapp"
    | "telegram"
    | "slack"
    | "discord"
    | "web_widget";
  config: Record<string, any>;
  is_active: boolean;
  webhook_url?: string;
  api_key?: string;
  created_date: string;
  last_sync_date?: string;
}

export interface ChatbotFilter {
  status?: "active" | "inactive" | "draft";
  category?: string;
  tags?: string[];
  created_by?: string;
  date_range?: {
    start: string;
    end: string;
  };
  access_permissions?: "public" | "private" | "role_based";
}

export interface ChatbotFlowStats {
  total_flows: number;
  active_flows: number;
  draft_flows: number;
  total_conversations: number;
  average_completion_rate: number;
  top_performing_flows: Array<{
    id: string;
    name: string;
    completion_rate: number;
    total_conversations: number;
  }>;
}
