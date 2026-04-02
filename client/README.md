client/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   ├── logo.svg
│   │   └── empty-state.svg
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx       ← sidebar + navbar shell
│   │   │   ├── Sidebar.jsx         ← nav links with active state
│   │   │   └── Navbar.jsx          ← top bar + dark mode toggle
│   │   │
│   │   ├── ui/                     ← design system primitives
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   │
│   │   ├── charts/                 ← recharts wrappers (data as props)
│   │   │   ├── SpendingLineChart.jsx
│   │   │   ├── CategoryPieChart.jsx
│   │   │   ├── BudgetProgressBar.jsx
│   │   │   └── DailyBarChart.jsx
│   │   │
│   │   ├── expenses/               ← expense-specific components
│   │   │   ├── ExpenseCard.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseFilters.jsx
│   │   │   └── ExpenseList.jsx
│   │   │
│   │   ├── ProtectedRoute.jsx      ← redirects if no JWT
│   │   ├── ThemeToggle.jsx
│   │   └── NotificationBell.jsx
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── Dashboard.jsx           ← most important page
│   │   ├── ExpensePage.jsx
│   │   ├── BudgetPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx         ← user + JWT global state
│   │   ├── ThemeContext.jsx        ← dark/light mode
│   │   └── NotificationContext.jsx ← budget alerts
│   │
│   ├── hooks/
│   │   ├── useExpenses.js          ← fetch + filter + paginate
│   │   ├── useBudgets.js
│   │   ├── useAnalytics.js
│   │   ├── useDebounce.js          ← delays search API call
│   │   ├── useLocalStorage.js
│   │   └── useClickOutside.js
│   │
│   ├── services/
│   │   ├── api.js                  ← axios instance + interceptors
│   │   ├── authService.js
│   │   ├── expenseService.js
│   │   ├── budgetService.js
│   │   ├── analyticsService.js
│   │   └── exportService.js
│   │
│   ├── utils/
│   │   ├── formatters.js           ← formatCurrency, formatDate
│   │   ├── validators.js           ← pure validation functions
│   │   ├── constants.js            ← categories, colors, options
│   │   └── helpers.js
│   │
│   ├── App.jsx                     ← router + providers
│   ├── main.jsx                    ← ReactDOM.createRoot
│   └── index.css                   ← Tailwind directives
│
├── .env                            ← VITE_API_URL
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json




### Step 1.2 — Backend folder structure
```
server/
├── config/
│   └── db.js               ← MongoDB connection
├── controllers/
│   ├── authController.js   ← Login/signup logic
│   ├── expenseController.js
│   ├── budgetController.js
│   └── analyticsController.js
├── middleware/
│   ├── authMiddleware.js    ← JWT verification
│   ├── errorMiddleware.js   ← Global error handler
│   └── validateMiddleware.js
├── models/
│   ├── User.js
│   ├── Expense.js
│   ├── Budget.js
│   └── Category.js
├── routes/
│   ├── authRoutes.js
│   ├── expenseRoutes.js
│   ├── budgetRoutes.js
│   └── analyticsRoutes.js
├── utils/
│   └── generateToken.js
├── .env
├── package.json
└── server.js               ← App entry point