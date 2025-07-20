// RBAC Types for Module Management System

export type ModuleAction = "view" | "edit" | "disable" | "manage";

export interface ModulePermission {
  moduleId: string;
  moduleName: string;
  allowedActions: ModuleAction[];
}

export interface SubscriptionPlan {
  id: string;
  planName: string;
  version: string;
  description?: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  maxUsers?: number;
  modules: Record<string, ModuleAction[]>; // moduleId -> allowed actions
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SubscriptionPlanFormData {
  planName: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  maxUsers?: number;
  modules: Record<string, ModuleAction[]>;
  features: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  permissions: Record<string, ModuleAction[]>; // moduleId -> role permissions
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface RoleFormData {
  name: string;
  description: string;
  permissions: Record<string, ModuleAction[]>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
  roleId: string;
  roleName?: string;
  isActive: boolean;
  lastLogin?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  name: string;
  email: string;
  roleId: string;
  organizationId: string;
  password?: string;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  subscriptionPlanId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSubscription {
  id: string;
  organizationId: string;
  subscriptionPlanId: string;
  planName?: string;
  planVersion?: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled" | "suspended";
  autoRenewal: boolean;
  paymentStatus: "paid" | "pending" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface EffectivePermissions {
  moduleId: string;
  moduleName: string;
  allowedActions: ModuleAction[];
  restrictedBy: "subscription" | "role" | "none";
}

export interface PermissionMatrix {
  userId: string;
  userName: string;
  rolePermissions: Record<string, ModuleAction[]>;
  subscriptionPermissions: Record<string, ModuleAction[]>;
  effectivePermissions: Record<string, ModuleAction[]>;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon?: string;
  availableActions: ModuleAction[];
  dependencies?: string[]; // Other module IDs this module depends on
  isCore: boolean; // Core modules cannot be disabled
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleToggleState {
  moduleId: string;
  action: ModuleAction;
  enabled: boolean;
  allowedBySubscription: boolean;
  allowedByRole: boolean;
}

export interface RolePermissionUpdate {
  roleId: string;
  moduleId: string;
  actions: ModuleAction[];
}

export interface SubscriptionPlanUpdate {
  planId: string;
  moduleId: string;
  actions: ModuleAction[];
}

export interface UserPermissionSummary {
  userId: string;
  userName: string;
  email: string;
  roleName: string;
  organizationName: string;
  subscriptionPlan: string;
  modules: Array<{
    moduleId: string;
    moduleName: string;
    roleActions: ModuleAction[];
    subscriptionActions: ModuleAction[];
    effectiveActions: ModuleAction[];
    hasAccess: boolean;
  }>;
  lastUpdated: string;
}

export interface PermissionAuditLog {
  id: string;
  entityType: "user" | "role" | "subscription" | "organization";
  entityId: string;
  action: "create" | "update" | "delete" | "assign" | "revoke";
  changes: Record<string, any>;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  reason?: string;
  affectedUsers?: string[];
}

export interface SuperAdminPrivileges {
  canManageModules: boolean;
  canManageSubscriptionPlans: boolean;
  canManageOrganizations: boolean;
  canManageRoles: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
  canManageSystemSettings: boolean;
}

export interface PermissionValidationResult {
  hasPermission: boolean;
  reason?: string;
  requiredAction: ModuleAction;
  moduleId: string;
  userId: string;
}

export interface BulkPermissionUpdate {
  targetType: "role" | "subscription";
  targetIds: string[];
  moduleUpdates: Array<{
    moduleId: string;
    actions: ModuleAction[];
    operation: "add" | "remove" | "replace";
  }>;
  reason?: string;
}

export interface PermissionConflict {
  type: "missing_dependency" | "circular_dependency" | "invalid_action";
  moduleId: string;
  conflictingAction: ModuleAction;
  description: string;
  suggestions: string[];
}

export interface PermissionTemplate {
  id: string;
  name: string;
  description: string;
  type: "role" | "subscription";
  permissions: Record<string, ModuleAction[]>;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

// Filter types
export interface RoleFilter {
  organizationId?: string;
  isActive?: boolean;
  search?: string;
}

export interface UserFilter {
  organizationId?: string;
  roleId?: string;
  isActive?: boolean;
  search?: string;
}

export interface SubscriptionPlanFilter {
  isActive?: boolean;
  billingCycle?: "monthly" | "yearly";
  search?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface AuditLogFilter {
  entityType?: string;
  action?: string;
  performedBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}
