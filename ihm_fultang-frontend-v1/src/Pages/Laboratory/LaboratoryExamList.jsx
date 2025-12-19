"use client"

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit2, Trash2, Calculator, Building, Package, Users, Banknote, TrendingDown, TrendingUp, Eye, ChevronDown, ChevronUp } from "lucide-react"; // Ajout ChevronDown/Up pour la cohérence si besoin futur
import {AccountantNavBar} from "../../Accountant/Components/AccountantNavBar.jsx";
import {AccountantDashBoard} from "../../Accountant/Components/AccountantDashboard.jsx";
import {FinancialAccountantNavLink} from "../NavLink.js";

// Simulez vos couleurs de thème si elles ne sont pas dans Tailwind par défaut
// Exemple : primary-end -> blue-700, primary-start -> blue-500
// Vous pouvez les définir dans votre tailwind.config.js ou les remplacer directement ici.
const themeColors = {
    primaryEnd: 'blue-700',
    primaryStart: 'blue-500',
    secondary: 'teal-500', // Exemple, ajustez si nécessaire
    focusRing: 'focus:ring-blue-500', // ou la couleur de votre primary-end
    textPrimaryEnd: 'text-blue-700',
    textPrimaryStart: 'text-blue-500',
};

export function ChartOfAccounts() {
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [accountsList, setAccountsList] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const ohadaClasses = {
        "1": { name: "Capitaux", icon: Building, color: "blue" },
        "2": { name: "Immobilisations", icon: Calculator, color: "green" },
        "3": { name: "Stocks", icon: Package, color: "yellow" },
        "4": { name: "Tiers", icon: Users, color: "purple" },
        "5": { name: "Trésorerie", icon: Banknote, color: "indigo" },
        "6": { name: "Charges", icon: TrendingDown, color: "red" },
        "7": { name: "Produits", icon: TrendingUp, color: "emerald" }
    };

    const sampleAccounts = [
        { id: 1, code: "2154", label: "Équipements de radiologie", class: "2", type: "Actif", balance: 125000, isActive: true, createdDate: "2024-01-15T10:30:00Z", lastUsed: "2024-06-10T14:20:00Z" },
        { id: 2, code: "7011", label: "Consultations médicales", class: "7", type: "Produit", balance: 45000, isActive: true, createdDate: "2024-01-10T08:15:00Z", lastUsed: "2024-06-14T09:30:00Z" },
        { id: 3, code: "4111", label: "Patients débiteurs", class: "4", type: "Actif", balance: 15000, isActive: true, createdDate: "2024-02-01T11:45:00Z", lastUsed: "2024-06-13T16:10:00Z" },
        { id: 4, code: "6011", label: "Achats de médicaments", class: "6", type: "Charge", balance: 28000, isActive: true, createdDate: "2024-01-20T14:00:00Z", lastUsed: "2024-06-12T11:25:00Z" },
        { id: 5, code: "5121", label: "Banque BICEC", class: "5", type: "Actif", balance: 85000, isActive: true, createdDate: "2024-01-05T09:20:00Z", lastUsed: "2024-06-14T08:45:00Z" }
    ];

    const loadChartOfAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setAccountsList(sampleAccounts);
            setErrorStatus(null);
            setErrorMessage("");
        } catch (error) {
            console.error(error);
            setErrorStatus(500);
            setErrorMessage("Une erreur est survenue lors du chargement du plan comptable.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChartOfAccounts();
    }, [loadChartOfAccounts]);

    const filteredAccounts = accountsList.filter((account) => {
        const matchesSearch =
            account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.label.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = !classFilter || account.class === classFilter;
        const matchesType = !typeFilter || account.type === typeFilter;
        return matchesSearch && matchesClass && matchesType;
    });

    function getClassIcon(classNumber) {
        const IconComponent = ohadaClasses[classNumber]?.icon || Calculator;
        return <IconComponent className="h-5 w-5" />;
    }

    function getClassColor(classNumber) {
        // Ces couleurs sémantiques sont importantes et conservées
        const colorMap = {
            "blue": "text-blue-600",
            "green": "text-green-600",
            "yellow": "text-yellow-600",
            "purple": "text-purple-600",
            "indigo": "text-indigo-600",
            "red": "text-red-600",
            "emerald": "text-emerald-600"
        };
        return colorMap[ohadaClasses[classNumber]?.color] || "text-gray-600";
    }

    function formatAmount(amount) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 }).format(amount);
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function AccountModal({ account, onClose, onSave }) {
        const [formData, setFormData] = useState({
            code: account?.code || "",
            label: account?.label || "",
            class: account?.class || "",
            type: account?.type || "",
            isActive: account?.isActive ?? true
        });

        const handleSubmit = () => {
            if (!formData.code.startsWith(formData.class)) {
                alert("Le code compte doit commencer par le numéro de classe sélectionné");
                return;
            }
            onSave(formData);
            onClose();
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all">
                    <h2 className={`text-2xl font-bold mb-6 text-${themeColors.primaryEnd}`}>
                        {account ? "Modifier le compte" : "Nouveau compte"}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                            <select
                                value={formData.class}
                                onChange={(e) => setFormData({...formData, class: e.target.value})}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeColors.focusRing} focus:border-${themeColors.primaryEnd} transition-colors duration-300`}
                            >
                                <option value="">Sélectionner une classe</option>
                                {Object.entries(ohadaClasses).map(([num, info]) => (
                                    <option key={num} value={num}>
                                        Classe {num} - {info.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code compte</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value})}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeColors.focusRing} focus:border-${themeColors.primaryEnd} transition-colors duration-300`}
                                placeholder="Ex: 2154"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Libellé</label>
                            <input
                                type="text"
                                value={formData.label}
                                onChange={(e) => setFormData({...formData, label: e.target.value})}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeColors.focusRing} focus:border-${themeColors.primaryEnd} transition-colors duration-300`}
                                placeholder="Ex: Équipements de radiologie"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${themeColors.focusRing} focus:border-${themeColors.primaryEnd} transition-colors duration-300`}
                            >
                                <option value="">Sélectionner un type</option>
                                <option value="Actif">Actif</option>
                                <option value="Passif">Passif</option>
                                <option value="Charge">Charge</option>
                                <option value="Produit">Produit</option>
                            </select>
                        </div>
                        <div className="pt-2">
                            <label className="flex items-center text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className={`mr-2 h-4 w-4 text-${themeColors.primaryEnd} border-gray-300 rounded ${themeColors.focusRing}`}
                                />
                                Compte actif
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`px-4 py-2 text-white rounded-lg bg-gradient-to-r from-${themeColors.primaryStart} to-${themeColors.primaryEnd} font-semibold hover:from-${themeColors.primaryEnd} hover:to-${themeColors.primaryStart} transition-all duration-300`}
                            >
                                {account ? "Modifier" : "Créer"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-${themeColors.primaryEnd}`}></div>
            </div>
        );
    }

    if (errorStatus) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-xl text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-3">Erreur {errorStatus}</h2>
                    <p className="text-gray-700">{errorMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <AccountantDashBoard linkList={FinancialAccountantNavLink} requiredRole={"Accountant"}>
            <AccountantNavBar />
            <div className="min-h-screen bg-gray-100 p-4 md:p-8">
                <div className="max-w-full mx-auto">
                    <div className={`bg-gradient-to-r from-${themeColors.primaryStart} to-${themeColors.primaryEnd} rounded-xl text-white p-6 md:p-8 mb-8 shadow-xl`}>
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold mb-1">Plan Comptable OHADA</h1>
                                <p className="opacity-90 text-sm">Gérez et consultez les comptes de votre organisation.</p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className={`mt-4 md:mt-0 flex items-center px-4 py-2 bg-white text-${themeColors.primaryEnd} rounded-lg font-semibold shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-300`}
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Nouveau compte
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
                        {Object.entries(ohadaClasses).map(([classNum, classInfo]) => {
                            const IconComponent = classInfo.icon;
                            const count = accountsList.filter(acc => acc.class === classNum).length;
                            return (
                                <div key={classNum} className={`bg-white p-4 rounded-xl shadow-lg border-l-4 border-${themeColors.primaryStart} hover:shadow-xl transition-shadow duration-300`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-xs ${themeColors.textPrimaryStart} font-semibold`}>CLASSE {classNum}</p>
                                            <p className="text-2xl font-bold text-gray-800">{count}</p>
                                            <p className="text-xs text-gray-500 truncate" title={classInfo.name}>{classInfo.name}</p>
                                        </div>
                                        <IconComponent className={`h-7 w-7 ${getClassColor(classNum)} opacity-75`} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par code ou libellé..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg ${themeColors.focusRing} focus:border-${themeColors.primaryEnd} transition-all duration-300`}
                                />
                            </div>
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className={`px-4 py-2.5 border border-gray-300 rounded-lg ${themeColors.focusRing} focus:border-${themeColors.primaryEnd} md:min-w-[200px] transition-all duration-300`}
                            >
                                <option value="">Toutes les classes</option>
                                {Object.entries(ohadaClasses).map(([num, info]) => (
                                    <option key={num} value={num}>Classe {num} - {info.name}</option>
                                ))}
                            </select>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className={`px-4 py-2.5 border border-gray-300 rounded-lg ${themeColors.focusRing} focus:border-${themeColors.primaryEnd} md:min-w-[180px] transition-all duration-300`}
                            >
                                <option value="">Tous les types</option>
                                <option value="Actif">Actif</option>
                                <option value="Passif">Passif</option>
                                <option value="Charge">Charge</option>
                                <option value="Produit">Produit</option>
                            </select>
                        </div>
                    </div>

                    {filteredAccounts && filteredAccounts.length > 0 ? (
                        <div className="overflow-x-auto bg-white rounded-xl shadow-xl">
                            <table className="w-full">
                                <thead className={`bg-${themeColors.primaryEnd}`}>
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider rounded-tl-xl">Code / Statut</th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Libellé</th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Classe</th>
                                    <th className="px-5 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                                    <th className="px-5 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">Solde</th>
                                    <th className="px-5 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">Dernière Util.</th>
                                    <th className="px-5 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider rounded-tr-xl">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAccounts.map((account, index) => (
                                    <tr key={account.id} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${index === filteredAccounts.length - 1 ? 'border-b-0' : ''}`}>
                                        <td className={`px-5 py-4 whitespace-nowrap border-l-4 border-${themeColors.primaryStart}`}>
                                            <div className="text-sm font-semibold text-gray-900">{account.code}</div>
                                            <div className={`text-xs font-medium ${account.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                {account.isActive ? 'Actif' : 'Inactif'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="text-sm text-gray-900 font-medium">{account.label}</div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`${getClassColor(account.class)} mr-2`}>
                                                    {getClassIcon(account.class)}
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-900">Cl. {account.class}</div>
                                                    <div className="text-xs text-gray-500">{ohadaClasses[account.class]?.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    account.type === 'Actif' ? 'bg-green-100 text-green-800' :
                                                        account.type === 'Passif' ? `bg-${themeColors.primaryStart} bg-opacity-10 text-${themeColors.primaryEnd}` : // Example for Passif
                                                            account.type === 'Charge' ? 'bg-red-100 text-red-800' :
                                                                'bg-emerald-100 text-emerald-800' // Produit
                                                }`}>
                                                    {account.type}
                                                </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm text-gray-900 font-semibold">{formatAmount(account.balance)}</div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-center">
                                            <div className="text-sm text-gray-600">{formatDate(account.lastUsed)}</div>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => console.log("Voir détails:", account.id)}
                                                    className={`text-${themeColors.primaryStart} hover:text-${themeColors.primaryEnd} transition-colors duration-200`}
                                                    title="Voir détails"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingAccount(account)}
                                                    className="text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
                                                            console.log("Supprimer:", account.id);
                                                        }
                                                    }}
                                                    className="text-red-500 hover:text-red-600 transition-colors duration-200"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center bg-white p-12 rounded-xl shadow-lg">
                            <Calculator className={`h-16 w-16 ${themeColors.textPrimaryEnd} mx-auto mb-4 opacity-70`} />
                            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Aucun compte trouvé</h2>
                            <p className="text-gray-500 mb-6">
                                Vos filtres actuels n'ont retourné aucun résultat. Essayez de les ajuster ou ajoutez un nouveau compte.
                            </p>
                            <button
                                className={`px-5 py-2.5 text-white rounded-lg bg-gradient-to-r from-${themeColors.primaryStart} to-${themeColors.primaryEnd} font-semibold hover:from-${themeColors.primaryEnd} hover:to-${themeColors.primaryStart} transition-all duration-300`}
                                onClick={() => setShowCreateModal(true)}
                            >
                                Créer un nouveau compte
                            </button>
                        </div>
                    )}

                    {(showCreateModal || editingAccount) && (
                        <AccountModal
                            account={editingAccount}
                            onClose={() => {
                                setShowCreateModal(false);
                                setEditingAccount(null);
                            }}
                            onSave={(formData) => {
                                console.log("Sauvegarder:", formData);
                                // Ici on ferait l'appel API pour sauvegarder
                                loadChartOfAccounts();
                            }}
                        />
                    )}
                </div>
            </div>
        </AccountantDashBoard>
    );
}