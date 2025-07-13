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

export type FilterStatus = "all" | "active" | "inactive";
