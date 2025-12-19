import React, { useState, useEffect } from 'react';
import { Calendar, Calculator, AlertTriangle, Download, Send, CheckCircle2, Clock, Edit3, Save, X, Plus, Trash2, Settings, TrendingUp, FileText, Bell } from 'lucide-react';
import {FinancialAccountantNavLink} from "../NavLink.js";
import {AccountantNavBar} from "../../Accountant/Components/AccountantNavBar.jsx";
import {AccountantDashBoard} from "../../Accountant/Components/AccountantDashboard.jsx";

export function SocialChargesCalculator() {
    // État pour les données de charges sociales avec structure plus flexible
    const [chargesData, setChargesData] = useState({
        masseSalariale: 45000000,
        effectif: 87,
        periode: '2025-06',
        declarations: []
    });

    // Configuration modifiable des taux des charges sociales
    const [taxRates, setTaxRates] = useState([
        {
            id: 'cnps_salarie',
            name: 'CNPS Salarié',
            category: 'cnps',
            type: 'percentage',
            rate: 4.2,
            base: 'masseSalariale',
            payedBy: 'employee',
            description: 'Cotisation salariale CNPS (retraite)',
            mandatory: true,
            color: 'blue'
        },
        {
            id: 'cnps_employeur',
            name: 'CNPS Employeur',
            category: 'cnps',
            type: 'percentage',
            rate: 7.4,
            base: 'masseSalariale',
            payedBy: 'employer',
            description: 'Cotisation patronale CNPS',
            mandatory: true,
            color: 'blue'
        },
        {
            id: 'taxe_formation',
            name: 'Taxe Formation Professionnelle',
            category: 'taxes',
            type: 'percentage',
            rate: 1.2,
            base: 'masseSalariale',
            payedBy: 'employer',
            description: 'Financement de la formation professionnelle',
            mandatory: true,
            color: 'green'
        },
        {
            id: 'crtv',
            name: 'CRTV',
            category: 'taxes',
            type: 'fixed',
            rate: 1000,
            base: 'effectif',
            payedBy: 'employer',
            description: 'Redevance audiovisuelle mensuelle',
            mandatory: true,
            color: 'orange'
        }
    ]);

    // État pour l'édition des taux
    const [editingTax, setEditingTax] = useState(null);
    const [showAddTaxModal, setShowAddTaxModal] = useState(false);

    // Nouvelle taxe à ajouter
    const [newTax, setNewTax] = useState({
        name: '',
        category: 'taxes',
        type: 'percentage',
        rate: 0,
        base: 'masseSalariale',
        payedBy: 'employer',
        description: '',
        mandatory: false,
        color: 'purple'
    });

    // Calculs dynamiques basés sur les taux configurés
    const calculations = React.useMemo(() => {
        const results = {};
        let totalEmployee = 0;
        let totalEmployer = 0;

        taxRates.forEach(tax => {
            const baseAmount = tax.base === 'masseSalariale' ? chargesData.masseSalariale : chargesData.effectif;
            const amount = tax.type === 'percentage' ?
                baseAmount * (tax.rate / 100) :
                baseAmount * tax.rate;

            results[tax.id] = amount;

            if (tax.payedBy === 'employee') {
                totalEmployee += amount;
            } else {
                totalEmployer += amount;
            }
        });

        results.totalEmployee = totalEmployee;
        results.totalEmployer = totalEmployer;
        results.totalCharges = totalEmployee + totalEmployer;
        results.totalCnps = (results.cnps_salarie || 0) + (results.cnps_employeur || 0);

        return results;
    }, [taxRates, chargesData.masseSalariale, chargesData.effectif]);

    // Échéances générées dynamiquement
    const deadlines = React.useMemo(() => {
        return [
            {
                id: 1,
                type: 'CNPS',
                description: 'Déclaration et paiement CNPS',
                deadline: '2025-07-15',
                amount: calculations.totalCnps,
                status: 'pending',
                priority: 'high',
                color: 'blue'
            },
            {
                id: 2,
                type: 'Formation',
                description: 'Taxe de formation professionnelle',
                deadline: '2025-07-31',
                amount: calculations.taxe_formation || 0,
                status: 'pending',
                priority: 'medium',
                color: 'green'
            },
            {
                id: 3,
                type: 'CRTV',
                description: 'Redevance audiovisuelle CRTV',
                deadline: '2025-07-10',
                amount: calculations.crtv || 0,
                status: 'pending',
                priority: 'high',
                color: 'orange'
            }
        ];
    }, [calculations]);

    // Fonction de formatage améliorée
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount).replace('XAF', 'FCFA');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const getDaysUntilDeadline = (deadline) => {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getPriorityColor = (deadline) => {
        const days = getDaysUntilDeadline(deadline);
        if (days <= 5) return 'text-red-600 bg-red-50 border-red-200';
        if (days <= 15) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    // Fonctions de gestion des taxes
    const startEditingTax = (tax) => {
        setEditingTax({ ...tax });
    };

    const saveEditingTax = () => {
        setTaxRates(prev => prev.map(tax =>
            tax.id === editingTax.id ? editingTax : tax
        ));
        setEditingTax(null);
    };

    const cancelEditingTax = () => {
        setEditingTax(null);
    };

    const addNewTax = () => {
        const newTaxWithId = {
            ...newTax,
            id: Date.now().toString()
        };
        setTaxRates(prev => [...prev, newTaxWithId]);
        setNewTax({
            name: '',
            category: 'taxes',
            type: 'percentage',
            rate: 0,
            base: 'masseSalariale',
            payedBy: 'employer',
            description: '',
            mandatory: false,
            color: 'purple'
        });
        setShowAddTaxModal(false);
    };

    const deleteTax = (taxId) => {
        setTaxRates(prev => prev.filter(tax => tax.id !== taxId && tax.mandatory));
    };

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            green: 'bg-green-50 text-green-700 border-green-200',
            orange: 'bg-orange-50 text-orange-700 border-orange-200',
            purple: 'bg-purple-50 text-purple-700 border-purple-200',
            red: 'bg-red-50 text-red-700 border-red-200'
        };
        return colors[color] || colors.purple;
    };

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar></AccountantNavBar>
        <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {/* En-tête modernisé */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-end to-primary-start rounded-full -mr-16 -mt-16"></div>
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-primary-end to-primary-start rounded-xl">
                            <Calculator className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Charges Sociales
                            </h1>
                            <p className="text-gray-600 mt-1">Calculs automatiques et gestion des échéances</p>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-500">Période de paie</p>
                        <p className="text-2xl font-bold text-gray-800">{chargesData.periode}</p>
                        <div className="flex items-center mt-2 text-sm text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Calculs à jour
                        </div>
                    </div>
                </div>
            </div>

            {/* Paramètres de calcul améliorés */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Paramètres de Calcul</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Settings className="h-4 w-4" />
                        Configuration de base
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Masse salariale brute
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={chargesData.masseSalariale}
                                onChange={(e) => setChargesData(prev => ({
                                    ...prev,
                                    masseSalariale: parseInt(e.target.value) || 0
                                }))}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder="Montant en FCFA"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <span className="text-sm text-gray-500 font-medium">FCFA</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Montant : {formatCurrency(chargesData.masseSalariale)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Nombre de salariés
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={chargesData.effectif}
                                onChange={(e) => setChargesData(prev => ({
                                    ...prev,
                                    effectif: parseInt(e.target.value) || 0
                                }))}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                placeholder="Nombre d'employés"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <span className="text-sm text-gray-500 font-medium">employés</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Effectif total déclaré
                        </p>
                    </div>
                </div>
            </div>

            {/* Récapitulatif des charges avec design moderne */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    {
                        label: 'Total CNPS',
                        amount: calculations.totalCnps,
                        desc: 'Salarié + Employeur',
                        color: 'from-blue-500 to-blue-600',
                        icon: ''
                    },
                    {
                        label: 'Taxe Formation',
                        amount: calculations.taxe_formation || 0,
                        desc: '1,2% masse salariale',
                        color: 'from-green-500 to-green-600',
                        icon: ''
                    },
                    {
                        label: 'CRTV',
                        amount: calculations.crtv || 0,
                        desc: `${chargesData.effectif} × 1 000 FCFA`,
                        color: 'from-orange-500 to-orange-600',
                        icon: ''
                    },
                    {
                        label: 'Total Charges',
                        amount: calculations.totalCharges,
                        desc: 'Toutes charges comprises',
                        color: 'from-purple-500 to-purple-600',
                        icon: ''
                    }
                ].map((item, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${item.color} rounded-full -mr-10 -mt-10 opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-2xl">{item.icon}</span>
                                <div className={`px-3 py-1 bg-gradient-to-r ${item.color} text-white rounded-full text-xs font-semibold`}>
                                    CALCULÉ
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">{item.label}</p>
                            <p className="text-2xl font-bold text-gray-800 my-2">{formatCurrency(item.amount)}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Configuration des taxes avec interface intuitive */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Configuration des Taxes</h2>
                    <button
                        onClick={() => setShowAddTaxModal(true)}
                        className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-end to-primary-start text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une taxe
                    </button>
                </div>

                <div className="space-y-4">
                    {taxRates.map((tax) => (
                        <div key={tax.id} className={`border-2 rounded-xl p-6 transition-all duration-200 ${getColorClasses(tax.color)}`}>
                            {editingTax && editingTax.id === tax.id ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            value={editingTax.name}
                                            onChange={(e) => setEditingTax(prev => ({ ...prev, name: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Nom de la taxe"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={editingTax.rate}
                                                onChange={(e) => setEditingTax(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            />
                                            <span className="text-sm font-medium">
                                                {editingTax.type === 'percentage' ? '%' : 'FCFA'}
                                            </span>
                                        </div>
                                        <select
                                            value={editingTax.base}
                                            onChange={(e) => setEditingTax(prev => ({ ...prev, base: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="masseSalariale">Masse salariale</option>
                                            <option value="effectif">Effectif</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <input
                                            type="text"
                                            value={editingTax.description}
                                            onChange={(e) => setEditingTax(prev => ({ ...prev, description: e.target.value }))}
                                            className="flex-1 mr-4 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="Description"
                                        />
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={saveEditingTax}
                                                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                <Save className="h-4 w-4 mr-1" />
                                                Sauvegarder
                                            </button>
                                            <button
                                                onClick={cancelEditingTax}
                                                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Annuler
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="font-bold text-lg">{tax.name}</h3>
                                            <span className="px-2 py-1 bg-white rounded-full text-xs font-semibold">
                                                {tax.type === 'percentage' ? `${tax.rate}%` : `${tax.rate} FCFA`}
                                            </span>
                                            <span className="px-2 py-1 bg-white rounded-full text-xs">
                                                {tax.base === 'masseSalariale' ? 'Sur masse salariale' : 'Par employé'}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1 opacity-80">{tax.description}</p>
                                        <div className="flex items-center space-x-4 mt-3">
                                            <span className="text-sm font-medium">
                                                Base: {tax.base === 'masseSalariale' ? formatCurrency(chargesData.masseSalariale) : `${chargesData.effectif} employés`}
                                            </span>
                                            <span className="text-lg font-bold">
                                                Montant: {formatCurrency(calculations[tax.id] || 0)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => startEditingTax(tax)}
                                            className="p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        {!tax.mandatory && (
                                            <button
                                                onClick={() => deleteTax(tax.id)}
                                                className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Échéances avec design moderne */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <Calendar className="h-6 w-6 text-purple-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Échéances de Déclaration</h2>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-orange-600">
                        <Bell className="h-4 w-4" />
                        {deadlines.filter(d => getDaysUntilDeadline(d.deadline) <= 15).length} échéance(s) proche(s)
                    </div>
                </div>

                <div className="space-y-6">
                    {deadlines.map((deadline) => {
                        const daysLeft = getDaysUntilDeadline(deadline.deadline);
                        const priorityClass = getPriorityColor(deadline.deadline);

                        return (
                            <div key={deadline.id} className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="font-bold text-xl text-gray-800">{deadline.type}</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${priorityClass}`}>
                                                {daysLeft > 0 ? `${daysLeft} jours restants` : 'Échéance dépassée'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3">{deadline.description}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-600">
                                                    Échéance : {formatDate(deadline.deadline)}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-lg font-bold text-gray-800">
                                                    {formatCurrency(deadline.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        {deadline.status === 'pending' && (
                                            <>
                                                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105">
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Générer
                                                </button>
                                                <button className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105">
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Déclarer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal pour ajouter une nouvelle taxe */}
            {showAddTaxModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-6">Ajouter une nouvelle taxe</h3>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={newTax.name}
                                onChange={(e) => setNewTax(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Nom de la taxe"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <select
                                        value={newTax.type}
                                        onChange={(e) => setNewTax(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="percentage">Pourcentage</option>
                                        <option value="fixed">Montant fixe</option>
                                    </select>
                                </div>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={newTax.rate}
                                    onChange={(e) => setNewTax(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Taux"
                                />
                            </div>

                            <select
                                value={newTax.base}
                                onChange={(e) => setNewTax(prev => ({ ...prev, base: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="masseSalariale">Masse salariale</option>
                                <option value="effectif">Effectif</option>
                            </select>

                            <textarea
                                value={newTax.description}
                                onChange={(e) => setNewTax(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Description"
                                rows="3"
                            />
                        </div>

                        <div className="flex space-x-4 mt-6">
                            <button
                                onClick={addNewTax}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold"
                            >
                                Ajouter
                            </button>
                            <button
                                onClick={() => setShowAddTaxModal(false)}
                                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
            </AccountantDashBoard>
    );
}