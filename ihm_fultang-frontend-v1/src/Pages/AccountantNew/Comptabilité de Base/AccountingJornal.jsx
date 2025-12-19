import  { useState } from 'react';
import {
    FileText,
    CreditCard,
    Wallet,
    Settings,
    TrendingUp,
    Filter,
    Search,
    Eye,
    CheckCircle,
    AlertCircle,
    BarChart3,
    PieChart
} from 'lucide-react';
import {AccountantDashBoard} from "../../Accountant/Components/AccountantDashboard.jsx";
import {FinancialAccountantNavLink} from "../NavLink.js";
import {AccountantNavBar} from "../../Accountant/Components/AccountantNavBar.jsx";

export function JournauxComptables()
{

    const [selectedJournal, setSelectedJournal] = useState('VTE');
    const [dateRange, setDateRange] = useState('week');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Données simulées pour les journaux
    const journaux = {
        VTE: {
            name: 'Journal des Ventes',
            icon: FileText,
            color: 'bg-green-500',
            total: 850000,
            entries: [
                { id: 1, date: '07/06/2025', libelle: 'Consultation Dr Mballa', patient: 'M. Kamdem', montant: 15000, status: 'validated' },
                { id: 2, date: '08/06/2025', libelle: 'Hospitalisation Mme Ngono', patient: 'Mme Ngono', montant: 45000, status: 'validated' },
                { id: 3, date: '09/06/2025', libelle: 'Analyses laboratoire', patient: 'M. Fouda', montant: 8500, status: 'validated' },
                { id: 4, date: '10/06/2025', libelle: 'Consultation ORL', patient: 'Mlle Messi', montant: 20000, status: 'pending' },
                { id: 5, date: '11/06/2025', libelle: 'Échographie', patient: 'Mme Biya', montant: 25000, status: 'validated' }
            ]
        },
        ACH: {
            name: 'Journal des Achats',
            icon: CreditCard,
            color: 'bg-red-500',
            total: 3750000,
            entries: [
                { id: 1, date: '05/06/2025', libelle: 'Facture SANOFI', fournisseur: 'SANOFI Cameroun', montant: 2500000, status: 'validated' },
                { id: 2, date: '06/06/2025', libelle: 'Équipement médical', fournisseur: 'MedEquip', montant: 850000, status: 'pending' },
                { id: 3, date: '07/06/2025', libelle: 'Consommables', fournisseur: 'Pharmadis', montant: 400000, status: 'validated' }
            ]
        },
        BQ: {
            name: 'Journal de Banque',
            icon: CreditCard,
            color: 'bg-blue-500',
            total: 5200000,
            entries: [
                { id: 1, date: '08/06/2025', libelle: 'Virement salaires', reference: 'VIR-2025-156', montant: -2800000, status: 'validated' },
                { id: 2, date: '09/06/2025', libelle: 'Encaissement patients', reference: 'ENC-2025-89', montant: 150000, status: 'validated' },
                { id: 3, date: '10/06/2025', libelle: 'Paiement fournisseur', reference: 'PAY-2025-45', montant: -750000, status: 'validated' }
            ]
        },
        CAI: {
            name: 'Journal de Caisse',
            icon: Wallet,
            color: 'bg-yellow-500',
            total: 450000,
            entries: [
                { id: 1, date: '10/06/2025', libelle: 'Encaissement consultation', patient: 'M. Fouda', montant: 40000, status: 'validated' },
                { id: 2, date: '11/06/2025', libelle: 'Paiement pharmacie', patient: 'Mme Ndoye', montant: 15000, status: 'validated' },
                { id: 3, date: '12/06/2025', libelle: 'Remboursement patient', patient: 'M. Talla', montant: -5000, status: 'pending' }
            ]
        },
        OD: {
            name: 'Opérations Diverses',
            icon: Settings,
            color: 'bg-purple-500',
            total: 750000,
            entries: [
                { id: 1, date: '05/06/2025', libelle: 'Loyer juin 2025', reference: 'LOY-2025-06', montant: -500000, status: 'validated' },
                { id: 2, date: '08/06/2025', libelle: 'Amortissement équipement', reference: 'AMO-2025-15', montant: -250000, status: 'validated' }
            ]
        }
    };

    const currentJournal = journaux[selectedJournal];

    // Statistiques dashboard
    const stats = [
        {
            label: 'Total Recettes',
            value: '1 300 000 FCFA',
            change: '+12.5%',
            trend: 'up',
            icon: TrendingUp,
            color: 'text-green-600'
        },
        {
            label: 'Total Dépenses',
            value: '4 500 000 FCFA',
            change: '+8.2%',
            trend: 'up',
            icon: TrendingUp,
            color: 'text-red-600'
        },
        {
            label: 'Flux Net',
            value: '-3 200 000 FCFA',
            change: '-15.3%',
            trend: 'down',
            icon: BarChart3,
            color: 'text-orange-600'
        },
        {
            label: 'Écritures Validées',
            value: '89%',
            change: '+2.1%',
            trend: 'up',
            icon: CheckCircle,
            color: 'text-blue-600'
        }
    ];

    const filteredEntries = currentJournal.entries.filter(entry =>
        entry.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.patient && entry.patient.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.fournisseur && entry.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="min-h-screen p-4 ">
                {/* Header */}
                <div className={`ml-5 bg-gradient-to-r from-primary-end to-primary-start rounded-xl text-white p-6 md:p-8 mb-8 shadow-xl`}>
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Saisie des Écritures Comptables</h1>
                            <p className="opacity-90 text-sm">Enregistrez et gérez les opérations financières.</p>
                        </div>
                    </div>
                </div>


                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                        <p className={`text-sm mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change} vs mois dernier
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full bg-gray-100`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar - Liste des Journaux */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border">
                                <div className="p-6 border-b">
                                    <h3 className="text-lg font-semibold text-gray-900">Types de Journaux</h3>
                                </div>
                                <div className="p-4">
                                    {Object.entries(journaux).map(([code, journal]) => {
                                        const Icon = journal.icon;
                                        return (
                                            <button
                                                key={code}
                                                onClick={() => setSelectedJournal(code)}
                                                className={`w-full flex items-center p-3 rounded-lg mb-2 transition-colors ${
                                                    selectedJournal === code
                                                        ? `${journal.color} text-white`
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                <Icon className="w-5 h-5 mr-3"/>
                                                <div className="text-left">
                                                    <div className="font-medium text-sm">{code}</div>
                                                    <div className="text-xs opacity-90">{journal.name}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Résumé du journal actuel */}
                            <div className="bg-white rounded-xl shadow-sm border mt-6">
                                <div className="p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4">Résumé {selectedJournal}</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total période</span>
                                            <span
                                                className="font-semibold">{currentJournal.total.toLocaleString()} FCFA</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Nb d'écritures</span>
                                            <span className="font-semibold">{currentJournal.entries.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Validées</span>
                                            <span className="font-semibold text-green-600">
                                                 {currentJournal.entries.filter(e => e.status === 'validated').length}
                                             </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">En attente</span>
                                            <span className="font-semibold text-orange-600">
                                                {currentJournal.entries.filter(e => e.status === 'pending').length}
                                             </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Détail du journal */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-sm border">
                                {/* Header du journal */}
                                <div className="p-6 border-b">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center">
                                            <currentJournal.icon
                                                className={`w-6 h-6 text-white p-1 rounded ${currentJournal.color} mr-3`}/>
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">{currentJournal.name}</h3>
                                                <p className="text-sm text-gray-600">Journal {selectedJournal}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setShowFilters(!showFilters)}
                                                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center"
                                            >
                                                <Filter className="w-4 h-4 mr-1"/>
                                                Filtres
                                            </button>
                                            <button
                                                className="bg-primary-end text-white px-3 py-2 rounded-lg hover:bg-primary-end flex items-center">
                                                <PieChart className="w-4 h-4 mr-1"/>
                                                Analyser
                                            </button>
                                        </div>
                                    </div>

                                    {/* Filtres */}
                                    {showFilters && (
                                        <div
                                            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 mb-1">Période</label>
                                                <select
                                                    value={dateRange}
                                                    onChange={(e) => setDateRange(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:bg-primary-end focus:border-transparent"
                                                >
                                                    <option value="week">Cette semaine</option>
                                                    <option value="month">Ce mois</option>
                                                    <option value="quarter">Ce trimestre</option>
                                                    <option value="year">Cette année</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                                                <select
                                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:bg-primary-end focus:border-transparent">
                                                    <option value="">Tous les statuts</option>
                                                    <option value="validated">Validées</option>
                                                    <option value="pending">En attente</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label
                                                    className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                                                <div className="relative">
                                                    <Search
                                                        className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
                                                    <input
                                                        type="text"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        placeholder="Rechercher..."
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:bg-primary-end focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Table des écritures */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Libellé
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {selectedJournal === 'VTE' ? 'Patient' : selectedJournal === 'ACH' ? 'Fournisseur' : 'Référence'}
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Montant
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Statut
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredEntries.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {entry.date}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {entry.libelle}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {entry.patient || entry.fournisseur || entry.reference || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                  <span className={entry.montant >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {entry.montant >= 0 ? '+' : ''}{entry.montant.toLocaleString()} FCFA
                                                  </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {entry.status === 'validated' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                          <CheckCircle className="w-3 h-3 mr-1"/>
                                                          Validée
                                                        </span>
                                                    ) : (
                                                        <span
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                            <AlertCircle className="w-3 h-3 mr-1"/>
                                                            En attente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <div className="flex justify-center space-x-2">
                                                        <button className="text-primary-end hover:text-teal-800">
                                                            <Eye className="w-4 h-4"/>
                                                        </button>
                                                        {entry.status === 'pending' && (
                                                            <button className="text-green-600 hover:text-green-900">
                                                                <CheckCircle className="w-4 h-4"/>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="px-6 py-4 border-t flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Affichage de <span className="font-medium">1</span> à <span
                                        className="font-medium">{filteredEntries.length}</span> sur <span
                                        className="font-medium">{filteredEntries.length}</span> résultats
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            className="px-3 py-1 border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50">
                                            Précédent
                                        </button>
                                        <button
                                            className="px-3 py-1 bg-primary-end text-white text-sm rounded hover:bg-teal-700">
                                            1
                                        </button>
                                        <button
                                            className="px-3 py-1 border border-gray-300 text-sm text-gray-700 rounded hover:bg-gray-50">
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AccountantDashBoard>

    );
};

