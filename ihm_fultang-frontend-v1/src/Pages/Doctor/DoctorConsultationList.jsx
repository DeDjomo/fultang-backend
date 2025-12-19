import {useEffect, useState} from "react"
import { Search, Calendar} from "lucide-react"
import {doctorNavLink} from "./lib/doctorNavLink.js";
import {DoctorNavBar} from "./DoctorComponents/DoctorNavBar.jsx";
import ConsultationCard from "./DoctorComponents/ConsultationCard.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import {useAuthentication} from "../../Utils/Provider.jsx";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";



export  function DoctorConsultationList() {
    const [searchTerm, setSearchTerm] = useState("");
    const currentDate = new Date().toLocaleDateString("en-EN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const [consultations, setConsultations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const filteredConsultations = consultations
        .filter((consultation) =>
            {
                const patientFullName = consultation?.idPatient?.firstName + consultation?.idPatient?.lastName
                return(
                    patientFullName.toLowerCase().includes(searchTerm.toLowerCase()) || consultation?.consultationReason.toLowerCase().includes(searchTerm.toLowerCase())
                )
            }

        )
       // .sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime))



    const {userData} = useAuthentication();



    useEffect(() => {
        async function loadDoctorConsultations() {
            setIsLoading(true);
            if (userData.id)
            {
                try
                {
                    const response = await axiosInstance.get(`/consultation/doctor/${userData?.id}/`);
                    setIsLoading(false);
                    if (response.status === 200)
                    {
                        setErrorMessage("");
                        setErrorStatus(null);
                        console.log(response);
                        setConsultations(response?.data);
                    }
                }
                catch (error)
                {
                    setIsLoading(false);
                    setErrorMessage("Something went wrong when retrieving your consultations, please retry later !!!");
                    setErrorStatus(error.status);
                    console.log(error);
                }
            }

        }
        loadDoctorConsultations();
    }, [userData.id]);


    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar/>
            <div className="mx-auto p-6">
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Consultations of the day</h1>
                            <div className="flex items-center text-gray-600">
                                <Calendar className="h-5 w-5 mr-2" />
                                <span className="capitalize">{currentDate}</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Search for a patient or reason for consultation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-2 focus:border-primary-end"
                        />
                    </div>
                </div>


                {isLoading ? (
                    <div className="h-[500px] w-full flex justify-center items-center">
                        <Loader size={"medium"} color={"primary-end"}/>
                    </div>
                ) : (
                    errorStatus ? <ServerErrorPage errorStatus={errorStatus} message={errorMessage}/> :
                        (filteredConsultations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredConsultations.map((consultation) => (
                                    <ConsultationCard key={consultation.id} consultation={consultation} />
                                ))}
                            </div>
                            ) :
                            (
                                <div className="p-8 mt-24 flex items-center justify-center">
                                    <div className="flex flex-col">
                                        <Calendar className="h-16 w-16 text-primary-end mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2 mx-auto">No Consultations Today</h2>
                                        <p className="text-gray-600 mb-4 mx-auto">There are currently no consultations scheduled for today.</p>
                                        <button
                                            className="px-4 hover:bg-primary-start  duration-300 mx-auto py-2 bg-primary-end text-white rounded-lg transition-all "
                                            onClick={() => {window.location.reload()}}
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

