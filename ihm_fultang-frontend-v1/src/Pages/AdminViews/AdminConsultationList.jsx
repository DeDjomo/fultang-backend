import {useEffect, useState} from 'react';
import { Search, Calendar, Filter, ChevronDown, ChevronUp,  Clock,  Stethoscope} from 'lucide-react';
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {adminNavLink} from "./adminNavLink.js";
import {AdminNavBar} from "./AdminNavBar.jsx";
import {Tooltip} from "antd";
import {FaArrowLeft, FaArrowRight, FaUser} from "react-icons/fa";
import {AppRoutesPaths} from "../../Router/appRouterPaths.js";
import {useNavigate} from "react-router-dom";
import axiosInstance from "../../Utils/axiosInstance.js";


const consultations = [
    { id: 1, patientName: "Jean Dupont", doctorName: "Dr. Marie Claire", date: "2024-01-28", time: "09:00", status: "Finished" },
    { id: 2, patientName: "Sophie Martin", doctorName: "Dr. Pierre Dubois", date: "2024-01-28", time: "10:30", status: "In progress" },
    { id: 3, patientName: "Lucas Bernard", doctorName: "Dr. Amélie Rousseau", date: "2024-01-28", time: "14:00", status: "Upcoming" },
    { id: 4, patientName: "Emma Petit", doctorName: "Dr. Thomas Leroy", date: "2024-01-27", time: "11:15", status: "Finished" },
    { id: 5, patientName: "Léa Durand", doctorName: "Dr. Marie Claire", date: "2024-01-27", time: "16:45", status: "Finished" },
    { id: 6, patientName: "Thierry Ngoupaye", doctorName: "Dr. Daniel Tchassi", date: "2024-05-30", time: "16:45", status: "Finished" },
];

export function AdminConsultationList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);

    const filteredConsultations = consultations
        .filter(consultation =>
            (filterStatus === 'all' || consultation.status === filterStatus) &&
            (consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                consultation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortBy === 'date') {
                return sortOrder === 'asc'
                    ? new Date(a.date) - new Date(b.date)
                    : new Date(b.date) - new Date(a.date);
            }
            return 0;
        });

    function toggleSort  (criteria) {
        if (sortBy === criteria) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(criteria);
            setSortOrder('asc');
        }
    }

    const [isLoading, setIsLoading] = useState(false);
    const [consultationList, setConsultationList] = useState([]);


    useEffect(() => {
        async function fetchConsultations()
        {
            setIsLoading(true);
            try
            {
                const response = await axiosInstance.get("/consultation/");
                setIsLoading(false);
                if (response.status === 200)
                {
                    console.log(response.data);
                    setConsultationList(response.data.results);
                }
            }
            catch (error)
            {
                setIsLoading(false);
                console.log(error);
            }
        }
        fetchConsultations();
    }, []);


    const navigate = useNavigate();

    return (

        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar/>
            <div className="flex flex-col min-h-screen p-6">
                        <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white mb-5">
                            <h1 className="text-3xl font-bold mb-2">Consultation List</h1>
                            <p className="opacity-90 font-semibold text-md">
                                Find the clinic’s complete consultation history here. You can follow the activity of each doctor, check the details of past consultations and access the information of the patients concerned.
                            </p>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                            <div className="flex flex-row gap-4">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Search by a patient or a medical staff"
                                        className="w-full bg-gray-100 pl-10 pr-4 py-2 border-2 outline-none border-secondary transition-all duration-300 rounded-md focus:outline-none focus:border-2 focus:border-primary-end"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Search className="absolute left-3 top-2.5 text-secondary" size={20}/>
                                </div>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-primary-end transition-all duration-300"
                                >
                                    <Filter size={20} className="mr-2"/>
                                    Filters
                                    {showFilters ? <ChevronUp size={20} className="ml-2"/> :
                                        <ChevronDown size={20} className="ml-2"/>}
                                </button>
                            </div>


                            {showFilters && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex flex-wrap gap-4">
                                        <div>
                                            <label
                                                className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none  focus:border-primary-end focus:border-2 sm:text-sm rounded-md"
                                            >
                                                <option value="all">All</option>
                                                <option value="Finished">Finished</option>
                                                <option value="In progress">In progress</option>
                                                <option value="Upcoming">Upcoming</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => toggleSort(e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#4DB6AC] focus:border-[#4DB6AC] sm:text-sm rounded-md"
                                            >
                                                <option value="date">Date</option>
                                                <option value="patientName">Patient Name</option>
                                                <option value="doctorName">Medical Staff Name</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>


                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredConsultations.map((consultation) => (
                                <div key={consultation.id}
                                     className="bg-gray-100 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex gap-4 mt-2">
                                                    <FaUser className="text-primary-end w-6 h-6"/>
                                                    <h3 className="text-lg font-semibold text-gray-800">{consultation.patientName}</h3>
                                                </div>
                                                <div className="flex mt-2 gap-4">
                                                    <Stethoscope className="text-primary-end w-6 h-6"/>
                                                    <p className="text-md text-gray-600">{consultation.doctorName}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${consultation.status === 'Finished' ? 'bg-green-100 text-green-800' : consultation.status === 'In progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>{consultation.status}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mt-3 ml-10">
                                            <Calendar className="w-4 h-4 mr-1"/>
                                            <span>{new Date(consultation.date).toLocaleDateString('fr-FR', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 mt-2 ml-10">
                                            <Clock className="w-4 h-4 mr-1"/>
                                            <span>{consultation.time}</span>
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 text-right">
                                        <button className="text-white px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-primary-end to-primary-start font-bold text-sm hover:text-md transition-all duration-300"
                                                onClick={()=> {navigate(AppRoutesPaths.adminConsultationDetailsPage)}}>
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/*Pagination content */}
                        <div className="w-full justify-center flex mt-4 mb-2">
                            <div className="flex gap-4">
                                <Tooltip placement={"left"} title={"previous slide"}>
                                    <button onClick={async () => {
                                    }}
                                            className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                        <FaArrowLeft/>
                                    </button>
                                </Tooltip>
                                <p className="text-secondary text-2xl font-bold mt-4">{`1/5`}</p>
                                <Tooltip placement={"right"} title={"next slide"}>
                                    <button onClick={async () => {
                                    }}
                                            className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                        <FaArrowRight/>
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
        </CustomDashboard>
    );
}

