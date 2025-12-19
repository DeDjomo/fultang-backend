import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import {Calendar, Clock, User, FileText, X} from 'lucide-react';
import axiosInstance from "../../Utils/axiosInstance.js";
import Wait from "../Modals/wait.jsx";
import {useAuthentication} from "../../Utils/Provider.jsx";

export function PrescribeDoctor({isOpen, onClose, patientInfos, setCanOpenSuccessModal, setSuccessMessage}) {


    PrescribeDoctor.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        patientInfos: PropTypes.object.isRequired,
        setCanOpenSuccessModal: PropTypes.func,
        setSuccessMessage:PropTypes.func,
    }


    const [doctors, setDoctors] = useState([]);
    const idMedicalFolderPage = localStorage.getItem('current_medical_folder_page');
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const {userData} = useAuthentication();
    const [consultationData, setConsultationData] = useState({
        consultationReason: '',
        consultationNotes: '',
        paymentStatus:'Invalid',
        state:'Pending',
        idMedicalFolderPage:'',
        idPatient: patientInfos.id,
        idMedicalStaffGiver:'',
        idMedicalStaffSender:'',
    });



    useEffect(() => {
        async function fetchDoctors () {
            try {
                const response = await axiosInstance("/medical-staff/all-doctors/");
                if (response.status === 200)
                {
                    console.log(response.data);
                    setDoctors(response.data);
                }
            } catch (error) {
                console.error("Error when retrieving doctor list", error)
            }
        }
        fetchDoctors()
    }, [])



    function handleDateChange(e) {
        setConsultationData(prevState => ({
            ...prevState,
            [e.name]: e.value
        }))
    }


    async function handleSubmit (e){

        e.preventDefault();
        setIsLoading(true);
        if(idMedicalFolderPage !== null && userData.id)
        {
            consultationData.idMedicalFolderPage = idMedicalFolderPage;
            consultationData.idMedicalStaffSender  = userData.id;
        }
        try
        {
            console.log(consultationData);
            const response = await axiosInstance.post("/consultation/", consultationData);
            setIsLoading(false);
            if (response.status === 201)
            {
                setError("");
                localStorage.removeItem('current_medical_folder_page');
                setSuccessMessage("Consultation created successfully !");
                setCanOpenSuccessModal(true);
                onClose();
            }
        }
        catch (error)
        {
            setIsLoading(false);
            console.log(error);
            setError("Something when wrong when prescribing a doctor");
        }
       console.log(consultationData);
    }


    if (!isOpen) return;

    if (isLoading) return <Wait/>

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Prescribe a Doctor</h1>

                    <button onClick={onClose} className="w-8 h-8 bg-red-100 text-red-500  rounded-full flex items-center justify-center">
                        <X className="w-6 h-6 hover:h-7 hover:w-7 transition-all duration-500"/>
                    </button>
                </div>


                {error && <div className = "text-red-500 font-bold text-xl mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="doctor" className="block text-md font-medium text-gray-700 mb-2">
                                Select one doctor
                            </label>
                            <div className="relative">
                                <select
                                    id="doctor"
                                    name = "idMedicalStaffGiver"
                                    value={consultationData.idMedicalStaffGiver}
                                    onChange={(e) => handleDateChange(e.target)}
                                    className="block w-full pl-10 pr-4 py-2 text-base border-gray-300 border-2 focus:border-2 focus:border-primary-end transition-all duration-500 focus:outline-none  rounded-md"

                                >
                                    <option value="">Select a doctor</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            Dr. {doctor.first_name} {doctor.last_name}  ({doctor.role === 'Doctor' ? 'General Practitioner' : doctor.role})
                                        </option>
                                    ))}
                                </select>
                                <User
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="appointmentDate"
                                       className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Consultation
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        id="appointmentDate"
                                        value={new Date().toISOString().split('T')[0]}
                                        className="block w-full pl-10 pr-4 py-2 text-base border-gray-300 border-2 focus:border-2 focus:border-primary-end transition-all duration-500 focus:outline-none  rounded-md"
                                        readOnly
                                    />
                                    <Calendar
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="appointmentTime"
                                       className="block text-sm font-medium text-gray-700 mb-2">
                                    Meeting time
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        id="appointmentTime"
                                        value={new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                        className="block w-full pl-10 pr-4 py-2 text-base border-gray-300 border-2  focus:border-2 focus:border-primary-end transition-all duration-500 focus:outline-none rounded-md"
                                        readOnly
                                    />
                                    <Clock
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="prescriptionDetails"
                                   className="block text-sm font-medium text-gray-700 mb-2">
                                Détails de la Prescription
                            </label>
                            <div className="relative">
            <textarea
                id="prescriptionDetails"
                value={consultationData.consultationNotes}
                name="consultationNotes"
                onChange={(e) => handleDateChange(e.target)}
                rows={4}
                className="block w-full pl-10 pr-4 py-2 text-base border-gray-300 border-2 focus:border-2 focus:border-primary-end transition-all duration-500 focus:outline-none rounded-md"
                placeholder="Entrez les détails de la prescription ici..."
                required
            />
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400"/>
            </div>
            </div>

                <div className="justify-center flex">
                    <button
                        type="submit"
                        className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-end  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Submit Prescription
                    </button>
                </div>
            </form>
        </div>
    </div>
    )
}