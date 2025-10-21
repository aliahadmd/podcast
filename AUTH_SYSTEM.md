# 🔐 Authentication & Authorization System

## Overview

This application implements a **professional, secure authentication and authorization system** with role-based access control (RBAC), subscription management, and comprehensive route protection.

---

## 🏗️ Architecture

### **Two-Layer Security**

1. **Server-Side (API Routes)**
   - JWT token validation
   - Role verification
   - Subscription checks
   - Located in: `lib/middleware.ts`

2. **Client-Side (React Pages)**
   - Route protection components
   - Auth context management
   - Automatic redirects
   - Loading states

---

## 📁 Files & Components

### **Core Authentication**

#### `contexts/AuthContext.tsx`
**Purpose:** Global authentication state management

**Features:**
- Manages user and subscription state
- Provides authentication status
- Handles login/logout
- Auto-loads user on mount
- Refreshes subscription data

**Exports:**
```typescript
interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasActiveSubscription: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}
```

**Usage:**
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, hasActiveSubscription, logout } = useAuth();
  // ...
}
```

---

#### `components/ProtectedRoute.tsx`
**Purpose:** Wrapper component for pages requiring authentication

**Features:**
- Redirects unauthenticated users to login
- Shows loading state during auth check
- Supports admin-only routes
- Supports subscription-required routes
- Preserves return URL for post-login redirect

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;           // Requires user to be logged in
  requireAdmin?: boolean;           // Requires admin role
  requireSubscription?: boolean;    // Requires active subscription
  redirectTo?: string;              // Custom redirect URL
}
```

**Usage:**
```typescript
// Require authentication only
export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ProfileContent />
    </ProtectedRoute>
  );
}

// Require admin role
export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminContent />
    </ProtectedRoute>
  );
}

// Require active subscription
export default function PremiumContentPage() {
  return (
    <ProtectedRoute requireSubscription={true}>
      <PremiumContent />
    </ProtectedRoute>
  );
}
```

---

#### `components/GuestRoute.tsx`
**Purpose:** Wrapper for pages that should ONLY be accessible to guests (non-authenticated users)

**Features:**
- Redirects authenticated users away
- Perfect for login/register pages
- Shows loading state

**Usage:**
```typescript
export default function LoginPage() {
  return (
    <GuestRoute redirectTo="/profile">
      <LoginForm />
    </GuestRoute>
  );
}
```

---

### **Server-Side Middleware**

#### `lib/middleware.ts`
**Purpose:** API route protection and JWT validation

**Functions:**

##### `authenticateRequest(request)`
Validates JWT token and returns user info
```typescript
const { user, error } = await authenticateRequest(request);
```

##### `requireAuth(request)`
Ensures user is authenticated (401 if not)
```typescript
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // User not authenticated
  }
  
  const user = authResult.user;
  // ... your logic
}
```

##### `requireAdmin(request)`
Ensures user is an admin (403 if not)
```typescript
const authResult = await requireAdmin(request);
```

##### `requireSubscription(request)`
Ensures user has active subscription (403 if not)
```typescript
const authResult = await requireSubscription(request);
```

---

## 🔒 Access Levels

### **1. Public Access** (No Protection)
- Landing page (`/`)
- Podcasts listing (`/podcasts`)
- Individual podcast pages (`/podcasts/[id]`)

### **2. Authenticated Users**
**Require Login:**
- Profile page (`/profile`)
- Subscription success/cancel pages (`/subscription/*`)

### **3. Admin Only**
**Require Admin Role:**
- Admin dashboard (`/admin`)
- Create podcast (`/admin/podcast/new`)
- Edit podcast (`/admin/podcast/[id]`)
- Manage episodes (`/admin/podcast/[id]/episodes`)

### **4. Subscription Required**
**Require Active Subscription:**
- Premium podcast playback (enforced at playback level)
- Premium episodes

### **5. Guest Only**
**Redirect if Authenticated:**
- Login page (`/login`)
- Register page (`/register`)

---

## 🚀 Implementation Examples

### Protect an Entire Page

```typescript
// app/my-protected-page/page.tsx
'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

function MyProtectedContent() {
  return <div>Protected content here</div>;
}

export default function MyProtectedPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <MyProtectedContent />
    </ProtectedRoute>
  );
}
```

### Use Auth State in Component

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    hasActiveSubscription,
    logout 
  } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      {isAdmin && <button>Admin Panel</button>}
      {hasActiveSubscription && <p>✓ Premium Member</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protect API Route

```typescript
// app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Returns 401 automatically
  }

  const user = authResult.user;
  
  // Your logic here
  return NextResponse.json({ message: 'Success', user });
}
```

### Protect Admin API Route

```typescript
import { requireAdmin } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Returns 401 or 403
  }

  const user = authResult.user;
  
  // Admin-only logic
  return NextResponse.json({ message: 'Admin action completed' });
}
```

---

## 🔄 Authentication Flow

### **Login Flow:**
```
1. User enters credentials
2. POST /api/auth/login
3. Server validates credentials
4. Server returns JWT token
5. Client stores token in localStorage
6. AuthContext loads user data
7. User is redirected to intended page
```

### **Page Protection Flow:**
```
1. User navigates to protected page
2. ProtectedRoute checks AuthContext
3. If not authenticated → redirect to /login?redirect={current_page}
4. If authenticated → render page
5. After login → redirect back to original page
```

### **Logout Flow:**
```
1. User clicks logout
2. AuthContext.logout() called
3. Token removed from localStorage
4. User/subscription state cleared
5. Redirect to home page
```

---

## 🛡️ Security Features

### **1. JWT Token Security**
- Stored in localStorage (client-side)
- Sent via `Authorization: Bearer {token}` header
- Validated on every API request
- Contains user ID, email, and role

### **2. Role-Based Access Control (RBAC)**
- Roles: `user`, `admin`
- Admin routes protected both client and server-side
- Role checked in JWT payload

### **3. Subscription Verification**
- Checks subscription status
- Validates expiration date
- Enforces premium content access

### **4. Return URL Preservation**
- Unauthenticated users redirected to login
- Return URL preserved: `/login?redirect=/profile`
- Auto-redirect after successful login

### **5. Loading States**
- Prevents flash of unauthorized content
- Shows spinner during auth check
- Smooth UX transitions

---

## 📊 Route Protection Matrix

| Route | Public | Auth Required | Admin Required | Subscription Required |
|-------|--------|---------------|----------------|----------------------|
| `/` | ✅ | ❌ | ❌ | ❌ |
| `/podcasts` | ✅ | ❌ | ❌ | ❌ |
| `/podcasts/[id]` | ✅ | ❌ | ❌ | ❌ |
| `/login` | ✅ (Guest Only) | ❌ | ❌ | ❌ |
| `/register` | ✅ (Guest Only) | ❌ | ❌ | ❌ |
| `/profile` | ❌ | ✅ | ❌ | ❌ |
| `/admin` | ❌ | ✅ | ✅ | ❌ |
| `/admin/podcast/*` | ❌ | ✅ | ✅ | ❌ |
| Premium Playback | ❌ | ✅ | ❌ | ✅ |

---

## 🧪 Testing Auth System

### **Test as Guest:**
1. Visit `/profile` → Should redirect to `/login`
2. Visit `/admin` → Should redirect to `/login`
3. Visit `/` → Should work
4. Visit `/podcasts` → Should work

### **Test as Regular User:**
1. Login with regular account
2. Visit `/profile` → Should work
3. Visit `/admin` → Should redirect to `/`
4. Try to play premium podcast → Should prompt for subscription

### **Test as Admin:**
1. Login with admin account
2. Visit `/admin` → Should work
3. Create/edit podcasts → Should work
4. Navbar should show "Admin" link

### **Test Logout:**
1. Click logout button
2. Should redirect to `/`
3. Navbar should show "Login" and "Sign Up"
4. Try to visit `/profile` → Should redirect to login

---

## 🔧 Configuration

### **Create Admin User:**

```bash
# Local database
wrangler d1 execute podcast-db --local --command="UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'"

# Production database
wrangler d1 execute podcast-db --remote --command="UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'"
```

### **Environment Variables:**
Located in `wrangler.jsonc` or `.dev.vars`:
```bash
JWT_SECRET=your-secret-key-here
```

---

## ✅ Best Practices Implemented

1. ✅ **Defense in Depth** - Protection at both client and server level
2. ✅ **Graceful Degradation** - Proper loading and error states
3. ✅ **User Experience** - Return URL preservation
4. ✅ **Security** - JWT validation, role checks, subscription verification
5. ✅ **Maintainability** - Reusable components, clear separation of concerns
6. ✅ **Type Safety** - Full TypeScript support
7. ✅ **Performance** - Minimal re-renders, efficient state management
8. ✅ **Accessibility** - Loading indicators, error messages

---

## 🚨 Common Issues & Solutions

### **Issue: "Unauthorized" on every request**
**Solution:** Check if JWT token is in localStorage. Try logging in again.

### **Issue: Redirect loop**
**Solution:** Check that GuestRoute is only used on login/register pages.

### **Issue: Flash of unauthorized content**
**Solution:** ProtectedRoute shows loading state - ensure it's being used.

### **Issue: Admin features not showing**
**Solution:** Update user role in database to 'admin'.

---

## 📚 Additional Resources

- JWT Documentation: https://jwt.io/
- Next.js Authentication: https://nextjs.org/docs/authentication
- React Context API: https://react.dev/reference/react/useContext

---

## 🎯 Summary

This authentication system provides:
- ✅ Secure JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Subscription-based content gating
- ✅ Professional UX with loading states
- ✅ Return URL preservation
- ✅ Guest-only routes (login/register)
- ✅ Comprehensive server + client protection
- ✅ Easy to use and extend

**The system is production-ready and follows industry best practices!** 🎉

