import { ArrowLeft, User, Stethoscope, Calendar, Weight,RulerIcon, CreditCard, Thermometer, Activity, Heart,  Pill, FileText,  Printer } from 'lucide-react';
import {useNavigate} from "react-router-dom";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {adminNavLink} from "./adminNavLink.js";
import {AdminNavBar} from "./AdminNavBar.jsx";
import {FaHistory, FaPills} from "react-icons/fa";
import {BsExclamationTriangle} from "react-icons/bs";
import {MdLocalHospital} from "react-icons/md";
import {IoMedkit} from "react-icons/io5";
import {GiStethoscope} from "react-icons/gi";



const consultationData = {
    id: 1,
    patientName: "Jean Dupont",
    patientAge: 45,
    doctorName: "Dr. Marie Claire",
    date: "2024-01-28",
    time: "09:00",
    status: "Finished",
    price: 25000,
    parameters: {
        temperature: 37.2,
        bloodPressure: "120/80",
        heartRate: 72,
        respiratoryRate: 16,
        weight: 70,
        height: 1.89,
    },
    diagnosis: "Grippe saisonnière",
    prescriptions: [
        { medication: "Paracétamol", dosage: "1000mg", frequency: "3 fois par jour", duration: "5 jours" },
        { medication: "Ibuprofène", dosage: "400mg", frequency: "2 fois par jour", duration: "3 jours" }
    ],
    notes: "Le patient présente des symptômes typiques de la grippe. Repos recommandé pendant 3-5 jours. Suivi téléphonique dans une semaine si les symptômes persistent."
};



export function ConsultationDetails() {
    const navigate = useNavigate();
    return (

        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar/>
            <div className="flex flex-col min-h-screen p-4 ">
                <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white mb-5">
                    <h1 className="text-3xl font-bold mb-2">Consultation of NGOUPAYE Thierry - 2025/06/23</h1>
                    <p className="opacity-90 font-semibold text-md">
                        This summary details the consultation of Mr NGOUPAYE Thierry with Dr. Tchassi Daniel, including the diagnosis established, the examinations performed and the treatment prescribed.
                    </p>
                </div>
                <div className="bg-gray-100 shadow-md rounded-lg mb-5 p-4 ">
                    <div className="flex justify-between items-center ">
                        <div className="flex justify-start">
                            <button onClick={() => navigate(-1)}
                                    className="text-secondary text-xl hover:text-primary-end transition-all duration-300 font-bold flex items-center">
                                <ArrowLeft/>
                                Back To Consultation List
                            </button>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={()=>{alert("implementing print function")}}
                                className="bg-secondary font-bold duration-300  text-white px-4 py-2 rounded-md hover:bg-primary-end hover:text-white transition-all mr-2">
                                <Printer size={20} className="inline mr-2"/>
                                Print
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <div className="grid  gap-x-4 gap-y-8 grid-cols-2">
                                <div className="col-span-1">
                                    <p className="text-xl font-bold ">Patient</p>
                                    <div className="mt-1 text-md text-gray-900 flex items-center">
                                        <User className="mr-2 h-8 w-8 text-gray-600"/>
                                        {consultationData.patientName}
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-md font-bold">Doctor</p>
                                    <div className="mt-1 text-md text-gray-900 flex items-center">
                                        <Stethoscope className="mr-2 h-8 w-8 text-gray-600"/>
                                        {consultationData.doctorName}
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-md font-bold">Date and Time</p>
                                    <div className="mt-1 text-md text-gray-900 flex items-center">
                                        <Calendar className="mr-2 h-8 w-8 text-gray-600"/>
                                        {new Date(consultationData.date).toLocaleDateString('en-En', {year: 'numeric', month: 'long', day: 'numeric'})} At {consultationData.time}
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <p className="text-md font-bold ">Status</p>
                                    <div className="mt-1 text-md text-gray-900">
                                        <span
                                            className={`px-4 py-1 text-sm  font-bold rounded-full ${consultationData.status === 'Finished' ? 'bg-green-200 text-green-800' : consultationData.status === 'Pending' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {consultationData.status}
                                         </span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-md font-bold ">Price</p>
                                    <div className="mt-1 text-md text-blue-500 font-bold flex items-center">
                                        <CreditCard className="mr-2 h-8 w-8 text-gray-400"/>
                                        {consultationData.price + " FCFA"}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <div className="flex gap-2 mb-2 mt-4">
                                        <IoMedkit className="w-7 h-7"/>
                                        <p className="text-md font-bold mt-1">Patient's Parameters</p>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-900">
                                        <div className="grid gap-4 grid-cols-4">
                                            <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                                                <Weight className="w-7 h-7 text-primary-end mr-2"/>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-semibold">Weight</p>
                                                    <p className="text-xl font-semibold">{consultationData.parameters.weight} Kg</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                                                <RulerIcon className="w-7 h-7 text-primary-end mr-2"/>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-semibold">Height</p>
                                                    <p className="text-xl font-semibold">{consultationData.parameters.height} m^2</p>
                                                </div>
                                            </div>

                                            <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                                                <Thermometer className="w-7 h-7 text-primary-end mr-2"/>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-semibold">Temperature</p>
                                                    <p className="text-xl font-semibold">{consultationData.parameters.temperature}°C</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                                                <Activity className="text-xl w-7 h-7 text-primary-end mr-2"/>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-semibold">Blood
                                                        Pressure</p>
                                                    <p className="text-xl font-semibold">{consultationData.parameters.bloodPressure} mmHg</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                                                <Heart className="w-7 h-7 text-primary-end mr-2"/>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-semibold">Heart Rate</p>
                                                    <p className="text-xl font-semibold">{consultationData.parameters.heartRate} bpm</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                                                <BsExclamationTriangle className="w-7 h-7 text-primary-end mr-2"/>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-semibold">Allergies</p>
                                                    <p className="text-xl font-semibold">{"Poussiere"}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                                                <FaPills className="w-7 h-7 text-primary-end mr-2"/>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-semibold">Current
                                                        Medications</p>
                                                    <p className="text-xl font-semibold">{"Ventoline"}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                                                <FaHistory className="w-7 h-7 text-primary-end mr-2"/>
                                                <div>
                                                    <p className="text-sm text-gray-600 font-semibold">Family Medical
                                                        History</p>
                                                    <p className="text-xl font-semibold">{"Asthma"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 mt-3">
                                    <div className="flex gap-2">
                                        <Stethoscope className="w-7 h-7 mb-1"/>
                                        <p className="text-md font-bold mt-1">Diagnostic</p>

                                    </div>
                                    <div className="text-md text-gray-900 bg-gray-100 p-3 rounded-lg">
                                        {consultationData.diagnosis}
                                    </div>
                                </div>

                                <div className="col-span-2 mt-3">
                                    <div className="flex gap-2">
                                        <FileText className="w-7 h-7 mb-1"/>
                                        <p className="text-md font-bold ">Doctor Notes</p>
                                    </div>
                                    <div className="text-md text-gray-900 bg-gray-100 p-4 rounded-lg">
                                        {consultationData.notes}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <div className="flex gap-2">
                                        <FaPills className="w-7 h-7 mb-1"/>
                                        <p className="text-md font-bold ">Prescriptions</p>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-900">
                                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                            {consultationData.prescriptions.map((prescription, index) => (
                                                <li key={index}
                                                    className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                                    <div className="w-0 flex-1 flex items-center">
                                                        <Pill className="flex-shrink-0 h-5 w-5 text-[#4DB6AC]"
                                                              aria-hidden="true"/>
                                                        <span className="ml-2 flex-1 w-0 truncate">
                                                            {prescription.medication} - {prescription.dosage}, {prescription.frequency} pendant {prescription.duration}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <div className="flex gap-2">
                                        <GiStethoscope className="w-7 h-7 mb-1"/>
                                        <p className="text-md font-bold mt-1 ">Exams</p>
                                    </div>
                                    <div className="mt-1 text-sm text-gray-900">
                                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                            {consultationData.prescriptions.map((prescription, index) => (
                                                <li key={index}
                                                    className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                                    <div className="w-0 flex-1 flex items-center">
                                                        <MdLocalHospital
                                                            className="flex-shrink-0 h-5 w-5 text-[#4DB6AC]"
                                                            aria-hidden="true"/>
                                                        <span className="ml-2 flex-1 w-0 truncate">
                                                            {prescription.medication} - {prescription.dosage}, {prescription.frequency} pendant {prescription.duration}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomDashboard>
    );
}

