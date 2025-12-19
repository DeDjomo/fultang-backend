import { useState, useEffect } from 'react';
import { Tooltip, Modal, message } from 'antd';
import { FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { newAdminNavLink } from "./newAdminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import { useTranslation } from 'react-i18next';
import { getAllServices, deleteService } from '../../services/servicesApi';
import { AddServiceModal, EditServiceModal, ServiceStatsModal } from './Services';
import Loader from "../../GlobalComponents/Loader.jsx";
import { Building2 } from 'lucide-react';

/**
 * Page de gestion des services hospitaliers.
 * Style identique a AdminPatientList.
 */
export function AdminServicesPage() {
    const { t } = useTranslation();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await getAllServices();
            const servicesData = response.results || response.data || [];
            setServices(servicesData);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (service) => {
        Modal.confirm({
            title: t('services.delete'),
            content: t('services.confirmDelete'),
            okText: t('common.confirm'),
            cancelText: t('common.cancel'),
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteService(service.id);
                    message.success(t('services.deleteSuccess'));
                    fetchServices();
                } catch (error) {
                    message.error(t('common.error'));
                }
            }
        });
    };

    const handleEdit = (service) => {
        setSelectedService(service);
        setShowEditModal(true);
    };

    const handleViewStats = (service) => {
        setSelectedService(service);
        setShowStatsModal(true);
    };

    return (
        <CustomDashboard linkList={newAdminNavLink} requiredRole={"admin"}>
            <AdminNavBar />
            <div className="mt-5 flex flex-col relative">
                {/* Header avec barre de recherche - style AdminPatientList */}
                <div className="flex justify-between mb-5">
                    <p className="font-bold text-xl mt-2 ml-5">{t('admin.servicesManagement')}</p>
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
                ) : services.length > 0 ? (
                    <div className="ml-5 mr-5">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                    <th className="text-center text-white p-4 text-xl font-bold rounded-l-2xl">No</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('services.serviceName')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('services.serviceDescription')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('services.chefService')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">{t('services.creationDate')}</th>
                                    <th className="text-center text-white p-4 text-xl font-bold rounded-r-2xl">Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service, index) => (
                                    <tr key={service.id} className="bg-gray-100">
                                        <td className="p-4 text-md text-blue-900 rounded-l-lg text-center">{index + 1}</td>
                                        <td className="p-4 text-md text-center font-bold">{service.nom_service}</td>
                                        <td className="p-4 text-md text-center max-w-xs truncate">{service.desc_service || '-'}</td>
                                        <td className="p-4 text-md text-center">
                                            {service.chef_service_details
                                                ? `${service.chef_service_details.nom} ${service.chef_service_details.prenom}`
                                                : '-'}
                                        </td>
                                        <td className="p-4 text-md text-center">{new Date(service.date_creation).toLocaleDateString()}</td>
                                        <td className="p-4 relative rounded-r-lg">
                                            <div className="w-full items-center justify-center flex gap-6">
                                                <Tooltip placement="left" title={t('services.viewStats')}>
                                                    <button onClick={() => handleViewStats(service)}
                                                        className="flex items-center justify-center w-9 h-9 text-primary-end text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaEye />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip placement="top" title={t('common.edit')}>
                                                    <button onClick={() => handleEdit(service)}
                                                        className="flex items-center justify-center w-9 h-9 text-green-500 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaEdit />
                                                    </button>
                                                </Tooltip>
                                                <Tooltip placement="right" title={t('common.delete')}>
                                                    <button onClick={() => handleDelete(service)}
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
                        <Building2 className="w-36 h-36 text-gray-300" />
                        <h3 className="font-bold text-3xl mt-4 mb-2 text-gray-800">{t('services.noServices')}</h3>
                        <p className="text-gray-600 mb-6 max-w-xl text-xl font-medium">{t('admin.manageHospitalServices')}</p>
                    </div>
                )}

                {/* Bouton Ajouter flottant */}
                <Tooltip placement="top" title={t('services.addService')}>
                    <button onClick={() => setShowAddModal(true)}
                        className="fixed bottom-5 right-16 rounded-full w-14 h-14 bg-gradient-to-r text-4xl font-bold text-white from-primary-start to-primary-end hover:text-5xl transition-all duration-300">
                        +
                    </button>
                </Tooltip>
            </div>

            {/* Modals */}
            <AddServiceModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchServices} />
            <EditServiceModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={fetchServices} service={selectedService} />
            <ServiceStatsModal isOpen={showStatsModal} onClose={() => setShowStatsModal(false)} service={selectedService} />
        </CustomDashboard>
    );
}
