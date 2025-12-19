import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths";
import {
  FaHome,
  FaWallet,
  FaFileInvoice,
  FaCashRegister,
  FaChartLine,
} from "react-icons/fa";
export const AccountantNavLink = [
  {
    name: "Dashboard",
    link: appRoutes.accountantPage,
    icon: FaHome,
  },

  {
    name: "Account List",
    link: appRoutes.accountList,
    icon: FaWallet,
  },

  {
    name: "Create a bill",
    link: appRoutes.createFactureAccountant,
    icon: FaFileInvoice,
  },

  {
    name: "Statistics",
    icon: FaWallet,
    subLinks: [
      {
        name: "Financial Contribution",
        link: appRoutes.financialContributions,
        icon: FaCashRegister,
      },
      {
        name: "Financial Report",
        link: appRoutes.financialReportsAccountant,
        icon: FaChartLine,
      },
    ],
  },
];
