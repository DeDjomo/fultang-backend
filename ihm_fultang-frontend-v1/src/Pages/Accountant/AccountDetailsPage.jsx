import { useEffect, useState, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";
import axiosInstance from "../../Utils/axiosInstance";
import { ErrorModal } from "../Modals/ErrorModal";
import { SuccessModal } from "../Modals/SuccessModal";
import {
  FaEye,
  FaArrowLeft,
  FaArrowRight,
  FaSort,
  FaPlus,
  FaHashtag,
  FaTimes,
} from "react-icons/fa";
import { InvoiceDetailsModal } from "./Components/InvoiceDetailsModal.jsx";
import { Tooltip } from "antd";
import { AccountantDashBoard } from "./Components/AccountantDashboard.jsx";
import { AccountantNavLink } from "./AccountantNavLink";
import { formatDateOnlyWithoutWeekDay } from "../../Utils/formatDateMethods.js";
import { AccountantNavBar } from "./Components/AccountantNavBar.jsx";
import { useNavigate } from "react-router-dom"; // Ajoutez cette importation

export function AccountDetailsPage() {
  const { accountId } = useParams();
  const { state } = useLocation();
  const accountDetail = state.account;
  const [accountDetails, setAccountDetails] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [unvalidatedInvoices, setUnvalidatedInvoices] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [canOpenErrorMessageModal, setCanOpenErrorMessageModal] =
    useState(false);
  const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
  const [canOpenInvoiceDetailsModal, setCanOpenInvoiceDetailsModal] =
    useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isAddOperationModalVisible, setIsAddOperationModalVisible] =
    useState(false);
  const [newOperationName, setNewOperationName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);

  const navigate = useNavigate(); // Utilisez useNavigate pour la navigation

  const fetchAccountDetails = useCallback(
    async (url = `/bill/get_for_account`) => {
      try {
        const accountResponse = await axiosInstanceAccountant.get(
          `/acccount-state/${accountId}/`
        );
        const unacountedBillResponse = await axiosInstance.get(
          `/bill/bill-unaccounted/?account_id=${accountDetail.id}`
        );
        const invoicesResponse = await axiosInstance.get(
          url + `/?account_id=${accountDetail.id}`
        );
        setUnvalidatedInvoices(unacountedBillResponse.data.length);
        if (accountResponse.status === 200 && invoicesResponse.status === 200) {
          setAccountDetails(accountResponse.data);
          setInvoices(invoicesResponse.data || []);
          setTotalPages(
            Math.ceil(
              invoicesResponse.data.count ? invoicesResponse.data.count / 10 : 1
            )
          );
          setNextUrl(invoicesResponse.data.next);
          setPreviousUrl(invoicesResponse.data.previous);
        }
      } catch (error) {
        console.error("Error fetching account details:", error);
        setErrorMessage(
          error.response?.data?.detail ||
            "An error occurred while loading the data."
        );
        setCanOpenErrorMessageModal(true);
        setInvoices([]);
      }
    },
    [accountId, accountDetail.id]
  );

  useEffect(() => {
    fetchAccountDetails();
  }, [accountId, accountDetail, currentPage]);

  const validateInvoice = async (invoiceId) => {
    const isAccounted = true;
    try {
      const response = await axiosInstance.patch(
        `/bill/${invoiceId}/account/`,
        isAccounted
      );
      if (response.status === 200) {
        setSuccessMessage("Invoice validated successfully!");
        setCanOpenSuccessModal(true);
        await fetchAccountDetails();
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "An error occurred");
      setCanOpenErrorMessageModal(true);
    }
  };

  const refreshInvoices = useCallback(async () => {
    await fetchAccountDetails();
  }, [fetchAccountDetails]);

  const handlePageChange = (action) => {
    if (action === "next" && nextUrl) {
      setCurrentPage(currentPage + 1);
    } else if (action === "prev" && previousUrl) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleAddOperation = useCallback(async () => {
    try {
      const response = await axiosInstanceAccountant.post(
        "/financial-operation/",
        {
          name: newOperationName,
          account: accountDetail.id,
        }
      );
      if (response.status === 201) {
        setIsAddOperationModalVisible(false);
        setNewOperationName("");
        setSuccessMessage("Operation added successfully!");
        setCanOpenSuccessModal(true);
        await fetchAccountDetails();
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail ||
          "An error occurred while adding the operation"
      );
      setCanOpenErrorMessageModal(true);
    }
  }, [newOperationName, accountDetail.id]);

  return (
    <AccountantDashBoard
      requiredRole={"Accountant"}
      linkList={AccountantNavLink}
    >
      <AccountantNavBar />

      <div className="p-5">
        <div className="flex items-center space-x-5">
          {" "}
          {/* Ajoutez une flèche de retour avec un message au survol */}
          <Tooltip placement="right" title="Back to Account List">
            <button
              onClick={() => navigate(-1)} // Retourne à la page précédente
              className="flex items-center text-secondary hover:text-primary-end transition duration-300 mb-5"
            >
              <FaArrowLeft className="text-4xl" /> {/* Flèche plus grosse */}
            </button>
          </Tooltip>
          <h1 className="text-2xl font-bold mb-5">
            Account Details - {accountDetail.account?.libelle}
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-lg shadow-md">
            <p className="text-lg font-semibold">Total Value</p>
            <p className="text-2xl">{accountDetails.soldePrevu} FCFA</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg shadow-md">
            <p className="text-lg font-semibold">Actual Value</p>
            <p className="text-2xl">{accountDetails.soldeReel} FCFA</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg shadow-md">
            <p className="text-lg font-semibold">Unvalidated Invoices</p>
            <p className="text-2xl">{unvalidatedInvoices}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-md">
          {invoices.length === 0 ? (
            <p className="text-center text-lg">No invoices available.</p>
          ) : (
            <>
              <table className="w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                    <th className="text-center text-white p-4 text-xl font-bold border-gray-200 rounded-l-2xl">
                      #
                    </th>
                    <th className="text-center text-white p-4 text-xl font-bold border-gray-200">
                      Date
                    </th>
                    <th className="text-center text-white p-4 text-xl font-bold border-gray-200">
                      Amount
                    </th>
                    <th className="text-center text-white p-4 text-xl font-bold border-gray-200">
                      Operator
                    </th>
                    <th className="text-center text-white p-4 text-xl font-bold border-gray-200 rounded-r-2xl">
                      Operations
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr key={index} className="bg-gray-100 shadow-sm">
                      <td
                        className={`p-4 text-md text-blue-900 text-center rounded-l-lg border-l-4 ${
                          invoice.isAccounted
                            ? "border-green-500"
                            : "border-red-500"
                        }`}
                      >
                        {index + 1}
                      </td>
                      <td className="p-4 text-md text-center">
                        {formatDateOnlyWithoutWeekDay(invoice.date)}
                      </td>
                      <td className="p-4 text-md text-center">
                        {invoice.amount} FCFA
                      </td>
                      <td className="p-4 text-md text-center">
                        {invoice.operator.first_name}{" "}
                        {invoice.operator.last_name}
                      </td>
                      <td className="p-4 text-center rounded-r-lg">
                        <div className="w-full items-center justify-center flex gap-6">
                          <Tooltip placement="left" title="View details">
                            <button
                              onClick={() => {
                                const fullInvoice = invoices.find(
                                  (inv) => inv.id === invoice.id
                                );
                                setSelectedInvoice(fullInvoice);
                                setCanOpenInvoiceDetailsModal(true);
                              }}
                              className="flex items-center justify-center w-9 h-9 text-primary-end text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300"
                            >
                              <FaEye />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center mt-6">
                <div className="flex gap-4">
                  <Tooltip placement="left" title="Previous page">
                    <button
                      onClick={() => handlePageChange("prev")}
                      disabled={!previousUrl}
                      className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center ${
                        !previousUrl
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-secondary hover:bg-secondary hover:text-white"
                      }`}
                    >
                      <FaArrowLeft />
                    </button>
                  </Tooltip>
                  <p className="text-secondary text-2xl font-bold mt-2">
                    Page {currentPage} of {totalPages}
                  </p>
                  <Tooltip placement="right" title="Next page">
                    <button
                      onClick={() => handlePageChange("next")}
                      disabled={!nextUrl}
                      className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center ${
                        !nextUrl
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-secondary hover:bg-secondary hover:text-white"
                      }`}
                    >
                      <FaArrowRight />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </>
          )}
        </div>

        <InvoiceDetailsModal
          isOpen={canOpenInvoiceDetailsModal}
          onClose={() => setCanOpenInvoiceDetailsModal(false)}
          invoice={selectedInvoice}
          validateInvoice={validateInvoice}
          refreshInvoice={refreshInvoices}
        />

        <ErrorModal
          isOpen={canOpenErrorMessageModal}
          onCloseErrorModal={() => setCanOpenErrorMessageModal(false)}
          message={errorMessage}
        />

        <SuccessModal
          isOpen={canOpenSuccessModal}
          canOpenSuccessModal={setCanOpenSuccessModal}
          message={successMessage}
          makeAction={() => fetchAccountDetails()} // Rafraîchir les données après succès
        />

        <Tooltip placement="top" title="Add a new operation">
          <button
            onClick={() => setIsAddOperationModalVisible(true)}
            className="fixed bottom-5 right-5 rounded-full w-14 h-14 bg-gradient-to-r text-4xl font-bold text-white from-primary-start to-primary-end hover:text-5xl transition-all duration-300 flex items-center justify-center"
          >
            <FaPlus />
          </button>
        </Tooltip>

        {isAddOperationModalVisible && (
          <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
              <div className="flex justify-between items-center bg-gradient-to-r from-primary-start to-primary-end p-4 rounded-t-lg">
                <h2 className="text-xl font-bold text-white">
                  Add a new financial operation
                </h2>
                <button
                  onClick={() => setIsAddOperationModalVisible(false)}
                  className="text-white hover:text-gray-200 transition duration-300"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="newOperationName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Operation Name
                  </label>
                  <div className="relative">
                    <FaHashtag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="newOperationName"
                      type="text"
                      placeholder="Operation Name"
                      value={newOperationName}
                      onChange={(e) => setNewOperationName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end items-center rounded-b-lg">
                <button
                  onClick={() => setIsAddOperationModalVisible(false)}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOperation}
                  disabled={!newOperationName}
                  className={`flex items-center px-4 py-2 ${
                    newOperationName
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-300 text-gray-700 cursor-not-allowed"
                  } rounded-md transition duration-300`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountantDashBoard>
  );
}
