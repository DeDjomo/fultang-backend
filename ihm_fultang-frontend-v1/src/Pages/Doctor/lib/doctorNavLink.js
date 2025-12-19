import {FaHistory, FaHome, FaNotesMedical, FaPlus, FaQuestionCircle, FaUsers} from "react-icons/fa";
import {AppRoutesPaths as appRoutes} from "../../../Router/appRouterPaths.js";
import { Calendar} from "lucide-react";
import {FiList} from "react-icons/fi";



export const doctorNavLink = [
    {
        name: "Dashboard",
        link: appRoutes.doctorPage,
        icon: FaHome,
    },
    {
        name: 'Patient List',
        icon: FaUsers,
        link: appRoutes.doctorPatientList,
    },

    {
        name: 'Consultation',
        icon: FiList,
        subLinks: [
            {
                icon: FiList,
                name: "Consultation List",
                link: appRoutes.doctorConsultationList
            },
            {
                icon: FaHistory,
                name: "Consultation History",
                link: appRoutes.doctorConsultationHistory
            },
          /*  {
                icon: FaPlus,
                name: "Add A Consultation",
                link: appRoutes.doctorAddConsultation
            }*/
        ]
    },
    {
        name: 'Appointments',
        icon: Calendar,
        link: appRoutes.doctorAppointment,
    },
   /* {
        name: 'Exams',
        icon: FaNotesMedical,
        link: appRoutes.doctorExamList,
    },*/
    {
        name: 'Help Center',
        icon: FaQuestionCircle,
        link: appRoutes.helpCenterPage,
    }
    
];