import { Calendar, Users, BedDouble } from "lucide-react";
import { AppRoutesPaths as appRoutes } from "../../Router/appRouterPaths.js";
import { FaQuestionCircle } from "react-icons/fa";

export const receptionistNavLink = [
    {
        name: 'Patient List',
        icon: Users,
        link: appRoutes.receptionistPage,
    },
    {
        name: 'Hospitalized',
        icon: BedDouble,
        link: appRoutes.hospitalizedPatientsPage,
    },
    {
        name: 'Appointments',
        icon: Calendar,
        link: appRoutes.appointmentsPage,
    },
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
];