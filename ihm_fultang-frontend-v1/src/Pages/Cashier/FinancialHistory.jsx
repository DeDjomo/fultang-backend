import { useEffect, useState } from "react"
import {AlertCircle, Search, Calendar, User, DollarSign, Filter, Printer, Activity, Home } from "lucide-react"
import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";
import {cashierNavLink} from "./cashierNavLink.js";
import {CashierNavBar} from "./CashierNavBar.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";


const mockTransactions = [
    
 ]


export function FinancialHistory() {

    const [transactions, setTransactions] = useState(mockTransactions)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all")
    const [showInvoice, setShowInvoice] = useState(null)

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
    }

    const handleFilterChange = (e) => {
        setFilterType(e.target.value)
    }

    const handleGenerateInvoice = (transactionId) => {
        setShowInvoice(transactionId)
    }

    const filteredTransactions = transactions.filter((transaction) => {
        return (
            transaction.patientName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterType === "all" || transaction.type === filterType)
        )
    })

    useEffect(() => {
        async function fetchFacture()
        {
            
            try
            {
                const response = await axiosInstance.get("/accounting/facture/");
                
                if (response.status === 200)
                {
                    setTransactions(response.data.results);
                }
            }
            catch (error)
            {
                
                console.log(error);
            }
        }
        fetchFacture();
    }, []);


    const getTransactionIcon = (type) => {
        switch (type) {
            case "Consultation":
                return <User className="h-5 w-5 text-blue-500" />
            case "Examen":
                return <Activity className="h-5 w-5 text-green-500" />
            case "Hospitalisation":
                return <Home className="h-5 w-5 text-red-500" />
            default:
                return <DollarSign className="h-5 w-5 text-gray-500" />
        }
    }

    const handlePrint = () => {
        const printContents = document.getElementById("invoice").innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents; // Restaure la page après l'impression
    };
    
    return (

        <DashBoard linkList={cashierNavLink} requiredRole={"Cashier"}>

            <CashierNavBar/>
            <div className="mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">History of Financial Transactions</h1>

                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    <div className="relative w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Rechercher un patient"
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Filter className="text-gray-400"/>
                        <select
                            value={filterType}
                            onChange={handleFilterChange}
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Types</option>
                            <option value="Consultation">Consultation</option>
                            <option value="Examen">Exams</option>
                            <option value="Hospitalisation">Hospitalisation</option>
                        </select>
                    </div>
                </div>

                {
                    transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-lg font-semibold text-gray-600">
                            No transactions available
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                        <thead className="bg-primary-end">
                                            <tr>
                                                <th className="px-6 py-5 text-center text-md font-bold text-white uppercase rounded-l-lg">Patient</th>
                                                <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">
                                                    Type
                                                </th>
                                                <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">Date</th>
                                                <th className="px-6 py-5 text-center text-md font-bold text-white uppercase">Price</th>
                                                <th className="px-6 py-5 text-center text-md font-bold text-white uppercase rounded-r-lg">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                    <tbody className="divide-y divide-gray-200">
                                            {filteredTransactions.map((transaction, index) => (
                                                <tr key={transaction.id}>
                                                    <td className="px-6 py-6 whitespace-nowrap">
                                                        <div className="flex items-center justify-center">
                                                            <User className="h-5 w-5 text-gray-400 mr-2"/>
                                                            <div
                                                                className="text-md font-semibold text-gray-900">{transaction.patientName}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 whitespace-nowrap">
                                                        <div className="flex items-center justify-center">
                                                            {getTransactionIcon(transaction.type)}
                                                            <div className="ml-2 text-md text-gray-900">{transaction.type}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 whitespace-nowrap">
                                                        <div className="flex items-center justify-center">
                                                            <Calendar className="h-5 w-5 text-gray-400 mr-2"/>
                                                            <div
                                                                className="text-md text-gray-900">{new Date(transaction.date).toLocaleDateString()}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 whitespace-nowrap">
                                                        <div className="flex items-center justify-center">
                                                            <div className="text-md text-gray-900">{transaction.montant} FCFA</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 whitespace-nowrap text-center text-md font-medium">
                                                        <button
                                                            onClick={() => handleGenerateInvoice(transaction.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 flex items-center justify-center mx-auto"
                                                        >
                                                            <Printer className="h-5 w-5 mr-1"/>
                                                            Print
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                            </table>
                        </div>
                       
                
                    )}
                     {showInvoice && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm h-full w-full flex items-center justify-center">
                                <div className="bg-white p-8 rounded-lg  w-full max-w-2xl">
                                    <h2 className="text-2xl font-bold mb-4">Bill</h2>
                                    {(() => {
                                        const transaction = transactions.find((t) => t.id === showInvoice)
                                        return (
                                            <>

                                                <div id="invoice">
                                                    <div className="mb-4">
                                                        <p>
                                                            <strong>Patient:</strong> {transaction.patientName}
                                                        </p>
                                                        <p>
                                                            <strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}
                                                        </p>
                                                        <p>
                                                            <strong>Type:</strong> {transaction.type}
                                                        </p>
                                                    </div>
                                                    <table className="w-full mb-4">
                                                        <thead>
                                                        <tr className="border-b">
                                                            <th className="text-left py-2">Description</th>
                                                            <th className="text-right py-2">Price</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        <tr className="border-b">
                                                            <td className="py-2">
                                                                {transaction.type} - {new Date(transaction.date).toLocaleDateString()}
                                                            </td>
                                                            <td className="text-right py-2">{transaction.amount} FCFA</td>
                                                        </tr>
                                                        </tbody>
                                                        <tfoot>
                                                        <tr className="font-bold">
                                                            <td className="py-2">Total</td>
                                                            <td className="text-right py-2">{transaction.amount} FCFA</td>
                                                        </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                                
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => setShowInvoice(null)}
                                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mr-2"
                                                    >
                                                        Close
                                                    </button>
                                                    <button
                                                        onClick={handlePrint}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                                                    >
                                                        <Printer className="h-5 w-5 mr-2"/>
                                                        Print
                                                    </button>
                                                </div>
                                            </>
                                        )
                                    })()}
                                </div>
                            </div>
                        )}

            </div>
        </DashBoard>
    )
}

