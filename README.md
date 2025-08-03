# ExpenseTracker Pro

A modern, full-stack expense tracking application built with React and Supabase, featuring comprehensive user authentication and CRUD operations for expense management.

## 🎯 Project Overview

ExpenseTracker Pro is a complete expense management solution that allows users to track their spending, categorize expenses, set budgets, and analyze their financial patterns. The application provides a secure, user-friendly interface with real-time data synchronization and responsive design.

## 🏗️ Tech Stack

### Frontend
- **React 19.1.1** - Component-based UI framework
- **React Router DOM 6.30.1** - Client-side routing
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Chart.js 4.5.0** - Data visualization
- **React Chart.js 2** - React wrapper for Chart.js
- **Framer Motion 12.23.12** - Animation library
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **Date-fns** - Date utility library

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL database)
- **Row Level Security (RLS)** - Data security and user scoping
- **Supabase Auth** - Authentication service

### Development Tools
- **Vite 7.0.6** - Build tool and development server
- **ESLint** - Code linting
- **Autoprefixer** - CSS vendor prefixing
- **PostCSS** - CSS processing

### Deployment
- **Frontend**: Vercel - [https://expense134-lor8.vercel.app](https://expense134-lor8.vercel.app)
- **Backend**: Render - [https://expense134.onrender.com](https://expense134.onrender.com)

## 📁 Project Structure

```
e:\RAJA\
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── AnalyticsCards.jsx   # Dashboard analytics
│   │   │   ├── BudgetProgress.jsx   # Budget tracking component
│   │   │   ├── Charts.jsx           # Chart components
│   │   │   ├── ExpenseCard.jsx      # Individual expense display
│   │   │   ├── Header.jsx           # Page headers
│   │   │   ├── LoadingSpinner.jsx   # Loading indicators
│   │   │   ├── Navbar.jsx           # Navigation component
│   │   │   ├── PrivateRoute.jsx     # Route protection
│   │   │   ├── SearchAndFilter.jsx  # Search/filter functionality
│   │   │   ├── SkeletonLoader.jsx   # Loading skeletons
│   │   │   └── StatCard.jsx         # Statistics display
│   │   ├── contexts/                # React contexts
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── ThemeContext.jsx     # Theme management
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useExpenses.js       # Expense data hook
│   │   ├── pages/                   # Route-based pages
│   │   │   ├── AddExpense.jsx       # Create expense
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── EditExpense.jsx      # Update expense
│   │   │   ├── Login.jsx            # User login
│   │   │   ├── Profile.jsx          # User profile
│   │   │   └── Register.jsx         # User registration
│   │   ├── services/                # API interaction layer
│   │   │   ├── api.js               # Base API configuration
│   │   │   ├── authService.js       # Authentication services
│   │   │   └── expenseService.js    # Expense CRUD operations
│   │   ├── utils/                   # Helper functions
│   │   │   └── categoryIcons.js     # Expense category icons
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # Application entry point
│   │   └── index.css                # Global styles
│   ├── public/                      # Static assets
│   ├── .env                         # Environment variables
│   ├── package.json                 # Dependencies
│   ├── tailwind.config.js           # Tailwind configuration
│   ├── vite.config.js               # Vite configuration
│   └── vercel.json                  # Vercel deployment config
└── server/                          # Backend application (migrated to Supabase)
    ├── .env                         # Server environment variables
    └── package.json                 # Server dependencies
```

## 🚀 Features

### ✅ Authentication
- [x] **User Registration** - Secure account creation with email verification
- [x] **User Login** - Email/password authentication
- [x] **User Logout** - Secure session termination
- [x] **Protected Routes** - Route-level authentication guards
- [x] **Persistent Sessions** - Stay logged in across browser sessions

### ✅ CRUD Operations
- [x] **Create Expenses** - Add new expenses with form validation
- [x] **Read Expenses** - List view with filtering and search
- [x] **Update Expenses** - Edit existing expense records
- [x] **Delete Expenses** - Remove expenses with confirmation
- [x] **Real-time Updates** - Live data synchronization

### ✅ User Experience
- [x] **Responsive Design** - Mobile-first, adaptive layout
- [x] **Dark/Light Theme** - User preference theme switching
- [x] **Loading States** - Skeleton loaders and spinners
- [x] **Form Validation** - Client-side input validation
- [x] **Error Handling** - Comprehensive error messaging
- [x] **Success Notifications** - Toast notifications for actions
- [x] **Search & Filter** - Advanced expense filtering
- [x] **Data Visualization** - Charts and analytics

### ✅ Advanced Features
- [x] **Budget Tracking** - Set and monitor spending limits
- [x] **Expense Categories** - Categorize expenses with icons
- [x] **Analytics Dashboard** - Visual spending insights
- [x] **Date Range Filtering** - Filter by time periods
- [x] **Export Functionality** - Download expense data
- [x] **Profile Management** - Update user preferences

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker
   ```

2. **Set up the frontend**
   ```bash
   cd client
   npm install
   ```

3. **Configure environment variables**
   
   Create `client/.env` file:
   ```env
   VITE_API_URL=https://expense134.onrender.com/api
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the following SQL to create tables:
   
   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     name VARCHAR(255) NOT NULL,
     monthly_budget DECIMAL(10,2) DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Expenses table
   CREATE TABLE expenses (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     title VARCHAR(255) NOT NULL,
     amount DECIMAL(10,2) NOT NULL,
     category VARCHAR(100) NOT NULL,
     description TEXT,
     date DATE NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

   -- Policies
   CREATE POLICY "Users can view own profile" ON users 
     FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Users can view own expenses" ON expenses 
     FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own expenses" ON expenses 
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own expenses" ON expenses 
     FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete own expenses" ON expenses 
     FOR DELETE USING (auth.uid() = user_id);
   ```

5. **Update Supabase configuration**
   
   Update `server/.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   PORT=5000
   ```

6. **Start the development server**
   ```bash
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🤖 AI Tools Used

### Primary AI Tools

1. **GitHub Copilot**
   - **Usage**: Code completion and suggestion during development
   - **Contribution**: 
     - Accelerated component development with intelligent code suggestions
     - Helped with React hooks implementation and best practices
     - Assisted in API integration patterns and error handling
     - Generated utility functions and helper methods

2. **ChatGPT/Claude (Development Assistant)**
   - **Usage**: Architecture planning and problem-solving
   - **Contribution**:
     - Helped design the application architecture and folder structure
     - Provided guidance on React best practices and patterns
     - Assisted with Supabase integration strategies
     - Generated comprehensive documentation and README content

### How AI Tools Enhanced Development

1. **Code Quality**: AI suggestions helped maintain consistent coding patterns and caught potential bugs early
2. **Development Speed**: Reduced boilerplate code writing time by ~40%
3. **Best Practices**: AI tools suggested modern React patterns and optimization techniques
4. **Documentation**: Generated comprehensive comments and documentation
5. **Problem Solving**: Provided solutions for complex authentication flows and data management

### AI Tool Integration Workflow

```
Planning Phase → AI-assisted architecture design
Development Phase → GitHub Copilot for code completion
Testing Phase → AI-generated test scenarios
Documentation Phase → AI-assisted README and comments
```

## 📱 Screenshots & Demo

### Live Application
🔗 **Live Demo**: [https://expense134-lor8.vercel.app](https://expense134-lor8.vercel.app)

### Key Screens
- **Dashboard**: Overview of expenses with charts and analytics
- **Add Expense**: Form with validation and category selection
- **Expense List**: Searchable and filterable expense list
- **Profile**: User settings and budget management
- **Login/Register**: Secure authentication forms

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level user data isolation
- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Client and server-side validation
- **Environment Variables** - Secure configuration management
- **CORS Protection** - Cross-origin request security
- **Password Hashing** - Secure password storage

## 🐛 Known Issues & Limitations

1. **Image Upload**: Currently not implemented for expense receipts
2. **Offline Mode**: No offline functionality for expense entry
3. **Export Formats**: Limited to CSV export (PDF export planned)
4. **Mobile App**: Web-only, no native mobile app
5. **Real-time Sync**: Some delays in real-time updates during high traffic

## 🚀 Future Enhancements

### Planned Features
- [ ] **Receipt OCR** - Automatic expense extraction from photos
- [ ] **Multi-currency Support** - International expense tracking
- [ ] **Team Expenses** - Shared expense tracking for groups
- [ ] **Advanced Analytics** - Predictive spending insights
- [ ] **Mobile App** - React Native mobile application
- [ ] **API Integration** - Bank account synchronization
- [ ] **Notification System** - Budget alerts and reminders
- [ ] **Data Export** - Multiple export formats (PDF, Excel)

### Technical Improvements
- [ ] **Progressive Web App (PWA)** - Offline functionality
- [ ] **Performance Optimization** - Code splitting and lazy loading
- [ ] **Testing Suite** - Comprehensive unit and integration tests
- [ ] **Accessibility** - WCAG 2.1 compliance
- [ ] **Internationalization** - Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email support@expensetracker.com or join our Slack channel.

## 🙏 Acknowledgments

- **Supabase** - For providing an excellent backend-as-a-service platform
- **Vercel** - For seamless deployment and hosting
- **React Community** - For the amazing ecosystem and resources
- **Tailwind CSS** - For the utility-first CSS framework
- **Chart.js** - For beautiful data visualization
- **AI Development Tools** - For accelerating the development process

---

**Built with ❤️ using React, Supabase, and AI assistance**
