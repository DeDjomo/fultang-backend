import { Users, Calendar, ClipboardList,  FileSpreadsheet, UserPlus, FileText } from 'lucide-react';

import {useNavigate} from "react-router-dom";
import {AppRoutesPaths as AppRouterPaths} from "../../Router/appRouterPaths.js";
import {DoctorNavBar} from "./DoctorComponents/DoctorNavBar.jsx"
import {doctorNavLink} from "./lib/doctorNavLink.js"
import QuickActionButton from "../../GlobalComponents/QuickActionButton.jsx";
import StatCard from "../../GlobalComponents/StatCard.jsx";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";


export function Doctor() {


    const navigate = useNavigate();
    const stats = {
        patients: 5,
        medicalStaff: 6,
        consultations: 0,
        appointments: 0,
        scheduledExams: 0,
        totalRooms: 12
    };


    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar/>
            <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome to the Doctor dashboard</h1>
                    <p className="opacity-90 font-semibold text-xl">
                        Manage your clinic efficiently and monitor all activities from this interface
                        centralized.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        icon={Users}
                        title="Patients"
                        value={stats?.patients}
                        description="Registered patients"
                        color="bg-blue-500"
                    />
                    <StatCard
                        icon={ClipboardList}
                        title="Consultations"
                        value={stats?.consultations}
                        description="Consultations today"
                        color="bg-purple-500"
                    />
                    <StatCard
                        icon={Calendar}
                        title="Appointements"
                        value={stats.appointments}
                        description="Scheduled appointments"
                        color="bg-orange-500"
                    />
                    <StatCard
                        icon={FileText}
                        title="Exams"
                        value={stats?.scheduledExams}
                        description="Prescribed exams"
                        color="bg-red-500"
                    />

                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">

                    <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Access</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <QuickActionButton
                            icon={UserPlus}
                            label="Manage Patient"
                            onClick={() => navigate(AppRouterPaths.doctorPatientList)}
                        />

                        <QuickActionButton
                            icon={Calendar}
                            label="View Appointments List"
                            onClick={() => navigate(AppRouterPaths.doctorAppointment)}
                        />

                        <QuickActionButton
                            icon={FileSpreadsheet}
                            label="View Consultations List"
                            onClick={() => navigate(AppRouterPaths.doctorConsultationList)}
                        />
                    </div>
                </div>
            </div>
        </CustomDashboard>
    );
}




