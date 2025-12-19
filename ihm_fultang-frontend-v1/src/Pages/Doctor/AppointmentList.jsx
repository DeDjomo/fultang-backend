import {useEffect, useState} from "react"
import { Search, Calendar,  ChevronLeft, ChevronRight } from "lucide-react"
import AppointmentCard from "./DoctorComponents/AppointmentCard.jsx";
import {useAuthentication} from "../../Utils/Provider.jsx";
import {doctorNavLink} from "./lib/doctorNavLink.js";
import {DoctorNavBar} from "./DoctorComponents/DoctorNavBar.jsx";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";



export  function AppointmentList() {
    const [filter, setFilter] = useState("Pending");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const appointmentsPerPage = 5;
    const [appointmentList, setAppointmentList] = useState([{}]);

    const [isLoading, setIsLoading] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");




    const filteredAppointments = appointmentList.filter((appointment) => {
        const fullName = appointment?.idPatient?.firstName + " " + appointment?.idPatient?.lastName;
        const matchesFilter = filter === "all" || appointment?.state === filter
        const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDate = dateFilter ? appointment?.atDate === dateFilter : true
        return matchesFilter && matchesSearch && matchesDate
    })


    const indexOfLastAppointment = currentPage * appointmentsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
    const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

    const paginate = (pageNumber) => setCurrentPage(pageNumber)
    const {userData} = useAuthentication();



    async function retrieveDoctorAppointments(doctorId)
    {
        setIsLoading(true);
        try
        {
            const response  = await axiosInstance.get(`/appointment/doctor/${doctorId}/`);
            setIsLoading(false);
            if (response.status === 200)
            {
                setAppointmentList(response?.data);
                console.log(response.data);
                setErrorStatus(null);
                setErrorMessage("");
            }
        }
        catch (error)
        {
            setIsLoading(false);
            console.log(error);
            setErrorStatus(error.status);
            setErrorMessage("Something went wrong when retrieving your appointments, please try again later !");
        }
    }




    useEffect(() => {
        if(userData.id)
        {
            retrieveDoctorAppointments(userData.id);
        }
    }, [userData.id]);




    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar/>
            <div className="mx-auto p-6 h-fit">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">{`Appointments of Dr. ${userData?.first_name + " " + userData?.last_name}`}</h1>


                <div className="mb-8 space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setFilter("Pending")}
                            className={`px-4 py-2 rounded-md hover:bg-primary-start text-white duration-300 transition-all ${filter === "Pending" ? "bg-primary-end text-white font-bold " : "bg-gray-100 text-gray-800 hover:bg-gray-200"} transition-colors`}
                        >
                            Upcoming appointments
                        </button>
                        <button
                            onClick={() => setFilter("Completed")}
                            className={`px-4 py-2 rounded-md hover:bg-primary-start duration-300 transition-all  hover:text-white ${
                                filter === "Completed" ? "bg-primary-end text-white font-bold " : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            } transition-colors`}
                        >
                            Honored appointments
                        </button>
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-md  hover:bg-primary-start duration-300 transition-all hover:text-white ${filter === "all" ? "bg-primary-end text-white font-bold" : "bg-gray-100 text-gray-800 hover:bg-gray-200"} transition-colors`}
                        >
                            All appointments
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for a patient..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-0 focus:outline-none focus:border-2 focus:border-primary-end"
                            />
                        </div>
                        <div className="flex items-center">
                            <Calendar className="text-gray-400 mr-2" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md  focus:ring-0 focus:outline-none focus:border-2 focus:border-primary-end "
                            />
                        </div>
                    </div>
                </div>

                {/* Liste des rendez-vous */}

                    {isLoading ? (
                        <div className="h-[400px] w-full flex justify-center items-center">
                            <Loader size={"medium"} color={"primary-end"}/>
                        </div>
                    ) : (
                        errorStatus ?  <ServerErrorPage errorStatus={errorStatus} message={errorMessage}/> :(
                            filteredAppointments.length>0 ? (
                                    <div className="space-y-6">
                                        {currentAppointments.map((appointment) => (
                                        <AppointmentCard key={appointment.id} appointment={appointment} />))}
                                    </div>
                            ) : (
                                <div className="p-8 mt-24 flex items-center justify-center">
                                    <div className="flex flex-col">
                                        <Calendar className="h-16 w-16 text-primary-end mx-auto mb-4"/>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2 mx-auto">No Appointments
                                            </h2>
                                        <p className="text-gray-600 mb-4 mx-auto">There are currently no appointments
                                            scheduled.</p>
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
                    )}

                {/* Pagination */}
                {appointmentList.length > appointmentsPerPage && (
                    <div className="mt-8 flex justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                             aria-label="Pagination">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="sr-only">Précédent</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true"/>
                            </button>
                            {Array.from({length: Math.ceil(appointmentList.length / appointmentsPerPage) }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => paginate(index + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                        currentPage === index + 1
                                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === Math.ceil(filteredAppointments.length / appointmentsPerPage)}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </CustomDashboard>
    )
}

