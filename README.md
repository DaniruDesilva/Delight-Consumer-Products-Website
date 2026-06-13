# Delight 🛍️✨

Welcome to **Delight**, a full-featured, modern e-commerce web application built with [Next.js](https://nextjs.org/) and the App Router. It is designed to offer a seamless shopping experience for customers and a powerful management interface for administrators.

---

## 🌟 Key Features

### 🛒 For Customers
- **Seamless Shopping Experience:** Browse products, view detailed descriptions, and add items to your cart.
- **Dynamic Search & Filtering:** Quickly find what you're looking for.
- **Secure Authentication:** Sign up, log in, password reset, and secure session management.
- **Checkout & Payments:** Integrated checkout flow (including PayHere integration).
- **User Dashboard:** Track orders, view order history, and manage profile settings.
- **Modern UI:** Built with interactive animations using `framer-motion` and polished aesthetics.

### 🛡️ For Administrators
- **Admin Dashboard:** Centralized management for the entire store.
- **Product Management:** Add, edit, or remove products and manage inventory.
- **Order Management:** View customer orders and update their status.
- **Content Management:** Manage hero sliders, FAQs, news, and policies dynamically.
- **Analytics & Stats:** Get insights on sales and user engagement.

### 💻 Technical Highlights
- **Performance Optimized:** Leveraging Next.js Server Components and advanced caching.
- **Media Management:** Integrated with **Cloudinary** for scalable image hosting and optimization.
- **Database:** Fast and lightweight local database using **SQLite** (`better-sqlite3`).
- **Security:** Hashed passwords with `bcryptjs` and secure tokens using `jose`.
- **Email Delivery:** Send transactional emails via `nodemailer`.
- **SEO Ready:** Automated sitemaps and dynamic metadata.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript / JavaScript
- **Styling:** CSS Modules & UI Animations
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Database:** SQLite (`better-sqlite3`)
- **Authentication:** Custom JWT-based Auth (`jose` + `bcryptjs`)
- **Media Hosting:** [Cloudinary](https://cloudinary.com/)

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (or yarn/pnpm/bun)
- A **Cloudinary** account (for media storage)
- An SMTP server for emails (e.g., Gmail, SendGrid, Resend)

### Installation

1. **Clone the repository** (after creating your private repo):
   ```bash
   git clone https://github.com/your-username/Delight.git
   cd Delight
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root of your project. You can copy the structure from a sample `.env` file if available, or use the following template:

   ```env
   # Application
   NODE_ENV=development
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Database (SQLite)
   # The SQLite files (delight.db, data.db) will be generated automatically or should be placed in the root

   # Cloudinary (Media Storage)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # JWT / Authentication
   JWT_SECRET=your_super_secret_jwt_key

   # Email Configuration (Nodemailer)
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_password
   ```

4. **Initialize Database & Admins (Optional):**
   If you are starting fresh, you may need to set up the database schemas and the initial admin user. You can run the included scripts:
   ```bash
   node test_db.js
   node check_admins.js
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
Delight/
├── app/                  # Next.js App Router (Pages, API routes, Layouts)
│   ├── api/              # Backend API endpoints (Auth, Products, Orders, Admin)
│   ├── (storefront)/     # Front-end pages (Shop, Cart, Checkout, etc.)
├── components/           # Reusable UI components (Header, Footer, Modals)
│   └── admin/            # Admin dashboard specific components
├── context/              # React Context providers (e.g., CartContext)
├── lib/                  # Helper functions (DB connections, Cloudinary, Mailer, Auth)
├── public/               # Static assets (SVGs, icons, local uploads backup)
├── scripts/              # Utility scripts for DB migration, image compression, etc.
├── .gitignore            # Ignored files (includes *.db, *.zip, .env)
└── package.json          # Project dependencies and scripts
```

---

## 🤝 Contributing

As this is a private repository, contributions are limited to authorized collaborators.
1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request.

---

## 📜 License

This project is proprietary and confidential. Unauthorized copying, distribution, or modification is strictly prohibited.
