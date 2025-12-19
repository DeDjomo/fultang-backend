import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaFileExcel,
  FaFileCsv,
  FaPrint,
  FaEye,
  FaTrash,
  FaSyncAlt,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useDebounce } from "use-debounce";
import { AccountantDashBoard } from "./Components/AccountantDashboard";
import { AccountantNavBar } from "./Components/AccountantNavBar";
import { AccountantNavLink } from "./AccountantNavLink";
import axiosInstance from "../../Utils/axiosInstance";
import { ViewBillDetailsModal } from "./Components/ViewBillDetailsModal";

const operationTypes = ["All", "Accountant", "Cashier", "Pharmacist", "Other"];

export function FinancialContributions() {
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const [operationType, setOperationType] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 300);
  const [contributions, setContributions] = useState([]);
  const [filteredContributions, setFilteredContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get(`/bill/list_with_source/`);
        console.log(response);
        setContributions(response.data);
        setFilteredContributions(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    handleFilter();
  }, [contributions, startDate, endDate, operationType]); //Corrected dependencies

  const handleFilter = () => {
    setIsLoading(true);

    const filtered = contributions.filter((contribution) => {
      const contributionDate = new Date(contribution.date);
      const matchesDate =
        contributionDate >= startDate && contributionDate <= endDate;
      const matchesType =
        operationType === "All" || contribution.operator.role === operationType;
      const matchesSearch =
        contribution.billCode
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        contribution.operator.role
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());

      return matchesDate && matchesType && matchesSearch;
    });

    setFilteredContributions(filtered);
    setIsLoading(false);
  };

  const handleExport = (format) => {
    const data = filteredContributions.map((item) => ({
      "Bill Code": item.billCode,
      Source: item.operator.role,
      Amount: item.amount,
      Date: format(new Date(item.date), "PPP"),
      Accounted: item.isAccounted ? "Yes" : "No",
    }));

    if (format === "csv") {
      const csvContent = [
        Object.keys(data[0]).join(","),
        ...data.map((item) => Object.values(item).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `contributions_${format(new Date(), "yyyyMMdd")}.csv`);
    } else if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Contributions");
      XLSX.writeFile(
        wb,
        `contributions_${format(new Date(), "yyyyMMdd")}.xlsx`
      );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleViewDetails = (contribution) => {
    setSelectedBill(contribution);
    setIsModalOpen(true);
  };

  const handleDelete = (contribution) => {
    // Implement delete functionality
    console.log("Delete:", contribution);
  };

  const resetFilters = () => {
    setStartDate(startOfMonth(new Date()));
    setEndDate(endOfMonth(new Date()));
    setOperationType("All");
    setSearchTerm("");
    setFilteredContributions(contributions);
  };

  const TooltipButton = ({ icon, onClick, tooltip, className }) => (
    <button
      onClick={onClick}
      className={className}
      data-tooltip-id="my-tooltip"
    >
      {icon}
      <Tooltip id="my-tooltip" place="top" effect="solid">
        {tooltip}
      </Tooltip>
    </button>
  );

  return (
    <AccountantDashBoard
      requiredRole={"Accountant"}
      linkList={AccountantNavLink}
    >
      <AccountantNavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-secondary">
          Financial Contributions
        </h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center">
            <label htmlFor="start-date" className="mr-2">
              Start Date:
            </label>
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="end-date" className="mr-2">
              End Date:
            </label>
            <DatePicker
              id="end-date"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
            />
          </div>

          <select
            onChange={(e) => setOperationType(e.target.value)}
            className="bg-white text-secondary w-[200px] px-4 py-2 rounded"
          >
            <option value="All">Select operation type</option>
            {operationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {/* 
          <input
            type="text"
            placeholder="Search by bill code or source"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white text-secondary px-4 py-2 rounded"
          />
          
          <button
            onClick={() => handleExport("csv")}
            className="bg-white text-secondary hover:bg-gray-100 px-4 py-2 rounded"
          >
            <FaFileCsv className="inline mr-2" />
            CSV
          </button>
          <button
            onClick={() => handleExport("xlsx")}
            className="bg-white text-secondary hover:bg-gray-100 px-4 py-2 rounded"
          >
            <FaFileExcel className="inline mr-2" />
            XLSX
          </button>
          <button
            onClick={handlePrint}
            className="bg-white text-secondary hover:bg-gray-100 px-4 py-2 rounded"
          >
            <FaPrint className="inline" />
          </button>
          */}
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <FaSyncAlt className="animate-spin text-4xl text-primary-600 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Loading contributions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                  {[
                    "No",
                    //"Bill Code",
                    "Source",
                    "Amount",
                    "Date",
                    "Accounted",
                    "Actions",
                  ].map((header, index) => (
                    <th
                      key={header}
                      className={`text-center text-white p-4 text-xl font-bold border-gray-200 ${
                        index === 0
                          ? "rounded-l-2xl"
                          : index === 6
                          ? "rounded-r-2xl"
                          : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredContributions.map((contribution, index) => (
                  <tr key={index} className="bg-gray-100 shadow-sm">
                    <td
                      className={`p-4 text-md text-blue-900 text-center rounded-l-lg border-l-4 ${
                        contribution.isAccounted
                          ? "border-green-500"
                          : "border-red-500"
                      }`}
                    >
                      {index + 1}
                    </td>
                    {/*<td className="p-4 text-md text-center font-bold">
          {contribution.billCode}
        </td>
        */}
                    <td className="p-4 text-md text-center">
                      <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                        {contribution.operator.role}
                      </span>
                    </td>
                    <td className="p-4 text-md text-center font-semibold">
                      {contribution.amount.toLocaleString()} F CFA
                    </td>
                    <td className="p-4 text-md text-center text-gray-600">
                      {format(new Date(contribution.date), "dd MMM yyyy")}
                    </td>
                    <td className="p-4 text-md text-center">
                      {contribution.isAccounted ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          No
                        </span>
                      )}
                    </td>
                    <td className="p-4 relative rounded-r-lg text-center">
                      <div className="w-full items-center justify-center flex gap-6">
                        <TooltipButton
                          icon={<FaEye className="text-primary-end text-xl" />}
                          onClick={() => handleViewDetails(contribution)}
                          tooltip="View details"
                          className="flex items-center justify-center w-9 h-9 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300"
                        />
                        {/*  
            <TooltipButton
              icon={<FaTrash className="text-red-400 text-xl" />}
              onClick={() => handleDelete(contribution)}
              tooltip="Delete record"
              className="flex items-center justify-center w-9 h-9 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300"
            />
            */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredContributions.length === 0 && (
          <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">
              No records found for the selected criteria
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 text-primary-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <ViewBillDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        billDetails={selectedBill}
      />
    </AccountantDashBoard>
  );
}

export default FinancialContributions;
