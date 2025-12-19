import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { FileText, Calendar, DollarSign, Activity, Users, Download } from "lucide-react"
import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";
import {cashierNavLink} from "./cashierNavLink.js";
import {CashierNavBar} from "./CashierNavBar.jsx";



const generateMonthlyData = (months) => {
    return Array.from({ length: months }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString("fr-FR", { month: "short" }),
        consultations: Math.floor(Math.random() * 500000) + 100000,
        examens: Math.floor(Math.random() * 1000000) + 500000,
        total: 0, // Sera calculé
    })).map((item) => ({
        ...item,
        total: item.consultations + item.examens,
    }))
}

export function FinancialReport() {
    const [filterType, setFilterType] = useState("currentMonth")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [data, setData] = useState([])
    const [summaryData, setSummaryData] = useState({
        total: 0,
        monthTotal: 0,
        examTotal: 0,
        consultationTotal: 0,
    })

    useEffect(() => {
        // Simuler le chargement des données selon le filtre
        let monthlyData = []
        switch (filterType) {
            case "currentMonth":
                monthlyData = generateMonthlyData(1)
                break
            case "year":
                monthlyData = generateMonthlyData(12)
                break
            case "yearToDate":
                { let currentMonth = new Date().getMonth()
                monthlyData = generateMonthlyData(currentMonth + 1)
                break }
            case "custom":
                if (startDate && endDate) {
                    const months = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30))
                    monthlyData = generateMonthlyData(months)
                }
                break
        }

        setData(monthlyData)

        // Calculer les totaux
        const totals = monthlyData.reduce(
            (acc, curr) => ({
                total: acc.total + curr.total,
                examTotal: acc.examTotal + curr.examens,
                consultationTotal: acc.consultationTotal + curr.consultations,
            }),
            { total: 0, examTotal: 0, consultationTotal: 0 },
        )

        setSummaryData({
            ...totals,
            monthTotal: monthlyData[monthlyData.length - 1]?.total || 0,
        })
    }, [filterType, startDate, endDate])


    const handleGeneratePDF = () => {
        console.log("Génération du PDF pour la période:", filterType)
    }

    return (
        <DashBoard linkList={cashierNavLink} requiredRole={"Cashier"}>

         <CashierNavBar/>


        <div className="mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">General Hospital Statistics</h1>
                <button
                    onClick={handleGeneratePDF}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Download className="h-5 w-5 mr-2" />
                    Générer PDF
                </button>
            </div>

            {/* Filtres */}
            <div className="mb-6 flex flex-wrap gap-4">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="currentMonth">Mois en cours</option>
                    <option value="year">Année complète</option>
                    <option value="yearToDate">Année jusqu'à présent</option>
                    <option value="custom">Période personnalisée</option>
                </select>

                {filterType === "custom" && (
                    <div className="flex gap-4">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                )}
            </div>

            {/* Cartes de résumé */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
                <div className="p-4 bg-green-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Total des entrées</p>
                            <p className="text-2xl font-bold text-green-800">{summaryData.total.toLocaleString()} $</p>
                        </div>
                        <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                </div>

                <div className="p-4 bg-red-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-red-600 font-medium">Entrées totales du mois</p>
                            <p className="text-2xl font-bold text-red-800">{summaryData.monthTotal.toLocaleString()} $</p>
                        </div>
                        <Calendar className="h-6 w-6 text-red-500" />
                    </div>
                </div>

                <div className="p-4 bg-blue-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Entrées des examens</p>
                            <p className="text-2xl font-bold text-blue-800">{summaryData.examTotal.toLocaleString()} $</p>
                        </div>
                        <Activity className="h-6 w-6 text-blue-500" />
                    </div>
                </div>

                <div className="p-4 bg-purple-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Entrées des consultations</p>
                            <p className="text-2xl font-bold text-purple-800">{summaryData.consultationTotal.toLocaleString()} $</p>
                        </div>
                        <Users className="h-6 w-6 text-purple-500" />
                    </div>
                </div>
            </div>



            {/* Tableau détaillé */}
            <table className="w-full  rounded-lg mb-14">
                <thead className="bg-primary-end">
                <tr>
                    <th className="px-6 py-5 text-center text-md font-bold text-white uppercase rounded-l-lg ">
                        Period
                    </th>
                    <th className="px-6 py-5 text-center text-md font-bold text-white uppercase ">
                        Consultations
                    </th>
                    <th className="px-6 py-5 text-center text-md font-bold text-white uppercase ">
                        Exams
                    </th>
                    <th className="px-6 py-5 text-center text-md font-bold text-white uppercase ">Total</th>
                    <th className="px-6 py-5 text-center text-md font-bold text-white uppercase  rounded-r-lg">
                        Actions
                    </th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {data.map((item, index) => (
                    <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-md text-center font-bold text-gray-900">{item.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-md text-center text-gray-900">{item.consultations.toLocaleString()} FCFA</td>
                        <td className="px-6 py-4 whitespace-nowrap text-md text-center text-gray-900">{item.examens.toLocaleString()} FCFA</td>
                        <td className="px-6 py-4 whitespace-nowrap text-md  text-center text-gray-900">{item.total.toLocaleString()} FCFA</td>
                        <td className="px-6 py-4 whitespace-nowrap text-md text-center text-gray-900">
                            <button
                                onClick={() => handleGeneratePDF()}
                                className="flex justify-center mx-auto items-center text-indigo-600 hover:text-indigo-900"
                            >
                                <FileText className="h-4 w-4 mr-1" />
                                Generate PDF
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Graphique */}
            <div className="mb-5  p-4 rounded-lg border">
                <h2 className="text-lg font-semibold mb-4">Évolution des entrées</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="consultations" name="Entrées des Consultations" stroke="#9333ea" />
                        <Line type="monotone" dataKey="examens" name="Entrées des Examens" stroke="#3b82f6" />
                        <Line type="monotone" dataKey="total" name="Total des Entrées" stroke="#22c55e" />
                    </LineChart>
                </ResponsiveContainer>
            </div>




        </div>
    </DashBoard>
    )
}

