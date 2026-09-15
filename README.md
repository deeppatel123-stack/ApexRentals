# Production-Ready Rental Management System (MERN Stack + Python AI/ML)

A complete, enterprise-grade rental lifecycle management system designed for equipment and product rental businesses (cameras, audio gear, heavy machinery, power generators, drones). 

Built according to the Odoo Hackathon specifications, this platform manages the complete operational workflow from catalog browsing, date-range availability locking, and dual checkout (rental fee + refundable security deposit), through pickup dispatch verification, condition inspection checklists, late fee automation with grace periods, damage assessment, security deposit settlement, and PDF invoicing.

It also features a dedicated **AI/ML Predictive Intelligence Suite** providing late-return risk scoring, 7-day demand forecasting, predictive maintenance wear scoring, and smart delivery route optimization.

---

## 1. System Architecture

```
                                 ┌─────────────────────────────────┐
                                 │   React + Vite Modern Web SPA   │
                                 │  (Customer Portal & Admin Suite)│
                                 └───────────────┬─────────────────┘
                                                 │ HTTPS / JSON
                                                 ▼
                                 ┌─────────────────────────────────┐
                                 │  Node.js / Express REST API     │
                                 │     - RBAC & JWT Middleware     │
                                 │     - Pricing & Overdue Engines │
                                 │     - Deposit Settlement Engine │
                                 │     - node-cron Background Jobs │
                                 │     - PDFKit Invoicing Engine   │
                                 └───────┬─────────────────┬───────┘
                                         │                 │
                        Internal REST    │                 │ Mongoose ODM
                                         ▼                 ▼
          ┌───────────────────────────────────┐    ┌─────────────────────────────────┐
          │  Python FastAPI ML Microservice   │    │    MongoDB Database Cluster     │
          │  - Late Return Risk Predictor     │    │  (Orders, Assets, Inspections,  │
          │  - 7-Day Time-Series Forecaster   │    │   Pricelists, Deposits, Users)  │
          │  - Predictive Maintenance Scorer  │    └─────────────────────────────────┘
          │  - Nearest-Neighbor TSP Optimizer │
          └───────────────────────────────────┘
```

---

## 2. Tech Stack

* **Frontend**: React 18, Vite, React Router v6, Axios with interceptors, Context API (`AuthContext`, `CartContext`), Lucide React icons, Plus Jakarta Sans typography, custom responsive CSS design system with Light/Dark mode.
* **Backend**: Node.js, Express.js (ES Modules), MongoDB with Mongoose ODM, JWT authentication, bcryptjs, node-cron scheduler, PDFKit vector PDF generator, QRCode generator, Multer file uploader, CORS.
* **AI/ML Service**: Python 3.10+, FastAPI, Uvicorn, NumPy, Scikit-learn, Pandas.

---

## 3. Project Folder Structure

```
Rental-Management-System/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection logic
│   │   ├── controllers/              # Business controllers (Auth, Products, Rentals, etc.)
│   │   ├── middlewares/              # JWT protect, RBAC, Multer upload, Error handlers
│   │   ├── models/                   # 16 Mongoose models (User, Product, Order, Deposit, etc.)
│   │   ├── routes/                   # REST API route endpoints under /api/v1
│   │   ├── services/                 # Pricing, Availability, Late Fee, Deposit, PDF engines
│   │   ├── jobs/                     # node-cron scheduled tasks (overdue scanner)
│   │   ├── scripts/
│   │   │   ├── seed.js               # Development seed script with demo data
│   │   │   └── test-suite.js         # Automated backend test suite (16 tests)
│   │   ├── app.js                    # Express app configuration & static file mounts
│   │   └── server.js                 # HTTP listener & process bootstrap
│   ├── uploads/                      # Generated PDF invoices and uploaded photos
│   ├── .env.example
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/               # Navbar, AdminSidebar, AdminRoute, CustomerRoute
│   │   ├── context/                  # AuthContext (JWT & Theme), CartContext (Date math)
│   │   ├── layouts/                  # CustomerLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── portal/               # Splash, Catalog, ProductDetail, Cart, Checkout, MyRentals
│   │   │   ├── auth/                 # Login & Register with 1-click sandbox switcher
│   │   │   └── admin/                # Dashboard, Products, Fleet Inventory, Quotes, Pickups,
│   │   │                             # Returns, Deposits, Invoices, Maintenance, AI Suite, Settings
│   │   ├── services/                 # Axios API instance with interceptors
│   │   ├── App.jsx                   # Master routing configuration
│   │   ├── main.jsx
│   │   └── index.css                 # Responsive SaaS enterprise CSS design system
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
│
├── ml-service/
│   ├── app/
│   │   ├── predictors/               # Late return, Demand forecaster, Maintenance, TSP Optimizer
│   │   ├── schemas.py                # Pydantic request/response schemas
│   │   └── main.py                   # FastAPI application
│   ├── requirements.txt
│   └── README.md
│
└── README.md
```

---

## 4. Quick Start & Running Instructions

### Prerequisites
* Node.js v18+
* MongoDB running locally (`mongodb://127.0.0.1:27017`)
* Python 3.10+ (for optional ML microservice)

---

### Step 1: Backend Setup & Seed Data

```powershell
cd server

# 1. Install dependencies
npm install

# 2. Seed database with rich sample data (Admin, Customers, Products, Active & Overdue Orders)
npm run seed

# 3. Run automated backend test suite (Verifies 16 critical business engine rules)
npm test

# 4. Start backend in development mode (Runs on port 5000)
npm run dev
```

---

### Step 2: Frontend Client Setup

Open a new terminal window:

```powershell
cd client

# 1. Install dependencies
npm install

# 2. Start Vite development server (Runs on port 5173)
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

### Step 3: Python ML Microservice Setup (Optional / Phase 10)

Open a new terminal window:

```powershell
cd ml-service

# 1. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate       # On Windows
# source venv/bin/activate    # On Linux/macOS

# 2. Install requirements
pip install -r requirements.txt

# 3. Start FastAPI server (Runs on port 8000)
uvicorn app.main:app --port 8000 --reload
```

*Note: If the Python microservice is not running, the Node.js backend automatically falls back to intelligent internal heuristic algorithms.*

---

## 5. Demo Sandbox Credentials

The seed script (`npm run seed`) provisions three verified user accounts:

| Role | Email | Password | Pre-seeded Scenario |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@rental.com` | `admin123` | Full access to command center, inventory fleet, returns desk, deposit reconciliation, and AI suite. |
| **Portal Customer (John)** | `john@example.com` | `customer123` | Active rental order (`#ORD-902142` - Sony FX3) with downloadable invoice. |
| **VIP Customer (Sarah)** | `sarah@example.com` | `customer123` | Overdue rental order (`#ORD-902143` - DJI Mavic 3) with pre-calculated late fee penalty. |

*Quick Sandbox Buttons are available directly on the Splash and Login pages to sign in with 1 click.*

---

## 6. End-to-End Rental Lifecycle

1. **Catalog & Availability**: The customer selects rental dates/times. The availability service verifies no conflicting orders exist, factoring in a 1-hour inspection buffer.
2. **Dual-Charge Checkout**: The system calculates the rental duration (hours/days), rental fee, applicable pricelist discounts, tax (GST 18%), and refundable security deposit.
3. **Order & Invoice Generation**: On payment, an order is confirmed, assigned assets are reserved, a security deposit ledger is initialized, a verification QR code is generated, and an official PDF invoice is created with PDFKit.
4. **Pickup / Delivery Dispatch**: The admin verifies the customer pass, runs through the pre-rental inspection checklist, and sets the order to `active` (assets transition to `rented`).
5. **Return Intake & Inspection**: When items are returned, the manager records the timestamp. The late fee engine calculates overdue time against the scheduled return and applies the 30-minute grace period. Physical damage is graded (`none`, `minor`, `moderate`, `severe`, `total_loss`).
6. **Security Deposit Settlement**: The net refund is calculated:
   $$\text{Net Refund} = \text{Initial Deposit} - \text{Late Fees} - \text{Damage Charges} - \text{Missing Accessories}$$
   The deposit ledger is updated, a refund payment transaction is logged, the invoice is updated with deductions, and the physical unit is either returned to `available` or routed to `maintenance`.

---

## 7. AI / ML Predictive Intelligence

The system includes 5 operational AI capabilities:

1. **Late Return Risk Prediction**: Evaluates active rentals using customer timeliness history, duration, weekend friction factors, and order values to generate a risk score (0-100) and actionable escalation recommendations.
2. **7-Day Demand Forecasting**: Projects daily booking volume across the fleet, identifies high-velocity equipment at risk of stockouts, and issues inventory buffer warnings.
3. **Predictive Asset Maintenance**: Computes wear scores based on cumulative operating hours and inspection logs, flagging units that need mechanical overhaul or calibration before their next rental.
4. **Smart Route Optimization**: Solves the Traveling Salesperson Problem (TSP) using a nearest-neighbor algorithm to sequence multi-stop doorstep deliveries with leg distances and estimated arrival times.
5. **AI Business Insights**: Synthesizes key management recommendations analyzing revenue patterns, late-fee leakages, and equipment utilization.

---

## 8. Manual Testing Checklist

Follow this checklist to verify all features in the UI:

- [ ] **1-Click Demo Login**: Visit `http://localhost:5173` and click "👑 Login as Admin". You are redirected to `/admin/dashboard`.
- [ ] **Dashboard Metrics**: Confirm live cards for Active Rentals, Overdue Rentals, Fleet Utilization, and Security Deposits Held.
- [ ] **Fleet Inventory**: Navigate to `/admin/inventory` and toggle an asset's status between `available` and `maintenance`.
- [ ] **Quotation Conversion**: Go to `/admin/quotations` and click "Convert to Order" on a draft quote. Observe order creation and invoice generation.
- [ ] **Customer Rental Booking**:
  - Logout and log in as `john@example.com`.
  - Go to `/catalog` and select an item (e.g. Sony FX3 Camera).
  - Pick start and return dates. Observe live availability counter and pricing breakdown.
  - Click "Add to Rental Cart" and proceed to `/checkout`.
  - Complete the demo card payment.
  - On the confirmation screen, click "View Order & Invoice" and download the generated PDF invoice.
- [ ] **Pickup Handover**:
  - Switch back to Admin (`admin@rental.com`).
  - Go to `/admin/pickups`, open the pending order, complete the inspection checklist, and click "Confirm Dispatch".
- [ ] **Return Intake & Deposit Settlement**:
  - Go to `/admin/returns` and select the active/overdue order.
  - Record the return, select a damage severity (e.g., Minor - ₹500), and click "Finalize Intake & Issue Refund".
  - Verify that the deposit refund is accurately computed and the order is closed.
- [ ] **AI Suite Verification**:
  - Go to `/admin/ai-insights` and cycle through all 5 tabs (Late Risk, Demand Forecast, Asset Wear, Delivery Route Optimizer, Business Insights).
