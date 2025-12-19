import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar, Printer, Download, DollarSign, Users, Activity, FileText } from "lucide-react"

// Fonction pour générer des données simulées pour une journée
const generateDailyData = (date) => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    return hours.map((hour) => ({
        hour: `${hour}:00`,
        consultations: Math.floor(Math.random() * 5000) + 1000,
        examens: Math.floor(Math.random() * 8000) + 2000,
    }))
}

export  function DailyFinancialReport() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [dailyData, setDailyData] = useState([])

    useEffect(() => {
        // Simuler le chargement des données pour la date sélectionnée
        setDailyData(generateDailyData(selectedDate))
    }, [selectedDate])

    const totalConsultations = dailyData.reduce((sum, hour) => sum + hour.consultations, 0)
    const totalExamens = dailyData.reduce((sum, hour) => sum + hour.examens, 0)
    const totalRevenue = totalConsultations + totalExamens

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value)
    }

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = () => {
        // Logique pour télécharger le rapport (à implémenter)
        console.log("Téléchargement du rapport pour la date:", selectedDate)
    }

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Rapport Financier Journalier</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        <Printer className="h-5 w-5 mr-2" />
                        Imprimer
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Télécharger
                    </button>
                </div>
            </div>

            {/* Cartes de résumé */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Revenus Totaux</p>
                            <p className="text-2xl font-bold text-blue-800">{totalRevenue.toLocaleString()} FCFA</p>
                        </div>
                        <DollarSign className="h-6 w-6 text-blue-500" />
                    </div>
                </div>

                <div className="p-4 bg-green-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Consultations</p>
                            <p className="text-2xl font-bold text-green-800">{totalConsultations.toLocaleString()} FCFA</p>
                        </div>
                        <Users className="h-6 w-6 text-green-500" />
                    </div>
                </div>

                <div className="p-4 bg-purple-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Examens</p>
                            <p className="text-2xl font-bold text-purple-800">{totalExamens.toLocaleString()} FCFA</p>
                        </div>
                        <Activity className="h-6 w-6 text-purple-500" />
                    </div>
                </div>

                <div className="p-4 bg-yellow-100 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Nombre de Transactions</p>
                            <p className="text-2xl font-bold text-yellow-800">{dailyData.length}</p>
                        </div>
                        <FileText className="h-6 w-6 text-yellow-500" />
                    </div>
                </div>
            </div>

            {/* Graphique */}
            <div className="mb-6 bg-white p-4 rounded-lg border">
                <h2 className="text-lg font-semibold mb-4">Revenus par Heure</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="consultations" name="Consultations" fill="#4ade80" />
                        <Bar dataKey="examens" name="Examens" fill="#a78bfa" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Tableau détaillé */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Consultations
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Examens
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {dailyData.map((hour, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hour.hour}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {hour.consultations.toLocaleString()} FCFA
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {hour.examens.toLocaleString()} FCFA
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {(hour.consultations + hour.examens).toLocaleString()} FCFA
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

