import {
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaSearch,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { Tooltip } from "antd";
import { useEffect, useState } from "react";
import { SuccessModal } from "../Modals/SuccessModal.jsx";
import Wait from "../Modals/wait.jsx";
import { ErrorModal } from "../Modals/ErrorModal.jsx";
import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant.js";
import { ConfirmationModal } from "../Modals/ConfirmAction.Modal.jsx";
import { useNavigate } from "react-router-dom";
import { AccountantNavLink } from "./AccountantNavLink";
import { AccountantDashBoard } from "./Components/AccountantDashboard";
//import { ViewAccountDetailsModal } from "./ViewAccountDetailsModal.jsx";
import { AddAccountModal } from "./Components/AddAccountModal.jsx";
import { AccountantNavBar } from "./Components/AccountantNavBar";

export function AccountList() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
  const [canOpenErrorMessageModal, setCanOpenErrorMessageModal] =
    useState(false);
  useState(false);
  const [canOpenConfirmActionModal, setCanOpenConfirmActionModal] =
    useState(false);
  const [accountToDelete, setAccountToDelete] = useState({});
  const [canOpenAddAccountModal, setCanOpenAddAccountModal] = useState(false);
  const [accountList, setAccountList] = useState([]);
  const [numberOfAccounts, setNumberOfAccounts] = useState(0);
  const [nextUrlForRenderAccountList, setNextUrlForRenderAccountList] =
    useState("");
  const [previousUrlForRenderAccountList, setPreviousUrlForRenderAccountList] =
    useState("");
  const [actualPageNumber, setActualPageNumber] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  // Fonction pour rediriger vers la page de détails du compte
  const handleViewAccountDetails = (account) => {
    navigate(`/accountant/account-details/${account.id}`, {
      state: { account },
    });
  };

  function calculateNumberOfSlide() {
    return numberOfAccounts % 5 === 0
      ? numberOfAccounts / 5
      : Math.floor(numberOfAccounts / 5) + 1;
  }

  function updateActualPageNumber(action) {
    if (action === "next") {
      if (actualPageNumber < calculateNumberOfSlide()) {
        setActualPageNumber(actualPageNumber + 1);
      }
    } else {
      if (actualPageNumber > 1) {
        setActualPageNumber(actualPageNumber - 1);
      }
    }
  }

  async function fetchAccountList() {
    try {
      const response = await axiosInstanceAccountant.get(
        "/acccount-state/get_by_budget_exercise/"
      );
      console.log(response);
      if (response.status === 200) {
        setAccountList(response.data);
        setNumberOfAccounts(response.data.length);
        setNextUrlForRenderAccountList(response.data.next);
        setPreviousUrlForRenderAccountList(response.data.previous);
      }
    } catch (error) {
      setAccountList([]);
      setNumberOfAccounts(0);
      setNextUrlForRenderAccountList("");
      setPreviousUrlForRenderAccountList("");
      console.log(error);
    }
  }

  useEffect(() => {
    fetchAccountList();
  }, []);

  async function fetchNextOrPreviousAccountList(url) {
    if (url) {
      try {
        const response = await axiosInstanceAccountant.get(url);
        if (response.status === 200) {
          setAccountList(response.data.results);
          setNumberOfAccounts(response.data.count);
          setNextUrlForRenderAccountList(response.data.next);
          setPreviousUrlForRenderAccountList(response.data.previous);
        }
      } catch (error) {
        setAccountList([]);
        setNumberOfAccounts(0);
        setPreviousUrlForRenderAccountList("");
        setNextUrlForRenderAccountList("");
        console.log(error);
      }
    }
  }

  async function deleteAccount(accountId) {
    setIsLoading(true);
    try {
      const response = await axiosInstanceAccountant.delete(
        `/account/${accountId}/`
      );
      if (response.status === 204) {
        setIsLoading(false);
        setSuccessMessage("Account deleted successfully!");
        setErrorMessage("");
        setCanOpenErrorMessageModal(false);
        setCanOpenSuccessModal(true);
      }
    } catch (error) {
      setIsLoading(false);
      setSuccessMessage("");
      setErrorMessage(error.response.data.detail);
      setCanOpenSuccessModal(false);
      setCanOpenErrorMessageModal(true);
      console.log(error);
    }
  }

  return (
    <AccountantDashBoard
      requiredRole={"Accountant"}
      linkList={AccountantNavLink}
    >
      <AccountantNavBar></AccountantNavBar>
      <div className="mt-5 flex flex-col relative">
        {/* Header content with search bar */}
        <div className="flex justify-between mb-5">
          <p className="font-bold text-xl mt-2 ml-5">List Of Accounts</p>
          <div className="flex mr-5">
            <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg">
              <FaSearch className="text-xl text-secondary m-2" />
              <input
                type="text"
                placeholder={"Search for a specific account"}
                className="border-none focus:outline-none focus:ring-0"
              />
            </div>
            <button className="ml-2 w-20 h-10 text-white bg-secondary rounded-lg">
              Search
            </button>
          </div>
        </div>

        {/* List of registered accounts */}
        <div className="ml-5 mr-5">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                <th className="text-center text-white p-4 text-xl font-bold border-gray-200 rounded-l-2xl">
                  No
                </th>
                <th className="text-center text-white p-4 text-xl font-bold border-gray-200">
                  Account Number
                </th>
                <th className="text-center text-white p-4 text-xl font-bold border-gray-200">
                  Account Label
                </th>
                <th className="text-center text-white p-4 text-xl font-bold border-gray-200">
                  Current Amount
                </th>
                <th className="text-center text-white p-4 text-xl font-bold border-gray-200">
                  Physical Amount
                </th>
                <th className="text-center text-white p-4 text-xl font-bold flex-col rounded-r-2xl">
                  <p>Operations</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {accountList.length > 0 &&
                accountList &&
                accountList?.map((account, index) => (
                  <tr key={account.id || index} className="bg-gray-100">
                    <td className="p-4 text-md text-blue-900 rounded-l-lg text-center">
                      {index + 1}
                    </td>
                    <td className="p-4 text-md text-center font-bold">
                      {account.account.number}
                    </td>
                    <td className="p-4 text-md text-center">
                      {account.account.libelle}
                    </td>
                    <td className="p-4 text-md text-center">
                      {account.soldePrevu}
                    </td>
                    <td className="p-4 text-md text-center">
                      {account.soldeReel}
                    </td>
                    <td className="p-4 relative rounded-r-lg">
                      <div className="w-full items-center justify-center flex gap-6">
                        <Tooltip placement={"left"} title={"View details"}>
                          <button
                            onClick={() => handleViewAccountDetails(account)}
                            className="flex items-center justify-center w-9 h-9 text-primary-end text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300"
                          >
                            <FaEye />
                          </button>
                        </Tooltip>

                        <Tooltip placement={"right"} title={"Delete"}>
                          <button
                            onClick={() => {
                              setAccountToDelete(account),
                                setCanOpenConfirmActionModal(true);
                            }}
                            className="flex items-center justify-center w-9 h-9 text-red-400 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300"
                          >
                            <FaTrash />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Pagination content */}
          <div className="fixed w-full justify-center -right-16 bottom-0 flex mt-6 mb-4">
            <div className="flex gap-4">
              <Tooltip placement={"left"} title={"Previous slide"}>
                <button
                  onClick={async () => {
                    await fetchNextOrPreviousAccountList(
                      previousUrlForRenderAccountList
                    ),
                      updateActualPageNumber("prev");
                  }}
                  className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl text-secondary hover:text-2xl duration-300 transition-all hover:text-white shadow-xl flex justify-center items-center mt-2"
                >
                  <FaArrowLeft />
                </button>
              </Tooltip>
              <p className="text-secondary text-2xl font-bold mt-4">
                {actualPageNumber}/{calculateNumberOfSlide()}
              </p>
              <Tooltip placement={"right"} title={"Next slide"}>
                <button
                  onClick={async () => {
                    await fetchNextOrPreviousAccountList(
                      nextUrlForRenderAccountList
                    ),
                      updateActualPageNumber("next");
                  }}
                  className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl text-secondary hover:text-2xl duration-300 transition-all hover:text-white shadow-xl flex justify-center items-center mt-2"
                >
                  <FaArrowRight />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Add new account button */}
          <Tooltip placement={"top"} title={"Add New Account"}>
            <button
              onClick={() => setCanOpenAddAccountModal(true)}
              className="fixed bottom-5 right-5 rounded-full w-14 h-14 bg-gradient-to-r text-4xl font-bold text-white from-primary-start to-primary-end hover:text-5xl transition-all duration-300 flex items-center justify-center"
            >
              <FaPlus />
            </button>
          </Tooltip>

          {/* Modals content */}
          <AddAccountModal
            isOpen={canOpenAddAccountModal}
            onClose={() => setCanOpenAddAccountModal(false)}
            setCanOpenSuccessModal={setCanOpenSuccessModal}
            setSuccessMessage={setSuccessMessage}
            setIsLoading={setIsLoading}
          />
          <SuccessModal
            isOpen={canOpenSuccessModal}
            message={successMessage}
            canOpenSuccessModal={setCanOpenSuccessModal}
            makeAction={async () => {
              await fetchAccountList(), calculateNumberOfSlide();
            }}
          />
          <ErrorModal
            isOpen={canOpenErrorMessageModal}
            onCloseErrorModal={() => setCanOpenErrorMessageModal(false)}
            message={errorMessage}
          />
          {/* <ViewAccountDetailsModal
          isOpen={canOpenViewAccountDetailModal}
          account={selectedAccountDetails}
          onClose={() => setCanOpenViewAccountDetailModal(false)}
        /> */}
          {isLoading && <Wait />}
          <ConfirmationModal
            isOpen={canOpenConfirmActionModal}
            onClose={() => setCanOpenConfirmActionModal(false)}
            onConfirm={async () => await deleteAccount(accountToDelete.id)}
            title={"Delete Account"}
            message={`Are you sure you want to delete the account ${accountToDelete?.account?.number} - ${accountToDelete?.account?.libelle}?`}
          />
        </div>
      </div>
    </AccountantDashBoard>
  );
}
