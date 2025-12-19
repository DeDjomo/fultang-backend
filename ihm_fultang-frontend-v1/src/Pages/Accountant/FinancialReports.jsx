import { useState, useEffect } from "react";
import {
  FaFilePdf,
  FaFileExcel,
  FaExclamationCircle,
  FaChartLine,
  FaBalanceScale,
  FaMoneyBillWave,
} from "react-icons/fa";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import BalanceSheet from "./Components/BalanceSheet";
import IncomeStatement from "./Components/IncomeStatement";
import FinancialCharts from "./Components/FinancialCharts";
import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";

export function FinancialReports() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [error, setError] = useState(null);
  const [financialData, setFinancialData] = useState(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const response = await axiosInstanceAccountant.get(
          `/budget-exercise/get_balance_sheet/?year=${selectedYear}`
        );
        setFinancialData(response.data);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        setError("Failed to load financial data");
      }
    };

    fetchFinancialData();
  }, [selectedYear]);

  const handleExport = (format) => {
    // Enhanced export functionality
    console.log(`Exporting ${format} with professional formatting`);
    // Add actual export logic using libraries like xlsx or pdfmake
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AccountantDashBoard
      requiredRole={"Accountant"}
      linkList={AccountantNavLink}
    >
      <AccountantNavBar />
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold text-secondary">
            Financial Reports
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <select
              className="px-4 py-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-start"
              onChange={(e) => setSelectedYear(e.target.value)}
              value={selectedYear}
            >
              <option value="2025">FY 2025</option>
            </select>
            {/*<div className="flex gap-2">
              <button
                onClick={() => handleExport("excel")}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaFileExcel className="text-green-600" />
                Excel
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FaFilePdf className="text-red-600" />
                PDF
              </button>
            </div>
            */}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <FaExclamationCircle />
              <p className="font-medium">Error</p>
            </div>
            <p className="mt-1 text-red-600">{error}</p>
          </div>
        )}

        <Tabs>
          <TabList className="flex border-b">
            <Tab className="px-6 py-3 text-center font-medium cursor-pointer focus:outline-none">
              Overview
            </Tab>
            <Tab className="px-6 py-3 text-center font-medium cursor-pointer focus:outline-none">
              Balance Sheet
            </Tab>
            {/*<Tab className="px-6 py-3 text-center font-medium cursor-pointer focus:outline-none">
              Income Statement
            </Tab>*/}
          </TabList>

          <TabPanel>
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-2 text-secondary">
                Financial Overview {selectedYear}
              </h2>
              <p className="text-gray-600 mb-6">
                Comprehensive financial position analysis
              </p>
              {financialData && (
                <FinancialCharts data={financialData} year={selectedYear} />
              )}
            </div>
          </TabPanel>

          <TabPanel>
            <div className="mt-6">
              <BalanceSheet year={selectedYear} />
            </div>
          </TabPanel>

          <TabPanel>
            <div className="mt-6">
              <IncomeStatement year={selectedYear} />
              {/* Income Statement Analysis Section */}
              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-blue-800">
                  <FaChartLine className="inline-block mr-2" />
                  Profitability Analysis
                </h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span>Operating Margin</span>
                    <span className="font-mono">XX%</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>YOY Revenue Growth</span>
                    <span className="text-green-600 font-mono">+XX%</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Expense Ratio</span>
                    <span className="font-mono">XX%</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </AccountantDashBoard>
  );
}
