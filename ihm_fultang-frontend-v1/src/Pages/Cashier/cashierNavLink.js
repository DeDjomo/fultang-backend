import { MdPending } from "react-icons/md";
import { AiOutlineFileExclamation } from "react-icons/ai";
import { HiOutlineDocumentReport } from "react-icons/hi";
import {AppRoutesPaths as appRoutes} from "../../Router/appRouterPaths.js";
import {FaHistory, FaHospital} from "react-icons/fa";
import { MdHelpOutline } from "react-icons/md";

export const cashierNavLink =
[
    {
        name: 'Consultation List',
        icon: MdPending,
        link: appRoutes.cashierPage,
    },

    {
        name: 'Exams List',
        icon: AiOutlineFileExclamation,
        link: appRoutes.examsList,
    },
    
    // {
    //     name: 'Hospitalisations List',
    //     icon: FaHospital,
    //     link: appRoutes.hospitalisations,
    // },
    {
        name: 'Financial History',
        icon: FaHistory,
        link: appRoutes.financialHistory,
    },
    {
        name: 'Financial Report',
        icon: HiOutlineDocumentReport,
        link: appRoutes.financialReport,
    },
    {
        name: 'Help Center',
        icon: MdHelpOutline,
        link: appRoutes.helpCenterPage,
    }

]