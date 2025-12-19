import PropTypes from "prop-types";
import { Calculator, Building, Package, Users, Banknote, TrendingDown, TrendingUp, Calendar, Hash, Tag, Eye, DollarSign } from 'lucide-react';

// Classes OHADA avec leurs icônes et couleurs
const ohadaClasses = {
    "1": { name: "Capitaux", icon: Building, color: "blue" },
    "2": { name: "Immobilisations", icon: Calculator, color: "green" },
    "3": { name: "Stocks", icon: Package, color: "yellow" },
    "4": { name: "Tiers", icon: Users, color: "purple" },
    "5": { name: "Trésorerie", icon: Banknote, color: "indigo" },
    "6": { name: "Charges", icon: TrendingDown, color: "red" },
    "7": { name: "Produits", icon: TrendingUp, color: "emerald" }
};

export function ViewAccountDetailsModal({ isOpen, account, onClose }) {
    ViewAccountDetailsModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        account: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired
    };

    if (!isOpen) return null;

    // Fonction pour obtenir l'icône d'une classe
    function getClassIcon(classNumber) {
        const IconComponent = ohadaClasses[classNumber]?.icon || Calculator;
        return <IconComponent className="h-8 w-8" />;
    }

    // Fonction pour obtenir la couleur d'une classe
    function getClassColor(classNumber) {
        const colorMap = {
            "blue": "text-blue-600 bg-blue-200",
            "green": "text-green-600 bg-green-200",
            "yellow": "text-yellow-600 bg-yellow-200",
            "purple": "text-purple-600 bg-purple-200",
            "indigo": "text-indigo-600 bg-indigo-200",
            "red": "text-red-600 bg-red-200",
            "emerald": "text-emerald-600 bg-emerald-200"
        };
        return colorMap[ohadaClasses[classNumber]?.color] || "text-gray-600 bg-gray-100";
    }

    function getColor(classNumber)
    {
        const colorMap={
            "blue": "bg-blue-100",
            "green": "bg-green-100",
            "yellow": "bg-yellow-100",
            "purple": "bg-purple-100",
            "indigo": "bg-indigo-100",
            "red": "bg-red-100",
            "emerald": "bg-emerald-100"
        }
        return colorMap[ohadaClasses[classNumber]?.color]
    }

    // Fonction pour formater le montant
    function formatAmount(amount) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Fonction pour formater la date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-lg shadow-xl w-[700px]">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="flex flex-row">
                        {/* Left Section - Icon and Account Code */}
                        <div className={`${getColor(account.class)} p-6 flex flex-col items-center text-center w-1/3`}>
                            <div className={`w-32 h-32 rounded-full ${getClassColor(account.class)} overflow-hidden mb-4 flex items-center justify-center`}>
                                {getClassIcon(account.class)}
                            </div>
                            <h1 className="text-3xl font-bold text-navy-900 mb-2">{account.code}</h1>
                            <div className="flex items-center text-gray-600 mb-2">
                                <Tag className="w-4 h-4 mr-2"/>
                                <p className="text-sm font-medium">Classe {account.class}</p>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                                {ohadaClasses[account.class]?.name}
                            </div>
                            <div className="mt-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    account.isActive ? 'bg-green-300 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {account.isActive ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                        </div>

                        {/* Right Section - Account Information */}
                        <div className="p-6 md:w-2/3">
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <Hash className="w-6 h-6 text-primary-end mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Libellé du compte</p>
                                        <p className="text-gray-700 font-bold text-lg">{account.label}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Tag className="w-6 h-6 text-primary-end mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Type de compte</p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                                            account.type === 'Actif' ? 'bg-green-100 text-green-800' :
                                                account.type === 'Passif' ? 'bg-blue-100 text-blue-800' :
                                                    account.type === 'Charge' ? 'bg-red-100 text-red-800' :
                                                        'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            {account.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <DollarSign className="w-6 h-6 text-primary-end mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Solde actuel</p>
                                        <p className="text-gray-700 font-bold text-xl">{formatAmount(account.balance)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Calendar className="w-6 h-6 text-primary-end mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Date de création</p>
                                        <p className="text-gray-700 font-bold">{formatDate(account.createdDate)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Eye className="w-6 h-6 text-primary-end mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Dernière utilisation</p>
                                        <p className="text-gray-700 font-bold">{formatDate(account.lastUsed)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-primary-end text-white font-bold rounded-md hover:bg-teal-700 transition-all duration-300"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}