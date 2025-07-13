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
