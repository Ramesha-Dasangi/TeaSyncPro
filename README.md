# 🍃 TeaSyncPro — Ceylon Tea Factory Management System

> A comprehensive full-stack web application built to digitize and streamline the end-to-end operations of a Ceylon tea factory — from green leaf collection to finished product inventory.

---

## 📌 Project Status

> 🚧 **Under Active Development** — This project is currently being built as a Final Year Project. Features are being added progressively.

---

## 🖥️ Overview

**TeaSyncPro** is a role-based management system designed for Sri Lankan tea factories. It covers the complete production lifecycle: collecting green leaves from suppliers, tracking production batches through withering, rolling, drying and grading stages, managing graded inventory, handling supplier payments, and generating financial and operational reports.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Database & ORM** | MySQL, Sequelize ORM |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| *Alternative Backend* | *PHP 8 with PDO (in `php/` directory)* |

---

## 📁 Project Structure

```
TeaSyncPro/
├── src/                        # React frontend (Vite)
│   ├── components/             # Sidebar, TopHeader, shared UI
│   ├── pages/                  # All page components
│   │   ├── Dashboard.jsx       # KPI overview & charts
│   │   ├── CollectionPage.jsx  # Green leaf intake & weighment
│   │   ├── ProductionPage.jsx  # Batch production tracking
│   │   ├── GradingPage.jsx     # Grading & packaging
│   │   ├── InventoryPage.jsx   # Warehouse stock
│   │   ├── ReportsPage.jsx     # Reports & exports
│   │   ├── LandingPage.jsx     # Public landing page
│   │   └── LoginPage.jsx       # Authentication
│   └── data/                   # Mock data (development only)
├── server/                     # Node.js + Express backend (REST API)
│   ├── config/                 # Sequelize & MySQL database connection
│   ├── models/                 # Sequelize database models
│   ├── database/               # SQL schemas & migrations
│   └── server.js               # Express API entry point
├── php/                        # Alternate / legacy PHP backend
│   ├── includes/               # Auth, header, sidebar, footer
│   ├── config/                 # Database configuration
│   ├── assets/                 # CSS & JavaScript assets
│   └── database/               # DB seeds & init scripts
├── public/                     # Static assets
├── dist/                       # Production build output
├── package.json                # Frontend package configuration
└── vite.config.js              # Vite configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MySQL](https://www.mysql.com/) server running locally

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend will start at `http://localhost:5173` (or the port specified by Vite).

### 3. Backend Setup (Node.js & Express)
```bash
# Navigate to the server folder
cd server

# Install backend dependencies
npm install

# Configure environment variables
# Ensure server/.env has your database credentials (DB_NAME, DB_USER, DB_PASSWORD, PORT=5000)

# Start the backend API server
npm run dev
```
The backend API server will run at `http://localhost:5000`.

---

## 📦 Modules

| Module | Status | Description |
|---|---|---|
| 🏠 Dashboard | ✅ Done | Factory-wide KPIs, charts, live stats |
| 🌿 Leaf Collection | ✅ Done | Green leaf intake, weighment slips, supplier tracking |
| 🏭 Production Batches | ✅ Done | Withering → Rolling → Drying → Grading stages |
| 🏷️ Grading & Packaging | ✅ Done | Finished tea outputs by grade (BOP, BOPF, Dust, FF) |
| 📦 Inventory | ✅ Done | Warehouse stock levels and management |
| 📊 Reports | ✅ Done | Exportable operational and financial reports |
| 👥 Suppliers | 🚧 In Progress | Supplier profiles and payment history |
| 💰 Finance | 🚧 In Progress | Leaf rates, plucker payments, payroll |

