"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash } from "lucide-react";
import { useAuthentication } from "../../Utils/Provider";
import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant";
import axiosInstance from "../../Utils/axiosInstance.js";
import { ErrorModal } from "../Modals/ErrorModal";
import { SuccessModal } from "../Modals/SuccessModal.jsx";
import { AccountantDashBoard } from "./Components/AccountantDashboard.jsx";
import { AccountantNavBar } from "./Components/AccountantNavBar.jsx";
import { AccountantNavLink } from "./AccountantNavLink.js";

export function CreateFacturePage() {
  const [title, setTitle] = useState("");
  const [billItems, setBillItems] = useState([
    { quantity: 1, unityPrice: 0, designation: "", description: "" },
  ]);
  const [selectedOperation, setSelectedOperation] = useState("");
  const [financialOperations, setFinancialOperations] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [canOpenErrorMessageModal, setCanOpenErrorMessageModal] =
    useState(false);
  const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { userData } = useAuthentication();

  useEffect(() => {
    fetchFinancialOperations();
  }, []);

  async function fetchFinancialOperations() {
    try {
      const response = await axiosInstanceAccountant.get(
        "/financial-operation/"
      );
      if (response.status === 200) {
        setFinancialOperations(response.data);
      }
    } catch (error) {
      console.error("Error fetching financial operations:", error);
      setErrorMessage(
        "Failed to load financial operations. Please try again later."
      );
      setCanOpenErrorMessageModal(true);
    }
  }

  const handleBillItemChange = (index, field, value) => {
    const newBillItems = [...billItems];
    newBillItems[index][field] = value;
    if (field === "quantity" || field === "unityPrice") {
      newBillItems[index].total =
        newBillItems[index].quantity * newBillItems[index].unityPrice;
    }
    setBillItems(newBillItems);
  };

  const addBillItem = () => {
    setBillItems([
      ...billItems,
      {
        quantity: 1,
        unityPrice: 0,
        designation: "",
        description: "",
        total: 0,
      },
    ]);
  };

  const removeBillItem = (index) => {
    const newBillItems = billItems.filter((_, i) => i !== index);
    setBillItems(newBillItems);
  };

  const calculateTotal = () => {
    return billItems.reduce(
      (sum, item) => sum + item.quantity * item.unityPrice,
      0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const billData = {
      title,
      bill_items: billItems,
      amount: calculateTotal(),
      operation: Number(selectedOperation),
      operator: userData?.id,
    };
    console.log(billData);
    try {
      const response = await axiosInstance.post("/bill/", billData);
      if (response.status === 201) {
        setSuccessMessage("Invoice created successfully!");
        setCanOpenSuccessModal(true);
        // Reset form
        setTitle("");
        setBillItems([
          { quantity: 1, unityPrice: 0, designation: "", description: "" },
        ]);
        setSelectedOperation("");
      }
    } catch (error) {
      console.error("Error creating bill:", error);
      setErrorMessage(
        "Failed to create the invoice. Please check your inputs and try again."
      );
      setCanOpenErrorMessageModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AccountantDashBoard
      requiredRole={"Accountant"}
      linkList={AccountantNavLink}
    >
      <AccountantNavBar></AccountantNavBar>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Create New Invoice</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          {/*
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="title"
            >
              Invoice Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="title"
              type="text"
              placeholder="e.g., Tax Payment, Staff Salaries, Equipment Purchase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          */}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="operation"
            >
              Financial Operation Category
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="operation"
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {financialOperations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Invoice Items</h3>
            {billItems.map((item, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Designation
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={item.designation}
                      onChange={(e) =>
                        handleBillItemChange(
                          index,
                          "designation",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Office Supplies, Medical Equipment"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={item.description}
                      onChange={(e) =>
                        handleBillItemChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Monthly supply of pens and paper"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Quantity
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleBillItemChange(
                          index,
                          "quantity",
                          Number.parseInt(e.target.value)
                        )
                      }
                      min="1"
                      placeholder="e.g., 10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Unit Price
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="number"
                      value={item.unityPrice}
                      onChange={(e) =>
                        handleBillItemChange(
                          index,
                          "unityPrice",
                          Number.parseFloat(e.target.value)
                        )
                      }
                      min="0"
                      step="0.01"
                      placeholder="e.g., 5000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Total
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
                      value={(item.quantity * item.unityPrice).toFixed(2)}
                      disabled
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={() => removeBillItem(index)}
                      disabled={billItems.length === 1}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={addBillItem}
            >
              <Plus className="h-4 w-4 inline-block mr-2" /> Add Item
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">
              Total Amount: {calculateTotal().toFixed(2)} FCFA
            </div>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={isProcessing}
            >
              <Save className="h-4 w-4 inline-block mr-2" />
              {isProcessing ? "Creating Invoice..." : "Create Invoice"}
            </button>
          </div>
        </form>

        <ErrorModal
          isOpen={canOpenErrorMessageModal}
          onCloseErrorModal={() => setCanOpenErrorMessageModal(false)}
          message={errorMessage}
        />

        <SuccessModal
          isOpen={canOpenSuccessModal}
          message={successMessage}
          canOpenSuccessModal={setCanOpenSuccessModal}
          makeAction={async () => {
            await fetchFinancialOperations();
          }}
        />
      </div>
    </AccountantDashBoard>
  );
}
