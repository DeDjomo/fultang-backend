import { Users, ClipboardList, Calendar, UserPlus, FileSpreadsheet } from 'lucide-react';
import { LaboratoryDashBoard } from "./LaboratoryDashBoard.jsx";
import { laboratoryNavLink } from "./LaboratoryNavLink.js";
import { LaboratoryNavBar } from "./LaboratoryNavBar.jsx";
import { useNavigate } from "react-router-dom";
import { AppRoutesPaths as AppRouterPaths } from "../../Router/appRouterPaths.js";
import { CustomDashboard } from "../../GlobalComponents/CustomDashboard.jsx";
import StatCard from "../../GlobalComponents/StatCard.jsx";
import QuickActionButton from "../../GlobalComponents/QuickActionButton.jsx";
import { useState, useEffect } from 'react';
import axiosInstance from "../../Utils/axiosInstance.js";

export function LaboratoryHomePage() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ patients: 0, examRequests: 0 });

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await axiosInstance.get('/exam-request/');
                if (response.status === 200) {
                    // Check if response.data is an array or if it contains a "results" property.
                    const examRequestsArray = Array.isArray(response.data)
                        ? response.data
                        : response.data.results || [];
                    // Calculate unique patient IDs from exam requests.
                    const uniquePatientIds = new Set(
                        examRequestsArray.map(exam => exam.idPatient?.id)
                    );
                    setStats({
                        patients: uniquePatientIds.size,
                        examRequests: examRequestsArray.length
                    });
                }
            } catch (error) {
                console.error("Error fetching exam request stats:", error);
            }
        }
        fetchStats();
    }, []);

    return (
        <CustomDashboard linkList={laboratoryNavLink} requiredRole={"Labtech"}>
            <LaboratoryNavBar />
            <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to the Laboratory Dashboard</h1>
                    <p className="opacity-90 font-semibold text-xl">
                        Manage your clinic efficiently and monitor all activities from this centralized interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        icon={Users}
                        title="Patients"
                        value={stats.patients}
                        description="Patients with exam requests"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={ClipboardList}
                        title="Exam Requests"
                        value={stats.examRequests}
                        description="Total exam requests"
                        color="bg-purple-500"
                    />
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Access</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton
                            icon={UserPlus}
                            label="View Patients for Consultation"
                            onClick={() => navigate(AppRouterPaths.laboratoryPatientList)}
                        />
                        <QuickActionButton
                            icon={Calendar}
                            label="View Exam Requests"
                            onClick={() => navigate(AppRouterPaths.laboratoryExamenList)}
                        />
                        <QuickActionButton
                            icon={FileSpreadsheet}
                            label="View Examination History"
                            onClick={() => navigate(AppRouterPaths.laboratoryExamenHistories)}
                        />
                    </div>
                </div>
            </div>
        </CustomDashboard>
    );
}
