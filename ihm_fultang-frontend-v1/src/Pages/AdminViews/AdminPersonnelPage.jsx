import { useState, useEffect } from 'react';
import { Tooltip, Modal, message, Tag } from 'antd';
import { FaEdit, FaTrash, FaSearch, FaEye, FaKey } from 'react-icons/fa';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { newAdminNavLink } from "./newAdminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import { useTranslation } from 'react-i18next';
import { getAllPersonnel, deletePersonnel, resetPersonnelPassword } from '../../services/personnelApi';
import { AddPersonnelModal, EditPersonnelModal, PersonnelDetailsModal } from './Personnel';
import Loader from "../../GlobalComponents/Loader.jsx";
import { Users } from 'lucide-react';

/**
 * Page de gestion du personnel hospitalier.
 * Style identique a AdminPatientList.
 */
export function AdminPersonnelPage() {
    const { t } = useTranslation();
    const [personnel, setPersonnel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPersonnel, setSelectedPersonnel] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchPersonnel();
    }, []);

    const fetchPersonnel = async () => {
        setLoading(true);
        try {
            const response = await getAllPersonnel();
            const personnelData = response.results || response.data || [];
            setPersonnel(personnelData);
        } catch (error) {
            console.error('Error fetching personnel:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: t('common.delete'),
            content: t('personnel.confirmDelete'),
            okText: t('common.confirm'),
            cancelText: t('common.cancel'),
            okType: 'danger',
            onOk: async () => {
                try {
                    await deletePersonnel(record.id);
                    message.success(t('personnel.deleteSuccess'));
                    fetchPersonnel();
                } catch (error) {
                    message.error(t('common.error'));
                }
            }
        });
    };

    const handleResetPassword = (record) => {
        Modal.confirm({
            title: t('personnel.resetPassword'),
            content: t('personnel.resetPasswordConfirm'),
            okText: t('common.confirm'),
            cancelText: t('common.cancel'),
            onOk: async () => {
                try {
                    await resetPersonnelPassword(record.email);
                    message.success(t('personnel.resetPasswordSuccess'));
                } catch (error) {
                    message.error(t('common.error'));
                }
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'actif': return 'bg-green-100 text-green-800';
            case 'licencie': return 'bg-red-100 text-red-800';
            case 'retraite': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <CustomDashboard linkList={newAdminNavLink} requiredRole={"admin"}>
            <AdminNavBar />
            <div className="mt-5 flex flex-col relative">
                {/* Header avec barre de recherche - style AdminPatientList */}
                <div className="flex justify-between mb-5">
                    <p className="font-bold text-xl mt-2 ml-5">{t('admin.personnelManagement')}</p>
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
                ) : personnel.length > 0 ? (
                    <div className="ml-5 mr-5">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                    <th className="text-center text-white p-4 text-xl font-bold rounded-l-2xl">No</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('personnel.matricule')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('personnel.lastName')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('personnel.email')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('personnel.position')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('personnel.status')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold rounded-r-2xl">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {personnel.map((person, index) => (
                                    <tr key={person.id} className="bg-gray-100">
                                        <td className="p-4 text-md text-blue-900 rounded-l-lg text-center">{index + 1}</td>
                                        <td className="p-4 text-md text-center font-mono">{person.matricule}</td>
                                        <td className="p-4 text-md text-center font-bold">{person.nom} {person.prenom}</td>
                                        <td className="p-4 text-md text-center">{person.email}</td>
                                        <td className="p-4 text-md text-center">{t(`personnel.positions.${person.poste}`)}</td>
                                        <td className="p-4 text-md text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(person.statut)}`}>
                                                {t(`personnel.statuses.${person.statut}`)}
                                            </span>
                                        </td>
                                        <td className="p-4 relative rounded-r-lg">
                                            <div className="w-full items-center justify-center flex gap-4">
                                                <Tooltip placement="left" title={t('personnel.viewDetails')}>
                                                    <button onClick={() => { setSelectedPersonnel(person); setShowDetailsModal(true); }}
                                                        className="flex items-center justify-center w-9 h-9 text-primary-end text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaEye />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip placement="top" title={t('common.edit')}>
                                                    <button onClick={() => { setSelectedPersonnel(person); setShowEditModal(true); }}
                                                        className="flex items-center justify-center w-9 h-9 text-green-500 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaEdit />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip placement="top" title={t('personnel.resetPassword')}>
                                                    <button onClick={() => handleResetPassword(person)}
                                                        className="flex items-center justify-center w-9 h-9 text-purple-500 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaKey />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip placement="right" title={t('common.delete')}>
                                                    <button onClick={() => handleDelete(person)}
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
                        <Users className="w-36 h-36 text-gray-300" />
                        <h3 className="font-bold text-3xl mt-4 mb-2 text-gray-800">{t('personnel.noPersonnel')}</h3>
                        <p className="text-gray-600 mb-6 max-w-xl text-xl font-medium">{t('admin.manageHospitalPersonnel')}</p>
                    </div>
                )}

                {/* Bouton Ajouter flottant */}
                <Tooltip placement="top" title={t('personnel.addPersonnel')}>
                    <button onClick={() => setShowAddModal(true)}
                        className="fixed bottom-5 right-16 rounded-full w-14 h-14 bg-gradient-to-r text-4xl font-bold text-white from-primary-start to-primary-end hover:text-5xl transition-all duration-300">
                        +
                    </button>
                </Tooltip>
            </div>

            {/* Modals */}
            <AddPersonnelModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchPersonnel} />
            <EditPersonnelModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={fetchPersonnel} personnel={selectedPersonnel} />
            <PersonnelDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} personnel={selectedPersonnel} />
        </CustomDashboard>
    );
}
