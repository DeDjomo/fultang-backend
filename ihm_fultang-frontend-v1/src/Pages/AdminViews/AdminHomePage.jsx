import { useState, useEffect } from 'react';
import { Building2, Users, Stethoscope } from 'lucide-react';
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import { newAdminNavLink } from "./newAdminNavLink.js";
import { AdminNavBar } from "./AdminNavBar.jsx";
import QuickActionButton from "../../GlobalComponents/QuickActionButton.jsx";
import StatCard from "../../GlobalComponents/StatCard.jsx";
import { useNavigate } from "react-router-dom";
import { AppRoutesPaths as AppRouterPaths } from "../../Router/appRouterPaths.js";
import { useTranslation } from 'react-i18next';
import { getAllServices } from '../../services/servicesApi';
import { getAllPersonnel } from '../../services/personnelApi';
import { getAllChambres } from '../../services/chambresApi';

/**
 * Page d'accueil du dashboard administrateur.
 * Affiche les statistiques principales et les acces rapides.
 */
export function AdminHomePage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        services: 0,
        personnel: 0,
        chambres: 0,
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            // Recuperer les donnees en parallele
            const [servicesRes, personnelRes, chambresRes] = await Promise.all([
                getAllServices(),
                getAllPersonnel(),
                getAllChambres()
            ]);

            // Extraire les counts (gerer pagination et non-pagination)
            const servicesCount = servicesRes.count || (servicesRes.results || servicesRes.data || []).length;
            const personnelCount = personnelRes.count || (personnelRes.results || personnelRes.data || []).length;
            const chambresCount = chambresRes.count || (chambresRes.results || chambresRes.data || []).length;

            setStats({
                services: servicesCount,
                personnel: personnelCount,
                chambres: chambresCount
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomDashboard linkList={newAdminNavLink} requiredRole={"admin"}>
            <AdminNavBar />
            <div className="p-6 space-y-6">
                {/* En-tete de bienvenue */}
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">{t('admin.welcomeDashboard')}</h1>
                    <p className="opacity-90 font-semibold text-xl">
                        {t('admin.manageEfficiently')}
                    </p>
                </div>

                {/* Cartes de statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        icon={Building2}
                        title={t('admin.services')}
                        value={loading ? '...' : stats.services}
                        description={t('admin.servicesAvailable')}
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={Users}
                        title={t('admin.personnel')}
                        value={loading ? '...' : stats.personnel}
                        description={t('admin.personnelMembers')}
                        color="bg-green-500"
                    />
                    <StatCard
                        icon={Stethoscope}
                        title={t('admin.chambres')}
                        value={loading ? '...' : stats.chambres}
                        description={t('admin.roomsAvailable')}
                        color="bg-purple-500"
                    />
                </div>

                {/* Acces rapides */}
                <div className="rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('admin.quickAccess')}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <QuickActionButton
                            icon={Building2}
                            label={t('admin.manageServices')}
                            onClick={() => navigate(AppRouterPaths.adminServicesPage)}
                        />
                        <QuickActionButton
                            icon={Users}
                            label={t('admin.managePersonnel')}
                            onClick={() => navigate(AppRouterPaths.adminPersonnelPage)}
                        />
                        <QuickActionButton
                            icon={Stethoscope}
                            label={t('admin.manageRooms')}
                            onClick={() => navigate(AppRouterPaths.adminChambresPage)}
                        />
                    </div>
                </div>
            </div>
        </CustomDashboard>
    );
}
