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

export type FilterStatus = "all" | "active" | "inactive";
