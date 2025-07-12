# 📦 StockIQ - Smart Inventory & Supply Chain Monitor

![StockIQ Logo](https://via.placeholder.com/800x200/2563EB/FFFFFF?text=StockIQ+-+Smart+Inventory+System)

> **A modern, intelligent inventory and supply chain management system built with React, TypeScript, and advanced UI components.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

## ✨ Features

### 🔐 **Smart Authentication & Authorization**
- **JWT-based authentication** with role-based access control
- **Auto admin creation** for seamless setup
- **Three distinct roles**: Admin, Manager, Staff with customized dashboards
- **Protected routes** ensuring secure access to features

### 📊 **Intelligent Analytics & Insights**
- **Real-time dashboards** with interactive charts and KPIs
- **Predictive analytics** for inventory trends and supplier performance
- **Smart alerts** triggered when stock falls below thresholds
- **Color psychology-driven design** for intuitive status recognition

### 📦 **Comprehensive Inventory Management**
- **CRUD operations** for inventory items with role-based permissions
- **Multi-category organization** with visual distribution charts
- **Stock level monitoring** with automated low-stock alerts
- **Quick search functionality** for efficient item lookup

### 🚚 **Supplier Management**
- **Supplier performance tracking** with reliability metrics
- **Delivery time analysis** and on-time performance indicators
- **Supplier scoring system** for quality assessment
- **Integration with inventory forecasting**

### 🎨 **Modern User Experience**
- **Responsive design** that works seamlessly across all devices
- **Smooth animations** powered by Framer Motion
- **Collapsible sidebar navigation** for optimal screen utilization
- **Professional color scheme** based on UI/UX best practices

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/stockiq.git
   cd stockiq
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser** and navigate to `http://localhost:8080`

### 🔑 Demo Credentials

Use these credentials to explore different user roles:

| Role    | Email                | Password    | Access Level                    |
|---------|----------------------|-------------|---------------------------------|
| Admin   | admin@stockiq.com    | admin123    | Full system access & user mgmt  |
| Manager | manager@stockiq.com  | manager123  | Analytics & inventory oversight |
| Staff   | staff@stockiq.com    | staff123    | Basic inventory operations      |

## 📱 Application Structure

### 🏗️ **Architecture Overview**

```
StockIQ/
├── 🔐 Authentication Layer
│   ├── JWT token management
│   ├── Role-based access control
│   └── Protected route guards
│
├── 🎨 Presentation Layer
│   ├── Role-specific dashboards
│   ├── Interactive charts & analytics
│   ├── Responsive sidebar navigation
│   └── Toast notifications
│
├── 📊 Business Logic Layer
│   ├── Inventory management
│   ├── Supplier tracking
│   ├── Alert generation
│   └── Analytics processing
│
└── 🗄️ Data Layer
    ├── Context API for state management
    ├── Axios for API communication
    └── Mock data for demonstration
```

### 📄 **Page Structure & Navigation**

#### 👑 **Admin Dashboard** (`/admin`)
- **Overview**: Complete system metrics and KPIs
- **Navigation**:
  - `/admin` - Main dashboard with system overview
  - `/admin/inventory` - Complete inventory management
  - `/admin/suppliers` - Supplier management & analytics
  - `/admin/users` - User account management & role assignment
  - `/admin/analytics` - Advanced reporting & insights
  - `/admin/alerts` - System alerts & notifications

#### 👨‍💼 **Manager Dashboard** (`/manager`)
- **Overview**: Analytics and performance insights
- **Navigation**:
  - `/manager` - Analytics dashboard with performance metrics
  - `/manager/inventory` - Inventory oversight & reporting
  - `/manager/suppliers` - Supplier performance tracking
  - `/manager/analytics` - Detailed analytics & trends
  - `/manager/alerts` - Critical alerts & warnings

#### 👷 **Staff Dashboard** (`/staff`)
- **Overview**: Daily tasks and inventory operations
- **Navigation**:
  - `/staff` - Task management & quick actions
  - `/staff/inventory` - Item updates & stock management
  - `/staff/alerts` - Active alerts & notifications

## 🎨 Design System

### 🌈 **Color Psychology**

Our carefully chosen color palette enhances user experience and decision-making:

| Color | Usage | Psychology | CSS Variable |
|-------|-------|------------|--------------|
| 🔵 **Primary Blue** (`#2563EB`) | Trust & Control | Conveys reliability and professionalism | `--primary` |
| 🟢 **Success Green** (`#16A34A`) | Inventory Health | Indicates positive status and success | `--success` |
| 🟡 **Warning Amber** (`#F59E0B`) | Reorder Alerts | Draws attention to important notifications | `--warning` |
| 🔴 **Danger Red** (`#DC2626`) | Critical Status | Highlights urgent issues requiring action | `--danger` |
| ⚪ **Neutral Gray** (`#F3F4F6`) | Backgrounds | Provides calm, non-distracting surfaces | `--muted` |

### 🧩 **Component Architecture**

#### **Layout Components**
- `AppLayout` - Main application shell with header and sidebar
- `AppSidebar` - Collapsible navigation with role-based menu items
- `ProtectedRoute` - Authentication and authorization wrapper

#### **UI Components**
- **Cards** - Information containers with subtle shadows and rounded corners
- **Badges** - Status indicators with contextual colors
- **Charts** - Interactive data visualizations using Recharts
- **Forms** - Accessible form controls with validation
- **Buttons** - Consistent button variants with hover animations

## 🛠️ Technology Stack

### **Frontend Framework**
- ⚛️ **React 18.3.1** - Modern React with hooks and concurrent features
- 📘 **TypeScript** - Type-safe development with excellent IDE support
- ⚡ **Vite** - Lightning-fast build tool and development server

### **Styling & UI**
- 🎨 **Tailwind CSS** - Utility-first CSS framework for rapid styling
- 🧩 **shadcn/ui** - High-quality, accessible component library
- 🎭 **Framer Motion** - Smooth animations and micro-interactions
- 📱 **Responsive Design** - Mobile-first approach with breakpoint system

### **Data Visualization**
- 📊 **Recharts** - Composable charting library built on D3
- 📈 **Interactive Charts** - Bar charts, line charts, pie charts, and area charts
- 🎯 **Custom Tooltips** - Enhanced data exploration experience

### **State Management**
- 🗃️ **React Context API** - Global state management for authentication
- 🔗 **React Query** - Server state management and caching
- 🎣 **Custom Hooks** - Reusable stateful logic

### **Development Tools**
- 🔧 **ESLint** - Code linting and style enforcement
- 📏 **Prettier** - Code formatting for consistency
- 🔍 **TypeScript Compiler** - Static type checking

## 📊 Features Deep Dive

### 📈 **Analytics & Reporting**

#### **Admin Analytics**
- **System-wide KPIs**: Total items, user counts, supplier metrics
- **Inventory Trends**: Monthly progression charts showing growth patterns
- **Value Tracking**: Financial overview of inventory worth over time
- **Activity Monitoring**: Real-time system events and user actions

#### **Manager Analytics**
- **Performance Metrics**: Inventory turnover rates and stock accuracy
- **Category Distribution**: Visual breakdown of inventory by category
- **Supplier Performance**: Reliability scores and delivery metrics
- **Efficiency Tracking**: Weekly performance trends and benchmarks

#### **Staff Analytics**
- **Daily Tasks**: Personal task management with priority indicators
- **Recent Activities**: Quick access to recently updated items
- **Quick Search**: Instant inventory lookup for efficient operations

### 🚨 **Smart Alert System**

#### **Alert Types**
- **Low Stock Warnings**: Automatic alerts when inventory falls below thresholds
- **Reorder Notifications**: Intelligent suggestions for restocking
- **System Events**: User actions, updates, and system changes
- **Performance Alerts**: Supplier delivery issues and quality concerns

#### **Alert Management**
- **Role-based Visibility**: Different alert priorities for each user role
- **Real-time Updates**: Instant notifications for critical events
- **Historical Tracking**: Complete audit trail of all alerts and actions

### 👥 **User Management (Admin Only)**

#### **User Roles & Permissions**
- **Admin**: Full system access, user management, system configuration
- **Manager**: Analytics, reporting, inventory oversight, supplier management
- **Staff**: Basic inventory operations, task management, alert viewing

#### **User Onboarding**
- **Admin-controlled Creation**: Secure user account creation with role assignment
- **Email Notifications**: Automated welcome emails with login credentials
- **Role-based Onboarding**: Customized introduction based on assigned role

## 🔧 Configuration & Customization

### **Environment Setup**

1. **Development Environment**
   ```bash
   # Start development server with hot reload
   npm run dev
   
   # Build for production
   npm run build
   
   # Preview production build
   npm run preview
   ```

2. **Environment Variables** (Optional)
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_APP_NAME=StockIQ
   VITE_APP_VERSION=1.0.0
   ```

### **Customization Options**

#### **Color Scheme**
Modify `src/index.css` to customize the color palette:
```css
:root {
  --primary: 217 91% 60%;        /* Blue */
  --success: 142 76% 36%;        /* Green */
  --warning: 38 92% 50%;         /* Amber */
  --danger: 0 84% 60%;           /* Red */
}
```

#### **Component Styling**
Update `tailwind.config.ts` for custom design tokens:
```typescript
theme: {
  extend: {
    colors: {
      brand: 'hsl(var(--primary))',
      // Add custom colors here
    }
  }
}
```

## 🚀 Deployment

### **Production Deployment**

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to hosting platform**
   - **Vercel**: Connect GitHub repository for automatic deployments
   - **Netlify**: Drag and drop `dist` folder or connect repository
   - **AWS S3**: Upload build files to S3 bucket with CloudFront
   - **Traditional Hosting**: Upload contents of `dist` folder

### **Performance Optimization**

- ⚡ **Code Splitting**: Automatic route-based code splitting
- 🗜️ **Asset Optimization**: Vite automatically optimizes images and fonts
- 📦 **Bundle Analysis**: Use `npm run build -- --analyze` to analyze bundle size
- 🚀 **Caching**: Built-in browser caching for static assets

## 🤝 Contributing

We welcome contributions to StockIQ! Here's how you can help:

### **Getting Started**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- **Code Style**: Follow the existing TypeScript and React patterns
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update README and code comments for significant changes
- **Performance**: Consider performance implications of new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** - For providing excellent UI components
- **Tailwind CSS** - For the utility-first CSS framework
- **Recharts** - For beautiful and responsive charts
- **Framer Motion** - For smooth animations and interactions
- **React Team** - For the amazing React framework

## 📞 Support

If you encounter any issues or have questions:

1. **Check the documentation** in this README
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Join our community** for discussions and support

---

**Built with ❤️ by the StockIQ Team**

*Making inventory management smarter, one feature at a time.*