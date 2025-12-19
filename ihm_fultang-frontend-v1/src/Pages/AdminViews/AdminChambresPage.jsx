import { useState, useEffect } from 'react';
import { Tooltip, Modal, message } from 'antd';
import { FaEdit, FaTrash, FaSearch, FaArrowLeft, FaArrowRight, FaPlus } from 'react-icons/fa';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { newAdminNavLink } from "./newAdminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import { useTranslation } from 'react-i18next';
import { getAllChambres, deleteChambre, createChambre, updateChambre } from '../../services/chambresApi';
import Loader from "../../GlobalComponents/Loader.jsx";
import { BedDouble } from 'lucide-react';

/**
 * Page de gestion des chambres hospitalières.
 * Style identique a AdminPatientList.
 */
export function AdminChambresPage() {
    const { t } = useTranslation();
    const [chambres, setChambres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedChambre, setSelectedChambre] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        numero_chambre: '',
        nombre_places_total: '',
        nombre_places_dispo: '',
        tarif_journalier: ''
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchChambres();
    }, []);

    const fetchChambres = async () => {
        setLoading(true);
        try {
            const response = await getAllChambres();
            const data = response.results || response.data || [];
            setChambres(data);
        } catch (error) {
            console.error('Error fetching chambres:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (chambre) => {
        Modal.confirm({
            title: t('common.delete'),
            content: t('chambres.confirmDelete'),
            okText: t('common.confirm'),
            cancelText: t('common.cancel'),
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteChambre(chambre.id);
                    message.success(t('chambres.deleteSuccess'));
                    fetchChambres();
                } catch (error) {
                    message.error(t('common.error'));
                }
            }
        });
    };

    const handleEdit = (chambre) => {
        setSelectedChambre(chambre);
        setFormData({
            numero_chambre: chambre.numero_chambre,
            nombre_places_total: chambre.nombre_places_total,
            nombre_places_dispo: chambre.nombre_places_dispo,
            tarif_journalier: chambre.tarif_journalier
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleAdd = () => {
        setFormData({ numero_chambre: '', nombre_places_total: '', nombre_places_dispo: '', tarif_journalier: '' });
        setFormErrors({});
        setShowAddModal(true);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.numero_chambre.trim()) errors.numero_chambre = t('services.required');
        if (!formData.nombre_places_total || formData.nombre_places_total <= 0) errors.nombre_places_total = t('services.required');
        if (!formData.tarif_journalier || formData.tarif_journalier <= 0) errors.tarif_journalier = t('services.required');
        if (formData.nombre_places_dispo === '' || formData.nombre_places_dispo < 0) errors.nombre_places_dispo = t('services.required');
        if (parseInt(formData.nombre_places_dispo) > parseInt(formData.nombre_places_total)) {
            errors.nombre_places_dispo = 'Cannot exceed total places';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitAdd = async () => {
        if (!validateForm()) return;
        try {
            await createChambre({
                numero_chambre: formData.numero_chambre,
                nombre_places_total: parseInt(formData.nombre_places_total),
                nombre_places_dispo: parseInt(formData.nombre_places_dispo),
                tarif_journalier: parseFloat(formData.tarif_journalier)
            });
            message.success(t('chambres.createSuccess'));
            setShowAddModal(false);
            fetchChambres();
        } catch (error) {
            message.error(error.response?.data?.detail || t('common.error'));
        }
    };

    const handleSubmitEdit = async () => {
        if (!validateForm()) return;
        try {
            await updateChambre(selectedChambre.id, {
                numero_chambre: formData.numero_chambre,
                nombre_places_total: parseInt(formData.nombre_places_total),
                nombre_places_dispo: parseInt(formData.nombre_places_dispo),
                tarif_journalier: parseFloat(formData.tarif_journalier)
            });
            message.success(t('chambres.updateSuccess'));
            setShowEditModal(false);
            fetchChambres();
        } catch (error) {
            message.error(error.response?.data?.detail || t('common.error'));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const FormModal = ({ isOpen, onClose, onSubmit, title }) => (
        <Modal open={isOpen} onCancel={onClose} onOk={onSubmit} okText={t('common.save')} cancelText={t('common.cancel')} title={title} width={500}>
            <div className="space-y-4 py-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('chambres.roomNumber')} *</label>
                    <input type="text" name="numero_chambre" value={formData.numero_chambre} onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg ${formErrors.numero_chambre ? 'border-red-500' : 'border-gray-300'}`} />
                    {formErrors.numero_chambre && <p className="text-red-500 text-xs mt-1">{formErrors.numero_chambre}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('chambres.totalPlaces')} *</label>
                        <input type="number" name="nombre_places_total" value={formData.nombre_places_total} onChange={handleInputChange} min="1"
                            className={`w-full px-3 py-2 border rounded-lg ${formErrors.nombre_places_total ? 'border-red-500' : 'border-gray-300'}`} />
                        {formErrors.nombre_places_total && <p className="text-red-500 text-xs mt-1">{formErrors.nombre_places_total}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('chambres.availablePlaces')} *</label>
                        <input type="number" name="nombre_places_dispo" value={formData.nombre_places_dispo} onChange={handleInputChange} min="0"
                            className={`w-full px-3 py-2 border rounded-lg ${formErrors.nombre_places_dispo ? 'border-red-500' : 'border-gray-300'}`} />
                        {formErrors.nombre_places_dispo && <p className="text-red-500 text-xs mt-1">{formErrors.nombre_places_dispo}</p>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('chambres.dailyRate')} (FCFA) *</label>
                    <input type="number" name="tarif_journalier" value={formData.tarif_journalier} onChange={handleInputChange} min="0" step="100"
                        className={`w-full px-3 py-2 border rounded-lg ${formErrors.tarif_journalier ? 'border-red-500' : 'border-gray-300'}`} />
                    {formErrors.tarif_journalier && <p className="text-red-500 text-xs mt-1">{formErrors.tarif_journalier}</p>}
                </div>
            </div>
        </Modal>
    );

    return (
        <CustomDashboard linkList={newAdminNavLink} requiredRole={"admin"}>
            <AdminNavBar />
            <div className="mt-5 flex flex-col relative">
                {/* Header avec barre de recherche - style AdminPatientList */}
                <div className="flex justify-between mb-5">
                    <p className="font-bold text-xl mt-2 ml-5">{t('chambres.title')}</p>
                    <div className="flex mr-5">
                        <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg">
                            <FaSearch className="text-xl text-secondary m-2" />
                            <input type="text" placeholder={t('common.search')} className="border-none focus:outline-none focus:ring-0" />
                        </div>
                        <button className="ml-2 px-4 h-10 text-white bg-secondary rounded-lg whitespace-nowrap">{t('common.search')}</button>
                    </div>
                </div>

                {/* Contenu principal */}
                {loading ? (
                    <div className="h-[500px] w-full flex justify-center items-center">
                        <Loader size={"medium"} color={"primary-end"} />
                    </div>
                ) : chambres.length > 0 ? (
                    <div className="ml-5 mr-5">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                    <th className="text-center text-white p-4 text-xl font-bold rounded-l-2xl">No</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('chambres.roomNumber')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('chambres.totalPlaces')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('chambres.availablePlaces')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('chambres.dailyRate')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('chambres.availability')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold rounded-r-2xl">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chambres.map((chambre, index) => (
                                    <tr key={chambre.id} className="bg-gray-100">
                                        <td className="p-4 text-md text-blue-900 rounded-l-lg text-center">{index + 1}</td>
                                        <td className="p-4 text-md text-center font-bold">{chambre.numero_chambre}</td>
                                        <td className="p-4 text-md text-center">{chambre.nombre_places_total}</td>
                                        <td className="p-4 text-md text-center">{chambre.nombre_places_dispo}</td>
                                        <td className="p-4 text-md text-center">{chambre.tarif_journalier} FCFA</td>
                                        <td className="p-4 text-md text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${chambre.nombre_places_dispo > 0
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {chambre.nombre_places_dispo > 0 ? t('chambres.available') : t('chambres.full')}
                                            </span>
                                        </td>
                                        <td className="p-4 relative rounded-r-lg">
                                            <div className="w-full items-center justify-center flex gap-6">
                                                <Tooltip placement="left" title={t('common.edit')}>
                                                    <button onClick={() => handleEdit(chambre)}
                                                        className="flex items-center justify-center w-9 h-9 text-green-500 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaEdit />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip placement="right" title={t('common.delete')}>
                                                    <button onClick={() => handleDelete(chambre)}
                                                        className="flex items-center justify-center w-9 h-9 text-red-400 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaTrash />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center mt-20">
                        <BedDouble className="w-36 h-36 text-gray-300" />
                        <h3 className="font-bold text-3xl mt-4 mb-2 text-gray-800">{t('chambres.noChambre')}</h3>
                        <p className="text-gray-600 mb-6 max-w-xl text-xl font-medium">{t('admin.manageHospitalRooms')}</p>
                    </div>
                )}

                {/* Bouton Ajouter flottant */}
                <Tooltip placement="top" title={t('chambres.addChambre')}>
                    <button onClick={handleAdd}
                        className="fixed bottom-5 right-16 rounded-full w-14 h-14 bg-gradient-to-r text-4xl font-bold text-white from-primary-start to-primary-end hover:text-5xl transition-all duration-300">
                        +
                    </button>
                </Tooltip>
            </div>

            {/* Modals */}
            <FormModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleSubmitAdd} title={t('chambres.addChambre')} />
            <FormModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSubmit={handleSubmitEdit} title={t('chambres.editChambre')} />
        </CustomDashboard>
    );
}
