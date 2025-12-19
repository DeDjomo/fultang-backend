"use client"

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2, Eye, BookOpen, CheckCircle, FileText, TrendingDown, TrendingUp, AlertTriangle, Save, Send, Filter } from "lucide-react";
import {AccountantDashBoard} from "../../Accountant/Components/AccountantDashboard.jsx";
import { v4 as uuidv4 } from 'uuid';
import {FinancialAccountantNavLink} from "../NavLink.js";
import {AccountantNavBar} from "../../Accountant/Components/AccountantNavBar.jsx";

// Thème de couleurs modernisé inspiré de la seconde interface
const themeColors = {
    primaryEnd: 'from-teal-600 to-teal-800',
    primaryStart: 'from-teal-500 to-teal-700',
    secondary: 'teal-600',
    focusRing: 'focus:ring-teal-500',
    textPrimaryEnd: 'text-teal-800',
    textPrimaryStart: 'text-teal-600',
    bgPrimary: 'bg-teal-600',
    bgPrimaryHover: 'hover:bg-teal-700',
    borderPrimary: 'border-teal-600',
};

// Données d'exemple pour les comptes (normalement viendraient d'une API)
const sampleChartOfAccounts = [
    { code: "6132", label: "Loyers", type: "Charge" },
    { code: "5121", label: "Banque BICEC", type: "Actif" },
    { code: "7011", label: "Consultations médicales", type: "Produit" },
    { code: "4011", label: "Fournisseurs", type: "Passif" },
    { code: "4111", label: "Clients", type: "Actif" },
];

// Données d'exemple pour les journaux
const journalTypes = [
    { code: "AC", name: "Achats" },
    { code: "VT", name: "Ventes" },
    { code: "BQ", name: "Banque" },
    { code: "OD", name: "Opérations Diverses" },
];

export function JournalEntries() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [journalFilter, setJournalFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [entriesList, setEntriesList] = useState([]);
    const [showEntryModal, setShowEntryModal] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const initialEntryLine = () => ({
        id: uuidv4(),
        accountId: "",
        accountLabel: "",
        lineLabel: "",
        debit: "",
        credit: ""
    });

    const sampleEntries = [
        {
            id: 'entry1',
            journal: "OD",
            date: "2024-07-20",
            reference: "LOY-2024-07",
            generalLabel: "Loyer juillet 2024",
            status: "Validée",
            totalDebit: 500000,
            totalCredit: 500000,
            lines: [
                { id: uuidv4(), accountId: "6132", accountLabel: "Loyers", lineLabel: "Loyer Bureau Principal", debit: 500000, credit: "" },
                { id: uuidv4(), accountId: "5121", accountLabel: "Banque BICEC", lineLabel: "Paiement Loyer", debit: "", credit: 500000 }
            ],
            validatedAt: "2024-07-21T10:00:00Z"
        },
        {
            id: 'entry2',
            journal: "AC",
            date: "2024-07-19",
            reference: "FAC-00123",
            generalLabel: "Achat fournitures de bureau",
            status: "Brouillon",
            totalDebit: 75000,
            totalCredit: 0,
            lines: [
                { id: uuidv4(), accountId: "6064", accountLabel: "Fournitures de bureau", lineLabel: "", debit: 75000, credit: "" }
            ]
        }
    ];

    const loadJournalEntries = useCallback(async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setEntriesList(sampleEntries);
            setErrorStatus(null);
        } catch (error) {
            console.error(error);
            setErrorStatus(500);
            setErrorMessage("Erreur lors du chargement des écritures.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadJournalEntries();
    }, [loadJournalEntries]);

    const filteredEntries = entriesList.filter(entry => {
        const matchesSearch = entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.generalLabel.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || entry.status === statusFilter;
        const matchesJournal = !journalFilter || entry.journal === journalFilter;
        return matchesSearch && matchesStatus && matchesJournal;
    });

    const handleOpenCreateModal = () => {
        setEditingEntry(null);
        setIsViewMode(false);
        setShowEntryModal(true);
    };

    const handleOpenEditModal = (entry) => {
        setEditingEntry(entry);
        setIsViewMode(false);
        setShowEntryModal(true);
    };

    const handleOpenViewModal = (entry) => {
        setEditingEntry(entry);
        setIsViewMode(true);
        setShowEntryModal(true);
    };

    const handleSaveEntry = async (entryData, isValidationIntent) => {
        console.log("Saving entry:", entryData, "Validation Intent:", isValidationIntent);
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        let newStatus = entryData.status;
        if (isValidationIntent) {
            if (entryData.totalDebit === entryData.totalCredit && entryData.totalDebit > 0) {
                newStatus = "Validée";
                console.log("Simulating validation for entry ID:", entryData.id);
            } else {
                alert("L'écriture doit être équilibrée pour être validée.");
                setIsLoading(false);
                return;
            }
        } else {
            if (entryData.totalDebit === entryData.totalCredit && entryData.totalDebit > 0) {
                newStatus = "Équilibrée";
            } else {
                newStatus = "Brouillon";
            }
        }

        const finalEntryData = {...entryData, status: newStatus};

        if (editingEntry && editingEntry.id) {
            setEntriesList(prev => prev.map(e => e.id === finalEntryData.id ? finalEntryData : e));
        } else {
            setEntriesList(prev => [{ ...finalEntryData, id: uuidv4() }, ...prev]);
        }
        setShowEntryModal(false);
        setEditingEntry(null);
        setIsLoading(false);
    };

    const handleDeleteEntry = async (entryId) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette écriture (si brouillon) ?")) {
            const entryToDelete = entriesList.find(e => e.id === entryId);
            if (entryToDelete && entryToDelete.status === "Brouillon") {
                setIsLoading(true);
                await new Promise(resolve => setTimeout(resolve, 500));
                setEntriesList(prev => prev.filter(e => e.id !== entryId));
                setIsLoading(false);
            } else {
                alert("Seules les écritures en brouillon peuvent être supprimées.");
            }
        }
    };

    function formatAmount(amount) {
        if (amount === "" || amount === null || amount === undefined) return "";
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
    }

    function formatDate(dateString) {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function EntryModal({ entry, onClose, onSave, viewMode }) {
        const [formData, setFormData] = useState({
            journal: entry?.journal || "OD",
            date: entry?.date || new Date().toISOString().split('T')[0],
            reference: entry?.reference || "",
            generalLabel: entry?.generalLabel || "",
            lines: entry?.lines?.map(l => ({...l, debit: l.debit || "", credit: l.credit || ""})) || [initialEntryLine()],
            status: entry?.status || "Brouillon"
        });
        const [totalDebit, setTotalDebit] = useState(0);
        const [totalCredit, setTotalCredit] = useState(0);
        const [isBalanced, setIsBalanced] = useState(false);

        useEffect(() => {
            const debits = formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
            const credits = formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
            setTotalDebit(debits);
            setTotalCredit(credits);
            setIsBalanced(debits === credits && debits > 0);
        }, [formData.lines]);

        const handleInputChange = (e, field) => {
            setFormData(prev => ({ ...prev, [field]: e.target.value }));
        };

        const handleLineChange = (index, field, value) => {
            const newLines = [...formData.lines];
            newLines[index][field] = value;

            if (field === "accountId") {
                const selectedAccount = sampleChartOfAccounts.find(acc => acc.code === value);
                newLines[index].accountLabel = selectedAccount ? selectedAccount.label : "";
            }

            if (field === "debit" && value !== "") newLines[index].credit = "";
            if (field === "credit" && value !== "") newLines[index].debit = "";

            setFormData(prev => ({ ...prev, lines: newLines }));
        };

        const addLine = () => {
            if (viewMode || formData.status === "Validée") return;
            setFormData(prev => ({ ...prev, lines: [...prev.lines, initialEntryLine()] }));
        };

        const removeLine = (index) => {
            if (viewMode || formData.status === "Validée") return;
            if (formData.lines.length <= 1) {
                alert("Une écriture doit comporter au moins une ligne.");
                return;
            }
            const newLines = formData.lines.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, lines: newLines }));
        };

        const handleSubmit = (isValidationIntent = false) => {
            if (viewMode) { onClose(); return; }

            if (!formData.journal || !formData.date || !formData.reference || !formData.generalLabel) {
                alert("Veuillez remplir les informations générales de l'écriture (Journal, Date, N° Pièce, Libellé).");
                return;
            }
            if (formData.lines.some(line => !line.accountId || (line.debit === "" && line.credit === ""))) {
                alert("Chaque ligne doit avoir un compte et un montant (débit ou crédit).");
                return;
            }

            if (isValidationIntent && !isBalanced) {
                alert("L'écriture doit être équilibrée (Total Débit = Total Crédit et > 0) pour être validée.");
                return;
            }

            onSave({ ...formData, totalDebit, totalCredit, status: formData.status }, isValidationIntent);
        };

        const canEdit = !viewMode && formData.status !== "Validée";

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl transform transition-all max-h-[90vh] flex flex-col animate-in duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className={`text-3xl font-bold ${themeColors.textPrimaryEnd}`}>
                            {viewMode ? " Détail de l'écriture" : (entry?.id ? " Modifier l'écriture" : "➕ Nouvelle écriture comptable")}
                        </h2>
                        {formData.status === "Validée" &&
                            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                                 Validée
                            </span>
                        }
                    </div>

                    <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                        {/* Infos générales */}
                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
                            <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                                <BookOpen size={20} className="mr-2" />
                                Informations générales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Journal</label>
                                    <select value={formData.journal} onChange={(e) => handleInputChange(e, 'journal')} disabled={!canEdit}
                                            className={`w-full px-4 py-3 border border-gray-300 rounded-xl ${themeColors.focusRing} transition-all ${!canEdit ? 'bg-gray-100' : 'hover:border-teal-400'}`}>
                                        {journalTypes.map(jt => <option key={jt.code} value={jt.code}>{jt.code} - {jt.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                    <input type="date" value={formData.date} onChange={(e) => handleInputChange(e, 'date')} disabled={!canEdit}
                                           className={`w-full px-4 py-3 border border-gray-300 rounded-xl ${themeColors.focusRing} transition-all ${!canEdit ? 'bg-gray-100' : 'hover:border-teal-400'}`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">N° Pièce</label>
                                    <input type="text" placeholder="Ex: LOY-2025-06" value={formData.reference} onChange={(e) => handleInputChange(e, 'reference')} disabled={!canEdit}
                                           className={`w-full px-4 py-3 border border-gray-300 rounded-xl ${themeColors.focusRing} transition-all ${!canEdit ? 'bg-gray-100' : 'hover:border-teal-400'}`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Libellé général</label>
                                    <input type="text" placeholder="Ex: Loyer juin 2025" value={formData.generalLabel} onChange={(e) => handleInputChange(e, 'generalLabel')} disabled={!canEdit}
                                           className={`w-full px-4 py-3 border border-gray-300 rounded-xl ${themeColors.focusRing} transition-all ${!canEdit ? 'bg-gray-100' : 'hover:border-teal-400'}`} />
                                </div>
                            </div>
                        </div>

                        {/* Lignes d'écriture */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <TrendingUp size={20} className="mr-2 text-teal-600" />
                                    Lignes d'écriture
                                </h3>
                                {canEdit && (
                                    <button type="button" onClick={addLine}
                                            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg">
                                        <Plus size={18} className="mr-2" /> Ajouter une ligne
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {formData.lines.map((line, index) => (
                                    <div key={line.id} className="grid grid-cols-12 gap-3 items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200">
                                        <div className="col-span-12 md:col-span-3">
                                            <select value={line.accountId} disabled={!canEdit}
                                                    onChange={(e) => handleLineChange(index, 'accountId', e.target.value)}
                                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${themeColors.focusRing} transition-all ${!canEdit ? 'bg-gray-100' : 'hover:border-teal-400'}`}>
                                                <option value="">Choisir un compte</option>
                                                {sampleChartOfAccounts.map(acc => <option key={acc.code} value={acc.code}>{acc.code} - {acc.label}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-span-12 md:col-span-4">
                                            <input type="text" placeholder="Libellé spécifique" value={line.lineLabel} disabled={!canEdit}
                                                   onChange={(e) => handleLineChange(index, 'lineLabel', e.target.value)}
                                                   className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${themeColors.focusRing} transition-all ${!canEdit ? 'bg-gray-100' : 'hover:border-teal-400'}`} />
                                        </div>
                                        <div className="col-span-5 md:col-span-2">
                                            <input type="number" placeholder="Débit" value={line.debit} disabled={!canEdit}
                                                   onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                                                   className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right ${themeColors.focusRing} transition-all ${!canEdit ? 'bg-gray-100' : 'hover:border-teal-400'}`} />
                                        </div>
                                        <div className="col-span-5 md:col-span-2">
                                            <input type="number" placeholder="Crédit" value={line.credit} disabled={!canEdit}
                                                   onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                                                   className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right ${themeColors.focusRing} transition-all ${!canEdit ? 'bg-gray-100' : 'hover:border-teal-400'}`} />
                                        </div>
                                        <div className="col-span-2 md:col-span-1 text-right">
                                            {canEdit && formData.lines.length > 0 && (
                                                <button type="button" onClick={() => removeLine(index)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-300"
                                                        title="Supprimer ligne">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totaux et Équilibre */}
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
                            <div className="flex justify-between items-center text-lg font-semibold mb-4">
                                <span className="flex items-center">
                                    <TrendingUp size={20} className="mr-2 text-green-600" />
                                    Total Débit: <span className="text-green-600 ml-2">{formatAmount(totalDebit)}</span>
                                </span>
                                <span className="flex items-center">
                                    <TrendingDown size={20} className="mr-2 text-red-600" />
                                    Total Crédit: <span className="text-red-600 ml-2">{formatAmount(totalCredit)}</span>
                                </span>
                            </div>
                            <div className={`text-center font-bold p-4 rounded-xl transition-all ${isBalanced ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                {isBalanced ?
                                    <div className="flex items-center justify-center">
                                        <CheckCircle size={24} className="mr-2" />
                                         Écriture Équilibrée
                                    </div> :
                                    <div className="flex items-center justify-center">
                                        <AlertTriangle size={24} className="mr-2" />
                                         Écriture Déséquilibrée: {formatAmount(totalDebit - totalCredit)}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Actions du Modal */}
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-auto">
                        <button type="button" onClick={onClose}
                                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-300 font-medium">
                            {viewMode ? "Fermer" : "Annuler"}
                        </button>
                        {!viewMode && formData.status !== "Validée" && (
                            <button type="button" onClick={() => handleSubmit(false)} disabled={isLoading}
                                    className="flex items-center px-6 py-3 border border-teal-300 rounded-xl text-teal-600 hover:bg-teal-50 transition-all duration-300 font-medium">
                                <Save size={18} className="mr-2" /> Sauvegarder Brouillon
                            </button>
                        )}
                        {!viewMode && formData.status !== "Validée" && (
                            <button type="button" onClick={() => handleSubmit(true)} disabled={isLoading || !isBalanced}
                                    className="flex items-center px-6 py-3 text-white rounded-xl bg-gradient-to-r from-teal-600 to-teal-800 font-semibold hover:from-teal-700 hover:to-teal-900 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl">
                                <Send size={18} className="mr-2" /> {entry?.status === "Équilibrée" ? "Valider l'écriture" : "Sauvegarder et Valider"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }



    if (errorStatus) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-red-200">
                    <h2 className="text-2xl font-bold text-red-600 mb-3"> Erreur {errorStatus}</h2>
                    <p className="text-gray-700">{errorMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar></AccountantNavBar>
        <div className="bg-white min-h-screen p-4 md:p-8">
            <div className="max-w-full mx-auto">
                {/* Header modernisé */}
                <div className="bg-gradient-to-r from-primary-end to-primary-start  rounded-2xl text-white p-8 mb-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-2 flex items-center">
                                 Saisie des Écritures Comptables
                            </h1>
                            <p className="opacity-90 text-lg">Enregistrez et gérez les opérations financières avec style.</p>
                        </div>
                        <button onClick={handleOpenCreateModal}
                                className="mt-6 md:mt-0 flex items-center px-6 py-3 bg-white text-teal-700 rounded-xl font-semibold shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <Plus className="h-6 w-6 mr-2" />
                             Nouvelle Écriture
                        </button>
                    </div>
                </div>

                {/* Filtres modernisés */}
                <div className="bg-gray-100 rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
                    <div className="flex items-center mb-4">
                        <Filter className="h-6 w-6 text-primary-end mr-2" />
                        <h2 className="text-xl font-semibold text-gray-800">Filtres de recherche</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input type="text" placeholder=" Rechercher par N° Pièce ou Libellé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                   className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:bg-primary-end focus:border-primary-end transition-all hover:border-primary-end" />
                        </div>
                        <select value={journalFilter} onChange={(e) => setJournalFilter(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-end focus:border-primary-end transition-all hover:border-primary-end">
                            <option value=""> Tous les journaux</option>
                            {journalTypes.map(jt => <option key={jt.code} value={jt.code}>{jt.name} ({jt.code})</option>)}
                        </select>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-end focus:border-primary-end transition-all hover:border-primary-end">
                            <option value=""> Tous les statuts</option>
                            <option value="Brouillon"> Brouillon</option>
                            <option value="Équilibrée"> Équilibrée</option>
                            <option value="Validée"> Validée</option>
                        </select>
                    </div>
                </div>

                {/* Tableau modernisé */}
                {filteredEntries && filteredEntries.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <div>
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-primary-end to-primary-start">
                                <tr>
                                    {[' Date', ' N° Pièce', ' Journal', ' Libellé', ' Débit', ' Crédit', ' Statut', ' Actions'].map((header, index) => (
                                        <th key={header} className={`px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider ${index === 0 ? 'rounded-tl-2xl' : ''} ${index === 7 ? 'rounded-tr-2xl' : ''}`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {filteredEntries.map((entry, index) => (
                                    <tr key={entry.id} className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-all duration-300 group">
                                        <td className={`px-6 py-4 whitespace-nowrap border-l-4 ${entry.status === "Validée" ? 'border-green-500' : entry.status === "Équilibrée" ? 'border-teal-500' : 'border-yellow-500'}`}>
                                            <div className="text-sm text-gray-900 font-medium">{formatDate(entry.date)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{entry.reference}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                                                {entry.journal}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate font-medium" title={entry.generalLabel}>{entry.generalLabel}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold text-right">{formatAmount(entry.totalDebit)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-bold text-right">{formatAmount(entry.totalCredit)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${
                                                entry.status === 'Validée' ? 'bg-green-100 text-green-800' :
                                                    entry.status === 'Équilibrée' ? 'bg-teal-100 text-teal-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {entry.status === 'Validée' ? '' : entry.status === 'Équilibrée' ? '⚖️' : '📝'} {entry.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => handleOpenViewModal(entry)}
                                                        className="text-teal-600 hover:text-teal-800 hover:bg-teal-50 p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                        title="Voir détails">
                                                    <Eye size={18} />
                                                </button>
                                                {entry.status !== "Validée" && (
                                                    <button onClick={() => handleOpenEditModal(entry)}
                                                            className="text-yellow-500 hover:text-yellow-700 hover:bg-yellow-50 p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                            title="Modifier">
                                                        <Edit2 size={18} />
                                                    </button>
                                                )}
                                                {entry.status === "Brouillon" && (
                                                    <button onClick={() => handleDeleteEntry(entry.id)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
                                                            title="Supprimer">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                ) : (

                    <div className="text-center bg-white p-16 rounded-2xl shadow-xl border border-gray-100">
                        <div className="mb-8 relative">
                            <FileText className="h-24 w-24 mx-auto text-primary-end opacity-70" />
                            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full bg-teal-200 rounded-full animate-ping opacity-25"></span>
                        </div>
                        <h2 className="text-3xl font-bold text-teal-700 mb-4"> Aucune écriture trouvée</h2>
                        <p className="text-gray-600 mb-8 text-lg max-w-xl mx-auto">
                            Commencez à enregistrer vos opérations financières ou ajustez vos filtres de recherche pour trouver les écritures existantes.
                        </p>
                        <button onClick={handleOpenCreateModal}
                                className="inline-flex items-center px-8 py-4 text-white rounded-xl bg-gradient-to-r from-primary-end to-teal-800 font-semibold hover:from-teal-700 hover:to-teal-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                            <Plus size={24} className="mr-3" />
                             Créer votre première écriture
                        </button>
                    </div>
                )}

                {showEntryModal && (
                    <EntryModal
                        entry={editingEntry}
                        viewMode={isViewMode}
                        onClose={() => { setShowEntryModal(false); setEditingEntry(null); setIsViewMode(false); }}
                        onSave={handleSaveEntry}
                    />
                )}
            </div>
        </div>
        </AccountantDashBoard>
    );
}