import  { useState } from 'react';
import {
    Calculator,
    BarChart3,
    Search,
    Download,
    TrendingUp,
    TrendingDown,
    Eye,
    Layers,
    CheckCircle2,
    AlertTriangle,
    Minus
} from 'lucide-react';
import {AccountantDashBoard} from "../../Accountant/Components/AccountantDashboard.jsx";
import {FinancialAccountantNavLink} from "../NavLink.js";
import {AccountantNavBar} from "../../Accountant/Components/AccountantNavBar.jsx";

export function GrandLivreBalance() {
    const [activeView, setActiveView] = useState('balance'); // 'balance', 'ledger', 'trial'
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [dateRange, setDateRange] = useState('month');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedClass, setSelectedClass] = useState('all');

    // Données simulées pour la balance
    const balanceData = [
        {
            code: '1011',
            libelle: 'Capital social',
            classe: 1,
            type: 'passif',
            debit: 0,
            credit: 50000000,
            solde: -50000000,
            evolution: '+2.5%',
            trend: 'up'
        },
        {
            code: '2154',
            libelle: 'Équipements médicaux',
            classe: 2,
            type: 'actif',
            debit: 85000000,
            credit: 12000000,
            solde: 73000000,
            evolution: '+15.3%',
            trend: 'up'
        },
        {
            code: '3111',
            libelle: 'Stock médicaments',
            classe: 3,
            type: 'actif',
            debit: 12500000,
            credit: 8200000,
            solde: 4300000,
            evolution: '-8.7%',
            trend: 'down'
        },
        {
            code: '4111',
            libelle: 'Clients consultations',
            classe: 4,
            type: 'actif',
            debit: 2800000,
            credit: 2100000,
            solde: 700000,
            evolution: '+25.4%',
            trend: 'up'
        },
        {
            code: '4011',
            libelle: 'Fournisseurs SANOFI',
            classe: 4,
            type: 'passif',
            debit: 1500000,
            credit: 4200000,
            solde: -2700000,
            evolution: '+12.1%',
            trend: 'up'
        },
        {
            code: '5711',
            libelle: 'Caisse recettes',
            classe: 5,
            type: 'actif',
            debit: 8500000,
            credit: 7200000,
            solde: 1300000,
            evolution: '+18.9%',
            trend: 'up'
        },
        {
            code: '5121',
            libelle: 'Banque BICEC',
            classe: 5,
            type: 'actif',
            debit: 45000000,
            credit: 38000000,
            solde: 7000000,
            evolution: '-5.2%',
            trend: 'down'
        },
        {
            code: '6031',
            libelle: 'Achats médicaments',
            classe: 6,
            type: 'charge',
            debit: 28000000,
            credit: 500000,
            solde: 27500000,
            evolution: '+22.3%',
            trend: 'up'
        },
        {
            code: '6411',
            libelle: 'Salaires personnel',
            classe: 6,
            type: 'charge',
            debit: 45000000,
            credit: 0,
            solde: 45000000,
            evolution: '+8.5%',
            trend: 'up'
        },
        {
            code: '7011',
            libelle: 'Consultations généralistes',
            classe: 7,
            type: 'produit',
            debit: 200000,
            credit: 18500000,
            solde: -18300000,
            evolution: '+14.7%',
            trend: 'up'
        },
        {
            code: '7012',
            libelle: 'Consultations spécialisées',
            classe: 7,
            type: 'produit',
            debit: 150000,
            credit: 25800000,
            solde: -25650000,
            evolution: '+19.2%',
            trend: 'up'
        }
    ];

    // Données pour le grand livre d'un compte spécifique
    const ledgerData = {
        '5711': [
            {
                date: '01/06/2025',
                journal: 'CAI',
                piece: 'REC-2025-1234',
                libelle: 'Encaissement consultation M. Kamdem',
                debit: 25000,
                credit: 0,
                solde: 25000
            },
            {
                date: '02/06/2025',
                journal: 'CAI',
                piece: 'REC-2025-1235',
                libelle: 'Paiement médicaments Mme Ngono',
                debit: 18500,
                credit: 0,
                solde: 43500
            },
            {
                date: '03/06/2025',
                journal: 'BQ',
                piece: 'VER-2025-089',
                libelle: 'Versement en banque',
                debit: 0,
                credit: 40000,
                solde: 3500
            },
            {
                date: '05/06/2025',
                journal: 'CAI',
                piece: 'REC-2025-1236',
                libelle: 'Consultation urgences',
                debit: 35000,
                credit: 0,
                solde: 38500
            },
            {
                date: '08/06/2025',
                journal: 'CAI',
                piece: 'REC-2025-1237',
                libelle: 'Hospitalisation Mme Biya',
                debit: 125000,
                credit: 0,
                solde: 163500
            }
        ]
    };

    // Statistiques pour la balance
    const balanceStats = [
        {
            label: 'Total Actif',
            value: '93 800 000 FCFA',
            change: '+7.2%',
            trend: 'up',
            icon: TrendingUp,
            color: 'text-green-600'
        },
        {
            label: 'Total Passif',
            value: '93 800 000 FCFA',
            change: '+7.2%',
            trend: 'up',
            icon: Calculator,
            color: 'text-blue-600'
        },
        {
            label: 'Équilibre',
            value: 'Parfait ✓',
            change: '0%',
            trend: 'stable',
            icon: CheckCircle2,
            color: 'text-green-600'
        },
        {
            label: 'Comptes Actifs',
            value: '47',
            change: '+3',
            trend: 'up',
            icon: Layers,
            color: 'text-purple-600'
        }
    ];

    // Classes de comptes pour les filtres
    const classesComptes = [
        { value: 'all', label: 'Toutes les classes', color: 'bg-gray-500' },
        { value: '1', label: 'Classe 1 - Capitaux', color: 'bg-blue-500' },
        { value: '2', label: 'Classe 2 - Immobilisations', color: 'bg-green-500' },
        { value: '3', label: 'Classe 3 - Stocks', color: 'bg-yellow-500' },
        { value: '4', label: 'Classe 4 - Tiers', color: 'bg-purple-500' },
        { value: '5', label: 'Classe 5 - Trésorerie', color: 'bg-indigo-500' },
        { value: '6', label: 'Classe 6 - Charges', color: 'bg-red-500' },
        { value: '7', label: 'Classe 7 - Produits', color: 'bg-emerald-500' }
    ];

    // Filtrer les données selon les critères
    const filteredBalance = balanceData.filter(account => {
        const matchesSearch = account.code.includes(searchTerm) ||
            account.libelle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = selectedClass === 'all' || account.classe.toString() === selectedClass;
        return matchesSearch && matchesClass;
    });

    // Calculs pour les totaux
    const totalDebit = filteredBalance.reduce((sum, account) => sum + account.debit, 0);
    const totalCredit = filteredBalance.reduce((sum, account) => sum + account.credit, 0);

    const handleAccountClick = (account) => {
        setSelectedAccount(account);
        setActiveView('ledger');
    };

    const exportData = () => {
        // Logique d'export
        console.log('Export des données...');
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="min-h-screen p-4">
                {/* Header */}
                <div className="ml-5 bg-gradient-to-r from-primary-end to-primary-start rounded-xl text-white p-6 md:p-8 mb-8 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">General Ledger and Trial Balance</h1>
                            <p className="opacity-90 text-sm">View detailed accounting balances and movements</p>
                        </div>
                        <div className="flex space-x-3 mt-4 md:mt-0">
                            <button
                                onClick={() => setActiveView('balance')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeView === 'balance'
                                        ? 'bg-primary-start text-white font-bold'
                                        : 'bg-blue-600/20 text-white hover:bg-blue-600/30'
                                }`}
                            >
                                <Calculator className="w-4 h-4 inline mr-2" />
                                Balance
                            </button>
                            <button
                                onClick={() => setActiveView('trial')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeView === 'trial'
                                        ? 'bg-white text-primary-end'
                                        : 'bg-blue-600/20 text-white hover:bg-blue-600/30'
                                }`}
                            >
                                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                                Balance de vérification
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {balanceStats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                        <p className={`text-sm mt-1 ${
                                            stat.trend === 'up' ? 'text-green-600' :
                                                stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {stat.change} vs période précédente
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-full bg-gray-100">
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Vue Balance Générale */}
                    {activeView === 'balance' && (
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Sidebar - Filtres */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm border">
                                    <div className="p-6 border-b">
                                        <h3 className="text-lg font-semibold text-gray-900">Filter</h3>
                                    </div>
                                    <div className="p-4">
                                        {/* Recherche */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rechercher un compte
                                            </label>
                                            <div className="relative">
                                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Code ou libellé..."
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        {/* Classes de comptes */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Classes de comptes
                                            </label>
                                            <div className="space-y-2">
                                                {classesComptes.map((classe) => (
                                                    <button
                                                        key={classe.value}
                                                        onClick={() => setSelectedClass(classe.value)}
                                                        className={`w-full flex items-center p-2 rounded-lg text-sm transition-colors ${
                                                            selectedClass === classe.value
                                                                ? `${classe.color} text-white`
                                                                : 'text-gray-700 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <div className={`w-3 h-3 rounded-full ${classe.color} mr-3 ${
                                                            selectedClass === classe.value ? 'bg-white' : ''
                                                        }`}></div>
                                                        {classe.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Période */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Période
                                            </label>
                                            <select
                                                value={dateRange}
                                                onChange={(e) => setDateRange(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end"
                                            >
                                                <option value="month">Ce mois</option>
                                                <option value="quarter">Ce trimestre</option>
                                                <option value="year">Cette année</option>
                                                <option value="custom">Période personnalisée</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Résumé */}
                                <div className="bg-white rounded-xl shadow-sm border mt-6">
                                    <div className="p-6">
                                        <h4 className="font-semibold text-gray-900 mb-4">Résumé Balance</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Débits</span>
                                                <span className="font-semibold text-green-600">
                                                    {totalDebit.toLocaleString()} FCFA
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Crédits</span>
                                                <span className="font-semibold text-primary-end">
                                                    {totalCredit.toLocaleString()} FCFA
                                                </span>
                                            </div>
                                            <div className="border-t pt-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Équilibre</span>
                                                    <span className={`font-semibold ${
                                                        totalDebit === totalCredit ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {totalDebit === totalCredit ? '✓ Équilibré' : '⚠ Déséquilibré'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Comptes affichés</span>
                                                <span className="font-semibold">{filteredBalance.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table Balance */}
                            <div className="lg:col-span-3">
                                <div className="bg-white rounded-xl shadow-sm border">
                                    <div className="p-6 border-b">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">Balance Générale</h3>
                                                <p className="text-sm text-gray-600">
                                                    {filteredBalance.length} comptes • Période : {dateRange}
                                                </p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={exportData}
                                                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center"
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Export
                                                </button>
                                                <button className="bg-teal-700 text-white px-3 py-2 rounded-lg hover:bg-primary-end flex items-center duration-300 transition-all">
                                                    <BarChart3 className="w-4 h-4 mr-1" />
                                                    Analyser
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Compte
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Libellé
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Débit
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Crédit
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Solde
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Évolution
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredBalance.map((account) => (
                                                <tr
                                                    key={account.code}
                                                    className="hover:bg-gray-50 cursor-pointer"
                                                    onClick={() => handleAccountClick(account)}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className={`w-3 h-3 rounded-full mr-3 ${
                                                                classesComptes.find(c => c.value === account.classe.toString())?.color || 'bg-gray-400'
                                                            }`}></div>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                    {account.code}
                                                                </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {account.libelle}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                        {account.debit > 0 ? account.debit.toLocaleString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                        {account.credit > 0 ? account.credit.toLocaleString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <span className={account.solde >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                                {Math.abs(account.solde).toLocaleString()}
                                                                {account.solde < 0 && ' (Cr)'}
                                                            </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center">
                                                            {account.trend === 'up' ? (
                                                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                                            ) : account.trend === 'down' ? (
                                                                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                                            ) : (
                                                                <Minus className="w-4 h-4 text-gray-400 mr-1" />
                                                            )}
                                                            <span className={`text-xs ${
                                                                account.trend === 'up' ? 'text-green-600' :
                                                                    account.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                                            }`}>
                                                                    {account.evolution}
                                                                </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAccountClick(account);
                                                            }}
                                                            className="text-primary-end hover:text-teal-800"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan="2" className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                    TOTAUX
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                                                    {totalDebit.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-semibold text-primary-end">
                                                    {totalCredit.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                                    Écart: {Math.abs(totalDebit - totalCredit).toLocaleString()}
                                                </td>
                                                <td colSpan="2" className="px-6 py-4 text-center">
                                                    {totalDebit === totalCredit ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <AlertTriangle className="w-5 h-5 text-red-500 mx-auto" />
                                                    )}
                                                </td>
                                            </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vue Grand Livre d'un compte */}
                    {activeView === 'ledger' && selectedAccount && (
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => setActiveView('balance')}
                                            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            ←
                                        </button>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                Grand Livre - {selectedAccount.code}
                                            </h3>
                                            <p className="text-sm text-gray-600">{selectedAccount.libelle}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 text-sm">
                                        <div className="text-center">
                                            <div className="text-gray-600">Solde actuel</div>
                                            <div className={`font-semibold ${selectedAccount.solde >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {Math.abs(selectedAccount.solde).toLocaleString()} FCFA
                                                {selectedAccount.solde < 0 && ' (Créditeur)'}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-gray-600">Évolution</div>
                                            <div className={`font-semibold flex items-center justify-center ${
                                                selectedAccount.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {selectedAccount.trend === 'up' ? (
                                                    <TrendingUp className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 mr-1" />
                                                )}
                                                {selectedAccount.evolution}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Journal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pièce
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Libellé
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Débit
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Crédit
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Solde
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {(ledgerData[selectedAccount.code] || []).map((movement, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {movement.date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-teal-800">
                                                        {movement.journal}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {movement.piece}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {movement.libelle}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                {movement.debit > 0 ? (
                                                    <span className="text-green-600 font-medium">
                                                            {movement.debit.toLocaleString()}
                                                        </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                {movement.credit > 0 ? (
                                                    <span className="text-red-600 font-medium">
                                                            {movement.credit.toLocaleString()}
                                                        </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <span className={movement.solde >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {Math.abs(movement.solde).toLocaleString()}
                                                        {movement.solde < 0 && ' (Cr)'}
                                                    </span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Graphique d'évolution du solde */}
                            <div className="p-6 border-t bg-gray-50">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Évolution du solde</h4>
                                <div className="h-32 bg-white rounded-lg border flex items-center justify-center">
                                    <div className="text-gray-500 flex items-center">
                                        <BarChart3 className="w-6 h-6 mr-2" />
                                        Graphique d'évolution (à implémenter avec Chart.js)
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vue Balance de Vérification */}
                    {activeView === 'trial' && (
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-6 border-b">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">Balance de Vérification</h3>
                                        <p className="text-sm text-gray-600">
                                            Vérification de l'égalité Débits = Crédits
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className={`flex items-center px-4 py-2 rounded-lg ${
                                            totalDebit === totalCredit
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {totalDebit === totalCredit ? (
                                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                            ) : (
                                                <AlertTriangle className="w-5 h-5 mr-2" />
                                            )}
                                            <span className="font-medium">
                                                {totalDebit === totalCredit ? 'Balance équilibrée' : 'Balance déséquilibrée'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={exportData}
                                            className="bg-primary-end text-white px-4 py-2 rounded-lg hover:bg-teal-700 duration-300 transition-all flex items-center"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Export PDF
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Résumé de vérification */}
                            <div className="p-6 bg-gray-50 border-b">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-lg p-4 border">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {totalDebit.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">Total Débits (FCFA)</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary-end">
                                                {totalCredit.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">Total Crédits (FCFA)</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border">
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${
                                                totalDebit === totalCredit ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {Math.abs(totalDebit - totalCredit).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {totalDebit === totalCredit ? 'Parfait équilibre' : 'Écart à corriger (FCFA)'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table détaillée par classe */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Classe
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nb Comptes
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Débits
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Crédits
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Solde Net
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Statut
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {classesComptes.filter(c => c.value !== 'all').map((classe) => {
                                        const comptes = balanceData.filter(account => account.classe.toString() === classe.value);
                                        const debitTotal = comptes.reduce((sum, account) => sum + account.debit, 0);
                                        const creditTotal = comptes.reduce((sum, account) => sum + account.credit, 0);
                                        const soldeNet = debitTotal - creditTotal;

                                        return (
                                            <tr key={classe.value} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className={`w-4 h-4 rounded-full ${classe.color} mr-3`}></div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                                Classe {classe.value}
                                                            </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {classe.label.split(' - ')[1]}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                                                    {comptes.length}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
                                                    {debitTotal.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-primary-end font-medium">
                                                    {creditTotal.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <span className={soldeNet >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                            {Math.abs(soldeNet).toLocaleString()}
                                                            {soldeNet < 0 && ' (Cr)'}
                                                        </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                    <tfoot className="bg-gray-900 text-white">
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-sm font-bold">
                                            TOTAUX GÉNÉRAUX
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold">
                                            {totalDebit.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold">
                                            {totalCredit.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold">
                                            {Math.abs(totalDebit - totalCredit).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {totalDebit === totalCredit ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto" />
                                            ) : (
                                                <AlertTriangle className="w-5 h-5 text-red-400 mx-auto" />
                                            )}
                                        </td>
                                    </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Recommandations */}
                            {totalDebit !== totalCredit && (
                                <div className="p-6 bg-red-50 border-t">
                                    <div className="flex items-start">
                                        <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-1" />
                                        <div>
                                            <h4 className="text-lg font-semibold text-red-800 mb-2">
                                                Balance déséquilibrée détectée
                                            </h4>
                                            <p className="text-red-700 mb-3">
                                                Un écart de {Math.abs(totalDebit - totalCredit).toLocaleString()} FCFA a été détecté.
                                                Voici les actions recommandées :
                                            </p>
                                            <ul className="list-disc list-inside text-red-700 space-y-1">
                                                <li>Vérifier les écritures saisies récemment</li>
                                                <li>Contrôler les reports de soldes</li>
                                                <li>Examiner les écritures non validées</li>
                                                <li>Contacter l'auditeur si l'écart persiste</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AccountantDashBoard>
    );
}