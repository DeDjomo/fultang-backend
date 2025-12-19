import {
    Microscope,
    Pill,
    User,
    Calendar,
    Weight,
    Ruler,
    Thermometer,
    Activity,
    PillIcon as Pills,
    FileText,
    Stethoscope,
    ClipboardList, Heart, AlertTriangle, MapPin, Phone, ArrowLeft, Printer, Clock,
} from "lucide-react"
import {doctorNavLink} from "./lib/doctorNavLink.js";
import {DoctorNavBar} from "./DoctorComponents/DoctorNavBar.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import {useCalculateAge} from "../../Utils/compute.js";
import {formatDateOnly, formatDateOnlyWithoutWeekDay, formatDateToTime} from "../../Utils/formatDateMethods.js";
import MedicalParametersCard from "./DoctorComponents/MedicalParametersCard.jsx";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {useEffect, useState} from "react";
import {GiMedicines} from "react-icons/gi";
import {FaEdit} from "react-icons/fa";
import EditConsultationModal from "./DoctorComponents/EditConsultationModal.jsx";

export  function ConsultationHistoryDetails() {

    const {state} = useLocation();
    const consultation = state?.consultation || {};

    const patientInfos = consultation?.idPatient;
    const medicalFolderPageInfos = consultation?.idMedicalFolderPage;

    const {calculateAge} = useCalculateAge();
    const { value: ageValue, unit: ageUnit } = calculateAge(patientInfos?.birthDate);


    const MedicalParametersInfos = [
        {
            icon: Weight,
            label: 'Weight',
            value: medicalFolderPageInfos?.parameters?.weight || '-',
            unit:  medicalFolderPageInfos?.parameters?.weight && ' Kg'
        },
        {
            icon: Ruler,
            label: 'Height',
            value: medicalFolderPageInfos?.parameters?.height || '-',
            unit: medicalFolderPageInfos?.parameters?.height && ' m²'
        },
        {
            icon: Thermometer,
            label: 'Temperature',
            value: medicalFolderPageInfos?.parameters?.temperature || '-',
            unit:  medicalFolderPageInfos?.parameters?.temperature && '°C'
        },
        {
            icon: Activity,
            label: 'Blood Pressure',
            value: medicalFolderPageInfos?.parameters?.bloodPressure || '-',
            unit: medicalFolderPageInfos?.parameters?.bloodPressure && ' mmHg'
        },
        {
            icon: Heart,
            label: 'Heart Rate',
            value: medicalFolderPageInfos?.parameters?.heartRate || '-',
            unit: medicalFolderPageInfos?.parameters?.heartRate && ' bpm'
        },
        {
            icon: AlertTriangle,
            label: 'Allergies',
            value: medicalFolderPageInfos?.parameters?.allergies || '-'
        },
        {
            icon: Pills,
            label: 'Family Medical History',
            value: medicalFolderPageInfos?.parameters?.familyMedicalHistory || '-'
        },
        {
            icon: FileText,
            label: 'Current Medication',
            value: medicalFolderPageInfos?.parameters?.currentMedication || '-'
        }
    ];

    useEffect(() => {
        console.log(consultation);
    }, []);


    const navigate = useNavigate();
    const [canOpenEditConsultationModal, setCanOpenEditConsultationModal] = useState(false);


    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar/>
        <div className="space-y-6">

            {/* Patient Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                            <User className="w-12 h-12 text-black"/>
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                            <div className="flex justify-between">
                                <h1 className="text-3xl font-bold text-white">CONSULTATION
                                    OF {patientInfos?.firstName || 'NGOUPAYE DJIO'} {patientInfos?.lastName || 'Thierry'}</h1>

                                <p className="text-white font-bold text-xl">
                                    {consultation?.consultationDate ? formatDateOnly(consultation?.consultationDate) : ' Any Date Specified'}
                                </p>
                            </div>
                            <div className="mt-3.5 grid grid-cols-3 gap-4 font-semibold">
                                <div className="flex items-center gap-2 text-white">
                                    <Calendar className="w-6 h-6"/>
                                    <div className="flex">
                                        <span>Born on {patientInfos?.birthDate && formatDateOnlyWithoutWeekDay(patientInfos?.birthDate) || 'Not Specified'}</span>
                                        <div className="flex gap-1 mt-0.5 ">
                                            <span className="ml-2 text-white text-sm">({ageValue}</span>
                                            <span className="text-white text-sm">{ageUnit})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-white">
                                    <MapPin className="w-6 h-6"/>
                                    <span>{patientInfos?.address || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white">
                                    <Phone className="w-6 h-6"/>
                                    <span>{patientInfos?.phoneNumber || 'Not Specified'}</span>
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
                                <div
                                    className="w-8 h-8 border-2 rounded-full flex justify-center items-center border-secondary">
                                    <ArrowLeft/>
                                </div>
                                <p className="text-[17px] mt-0.5">Back To Consultation History List</p>
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center">
                                <button
                                    onClick={() => {setCanOpenEditConsultationModal(true)}}
                                    className="bg-secondary font-bold duration-300  text-white px-4 py-2 rounded-md hover:bg-primary-end hover:text-white transition-all mr-2">
                                    <FaEdit size={20} className="inline mr-2"/>
                                    Edit Consultation
                                </button>
                            </div>


                            <div className="flex items-center">
                                <button
                                    onClick={() => {
                                        window.print();
                                    }}
                                    className="bg-secondary font-bold duration-300  text-white px-4 py-2 rounded-md hover:bg-primary-end hover:text-white transition-all mr-2">
                                    <Printer size={20} className="inline mr-2"/>
                                    Print Medical Folder Page
                                </button>
                            </div>

                        </div>

                    </div>
                </div>


                {/* Medical Parameters */}
                <div className="w-full mx-auto">
                    <div className="bg-gray-100 flex flex-col w-full rounded-lg  p-6">
                        <p className="font-bold text-xl ml-5 text-secondary">Patient Medical Parameters</p>
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
                </div>




                {/* Consultation Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">

                    {/*Nurse Notes*/}

                    <div className="mb-10">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <ClipboardList className="h-5 w-5 mr-2 text-blue-500"/>
                            Nurse Notes
                        </h3>
                        <p className="text-gray-700 ml-10">{medicalFolderPageInfos?.nurseNotes || consultation?.consultationNotes || 'Not Specified'}</p>
                    </div>


                    {/*Doctor notes*/}
                    <div className="mb-10">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <ClipboardList className="h-5 w-5 mr-2 text-blue-500"/>
                            Doctor Notes
                        </h3>
                        <p className="text-gray-700 ml-10">{medicalFolderPageInfos?.doctorNote || 'Not Specified'}</p>
                    </div>


                    {/* Diagnostic */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Stethoscope className="h-5 w-5 mr-2 text-blue-500"/>
                            Diagnostic
                        </h3>
                        <p className="text-gray-700 ml-10">{medicalFolderPageInfos?.diagnostic || 'Not Specified'}</p>
                    </div>




                    {/* Prescriptions */}
                    <div className="mb-10">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <GiMedicines className="h-5 w-5 mr-2 text-blue-500"/>
                            Prescriptions
                        </h3>
                        {medicalFolderPageInfos?.prescriptions && medicalFolderPageInfos?.prescriptions.length > 0 && (
                            <div className="grid grid-cols-2 gap-5">
                                {medicalFolderPageInfos?.prescriptions.map((prescription) => {
                                    let drugsInfo = []
                                    drugsInfo = prescription?.prescriptionDrug;
                                    return (
                                        drugsInfo.length > 0 && drugsInfo.map((drugInfo, index) => (
                                    <div key={index} className="bg-gray-100 p-4 rounded-lg">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="flex items-start">
                                                <Pill className="h-6 w-6 text-blue-500 mt-1" />
                                                <div className="ml-2">
                                                    <span className="text-sm text-gray-500">Medicine</span>
                                                    <p className="font-medium">{drugInfo?.medicament?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                     className="h-6 w-6 text-blue-500 mt-1" fill="none"
                                                     viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                                </svg>
                                                <div className="ml-2">
                                                    <span className="text-sm text-gray-500">Dosage</span>
                                                    <p className="font-medium">{drugInfo?.dosage ? drugInfo?.dosage : "not specified"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <Clock className="h-6 w-6 text-blue-500 mt-1"/>
                                                <div className="ml-2">
                                                    <span className="text-sm text-gray-500">Frequency</span>
                                                    <p className="font-medium">{drugInfo?.frequency}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <Calendar className="h-6 w-6 text-blue-500 mt-1" />
                                                <div className="ml-2">
                                                    <span className="text-sm text-gray-500">Duration</span>
                                                    <p className="font-medium">{drugInfo?.duration ? drugInfo?.duration : "not specified"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                        ))
                                    )
                                })}
                            </div>
                        )}
                    </div>



                    {/* Exams */}
                    {medicalFolderPageInfos?.examRequests && medicalFolderPageInfos?.examRequests.length > 0 && (
                        <div className="mb-5">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-blue-500"/>
                                Prescribed Exams
                            </h3>
                            <div className="grid grid-cols-2">
                                {medicalFolderPageInfos?.examRequests.map((exam, index) => (

                                    <div key={index} className="bg-gray-100 p-4 rounded-lg grid grid-cols-2">
                                        <div className="flex mb-2">
                                            <Microscope className="h-6 w-6 text-blue-500 mt-1"/>
                                            <div className="ml-2">
                                                <span className="text-sm text-gray-500">Exams</span>
                                                <p className="font-medium">{exam?.idExam?.examName}</p>
                                            </div>
                                        </div>

                                        {/*
                                        <div className="flex mb-2">
                                            <FileText className="h-6 w-6 text-blue-500 mt-1"/>
                                            <div className="ml-2">
                                                <span className="text-sm text-gray-500">Exam Description</span>
                                                <p className="font-medium">{exam?.idExam?.examDescription}</p>
                                            </div>
                                        </div>*/}

                                        <div className="flex mb-2">
                                            <FileText className="h-6 w-6 text-blue-500 mt-1"/>
                                            <div className="ml-2">
                                                <span className="text-sm text-gray-500">Instructions</span>
                                                <p className="font-medium">{exam?.notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Appointment */}
                    {consultation?.appointments && consultation?.appointments.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-blue-500"/>
                                Scheduled Appointments
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                {consultation?.appointments.map((appointment, index) => (
                                    <div key={index} className="bg-gray-100 p-4 rounded-lg">
                                        <div className="flex gap-20">
                                            <div className="mb-2">
                                                <div className="flex gap-2">
                                                    <Calendar className="text-blue-500"/>
                                                    <span className="text-sm text-gray-500">Date</span>
                                                </div>
                                                <p className="font-medium ml-8">{appointment?.atDate ? formatDateOnly(appointment?.atDate) : 'Not Specified'}</p>
                                            </div>
                                            <div>
                                                <div className="flex gap-2">
                                                    <Clock className="text-blue-500"/>
                                                    <span className="text-sm text-gray-500">Time</span>
                                                </div>
                                                <p className="text-gray-700 ml-8">{appointment?.atDate ? formatDateToTime(appointment?.atDate) : 'Not Specified'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-500">Reason</span>
                                            <p className="text-gray-700">{appointment?.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

            <EditConsultationModal
                isOpen={canOpenEditConsultationModal}
                onClose={() => setCanOpenEditConsultationModal(false)}
                consultation={consultation}
                onSave={()=>{alert("save")}}
            />
        </CustomDashboard>
    )
}

