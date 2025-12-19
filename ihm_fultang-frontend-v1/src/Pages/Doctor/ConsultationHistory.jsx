import {useEffect, useState} from "react"
import { Search, Calendar, Eye, User, Clock, DollarSign } from "lucide-react"
import {doctorNavLink} from "./lib/doctorNavLink.js";
import {DoctorNavBar} from "./DoctorComponents/DoctorNavBar.jsx";
import {useCalculateAge} from "../../Utils/compute.js";
import {formatDateOnly, formatDateToTime} from "../../Utils/formatDateMethods.js";
import {getStateStyles} from "./lib/applyStyleFunction.js";
import {useNavigate} from "react-router-dom";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {useAuthentication} from "../../Utils/Provider.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";


export function ConsultationHistory() {
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {userData} = useAuthentication();
    const [consultationHistoryList, setConsultationHistoryList] = useState([]);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");


    async function loadConsultationHistory(idDoctor)
    {
        setIsLoading(true);
        try
        {
            const response =  await axiosInstance.get(`/consultation/doctor/${idDoctor}/?history=true`);
            setIsLoading(false);
            if(response.status === 200)
            {
                setConsultationHistoryList(response?.data);
                setErrorStatus(null);
                setErrorMessage("");
                console.log(response?.data);
            }

        }
        catch (error)
        {
            setIsLoading(false);
            setErrorStatus(error.status);
            console.log(error);
        }
    }

    useEffect(() => {
        if (userData.id)
        {
            loadConsultationHistory(userData.id);
        }
    }, [userData.id]);


    const filteredConsultations = consultationHistoryList.filter((consultation) => {
        const fullName = consultation?.idPatient?.firstName + " "+ consultation?.idPatient?.lastName;
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !dateFilter || new Date(consultation?.consultationDate || '').toISOString().split('T')[0] === dateFilter;
        return matchesSearch && matchesDate
    })


    const navigate = useNavigate();

    const {calculateAge} = useCalculateAge();


    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar/>
            <div className="mx-auto p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">History of Consultations</h1>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search for a consultation according to the patient name or a date..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:border-none rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none transition-all duration-300"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <Calendar className="text-gray-400 h-5 w-5" />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 focus:border-none rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none transition-all duration-300"
                        />
                    </div>
                </div>

                {/* consultation history List */}
                {isLoading ? (
                    <div className="h-[500px] w-full flex justify-center items-center">
                        <Loader size={"medium"} color={"primary-end"}/>
                    </div>
                    ) : (
                        errorStatus ? <ServerErrorPage errorStatus={errorStatus} message={errorMessage}/>  :
                        ( filteredConsultations && filteredConsultations.length > 0 ?
                            (
                                < div >
                                    < table className="w-full border-separate border-spacing-y-2 ">
                                        <thead>
                                        <tr>
                                            <th className="px-6 py-3  bg-primary-end rounded-l-xl text-center text-md text-white font-bold uppercase">
                                                Patient
                                            </th>
                                            <th className="px-6 py-3 bg-primary-end text-center text-md text-white font-bold uppercase">
                                                Date & Time
                                            </th>
                                            <th className="px-6 py-3 bg-primary-end text-center text-md text-white font-bold uppercase">
                                                Reason for consultation
                                            </th>
                                            <th className="px-6 py-3 bg-primary-end text-center text-md text-white font-bold uppercase">
                                                patient condition
                                            </th>
                                            <th className="px-6 py-3 bg-primary-end text-center text-md text-white font-bold uppercase">Price</th>
                                            <th className="px-6 py-3 text-center text-md text-white font-bold bg-primary-end rounded-r-xl uppercase ">
                                                Action
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white  border-separate ">
                                        {filteredConsultations.map((consultation) => {
                                            const patientInfo = consultation?.idPatient;
                                            return (
                                                <tr key={consultation.id} className="">
                                                    <td className={`px-6 py-5 rounded-l-xl bg-gray-100  border-l-4  ${getStateStyles(consultation?.statePatient).container}`}>
                                                        <div className="w-full flex items-center justify-center">
                                                            <User className="h-6 w-6 text-gray-400 mr-2"/>
                                                            <div>
                                                                <div
                                                                    className="text-md font-medium text-gray-900">{patientInfo?.firstName + " " + patientInfo?.lastName}</div>
                                                                <div className="text-md text-gray-500">
                                                                    {calculateAge(patientInfo?.birthDate).value + " " + calculateAge(patientInfo?.birthDate).unit}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 bg-gray-100 ">
                                                        <div className="w-full flex justify-center items-center ">
                                                            <Clock className="h-5 w-5 text-gray-400 mr-2 mt-2"/>
                                                            <div>
                                                                <div className="text-sm text-center text-gray-900">{consultation?.consultationDate ? formatDateOnly(consultation?.consultationDate) : 'Not Specified'}</div>
                                                                <div className="text-sm  text-center text-gray-500">{consultation?.consultationDate ? formatDateToTime(consultation?.consultationDate) : 'Not Specified'} </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 bg-gray-100">
                                                        <div
                                                            className="text-sm text-center text-gray-900">{consultation?.consultationNotes || 'Not Specified'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 bg-gray-100 ">
                                                        <div className="flex items-center justify-center text-sm text-gray-900">
                                                <span
                                                    className={`px-2 py-1 rounded-full border-2 text-sm font-medium ${getStateStyles(consultation?.statePatient).badge}`}>
                                                     {consultation?.statePatient || 'Not Critical'}
                                                </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 bg-gray-100 ">
                                                        <div className="flex items-center justify-center text-sm text-gray-900">
                                                            <DollarSign className="h-5 w-5 text-gray-400 mr-1"/>
                                                            {consultation?.consultationPrice ? consultation?.consultationPrice.toLocaleString() + ' FCFA' : ' - '}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5  bg-gray-100 rounded-r-xl">
                                                        <button
                                                            onClick={() => {
                                                                navigate(`/doctor/consultation-history/details/${consultation?.id}`, {state: {consultation}})
                                                            }}
                                                            className="flex items-center text-primary-end hover:text-primary-start font-semibold hover:text-[17px] transition-all duration-500"
                                                        >
                                                            <Eye className="h-5 w-5 "/>
                                                            <span className="ml-2">Details</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            ): (
                                <div className="p-8 mt-24 flex items-center justify-center">
                                    <div className="flex flex-col">
                                        <Calendar className="h-16 w-16 text-primary-end mx-auto mb-4"/>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2 mx-auto">No Consultations
                                            History</h2>
                                        <p className="text-gray-600 mb-4 mx-auto text-center">You don't have any saved consultations yet. Once your medical consultations have been carried out, their history will appear here for better monitoring of your patients.</p>
                                        <button
                                            className="px-4 hover:bg-primary-start  duration-300 mx-auto py-2 bg-primary-end text-white rounded-lg transition-all "
                                            onClick={() => {
                                                window.location.reload()
                                            }}
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            )
                        )
                    )
                }
            </div>
        </CustomDashboard>
    )
}

