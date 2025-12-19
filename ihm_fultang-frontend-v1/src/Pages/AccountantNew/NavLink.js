import {
    FaHome,
    FaChartBar,
    FaBookOpen,
    FaEdit,
    FaBook,
    FaUserTie,
    FaFileInvoiceDollar,
    FaChartLine,
    FaCalculator,
    FaBell,
    FaQuestionCircle,
} from "react-icons/fa";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";
import {TrendingUp,} from "lucide-react";

export const FinancialAccountantNavLink = [

    {
        name: "Dashboard",
        link: appRoutes.financialAccountantHome,
        icon: FaHome,
        description: "Overview of financial KPIs"
    },

    // Basic Accounting
    {
        name: 'Basic Accounting',
        icon: FaBookOpen,
        subLinks: [
            {
                icon: FaChartBar,
                name: "Chart of Accounts",
                link: appRoutes.financialAccountantChartOfAccount,
                description: "Manage the OHADA account structure"
            },
            {
                icon: FaEdit,
                name: "Journal Entries",
                link: appRoutes.financialAccountantJournalEntries,
                description: "Record accounting transactions"
            },
            {
                icon: FaBook,
                name: "Accounting Journals",
                link: appRoutes.financialAccountantAccountingJournals,
                description: "View journals (Sales, Purchases, Bank, Cash, Adjustments)"
            },
            {
                icon: FaBook,
                name: "Ledger & Trial Balance",
                link: appRoutes.financialAccountantAccountingGrandLivre,
                description: "View the ledger and trial balance"
            }
        ]
    },

    /* Revenue & Receivables
    {
        name: 'Revenue & Receivables',
        icon: FaMoneyBillWave,
        subLinks: [
            {
                icon: Receipt,
                name: "Billing",
                link: appRoutes.billing,
                description: "Manage patient billing"
            },
            {
                icon: TrendingUp,
                name: "Revenue by Service",
                link: appRoutes.revenueByService,
                description: "Analyze revenue by medical service"
            },
            {
                icon: CreditCard,
                name: "Accounts Receivable",
                link: appRoutes.accountsReceivable,
                description: "Track receivables and collections"
            }
        ]
    },*/

    /* Suppliers & Payables
    {
        name: 'Suppliers & Payables',
        icon: FaTruck,
        subLinks: [
            {
                icon: FaUsers,
                name: "Supplier Directory",
                link: appRoutes.suppliers,
                description: "Manage suppliers and their terms"
            },
            {
                icon: FileText,
                name: "Supplier Invoices",
                link: appRoutes.supplierInvoices,
                description: "Enter and validate received invoices"
            },
            {
                icon: Banknote,
                name: "Payment Schedule & Payments",
                link: appRoutes.payables,
                description: "Manage due dates and payments"
            }
        ]
    },*/

    /* Cash Management
    {
        name: 'Cash Management',
        icon: FaUniversity,
        subLinks: [
            {
                icon: FaUniversity,
                name: "Bank Balances",
                link: appRoutes.cashPositions,
                description: "View real-time bank balances"
            },
            {
                icon: FaCalculator,
                name: "Bank Reconciliation",
                link: appRoutes.bankReconciliation,
                description: "Perform monthly reconciliations"
            },
            {
                icon: FaChartLine,
                name: "Cash Flow Forecast",
                link: appRoutes.cashFlowForecast,
                description: "Forecast cash flows"
            }
        ]
    },*/

    /* Fixed Assets
    {
        name: 'Fixed Assets',
        icon: FaBuilding,
        subLinks: [
            {
                icon: FaBuilding,
                name: "Fixed Assets Register",
                link: appRoutes.fixedAssetsRegister,
                description: "Manage capital assets"
            },
            {
                icon: FaCalculator,
                name: "Depreciation Calculation",
                link: appRoutes.depreciation,
                description: "Calculate and record depreciation"
            }
        ]
    },*/

    /* Inventory & Stock
    {
        name: 'Inventory & Stock',
        icon: FaBoxes,
        subLinks: [
            {
                icon: FaBoxes,
                name: "Inventory Valuation",
                link: appRoutes.inventoryValuation,
                description: "Value inventory (FIFO, LIFO, WAC)"
            },
            {
                icon: FaEdit,
                name: "Inventory Entry",
                link: appRoutes.physicalInventory,
                description: "Record physical counts"
            },
            {
                icon: FaChartBar,
                name: "ABC Analysis",
                link: appRoutes.abcAnalysis,
                description: "Classify and analyze stock"
            }
        ]
    }, */

    // Payroll & Social Charges
    {
        name: 'Payroll & Social Charges',
        icon: FaUserTie,
        subLinks: [
            /*{
                icon: FaUserTie,
                name: "Payroll Accounting",
                link: appRoutes.financialAccountPayroll,
                description: "Account for payroll"
            },*/
            {
                icon: FaFileInvoiceDollar,
                name: "Social Charges",
                link: appRoutes.financialAccountPayroll,
                description: "Manage social security, training taxes, etc."
            },
            {
                icon: FaChartLine,
                name: "HR Cost Analysis",
                link: appRoutes.financialAccountantCostAnalytic,
                description: "Analyze costs by department"
            }
        ]
    },

    /* VAT & Taxation
    {
        name: 'VAT & Taxation',
        icon: FaFileInvoiceDollar,
        subLinks: [
            {
                icon: FaCalculator,
                name: "VAT Calculation",
                link: appRoutes.vatCalculation,
                description: "Calculate monthly VAT"
            },
            {
                icon: FaFileAlt,
                name: "Tax Declarations",
                link: appRoutes.taxDeclarations,
                description: "Prepare and submit tax returns"
            },
            {
                icon: FaBell,
                name: "Tax Calendar",
                link: appRoutes.taxCalendar,
                description: "Track tax deadlines"
            }
        ]
    },

    // Financial Analysis
    {
        name: 'Financial Analysis',
        icon: FaChartLine,
        subLinks: [
            {
                icon: FaChartLine,
                name: "Financial Ratios",
                link: appRoutes.financialRatios,
                description: "Compute performance ratios"
            },
            {
                icon: TrendingUp,
                name: "Profitability by Service",
                link: appRoutes.profitabilityAnalysis,
                description: "Analyze service profitability"
            },
            {
                icon: FaChartBar,
                name: "Executive Dashboard",
                link: appRoutes.executiveDashboard,
                description: "KPIs for management"
            }
        ]
    },

    // Budget & Control
    {
        name: 'Budget & Control',
        icon: FaCalculator,
        subLinks: [
            {
                icon: FaEdit,
                name: "Budget Entry",
                link: appRoutes.budgetEntry,
                description: "Create and modify budgets"
            },
            {
                icon: FaChartBar,
                name: "Variance Analysis",
                link: appRoutes.budgetVariance,
                description: "Compare budget vs actual"
            },
            {
                icon: FaBell,
                name: "Budget Alerts",
                link: appRoutes.budgetAlerts,
                description: "Receive overrun alerts"
            }
        ]
    },

    /* Closing & Reporting
    {
        name: 'Closing & Reporting',
        icon: FaLock,
        subLinks: [
            {
                icon: FaCog,
                name: "Closing Assistant",
                link: appRoutes.periodClose,
                description: "Perform monthly close"
            },
            {
                icon: FaFileAlt,
                name: "Financial Statements",
                link: appRoutes.financialStatements,
                description: "Generate balance sheet and income statement"
            },
            {
                icon: FaBook,
                name: "Custom Reports",
                link: appRoutes.customReports,
                description: "Create tailored reports"
            }
        ]
    },*/

    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenter,
        description: "Documentation and support"
    }
];
