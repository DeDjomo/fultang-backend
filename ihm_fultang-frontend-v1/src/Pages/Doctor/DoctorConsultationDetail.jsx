import {
    Stethoscope,
    Weight,
    Thermometer,
    Activity,
    Heart,
    FileText,
    Ruler,
    AlertTriangle,
    PillIcon as Pills,
    Hospital,
    CalendarCheck,
    User, Calendar, MapPin, Phone, Printer, ArrowLeft
} from 'lucide-react';
import {useLocation, useNavigate} from "react-router-dom";
import {doctorNavLink} from "./lib/doctorNavLink.js";
import { DoctorNavBar } from './DoctorComponents/DoctorNavBar.jsx';
import {useEffect, useState} from "react";
import {useCalculateAge} from "../../Utils/compute.js";
import {combineToISOString, formatDateOnly, formatDateOnlyWithoutWeekDay} from "../../Utils/formatDateMethods.js";
import MedicalParametersCard from "./DoctorComponents/MedicalParametersCard.jsx";
import MedicationPrescriptionCard from "./DoctorComponents/MedicationPrescriptionCard.jsx";
import ExamPrescriptionCard from "./DoctorComponents/ExamPrescriptionCard.jsx";
import AppointmentPrescriptionCard from "./DoctorComponents/AppointmentPrescriptionCard.jsx";
import DiagnosticCard from "./DoctorComponents/DiagnosticCard.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import Wait from "../Modals/wait.jsx";
import {SuccessModal} from "../Modals/SuccessModal.jsx";
import {ErrorModal} from "../Modals/ErrorModal.jsx";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {useAuthentication} from "../../Utils/Provider.jsx";





const consultationSteps = [
    {
        id:0,
        name: 'diagnostic',
        label: 'Diagnostic',
        icon: Stethoscope
    },
    {
        id:1,
        name: 'prescriptions',
        label: 'Prescriptions',
        icon: Pills
    },
    {
        id:2,
        name: 'exams',
        label: 'Exams',
        icon: Hospital
    },
    {
        id:4,
        name: 'appointment',
        label: 'Schedule an appointment',
        icon: CalendarCheck
    }
];


export function DoctorConsultationDetails() {



    const {state} = useLocation();
    const consultation = state?.consultation || {};
    const patientInfo = consultation?.idPatient;
    const medicalPageInfo = consultation?.idMedicalFolderPage;
    const [availableMedications, setAvailableMedication] = useState([]);
    const [availableExams, setAvailableExams]  = useState([]);
   // const [isLoading, setIsLoading] = useState(false);
    const [isUpdatingConsultation, setIsUpdatingConsultation] = useState(false);
    const [isPrescribing, setIsPrescribing] = useState(false);
    const [isPrescribingExam, setIsPrescribingExams] = useState(false);
    const [isEndingConsultation, setIsEndingConsultation] = useState(false);
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [canOpenErrorMessageModal, setCanOpenErrorMessageModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [transactionErrorMessage, setTransactionErrorMessage] = useState("");
    const [isPrescribingAppointment, setIsPrescribingAppointment] = useState(false);






    const [activeTab, setActiveTab] = useState("diagnostic");
    const [prescriptions, setPrescriptions] = useState([
        {
            id: Date.now(),
            medicament: "",
            dosage: "",
            frequency: "",
            duration: "",
            instructions: "",
            quantity:"",
        },
    ]);
    const [exams, setExams] = useState([
        {
            id: Date.now(),
            examName: "",
            idExam:"",
            notes: "",
            isCustom: false,
            idConsultation: consultation?.id,
            idPatient: patientInfo?.id,
            idMedicalStaff: consultation?.idMedicalStaffGiver?.id
        },
    ]);
    const [diagnostic, setDiagnostic] = useState("");
    const [doctorNote, setDoctorNote] = useState("");
    const [appointmentDate, setAppointmentDate] = useState(new Date());
    const [appointmentTime, setAppointmentTime] = useState(new Date());
    const [requirements, setRequirements] = useState("");
    const [appointmentReason, setAppointmentReason] = useState("");




    const {calculateAge} = useCalculateAge();
    const { value: ageValue, unit: ageUnit } = calculateAge(patientInfo?.birthDate);
    const MedicalParametersInfos = [
        {
            icon: Weight,
            label: 'Weight',
            value: medicalPageInfo?.parameters?.weight || '-',
            unit:  medicalPageInfo?.parameters?.weight && ' Kg'
        },
        {
            icon: Ruler,
            label: 'Height',
            value: medicalPageInfo?.parameters?.height || '-',
            unit: medicalPageInfo?.parameters?.height && ' m²'
        },
        {
            icon: Thermometer,
            label: 'Temperature',
            value: medicalPageInfo?.parameters?.temperature || '-',
            unit:  medicalPageInfo?.parameters?.temperature && '°C'
        },
        {
            icon: Activity,
            label: 'Blood Pressure',
            value: medicalPageInfo?.parameters?.bloodPressure || '-',
            unit: medicalPageInfo?.parameters?.bloodPressure && ' mmHg'
        },
        {
            icon: Heart,
            label: 'Heart Rate',
            value: medicalPageInfo?.parameters?.heartRate || '-',
            unit: medicalPageInfo?.parameters?.heartRate && ' bpm'
        },
        {
            icon: AlertTriangle,
            label: 'Allergies',
            value: medicalPageInfo?.parameters?.allergies || '-'
        },
        {
            icon: Pills,
            label: 'Family Medical History',
            value: medicalPageInfo?.parameters?.familyMedicalHistory || '-'
        },
        {
            icon: FileText,
            label: 'Current Medication',
            value: medicalPageInfo?.parameters?.currentMedication || '-'
        }
    ];



    function addPrescription (){
        setPrescriptions([
            ...prescriptions,
            {
                id: Date.now(),
                medicament: "",
                dosage: "",
                frequency: "",
                duration: "",
                instructions: "",
                quantity:"",
            },
        ])
    }


    function getConsultationStepsStyles (isActive)  {
        return isActive
            ? 'border-b-4 border-primary-end text-primary-end font-bold'
            : 'text-gray-500 hover:text-gray-700';
    }


    function removePrescription (id)
    {
        setPrescriptions(prescriptions.filter((prescription) => prescription.id !== id))
    }



    function updatePrescription (id, field, value)
    {
        setPrescriptions(prescriptions.map((prescription) =>
            (
                prescription.id === id ?
                    {
                        ...prescription,
                        [field]: value
                    } :
                    prescription
            )
        ))
    }


    function addExam ()
    {
        setExams([
            ...exams,
            {
                id: Date.now(),
                examName: "",
                notes: "",
                isCustom: false,
                idConsultation: consultation?.id,
                idPatient: patientInfo?.id,
                idMedicalStaff: consultation?.idMedicalStaffGiver?.id
            },
        ])
    }


    async function loadMedication()
    {
        try {
            const response = await axiosInstance.get("/product/?page_size=100");
            if (response.status === 200)
            {
                console.log("medimentations ", response.data);
                setAvailableMedication(response.data.results);
            }

        }
        catch (error)
        {
            console.log(error);
        }

    }


    async function loadExams()
    {
        try
        {
            const response = await axiosInstance.get("/exam/?page_size=100");
            if (response.status === 200)
            {
                console.log("exams ", response.data);
                setAvailableExams(response.data.results);
            }

        }
        catch (error) {
            console.log(error);
        }
    }



    useEffect(() => {
        loadMedication();
        loadExams();
    }, []);


    function removeExam (id)  {
        setExams(exams.filter((e) => e.id !== id))
    }


    function applyInputStyle ()
    {
        return "w-full p-3 border-2 border-gray-300 bg-white rounded-lg focus:outline-none  focus:border-primary-end focus:border-2 transition-all duration-500";
    }







    async function updateConsultation(e)
    {
        e.preventDefault();
        setIsUpdatingConsultation(true);
        let medicalFolderPageData =
            {
                diagnostic: diagnostic,
                doctorNote: doctorNote,
            }
        try
        {
            const consultationUpdateResponse = await axiosInstance.put(`/medical-folder/${medicalPageInfo?.idMedicalFolder}/update-page/${medicalPageInfo?.id}/`, medicalFolderPageData);
            setIsUpdatingConsultation(false);
            if (consultationUpdateResponse.status === 200)
            {
                console.log("updated consultation with diagnostic and notes: ", consultationUpdateResponse?.data);
                setTransactionErrorMessage("");
                setDiagnostic("");
                setDoctorNote("");
            }
        }
        catch (error)
        {
            setIsUpdatingConsultation(false);
            setTransactionErrorMessage("Something went wrong when updating the consultation with your diagnostic and notes, please try again!");
            console.log(error);
        }

    }




    async function handlePrescribeMedicament(e)
    {
        e.preventDefault();
        setIsPrescribing(true);
        let prescriptionData = {

            prescription_drugs: prescriptions.map((prescription) => Object.fromEntries(Object.entries(prescription).filter(([key]) => key !== "id"))),
            note:'',
            idConsultation: consultation?.id,
            idPatient: patientInfo?.id,
            idMedicalStaff: consultation?.idMedicalStaffGiver?.id
        }

        try
        {
            const prescriptionResponse = await axiosInstance.post("/prescription/", prescriptionData);
            setIsPrescribing(false);
            if (prescriptionResponse.status === 201)
            {
                console.log("created prescription ",prescriptionResponse?.data);
                setTransactionErrorMessage("");
                setPrescriptions([
                    {
                        id: Date.now(),
                        medicament: "",
                        dosage: "",
                        frequency: "",
                        duration: "",
                        instructions: "",
                        quantity:"",
                    },
                ])
            }
        }
        catch (error)
        {
            setIsPrescribing(false);
            setTransactionErrorMessage("something when wrong when prescribing medications, please retry")
            console.log(error);
            
        }

        console.log(prescriptionData);
    }




    async function endConsultation()
    {
        setIsEndingConsultation(true);
        let updatedData =
            {
                state: 'InProgress'
            }
        try
        {
            const response = await axiosInstance.patch(`/consultation/${consultation?.id}/`, updatedData);
            setIsEndingConsultation(false);
            if (response.status === 200)
            {
                setSuccessMessage("Successfully Ending consultation !")
                setErrorMessage("");
                setCanOpenErrorMessageModal(false);
                setCanOpenSuccessModal(true);
                console.log(response?.data);
            }
        }
        catch (error)
        {
            setIsEndingConsultation(false);
            setSuccessMessage("");
            setErrorMessage(`Something went wrong, when ending consultation with ${patientInfo?.firstName + patientInfo?.lastName}, please try again!`);
            setCanOpenSuccessModal(false);
            setCanOpenErrorMessageModal(true);
            console.log(error);
        }
    }




    async function handlePrescribeExams(e)
    {
        e.preventDefault();
        setIsPrescribingExams(true);
        let examsData = exams.map((exam) => Object.fromEntries(Object.entries(exam).filter(([key]) => (key !== "id" && key !== "isCustom" && exam.idExam !== "another"))));


        try
        {
            const examRequestResponse = await axiosInstance.post("/exam-request/", examsData);
            setIsPrescribingExams(false);
            if (examRequestResponse.status === 201)
            {
                setTransactionErrorMessage("");
                console.log(examRequestResponse?.data);
            }
        }
        catch (error)
        {
            setIsPrescribingExams(false);
            setTransactionErrorMessage("Something when wrong  with the sever when prescribing exams, please retry !!");
            console.log(error);
        }
        console.log(examsData)
    }



    async function handlePrescribeAppointment(e)
    {
        e.preventDefault();
        setIsPrescribingAppointment(true);
        let appointmentData = {
            atDate: combineToISOString(appointmentDate, appointmentTime),
            reason: appointmentReason,
            requirements: requirements,
            idConsultation: consultation?.id,
            idPatient: patientInfo?.id,
            idMedicalStaff: consultation?.idMedicalStaffGiver?.id,
        }
        try
        {
            const appointmentRequestResponse = await axiosInstance.post("/appointment/", appointmentData);
            setIsPrescribingAppointment(false);
            if (appointmentRequestResponse.status === 201)
            {
                console.log(appointmentRequestResponse?.data);
            }
        }
        catch (error)
        {
            setIsPrescribingAppointment(false);
            setTransactionErrorMessage("Something when wrong  with the sever when creating your appointment, please retry !!");
            console.log(error);
        }
    }




    function closeConsultation()
    {
        navigate(-1);
    }




    const navigate = useNavigate();




    return (

        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            < DoctorNavBar/>
            <div className="flex flex-col min-h-screen p-8 ">

                {/* Patient Infos */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                            <User className="w-12 h-12 text-black"/>
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                            <div className="flex justify-between">
                                <h1 className="text-3xl font-bold text-white">CONSULTATION
                                    OF {patientInfo?.firstName || 'Not Specified'} {patientInfo?.lastName || 'Not Specified'}</h1>

                                <p className="text-white font-bold text-xl">
                                    {formatDateOnly(new Date())}
                                </p>
                            </div>
                            <div className="mt-3.5 grid grid-cols-3 gap-4 font-semibold">
                                <div className="flex items-center gap-2 text-white">
                                    <Calendar className="w-6 h-6"/>
                                    <div className="flex flex-col">
                                        <span>Born on {patientInfo?.birthDate && formatDateOnlyWithoutWeekDay(patientInfo?.birthDate) || 'Not Specified'}</span>
                                        <div className="flex gap-1 mt-0.5 ">
                                            <span className="text-white text-sm">{ageValue}</span>
                                            <span className="text-white text-sm">{ageUnit}</span>
                                        </div>
                                    </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <MapPin className="w-6 h-6"/>
                                        <span>{patientInfo?.address || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white">
                                        <Phone className="w-6 h-6"/>
                                        <span>{patientInfo?.phoneNumber || 'Not Specified'}</span>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>


                {/* Go back */}
                <div className="bg-gray-100 shadow-md rounded-lg mb-5 p-4 ">
                    <div className="flex justify-between items-center ">
                        <div className="flex justify-start">
                            <button onClick={() => navigate(-1)}
                                    className="text-secondary text-xl transition-all duration-300 font-bold flex gap-2 items-center">
                                <div className="w-8 h-8 border-2 rounded-full flex justify-center items-center border-secondary">
                                    <ArrowLeft/>
                                </div>
                                <p className="text-[17px] mt-0.5">Back To Consultation List</p>
                            </button>
                        </div>
                         <div className="flex items-center">
                            <button
                                onClick={() => {
                                    window.print()
                                }}
                                className="bg-secondary font-bold duration-300  text-white px-4 py-2 rounded-md hover:bg-primary-end hover:text-white transition-all mr-2">
                                <Printer size={20} className="inline mr-2"/>
                                Print Medical Folder Page
                            </button>
                        </div>
                    </div>
                </div>



                {/* Patient Parameters */}
                <div className="w-full mx-auto">
                    <div className="bg-gray-100 flex flex-col w-full rounded-lg  p-6">
                        <p className="font-bold text-xl ml-5 text-secondary">Patient Parameters</p>
                        <div className="grid grid-cols-4 gap-4 mt-6">
                            {MedicalParametersInfos.map((info, index) => (
                                <MedicalParametersCard
                                    key={index}
                                    icon={info.icon}
                                    label={info.label}
                                    value={info.value}
                                    unit={info.unit}
                                />
                            ))}
                        </div>
                    </div>


                    {/* Nurse Notes */}
                    <div className="mt-5 bg-gray-100 flex flex-col w-full rounded-lg  p-6 hover:shadow-lg hover:-translate-y-1.5 duration-500 transition-all">
                        <h3 className="mb-2 flex items-center font-bold text-xl ml-5 text-secondary">
                            Nurse Notes
                        </h3>
                        <p className="text-md text-gray-600">
                            {consultation?.consultationNotes || 'No note from the nurse'}
                        </p>
                    </div>


                    {/* Consultation Steps */}
                    <div className="mt-14">
                        <div className="flex space-x-14 mb-6 border-b">
                            {consultationSteps.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`pb-2 px-2 text-md transition-all duration-500 ease-in-out ${getConsultationStepsStyles(activeTab === tab.name)}`}
                                >
                                    <div className="flex items-center">
                                        <tab.icon className="h-5 w-5 mr-2"/>
                                        {tab.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div>
                            {transactionErrorMessage && <p className="text-red-500  font-semibold text-md ml-5 mt-2 mb-2">{transactionErrorMessage}</p>}
                            {activeTab === "diagnostic" && <DiagnosticCard applyInputStyle={applyInputStyle} setDiagnostic={setDiagnostic} setDoctorNotes={setDoctorNote} diagnostic={diagnostic} doctorNotes={doctorNote}  handleConsult={updateConsultation}  endConsultation={endConsultation}  isUpdatingConsultation={isUpdatingConsultation}   />}
                            {activeTab === "prescriptions" && <MedicationPrescriptionCard prescriptions={prescriptions} availableMedications={availableMedications} updatePrescription={updatePrescription} removePrescription={removePrescription} addPrescription={addPrescription} applyInputStyle={applyInputStyle} handlePrescribe={handlePrescribeMedicament} endConsultation={endConsultation} isPrescribing = {isPrescribing}/>}
                            {activeTab === "exams" && <ExamPrescriptionCard exams={exams} availableExams={availableExams} setExams={setExams} removeExam={removeExam} addExam={addExam} applyInputStyle={applyInputStyle} handlePrescribeExam={handlePrescribeExams} endConsultation={endConsultation} isPrescribingExam={isPrescribingExam}/>}
                            {activeTab === "appointment" && <AppointmentPrescriptionCard applyInputStyle={applyInputStyle} setAppointmentReason={setAppointmentReason} appointmentReason={appointmentReason} setRequirements={setRequirements} setAppointmentDate={setAppointmentDate} setAppointmentTime={setAppointmentTime} requirements={requirements} appointmentDate={appointmentDate} appointmentTime={appointmentTime} endConsultation={endConsultation} onSubmit={handlePrescribeAppointment} isPrescribingAppointment={isPrescribingAppointment}/>}
                        </div>
                    </div>
                </div>
            </div>

            {isEndingConsultation && <Wait/>}
            <SuccessModal isOpen={canOpenSuccessModal} canOpenSuccessModal={setSuccessMessage} message={successMessage} makeAction={closeConsultation}/>
            <ErrorModal isOpen={canOpenErrorMessageModal} onCloseErrorModal={setCanOpenErrorMessageModal} message={errorMessage}/>
        </CustomDashboard>
    );
}

