import { useState, useEffect } from "react"
import { X, Printer, Save, AlertCircle } from "lucide-react"
import PropTypes from "prop-types";
import axiosInstanceAccountant from "../../Utils/axiosInstanceAccountant.js";
import {useAuthentication} from "../../Utils/Provider.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import {formatDateOnly} from "../../Utils/formatDateMethods.js";

export function PaymentModal({ isOpen, onClose, consultationData }) {


    PaymentModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        consultationData: PropTypes.object.isRequired,
    };


    const [selectedFinancialOperation, setSelectedFinancialOperation] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [billNumber, setBillNumber] = useState("");
    const [isClosing, setIsClosing] = useState(false);
    const [financialOperations, setFinancialOperations] = useState([]);
    const {userData} = useAuthentication();
    const [error, setError] = useState("");
    const [bill, setBill] = useState() 


    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setIsSuccess(false);
        }
    }, [isOpen])


    function handleClose (){
        setIsClosing(true);
        setTimeout(() => {onClose()}, 300)
    }

    async function handleSubmit (e){
        e.preventDefault();
        setIsProcessing(true);
        let billData = {
            bill_items:
                [
                    {
                        designation : 'consultation',
                        consultation: consultationData?.id

                    },
                ],
            patient: consultationData?.idPatient?.id,
            operation: selectedFinancialOperation,
            operator: userData?.id,
        }
        try
        {
            console.log(billData);
            const response = await axiosInstance.post("/bill/", billData);
            
            setIsProcessing(false);
            if (response.status === 201)

            {   setBill(response?.data)
                console.log(response.data);
                setBillNumber(response?.data?.id);
                setIsSuccess(true);
                setError(null);
            }
        }
        catch (error)
        {
            setIsProcessing(false);
            setError("Something went wrong went creating bill, please retry later !!!");
            console.log(error);
        }
    }



    useEffect(() => {
        async function fetchFinancialOperation()
        {
            try
            {
                const response = await axiosInstanceAccountant.get("/financial-operation/");
                if (response.status === 200)
                {
                    console.log("financial operation", response);
                    setFinancialOperations(response.data);
                }
            }
            catch (error)
            {
                console.log(error);
            }
        }
        fetchFinancialOperation();
    }, []);

    const handlePrint = () => {
        const printContents = document.getElementById("invoice").innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents; // Restaure la page après l'impression
    };


    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
            <div className={`fixed inset-0 bg-black  transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-70"}`} onClick={handleClose}/>
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={`relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-300 ${isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold ">Invoice Creation</h2>
                        <button onClick={handleClose} className="rounded-full p-1 hover:bg-red-100 transition-colors duration-500">
                            <X className="h-7 w-7 text-red-500" />
                        </button>
                    </div>

                    {error && <p className="m-4 font-bold text-md text-red-500">{error}</p>}

                    <div className="px-6 py-4">
                        {isSuccess ? (
                            <div className="space-y-6">
                                <div className="rounded-md bg-green-50 p-4 border border-green-200">
                                    <div className="flex items-center">
                                        <AlertCircle className="h-5 w-5 text-green-600" />
                                        <p className="ml-3 text-green-700">Invoice created successfully! Invoice number: {billNumber}</p>
                                    </div>
                                </div>


                                <div className="rounded-lg bg-gray-50 p-4 space-y-4">
                                    <div id = "invoice" className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Patient</p>
                                            <p className="font-medium">{consultationData.idPatient.firstName + " " + consultationData.idPatient.lastName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <p className="font-medium">{consultationData.idPatient.phoneNumber || "Not specified"}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Price</p>
                                            <p className="font-medium">{consultationData.consultationPrice.toLocaleString()} FCFA</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Date</p>
                                            <p className="font-medium">{new Date(consultationData.consultationDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Price</p>
                                            <p className="font-medium">{consultationData.consultationPrice.toLocaleString()} FCFA</p>
                                        </div>
                                    </div>
                                </div>


                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                                    >
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print Facture
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                                            <input
                                                type="text"
                                                value={consultationData?.idPatient?.firstName + " " + consultationData?.idPatient?.lastName}
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input
                                                type="text"
                                                value={consultationData?.idPatient?.phoneNumber || ""}
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                            />
                                        </div>
                                    </div>


                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                            <input
                                                type="text"
                                                value={`${consultationData?.consultationPrice} FCFA`}
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="text"
                                                value={consultationData?.consultationDate ? formatDateOnly(consultationData?.consultationDate) : 'Not Specified'}
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                            />
                                        </div>
                                    </div>


                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type of financial transaction</label>
                                        <select
                                            value={selectedFinancialOperation}
                                            onChange={(e) => setSelectedFinancialOperation(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-2  focus:border-primary-end"
                                        >
                                            <option value="">Select operation type</option>
                                            {financialOperations && financialOperations.length > 0 && financialOperations.map((operation) => (
                                                <option key={operation?.id} value={operation?.id}>{operation?.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>


                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2  bg-red-400  font-bold  rounded-md text-white hover:bg-red-600 transition-all duration-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isProcessing || !selectedFinancialOperation}
                                        className={`px-4 py-2 rounded-md text-white font-bold flex items-center transition-colors ${
                                            isProcessing || !selectedFinancialOperation
                                                ? "bg-primary-end/70 cursor-not-allowed"
                                                : "bg-primary-end hover:bg-indigo-700"
                                        }`}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        <p className={`${isProcessing ? "animate-pulse" : ""}`}>{isProcessing ? "Creation in progress..." : "Create the invoice"}</p>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

