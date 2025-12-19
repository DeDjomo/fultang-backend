import {useState} from "react";
import {ohadaClasses} from "./PlanComptable.jsx";

export function AccountModal({ account, onClose, onSave }) {

    const [formData, setFormData] = useState({
        code: account?.code || "",
        label: account?.label || "",
        class: account?.class || "",
        type: account?.type || "",
        isActive: account?.isActive ?? true
    });

    const handleSubmit = () => {
        // Validation du code OHADA (doit commencer par le numéro de classe)
        if (!formData.code.startsWith(formData.class)) {
            alert("Le code compte doit commencer par le numéro de classe sélectionné");
            return;
        }
        onSave(formData);
        onClose();
    };

    return (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    {account ? "Modifier le compte" : "Nouveau compte"}
                </h2>
                <div className="space-y-4">
                    <div className="mb-4">
                        <select
                            value={formData.class}
                            onChange={(e) => setFormData({...formData, class: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sélectionner une classe</option>
                            {Object.entries(ohadaClasses).map(([num, info]) => (
                                <option key={num} value={num}>
                                    Classe {num} - {info.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Code compte</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: 2154"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Libellé</label>
                        <input
                            type="text"
                            value={formData.label}
                            onChange={(e) => setFormData({...formData, label: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Équipements de radiologie"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sélectionner un type</option>
                            <option value="Actif">Actif</option>
                            <option value="Passif">Passif</option>
                            <option value="Charge">Charge</option>
                            <option value="Produit">Produit</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                className="mr-2"
                            />
                            Compte actif
                        </label>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {account ? "Modifier" : "Créer"}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}
