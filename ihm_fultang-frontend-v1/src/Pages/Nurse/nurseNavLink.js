import {FaHome, FaQuestionCircle, FaUserMd} from "react-icons/fa";
import {AppRoutesPaths as appRoutes} from "../../Router/appRouterPaths.js";
import {Calendar} from "lucide-react";


export const nurseNavLink =
[
    {
        name: 'Patients',
        icon: FaHome,
        link: appRoutes.nursePage,
    },
    {
        name: 'Medical Staffs',
        icon: FaUserMd,
        link: appRoutes.nurseMedicalStaffsPage,
    },
   /* {
        name: 'Appointments',
        icon: Calendar,
        link: appRoutes.appointmentsPage,
    },
    /*
    {
        name: 'Consultation History',
        icon: FaUserNurse,
        link: appRoutes.consultationHistoryPage,
    },
    */
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
]