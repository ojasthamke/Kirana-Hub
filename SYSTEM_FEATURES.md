# 📋 KiranaHub — Complete System Documentation (Technical & Functional)

This document is the "Source of Truth" for the KiranaHub ecosystem. It covers every page, button, action, and backend route in the entire application.

---

## 🏛️ 1. Architecture & Design Patterns
- **Framework:** Next.js 14 (App Router).
- **Styling:** Vanilla CSS-in-JS and custom modules for a professional, mobile-first design.
- **Database:** MongoDB Atlas with Mongoose.
- **State Management:** `CartContext` (Client) for multi-vendor checkout synchronization.
- **Authentication:** JWT-based.
  - **Bridge Logic:** Login sets the `token` in `document.cookie` (for server-side pages) and `localStorage` (for client-side/mobile API calls via `Authorization` header).
- **Mobile Architecture (Auto-Updating):** The Capacitor `capacitor.config.ts` is configured as a **Live Webview Container** pointing to the Vercel production URL (`server.url`). This means the Native Android APK never has to be rebuilt; all UI updates, animations, and bug fixes pushed to GitHub/Vercel are instantly reflected in the mobile app without local rebuilds.
- **API Communication (Strict Mobile Routing):** All requests use `getApiUrl()` to resolve the correct backend. The system enforces **Strict Capacitor App Detection** (`window.Capacitor`) to instantly force the app to hit the Vercel Production Server. This permanently prevents the "Android localhost loop" (where the phone tries to query its own local storage for a database instead of the live server).
- **Pro-Level Debugging:** A `localStorage` override via `API_URL_OVERRIDE` is available for field debugging (e.g., pointing a real phone to a PC's local IP like `192.168.1.15:3000` via the "CHANGE SERVER IP" button on the error screen).
- **Error Resilience:** Clients proactively catch HTML-as-JSON responses (which cause the 'Server Error 200'). If an API call hits a redirect or a 404 block, the app extracts the `<title>` tag of the HTML page and provides a highly descriptive "Network Misconfiguration" warning instead of an arbitrary crash.
- **Mobile Support:** Capacitor handles hardware back-button navigation (`AppListener.tsx`).

---

## 🔐 2. Authentication System

### Login Page (`/login`)
- **Role Selector Buttons:** Switches between `Shop Owner`, `Agency`, and `Admin`.
- **Sign In Button:** 
  - **Action:** Calls `POST /api/auth/login`.
  - **Payload:** `{ phone, password, role }`.
  - **Success:** Stores JWT and redirects based on role.
- **Registration Links:** Dynamic based on role (Admins cannot sign up; Agencies must be approved).

### Registration Pages (`/register`)
- **User Registration:** 
  - Fields: Name, Phone, Address, State, City, Password.
  - Buttons: **"Create Account"** (Calls `POST /api/auth/register`).
- **Agency Registration (Multi-Step):**
  - **Step 1:** Business Info (Owner Name, Store Name, Address, State, City, GST, Turnover).
  - **Step 2:** Credentials (Phone, Alt Phone, Email, Password).
  - **Step 3:** Success Modal (States that review takes 24-48 hours).

---

## 🛒 3. Shop Owner (Marketplace) Interface

### Home Screen (`/`)
- **Search Bar:** Real-time fuzzy filtering on `name_en` and `name_hi`.
- **Category Nav:** Horizontal scrolling bar to filter products by category.
- **Product Card Actions:**
  - **Card Menu (⋮):** Displays the agency fulfilling the product and any active offers.
  - **Variant Selector:** Dropdown or tabs to choose different packaging sizes (e.g., Bag vs Pouch).
  - **Add to Cart (Green Button):** Adds the `min_qty` to the cart.
  - **Quantity Stepper (+/-):** Updates the local cart state and re-calculates totals.
- **Vertical Filtering:** Automatic logic that shows products only from agencies matching the user's business type.

### Navbar Actions
- **User Profile Pill:** Clickable status indicator.
- **Options Menu (☰):** Sidebar with links to Orders, Reports, and Business Settings.
- **Business Vertical Drawer:** A side-menu allowing users to update their business type (e.g., switching from Kirana to Restaurant).
- **Cart Bottom Bar (Mobile):** Shows running total and "View Cart" button when items are present.
- **Logout Button:** Clears all session data and redirects.

### Cart & Checkout (`/cart`)
- **Item Summary:** Lists all items grouped by vendor.
- **Adjust Quantities:** Same stepper logic as home.
- **Remove Button:** One-tap removal.
- **Order Total Section:** Displays subtotal + delivery (always Free/Wholesale).
- **Payment Modal:** 
  - **Cash on Delivery:** Sets `payment_method` to `Cash`.
  - **Online Payment:** Sets `payment_method` to `Online`.
- **Checkout Action:** Calls `POST /api/orders/checkout`. Splits the master cart into individual agency orders.

### Orders History (`/orders`)
- **Unpaid Dues Badge:** Red banner showing exactly how much is owed to all agencies.
- **Refresh Button:** Atomic sync with server.
- **Edit Order (Yellow Button):** Allow quantity changes on orders that haven't been accepted yet.
- **Cancel Order (Red Button):** Mark order as `Cancelled`.
- **Expandable Items:** Tap to see the full manifest of ordered products with photos.

---

## 🏗️ 4. Agency Dashboard (`/agency`)

### Overview Tab
- **Wallet Stats:** Real-time revenue, delivered orders, and pending payments.
- **Recent Orders List:** Quick-view of the last 5 transactions.

### Orders Management
- **Accept Order:** Moves order to `Accepted`.
- **Start Logic:** Moves order to `Processing` (signaling packing/manifesting).
- **Mark Paid:** One-tap payment verification (moves order to `Paid` status).
- **Live Sync Polling:** The list automatically updates every 30 seconds.

### Product Library
- **Add Product Modal:**
  - **Sync Category:** Quick-add new categories directly from the form.
  - **Variant Rows:** Support for unlimited variants (e.g., 1kg, 5kg, 10kg) with unique prices and stock.
- **Stock Control:** Toggle `In Stock` / `Out of Stock` status instantly.

---

## 🛡️ 5. Admin Control Panel (`/admin`)

### Overview (Dashboard)
- Global metrics: Revenue, Active Orders, Registered User/Agency counts.
- Order Velocity Bar Chart showing the health of the entire multi-vendor system.

### Orders Tab (Unified Control)
- **Filters:** By Date, Status, or Agency.
- **Admin Overrides:** Manually override any order status (Accept -> Deliver -> Cancel).
- **Ledger View:** Toggle between Paid and Unpaid orders globally.

### Marketplace (Global SKU Management)
- **Assign Agency:** Link products to specific vendors or keep them as "System Global".
- **Mass Update:** Change pricing or stock levels for any product in the registry.

### Users & Agencies Tabs
- **Approve Agency:** Move an agency registration from `Pending` to `Approved`.
- **Block User/Agency:** Instantly revoke access and hide their presence.
- **Clear User Dues:** Button that takes all unpaid orders for a specific user and marks them as paid (used for offline settlements).

### Infrastructure (Locations & Verticals)
- **Verticals Tab:** Manage icons and names of business segments (e.g., "Medical Shop").
- **Locations Tab:** Add new cities or states to the registration dropdowns.

---

## 🖱️ 6. Universal Button & Action Index
*If it's a button, it's listed here.*

### Marketplace (User)
- **Search (🔍):** Filters product list by keyword.
- **Category (Buttons):** Filters by specific item type (Pulse, Rice, etc).
- **Add to Cart (+):** Initial add of product to session.
- **Plus/Minus (+/-):** Adjust quantity of cart item.
- **Cart Menu (⋮):** Information popup for agency/offers.
- **Drawer Close (X):** Dismisses side panels.
- **Confirm Order:** Submits cart to database.

### Orders (User)
- **Refresh (🔄):** Fetches fresh order data.
- **Edit (✏️):** Unlocks quantity inputs on pending orders.
- **Cancel (🗑️):** Aborts a pending order.
- **Save (Checkmark):** Commits edits to an existing order.

### Agency (Vendor)
- **Accept Order:** Acknowledges request from shop owner.
- **Processing:** Signals that items are being packed.
- **Mark Paid:** Confirms receipt of funds (Cash or Online).
- **Add Product:** Opens creation wizard.
- **Stock Toggle:** Changes item availability status.
- **Delete Variant (X):** Removes a specific packaging size from a product.

### Admin (Root)
- **Sidebar Tabs:** Switch between Dashboard, Orders, Users, agencies, etc.
- **Live Sync Bar:** Force refresh of global state.
- **Clear Dues:** Batch-payment tool for shop owners.
- **Approve Agency:** Verifies a new vendor for marketplace entry.
- **Block/Active:** Global access kill-switch for any account.
- **Delete Item (Trash):** Permanent removal of SKU/Order/User.
- **Add Location (+):** Service expansion tool.
- **Remove City (X):** Retracts service from a specific area.

---

## 🎨 7. UI/UX Animation & Interaction Standards
- **Page Transitions:** Navigating between Next.js pages triggers a native-feeling full-screen slide from the right side (`translateX(100vw)` to `0`) using `template.tsx`.
- **Loading Overlays:** The global loader (`loading.tsx`) utilizes minimal, clean pulse-dots centered on the screen without massive distracting branding elements.
- **Click-Outside to Close (Bulletproof UX):** All sliding drawers, navigation option menus, and product card menus are backed by a fixed `inset: 0` invisible interaction layer to guarantee that tapping *anywhere* outside the menu aggressively closes it.
- **Hardware Back Navigation:** Floating menus and sidebars intercept the Native Android hardware back-button (`popstate` listener) to close gracefully rather than accidentally navigating the user away.
- **Premium Element Animations:** Modals utilize a slick zoom-in `modalShow` pop, and Product Cards feature a smooth `hover` scale-and-lift elevation effect.


---

## 📡 8. API Route Mapping

| Endpoint | Method | Result |
| :--- | :--- | :--- |
| `/api/auth/login` | POST | Generates JWT and session cookie. |
| `/api/auth/register` | POST | Creates User or Vendor record. |
| `/api/products` | GET | Fetches products (filtered by user vertical). |
| `/api/orders/checkout` | POST | Splits cart and saves multiple Vendor orders. |
| `/api/orders/[id]` | PATCH | Updates status, quantity, or payment. |
| `/api/admin/users/clear-dues` | POST | Mass-updates payment status for an entire shop owner. |
| `/api/agency/wallet` | GET | Calculates vendor revenue and pending balance. |
| `/api/locations` | GET | Fetches active states and cities. |
