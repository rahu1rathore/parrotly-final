# Admin Panel Features

This directory contains the admin panel components for managing modules and subscriptions in the SaaS application.

## Components

### 1. Module Management (`ModuleManagement.tsx`)

A comprehensive component for managing system modules with the following features:

**Fields:**

- `name` (string) - Required module name
- `description` (string) - Optional module description
- `is_active` (boolean) - Active/inactive status

**Features:**

- ✅ Create new modules
- ✅ Edit existing modules (name and description)
- ✅ Toggle active/inactive status with switch
- ✅ Search modules by name
- ✅ Filter by status (All, Active, Inactive)
- ✅ Real-time validation
- ✅ Success/error notifications
- ✅ Responsive design with Material-UI

### 2. Subscription Management (`SubscriptionManagement.tsx`)

A comprehensive component for managing subscription plans with module permissions:

**Fields:**

- `name` (string) - Required subscription name
- `description` (string) - Optional description
- `price` (number) - Required price amount
- `validity` (number) - Required validity period in days
- `modules` (array) - Selected modules with permissions

**Module Permissions:**

- `view` - Read access
- `create` - Create new records
- `edit` - Modify existing records
- `delete` - Remove records

**Features:**

- ✅ Create/edit subscription plans
- ✅ Delete subscriptions with confirmation
- ✅ Multi-select module dropdown (active modules only)
- ✅ Granular permission assignment per module
- ✅ Dynamic module permissions table
- ✅ Form validation for all required fields
- ✅ Modern card-based layout
- ✅ Real-time price formatting
- ✅ Success/error notifications

### 3. Admin Dashboard (`AdminDashboard.tsx`)

Main admin panel page with tabbed navigation:

**Features:**

- ✅ Overview tab with feature summary
- ✅ Module Management tab
- ✅ Subscription Management tab
- ✅ Breadcrumb navigation
- ✅ Responsive design

## API Integration

### Service Layer (`services/api.ts`)

Provides API endpoints for:

- Module CRUD operations
- Subscription CRUD operations
- Mock data for development
- Axios integration with proper error handling

**Current Status:** Using mock data - ready for backend integration

### Custom Hooks (`hooks/useModules.ts`)

Provides reusable module management logic:

- State management for modules
- CRUD operations with error handling
- Loading states
- Active module filtering

## Types (`types/index.ts`)

Comprehensive TypeScript interfaces for:

- `Module` - Module entity
- `Subscription` - Subscription entity
- `Permission` - Permission flags
- `ModulePermission` - Module with permissions
- `FilterStatus` - Status filter options
- Form data types with validation

## Usage

### Accessing the Admin Panel

1. Navigate to `/admin` in your application
2. The admin panel is protected by authentication (requires login)
3. Admin link is available in the CRM dashboard navigation

### Module Management Workflow

1. **Create Module**: Click "Add Module" → Fill form → Submit
2. **Edit Module**: Click edit icon → Modify fields → Update
3. **Toggle Status**: Use the switch in the "Active" column
4. **Search**: Use search bar to filter by name
5. **Filter**: Use dropdown to filter by status

### Subscription Management Workflow

1. **Create Subscription**: Click "Add Subscription" → Fill details
2. **Add Modules**: Select from dropdown → Configure permissions → Add
3. **Set Permissions**: Use checkboxes for view/create/edit/delete
4. **Save**: Click "Create Subscription" or "Update Subscription"
5. **Edit**: Click edit button on subscription card
6. **Delete**: Click delete button → Confirm action

## Technical Features

### Responsive Design

- Mobile-first Material-UI components
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

### Form Validation

- Real-time field validation
- Required field indicators
- Error messages with user guidance
- Form state management

### User Experience

- Loading states during API calls
- Success/error notifications
- Confirmation dialogs for destructive actions
- Keyboard navigation support
- Accessible components

### Performance

- Optimized re-renders with React hooks
- Efficient state management
- Lazy loading ready
- Minimal bundle impact

## Backend Integration

To connect with your backend API:

1. Update the API endpoints in `services/api.ts`
2. Replace mock data usage with actual API calls
3. Configure axios base URL in `src/lib/axios.ts`
4. Add authentication headers as needed
5. Handle error responses appropriately

## Styling

The components use Material-UI v5 with:

- Consistent theme integration
- Dark/light mode support
- Responsive breakpoints
- Elevation and shadows
- Typography scale
- Color palette

## File Structure

```
src/features/admin/
├── components/
│   ├── ModuleManagement.tsx     # Module CRUD component
│   └── SubscriptionManagement.tsx # Subscription CRUD component
├── pages/
│   └── AdminDashboard.tsx       # Main admin page
├── services/
│   └── api.ts                   # API service layer
├── hooks/
│   └── useModules.ts           # Module management hook
├── types/
│   └── index.ts                # TypeScript interfaces
├── index.ts                    # Feature exports
└── README.md                   # This documentation
```

## Future Enhancements

Potential improvements:

- Bulk module operations
- Advanced filtering and sorting
- Module usage analytics
- Subscription analytics dashboard
- Role-based admin permissions
- Audit logging
- Export/import functionality
- Module dependency management
