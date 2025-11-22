# Inventory Management System — MEAN Stack

> A complete Inventory Management System built using the **MEAN Stack (MongoDB, Express, Angular, Node.js)** that enables businesses to manage products, stock levels, suppliers, categories, sales, and purchase operations efficiently.

**Repository:** `rithishvellingiri/inventory-management-prp-`

---

## 📌 Table of Contents

* [About](#about)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Screens & Modules](#screens--modules)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Clone the repository](#clone-the-repository)
  * [Environment Variables](#environment-variables)
  * [Install & Run Backend](#install--run-backend)
  * [Install & Run Frontend](#install--run-frontend)
* [API Overview](#api-overview)
* [Database Models](#database-models)
* [Authentication](#authentication)
* [Deployment](#deployment)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

---

## 🧾 About

The Inventory Management System helps businesses maintain real‑time inventory levels, track products, monitor stock in/out, manage suppliers, view sales reports, and automate stock updates.

This system follows a **RESTful API (Node.js + Express)** with a **Angular frontend** consuming the API. MongoDB stores all product, category, and transaction data.

---

## 🚀 Features

* Product CRUD (Create, Read, Update, Delete)
* Category management
* Supplier management
* Sales and purchase entries
* Real‑time stock tracking
* Low‑stock alerts
* Dashboard with analytics
* Authentication system (JWT-based)
* Fully responsive Angular UI

---

## 🛠 Tech Stack

### **Frontend (Angular)**

* Angular 15+/17+
* Angular Material or Bootstrap UI (based on project)
* RxJS

### **Backend (Node + Express)**

* Express.js REST API
* JWT authentication
* Multer for file uploads (if implemented)

### **Database**

* MongoDB + Mongoose ORM

---

## 📁 Project Structure

```
inventory-management-prp-/
│
├── backend/         # Node.js + Express API
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API routes
│   ├── controllers/ # Controller logic
│   ├── middleware/  # Auth middleware
│   └── server.js    # App entry point
│
└── frontend/        # Angular frontend app
    ├── src/app/     # Angular modules & components
    ├── environments # Angular env configurations
    └── ...
```

---

## 📊 Screens & Modules

* **Dashboard** — Stock summary, low stock alert
* **Products Module**

  * Add product
  * Product list
  * Update product
  * Delete product
* **Categories Module**
* **Suppliers Module**
* **Sales Module** — Stock out entries
* **Purchase Module** — Stock in entries
* **User authentication**

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (v14+)
* Angular CLI (latest)
* MongoDB (local or Atlas)

---

### Clone the repository

```bash
git clone https://github.com/rithishvellingiri/inventory-management-prp-.git
cd inventory-management-prp-
```

---

## 🔐 Environment Variables

Inside **backend/** create a `.env` file:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/inventory
JWT_SECRET=your_secret_key_here
```

---

## ▶️ Install & Run Backend

```bash
cd backend
npm install
npm run dev     # or: node server.js
```

The backend will run on **[http://localhost:5000](http://localhost:5000)**

---

## 💻 Install & Run Frontend

```bash
cd frontend
npm install
ng serve -o
```

The Angular app will run on **[http://localhost:4200](http://localhost:4200)**

---

## 📡 API Overview

**Auth**

* `POST /api/auth/register`
* `POST /api/auth/login`

**Products**

* `GET /api/products`
* `POST /api/products`
* `PUT /api/products/:id`
* `DELETE /api/products/:id`

**Categories**

* `GET /api/categories`
* `POST /api/categories`

**Suppliers**

* `GET /api/suppliers`
* `POST /api/suppliers`

**Sales / Purchase**

* `POST /api/sales`
* `POST /api/purchase`

*(Adjust these endpoints to match your actual backend)*

---

## 🗄 Database Models

### **Product Model**

```
{
  name: String,
  category: String,
  supplier: String,
  quantity: Number,
  price: Number,
  createdAt: Date
}
```

### **Sales Model**

```
{
  productId: ObjectId,
  quantity: Number,
  date: Date
}
```

### **Category & Supplier Models**

Straightforward schemas with `name`, `contactInfo`, etc.

---

## 🔐 Authentication

* JWT-based login system
* Protected routes for CRUD operations
* Role-based access (optional)

---

## 🚀 Deployment

* **Backend:** Render / Railway / DigitalOcean
* **Frontend:** Vercel / Netlify / Angular hosting
* **Database:** MongoDB Atlas

---

## 🤝 Contributing

1. Fork the project
2. Create a branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Added new feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Open a pull request

---

## 📧 Contact

**Rithish Kumar**
GitHub: [https://github.com/rithishvellingiri](https://github.com/rithishvellingiri)

---


