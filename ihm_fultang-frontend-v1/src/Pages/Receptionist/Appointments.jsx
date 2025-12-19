import { useState, useEffect } from 'react';
import { Modal, message, DatePicker, Tag, Alert } from 'antd';
import { FaSearch, FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { XIcon, Calendar } from 'lucide-react';
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { receptionistNavLink } from "./receptionistNavLink.js";
import { ReceptionistNavBar } from "./ReceptionistNavBar.jsx";
import { getAllRendezVous, createRendezVous, deleteRendezVous } from '../../services/rendezVousApi';
import { getAllMedecins } from '../../services/medecinsApi';
import { searchPatients } from '../../services/patientsApi';
import Loader from "../../GlobalComponents/Loader.jsx";
import dayjs from 'dayjs';

/**
 * Page des rendez-vous du receptionniste.
 * Affiche la liste des rendez-vous avec statut et permet d'en creer de nouveaux.
 */
export function Appointments() {
    const [rendezVous, setRendezVous] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [medecins, setMedecins] = useState([]);
    const [patientSearchResults, setPatientSearchResults] = useState([]);
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const [formData, setFormData] = useState({
        matricule_patient: '',
        matricule_medecin: '',
        date_rendez_vous: null,
        heure_rendez_vous: null
    });

    useEffect(() => {
        fetchRendezVous();
        fetchMedecins();
    }, []);

    const fetchRendezVous = async () => {
        setLoading(true);
        try {
            const response = await getAllRendezVous();
            const data = response.data || response.results || [];
            setRendezVous(data);
        } catch (error) {
            console.error('Error fetching rendez-vous:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMedecins = async () => {
        try {
            const response = await getAllMedecins();
            const data = response.data || response.results || [];
            setMedecins(data);
        } catch (error) {
            console.error('Error fetching medecins:', error);
        }
    };

    const handleSearchPatients = async (query) => {
        setPatientSearchTerm(query);
        if (query.length < 2) {
            setPatientSearchResults([]);
            return;
        }
        try {
            const response = await searchPatients(query);
            const data = response.results || response.data || [];
            setPatientSearchResults(data);
        } catch (error) {
            console.error('Error searching patients:', error);
        }
    };

    const selectPatient = (patient) => {
        setSelectedPatient(patient);
        setFormData(prev => ({ ...prev, matricule_patient: patient.matricule }));
        setPatientSearchResults([]);
        setPatientSearchTerm(`${patient.nom} ${patient.prenom} (${patient.matricule})`);
        if (errors.matricule_patient) {
            setErrors(prev => ({ ...prev, matricule_patient: null }));
        }
    };

    const handleDelete = (rdv) => {
        Modal.confirm({
            title: 'Supprimer le rendez-vous',
            content: 'Êtes-vous sûr de vouloir supprimer ce rendez-vous ?',
            okText: 'Confirmer',
            cancelText: 'Annuler',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteRendezVous(rdv.id);
                    message.success('Rendez-vous supprimé');
                    fetchRendezVous();
                } catch (error) {
                    message.error('Erreur lors de la suppression');
                }
            }
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.matricule_patient) newErrors.matricule_patient = "Veuillez sélectionner un patient";
        if (!formData.matricule_medecin) newErrors.matricule_medecin = "Veuillez sélectionner un médecin";
        if (!formData.date_rendez_vous) newErrors.date_rendez_vous = "Veuillez choisir une date";
        if (!formData.heure_rendez_vous) newErrors.heure_rendez_vous = "Veuillez choisir une heure";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatApiErrors = (errorData) => {
        if (errorData?.erreurs) {
            const messages = [];
            for (const [field, fieldErrors] of Object.entries(errorData.erreurs)) {
                const errorList = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
                messages.push(`${field}: ${errorList.join(', ')}`);
            }
            return messages.join('\n');
        }
        return errorData?.detail || errorData?.error || "Une erreur s'est produite";
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setApiError('');

        try {
            const dataToSend = {
                matricule_patient: formData.matricule_patient,
                matricule_medecin: formData.matricule_medecin,
                date_rendez_vous: formData.date_rendez_vous.format('YYYY-MM-DD'),
                heure_rendez_vous: formData.heure_rendez_vous.format('HH:mm')
            };

            await createRendezVous(dataToSend);
            message.success('Rendez-vous créé avec succès');
            setShowAddModal(false);
            resetForm();
            fetchRendezVous();
        } catch (error) {
            const errorMsg = formatApiErrors(error.response?.data);
            setApiError(errorMsg);
        }
    };

    const resetForm = () => {
        setFormData({ matricule_patient: '', matricule_medecin: '', date_rendez_vous: null, heure_rendez_vous: null });
        setSelectedPatient(null);
        setPatientSearchTerm('');
        setPatientSearchResults([]);
        setErrors({});
        setApiError('');
    };

    const getStatutTag = (statut) => {
        const config = {
            'en_attente': { color: 'orange', label: 'En attente' },
            'effectue': { color: 'green', label: 'Effectué' },
            'annule': { color: 'red', label: 'Annulé' }
        };
        const cfg = config[statut] || { color: 'default', label: statut };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
    };

    const filteredRendezVous = rendezVous.filter(rdv => {
        const searchLower = searchTerm.toLowerCase();
        const patientName = `${rdv.patient_nom || ''} ${rdv.patient_prenom || ''}`.toLowerCase();
        const medecinName = `${rdv.medecin_nom || ''} ${rdv.medecin_prenom || ''}`.toLowerCase();
        return patientName.includes(searchLower) || medecinName.includes(searchLower);
    });

    const applyFormStyle = (hasError = false) => {
        return `w-full px-4 py-2 border rounded-md focus:outline-none focus:border-2 focus:border-primary-end ${hasError ? 'border-red-500' : 'border-gray-300'}`;
    };

    return (
        <DashBoard requiredRole={"receptioniste"} linkList={receptionistNavLink}>
            <ReceptionistNavBar />
            <div className="mt-5 flex flex-col relative">
                {/* Header avec barre de recherche */}
                <div className="flex justify-between mb-5">
                    <p className="font-bold text-xl mt-2 ml-5">Liste des Rendez-vous</p>
                    <div className="flex mr-5">
                        <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg">
                            <FaSearch className="text-xl text-secondary m-2" />
                            <input
                                type="text"
                                placeholder="Rechercher patient ou médecin..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-none focus:outline-none focus:ring-0 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                {loading ? (
                    <div className="h-[500px] w-full flex justify-center items-center">
                        <Loader size={"medium"} color={"primary-end"} />
                    </div>
                ) : filteredRendezVous.length > 0 ? (
                    <div className="ml-5 mr-5">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                    <th className="text-center text-white p-4 text-xl font-bold rounded-l-2xl">No</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">Patient</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">Médecin</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">Date & Heure</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">Statut</th>
                                    <th className="text-center text-white p-4 text-xl font-bold rounded-r-2xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRendezVous.map((rdv, index) => (
                                    <tr key={rdv.id} className="bg-gray-100">
                                        <td className="p-4 text-md text-blue-900 rounded-l-lg text-center">{index + 1}</td>
                                        <td className="p-4 text-md text-center font-bold">
                                            {rdv.patient_nom} {rdv.patient_prenom}
                                            <br /><span className="text-gray-500 text-sm font-normal">{rdv.patient_matricule}</span>
                                        </td>
                                        <td className="p-4 text-md text-center">
                                            Dr. {rdv.medecin_nom} {rdv.medecin_prenom}
                                            <br /><span className="text-gray-500 text-sm">{rdv.medecin_specialite}</span>
                                        </td>
                                        <td className="p-4 text-md text-center">
                                            {new Date(rdv.date_heure).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                            <br /><span className="font-bold">{new Date(rdv.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </td>
                                        <td className="p-4 text-md text-center">
                                            {getStatutTag(rdv.statut)}
                                        </td>
                                        <td className="p-4 relative rounded-r-lg">
                                            <div className="w-full items-center justify-center flex gap-4">
                                                <button
                                                    onClick={() => handleDelete(rdv)}
                                                    className="flex items-center justify-center w-9 h-9 text-red-500 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300"
                                                    title="Supprimer">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center mt-20">
                        <Calendar className="w-36 h-36 text-gray-300" />
                        <h3 className="font-bold text-2xl mt-4 mb-2 text-gray-800">Aucun rendez-vous</h3>
                        <p className="text-gray-600 mb-6 max-w-xl text-md font-medium">
                            Il n'y a actuellement aucun rendez-vous programmé.
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center px-4 py-2 bg-primary-start font-semibold text-white rounded-md hover:bg-primary-end transition-all duration-300"
                        >
                            <span className="mr-2 text-lg">+</span>
                            Prendre un rendez-vous
                        </button>
                    </div>
                )}

                {/* Bouton flottant pour ajouter un RDV */}
                {filteredRendezVous.length > 0 && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="fixed bottom-5 right-16 rounded-full w-14 h-14 bg-gradient-to-r text-3xl font-bold text-white from-primary-start to-primary-end hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg"
                        title="Nouveau rendez-vous"
                    >
                        <FaPlus />
                    </button>
                )}
            </div>

            {/* Modal d'ajout de rendez-vous - Style customisé */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                        <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-white">Nouveau Rendez-vous</h3>
                            <button onClick={() => { resetForm(); setShowAddModal(false); }} className="text-white hover:text-gray-200">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {apiError && (
                            <div className="px-6 pt-4">
                                <Alert
                                    type="error"
                                    message={apiError}
                                    showIcon
                                    closable
                                    onClose={() => setApiError('')}
                                />
                            </div>
                        )}

                        <div className="p-6 space-y-5">
                            {/* Recherche Patient */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patient <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Rechercher un patient par nom ou matricule..."
                                    value={patientSearchTerm}
                                    onChange={(e) => handleSearchPatients(e.target.value)}
                                    className={applyFormStyle(errors.matricule_patient)}
                                />
                                {patientSearchResults.length > 0 && (
                                    <div className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto bg-white shadow-md">
                                        {patientSearchResults.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => selectPatient(p)}
                                                className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                            >
                                                <span className="font-bold">{p.nom} {p.prenom}</span>
                                                <span className="text-gray-500 ml-2">({p.matricule})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {selectedPatient && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md flex justify-between items-center">
                                        <span className="text-green-800">
                                            <FaCheck className="inline mr-2" />
                                            {selectedPatient.nom} {selectedPatient.prenom} - {selectedPatient.matricule}
                                        </span>
                                        <button onClick={() => { setSelectedPatient(null); setPatientSearchTerm(''); setFormData(prev => ({ ...prev, matricule_patient: '' })); }}>
                                            <FaTimes className="text-red-500" />
                                        </button>
                                    </div>
                                )}
                                {errors.matricule_patient && <p className="text-red-500 text-xs mt-1">{errors.matricule_patient}</p>}
                            </div>

                            {/* Sélection Médecin */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Médecin <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.matricule_medecin}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, matricule_medecin: e.target.value }));
                                        if (errors.matricule_medecin) setErrors(prev => ({ ...prev, matricule_medecin: null }));
                                    }}
                                    className={applyFormStyle(errors.matricule_medecin)}
                                >
                                    <option value="">Sélectionner un médecin</option>
                                    {medecins.map(m => (
                                        <option key={m.id} value={m.matricule}>Dr. {m.nom} {m.prenom} - {m.specialite}</option>
                                    ))}
                                </select>
                                {errors.matricule_medecin && <p className="text-red-500 text-xs mt-1">{errors.matricule_medecin}</p>}
                            </div>

                            {/* Date et Heure */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        value={formData.date_rendez_vous}
                                        onChange={(date) => {
                                            setFormData(prev => ({ ...prev, date_rendez_vous: date }));
                                            if (errors.date_rendez_vous) setErrors(prev => ({ ...prev, date_rendez_vous: null }));
                                        }}
                                        className={`w-full ${errors.date_rendez_vous ? 'border-red-500' : ''}`}
                                        placeholder="Sélectionner date"
                                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                                    />
                                    {errors.date_rendez_vous && <p className="text-red-500 text-xs mt-1">{errors.date_rendez_vous}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Heure <span className="text-red-500">*</span>
                                    </label>
                                    <DatePicker
                                        picker="time"
                                        format="HH:mm"
                                        value={formData.heure_rendez_vous}
                                        onChange={(time) => {
                                            setFormData(prev => ({ ...prev, heure_rendez_vous: time }));
                                            if (errors.heure_rendez_vous) setErrors(prev => ({ ...prev, heure_rendez_vous: null }));
                                        }}
                                        className={`w-full ${errors.heure_rendez_vous ? 'border-red-500' : ''}`}
                                        placeholder="Sélectionner heure"
                                        minuteStep={15}
                                    />
                                    {errors.heure_rendez_vous && <p className="text-red-500 text-xs mt-1">{errors.heure_rendez_vous}</p>}
                                </div>
                            </div>

                            {/* Boutons */}
                            <div className="flex justify-center space-x-4 pt-4">
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-2 bg-gradient-to-r from-primary-start to-primary-end text-white rounded-lg font-bold hover:opacity-90 transition-all duration-300"
                                >
                                    Enregistrer
                                </button>
                                <button
                                    onClick={() => { resetForm(); setShowAddModal(false); }}
                                    className="px-6 py-2 border bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all duration-300"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashBoard>
    );
}