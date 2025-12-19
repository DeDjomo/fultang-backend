import { XIcon } from "lucide-react";
import { useState } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../../Utils/axiosInstance.js";
import { useAuthentication } from "../../Utils/Provider.jsx";
import { Alert } from "antd";

/**
 * Modal pour ajouter un nouveau patient.
 * Champs selon PatientCreateSerializer backend:
 * - Obligatoires: nom, date_naissance, contact, nom_proche, contact_proche, id_personnel
 * - Optionnels: prenom, adresse, email
 */
export function AddNewPatientModal({ isOpen, onClose, setCanOpenSuccessModal, setSuccessMessage, setIsLoading }) {
    AddNewPatientModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        setCanOpenSuccessModal: PropTypes.func.isRequired,
        setSuccessMessage: PropTypes.func.isRequired,
        setIsLoading: PropTypes.func.isRequired
    }

    const { userData } = useAuthentication();
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        date_naissance: '',
        adresse: '',
        contact: '',
        email: '',
        nom_proche: '',
        contact_proche: '',
    });
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});
    const [isYears, setIsYears] = useState(false);
    const [isMonth, setIsMonth] = useState(false);
    const [isWeeks, setIsWeeks] = useState(false);
    const [isDay, setIsDay] = useState(false);
    const [age, setAge] = useState(0);
    const [dateError, setDateError] = useState("");

    function calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        const diffTime = Math.abs(today - birth);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 7) {
            setIsDay(true); setIsWeeks(false); setIsMonth(false); setIsYears(false);
            return Math.floor(diffDays);
        } else if (diffDays < 30) {
            setIsDay(false); setIsWeeks(true); setIsMonth(false); setIsYears(false);
            return Math.floor(diffDays / 7);
        } else if (diffDays < 365) {
            setIsDay(false); setIsWeeks(false); setIsMonth(true); setIsYears(false);
            return Math.floor(diffDays / 30);
        } else {
            setIsDay(false); setIsWeeks(false); setIsMonth(false); setIsYears(true);
            let _age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                _age--;
            }
            return _age;
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        if (name === 'date_naissance') {
            const selectedDate = new Date(value);
            const today = new Date();
            if (selectedDate > today) {
                setDateError('La date de naissance ne peut pas être dans le futur');
                return;
            } else {
                setDateError('');
                setFormData(prev => ({ ...prev, [name]: value }));
                setAge(calculateAge(value));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        // Clear field error
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        setError("");
    }

    function validateForm() {
        const newErrors = {};
        if (!formData.nom.trim()) newErrors.nom = "Ce champ est obligatoire";
        if (!formData.date_naissance) newErrors.date_naissance = "Ce champ est obligatoire";
        if (!formData.contact.trim()) {
            newErrors.contact = "Ce champ est obligatoire";
        } else if (!/^6\d{8}$/.test(formData.contact)) {
            newErrors.contact = "Format: 9 chiffres commençant par 6";
        }
        if (!formData.nom_proche.trim()) newErrors.nom_proche = "Ce champ est obligatoire";
        if (!formData.contact_proche.trim()) {
            newErrors.contact_proche = "Ce champ est obligatoire";
        } else if (!/^6\d{8}$/.test(formData.contact_proche)) {
            newErrors.contact_proche = "Format: 9 chiffres commençant par 6";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function formatApiErrors(errorData) {
        if (errorData?.erreurs) {
            const messages = [];
            for (const [field, fieldErrors] of Object.entries(errorData.erreurs)) {
                const errorList = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
                messages.push(`${field}: ${errorList.join(', ')}`);
            }
            return messages.join('\n');
        }
        return errorData?.detail || errorData?.error || "Une erreur s'est produite";
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateForm() || dateError) return;

        setIsLoading(true);
        setError("");

        try {
            const dataToSend = {
                nom: formData.nom.trim(),
                prenom: formData.prenom.trim() || '',
                date_naissance: formData.date_naissance,
                contact: formData.contact.trim(),
                nom_proche: formData.nom_proche.trim(),
                contact_proche: formData.contact_proche.trim(),
                id_personnel: userData.id
            };

            // Champs optionnels
            if (formData.adresse.trim()) dataToSend.adresse = formData.adresse.trim();
            if (formData.email.trim()) dataToSend.email = formData.email.trim().toLowerCase();

            console.log('Sending patient data:', dataToSend);

            const response = await axiosInstance.post("/patients/", dataToSend);
            if (response.status === 201) {
                setIsLoading(false);
                setSuccessMessage("Patient enregistré avec succès !");
                setCanOpenSuccessModal(true);
                resetForm();
                onClose();
            }
        } catch (error) {
            setIsLoading(false);
            const errorMsg = formatApiErrors(error.response?.data);
            setError(errorMsg);
            console.error('Error creating patient:', error);
        }
    }

    function resetForm() {
        setFormData({
            nom: '', prenom: '', date_naissance: '', adresse: '',
            contact: '', email: '', nom_proche: '', contact_proche: ''
        });
        setErrors({});
        setError("");
        setAge(0);
    }

    function applyFormStyle(hasError = false) {
        return `w-full px-4 py-2 border rounded-md focus:outline-none focus:border-2 focus:border-primary-end ${hasError ? 'border-red-500' : 'border-gray-300'}`;
    }

    function applyAgeStyle() {
        return "w-1/4 text-gray-500 text-md mr-1";
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0">
                    <h3 className="text-2xl font-bold text-white">Nouveau Patient</h3>
                    <button onClick={() => { resetForm(); onClose(); }} className="text-white hover:text-gray-200">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {(dateError || error) && (
                    <div className="px-4 pt-4">
                        <Alert
                            type="error"
                            message={dateError || error}
                            showIcon
                            closable
                            onClose={() => { setDateError(''); setError(''); }}
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Nom et Prénom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text" name="nom" value={formData.nom}
                                placeholder="Nom du patient"
                                onChange={handleChange}
                                className={applyFormStyle(errors.nom)}
                            />
                            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                            <input
                                type="text" name="prenom" value={formData.prenom}
                                placeholder="Prénom du patient"
                                onChange={handleChange}
                                className={applyFormStyle()}
                            />
                        </div>
                    </div>

                    {/* Date de naissance et Age */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date de naissance <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date" name="date_naissance" value={formData.date_naissance}
                                onChange={handleChange}
                                className={applyFormStyle(errors.date_naissance)}
                            />
                            {errors.date_naissance && <p className="text-red-500 text-xs mt-1">{errors.date_naissance}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
                            <div className={`${applyFormStyle()} flex justify-between bg-gray-100`}>
                                <input
                                    value={age}
                                    readOnly
                                    className="w-3/4 outline-none focus:outline-none ring-0 focus:ring-0 bg-transparent"
                                />
                                {isDay && <p className={applyAgeStyle()}>Jour(s)</p>}
                                {isWeeks && <p className={applyAgeStyle()}>Semaine(s)</p>}
                                {isMonth && <p className={applyAgeStyle()}>Mois</p>}
                                {isYears && <p className={applyAgeStyle()}>An(s)</p>}
                            </div>
                        </div>
                    </div>

                    {/* Contact et Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Téléphone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text" name="contact" value={formData.contact}
                                placeholder="677123456" maxLength={9}
                                onChange={handleChange}
                                className={applyFormStyle(errors.contact)}
                            />
                            <p className="text-xs text-gray-500 mt-1">Format: 6XXXXXXXX</p>
                            {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email" name="email" value={formData.email}
                                placeholder="exemple@email.com"
                                onChange={handleChange}
                                className={applyFormStyle()}
                            />
                        </div>
                    </div>

                    {/* Adresse */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <input
                            type="text" name="adresse" value={formData.adresse}
                            placeholder="Adresse du patient"
                            onChange={handleChange}
                            className={applyFormStyle()}
                        />
                    </div>

                    {/* Personne à prévenir */}
                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-md font-semibold text-gray-800 mb-3">Personne à prévenir en cas d'urgence</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom du proche <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text" name="nom_proche" value={formData.nom_proche}
                                    placeholder="Nom complet du proche"
                                    onChange={handleChange}
                                    className={applyFormStyle(errors.nom_proche)}
                                />
                                {errors.nom_proche && <p className="text-red-500 text-xs mt-1">{errors.nom_proche}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Téléphone du proche <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text" name="contact_proche" value={formData.contact_proche}
                                    placeholder="677123456" maxLength={9}
                                    onChange={handleChange}
                                    className={applyFormStyle(errors.contact_proche)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: 6XXXXXXXX</p>
                                {errors.contact_proche && <p className="text-red-500 text-xs mt-1">{errors.contact_proche}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Boutons */}
                    <div className="flex justify-center space-x-4 pt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg font-bold hover:opacity-90 transition-all duration-300"
                        >
                            Enregistrer
                        </button>
                        <button
                            type="button"
                            onClick={() => { resetForm(); onClose(); }}
                            className="px-6 py-2 border bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-300"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}