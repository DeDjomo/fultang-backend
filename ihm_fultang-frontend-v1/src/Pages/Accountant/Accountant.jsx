import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import {
  Users,
  DollarSign,
  FileText,
  Settings,
  WalletCards,
} from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

export function Accountant() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAccounts: 0,
    totalFinancialOperations: 0,
  });

  // Fonction pour récupérer le nombre total de factures
  const fetchTotalInvoices = async () => {
    try {
      const response = await axiosInstanceAccountant.get("/invoice/total");
      setStats((prev) => ({ ...prev, totalInvoices: response.data.total }));
    } catch (error) {
      console.error("Error fetching total invoices:", error);
    }
  };

  // Fonction pour récupérer le nombre total de comptes
  const fetchTotalAccounts = async () => {
    try {
      const response = await axiosInstanceAccountant.get("/account/total");
      setStats((prev) => ({ ...prev, totalAccounts: response.data.total }));
    } catch (error) {
      console.error("Error fetching total accounts:", error);
    }
  };

  // Fonction pour récupérer le nombre total d'opérations financières
  const fetchTotalFinancialOperations = async () => {
    try {
      const response = await axiosInstanceAccountant.get(
        "/financial-operation/total"
      );
      setStats((prev) => ({
        ...prev,
        totalFinancialOperations: response.data.total,
      }));
    } catch (error) {
      console.error("Error fetching total financial operations:", error);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchTotalInvoices();
    fetchTotalAccounts();
    fetchTotalFinancialOperations();
  }, []);

  const quickActions = [
    {
      icon: DollarSign,
      label: "Add Expense",
      onClick: () => navigate("/accountant/create-facture"),
    },
    {
      icon: WalletCards,
      label: "View Account",
      onClick: () => navigate("/accountant/account-list"),
    },
    {
      icon: FileText,
      label: "View Reports",
      onClick: () => navigate("/accountant/financial-reports"),
    },
  ];

  return (
    <AccountantDashBoard
      linkList={AccountantNavLink}
      requiredRole={"Accountant"}
    >
      <AccountantNavBar />
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold mb-4">Accounting Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            description="Total number of invoices"
            color="bg-blue-500"
            icon={FileText}
          />
          <StatCard
            title="Total Accounts"
            value={stats.totalAccounts}
            description="Total number of accounts"
            color="bg-green-500"
            icon={WalletCards}
          />
          <StatCard
            title="Financial Operations"
            value={stats.totalFinancialOperations}
            description="Total financial operations"
            color="bg-purple-500"
            icon={DollarSign}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={index}
                icon={action.icon}
                label={action.label}
                onClick={action.onClick}
              />
            ))}
          </div>
        </div>
      </div>
    </AccountantDashBoard>
  );
}

function StatCard({ title, value, description, color }) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 flex items-start gap-4`}>
      <div className={`${color} rounded-full p-3 text-white`}>
        <DollarSign className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-2 hover:border-primary-end hover:bg-gray-100 transition-all duration-300"
    >
      <Icon className="w-6 h-6 text-primary-end" />
      <span className="text-md text-gray-600 font-bold text-center">
        {label}
      </span>
    </button>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

QuickActionButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
