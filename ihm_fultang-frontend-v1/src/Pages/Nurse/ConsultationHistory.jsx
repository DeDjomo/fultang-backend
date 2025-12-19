import {NurseNavBar} from "./NurseNavBar.jsx";
import PatientInformationBoard from "./PatientInformationBoard.jsx";
import {useLocation} from "react-router-dom";
import {FaSearch} from "react-icons/fa";
import flecheDeroulanteBas from "../../assets/flecheDeroulanteBas.png"
import flecheDeroulanteHaut from "../../assets/flecheDeroulanteHaut.png";
import {useState} from "react";
import {nurseNavLink} from "./nurseNavLink.js";
import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";

export function ConsultationHistory()
{

    const { state } = useLocation();
    const patient = state?.patient;
    const [isHospitalMenuOpen, setIsHospitalMenuOpen] = useState(false);
    const [isConsultationMenuOpen, setIsConsultationMenuOpen] = useState(false);
    const [isPrescriptionMenuOpen, setIsPrescriptionMenuOpen] = useState(true);
    const [isExamMenuOpen, setIsExamMenuOpen] = useState(false);

    const HospitalisationHistory =
        [
            {
                startDate: "Jan, 12 2023",
                startTime: "10:00 a.m",
                bed: "Bed 2 By RAS",
                endDate: "Jan, 15 2023",
                endTime: "10:00 a.m",
            },
            {
                startDate: "Jan, 12 2023",
                startTime: "10:00 a.m",
                bed: "Bed 2 By RAS",
                endDate: "Jan, 15 2023",
                endTime: "10:00 a.m",
            }
        ]


    const prescriptionHistory =
        [
            {
                date: "Jan, 12 2023",
                time: "10:45 a.m",
                dose: "RAS",
                doctor: "Mr BATCHAKUI, Doctor",
                medicine: "Paracetamol"
            },
            {
                date: "Jan, 12 2023",
                time: "10:45 a.m",
                dose: "2 times per day during 2 weeks",
                doctor: "Mr BATCHAKUI, Doctor",
                medicine: "Paracetamol"
            }
        ]

    return (
        <>
            <DashBoard linkList={nurseNavLink} requiredRole={"Nurse"}>
                <NurseNavBar>
                    <div className="mt-5 flex gap-4">
                        <PatientInformationBoard patient={patient}/>

                        {/* Historical content */}
                        <div className="flex-1 flex flex-col mr-2 gap-4 mb-5">
                            <div className="w-full h-[150px] border shadow-xl rounded-lg flex flex-col">
                                <h1 className="font-bold text-secondary text-2xl mt-3 ml-4">Appointments</h1>
                            </div>
                            <div className="flex-1 border shadow-xl rounded-lg flex flex-col">
                                <h1 className="font-bold text-secondary text-2xl mt-3 ml-4 mb-3"> Historical</h1>


                                {/*Search content*/}
                                <div className="ml-4 flex">
                                    <div className="w-2/5 border rounded-lg bg-gray-200 py-2">
                                        <input type="date" className="ml-3 w-5/6 border-none bg-gray-200 ring-0 focus:ring-0 focus:border-0 focus:outline-none"/>
                                    </div>
                                    <div className="ml-4 w-2/5 col-span-3 border rounded-lg bg-gray-200 py-2">
                                        <input type="date" className="ml-3 w-5/6 border-none bg-gray-200 ring-0 focus:ring-0 focus:border-0 focus:outline-none"/>
                                    </div>
                                    <div className="ml-6 flex-1 items-center justify-center">
                                        <button className="px-5 py-2 bg-secondary text-white rounded-lg font-bold">
                                            <FaSearch className="text-2xl text-center"/>
                                        </button>
                                    </div>
                                </div>


                                {/*Consultation content*/}
                                <div className="mt-2">
                                    <div className="justify-between flex">
                                        <h2 className="text-xl text-secondary font-bold mt-8 ml-10 mb-2">Consultation</h2>
                                        <button
                                            onClick={()=>setIsConsultationMenuOpen(!isConsultationMenuOpen)}
                                            className="mr-5 mt-8 hover:bg-gray-300 hover:rounded-full w-8 h-8 flex justify-center items-center duration-300 transition-all cursor-pointer">
                                            {isConsultationMenuOpen ? (<img src={flecheDeroulanteBas} alt={"menu"} className="w-4 h-3"/>): (<img src={flecheDeroulanteHaut} alt={"menu"} className="w-4 h-3"/>)}
                                        </button>
                                    </div>
                                    <div className="flex flex-col border-b-2 border-b-gray-300 ml-5 mr-2">
                                    </div>
                                </div>



                                {/*Hospitalisation content*/}
                                <div className="mt-4">
                                    <div className="justify-between flex">
                                        <h2 className="text-xl text-secondary font-bold mt-8 ml-10 mb-2">Hospitalisation</h2>
                                        <button
                                            onClick={()=>setIsHospitalMenuOpen(!isHospitalMenuOpen)}
                                            className="mr-5 mt-8 hover:bg-gray-300 hover:rounded-full w-8 h-8 flex justify-center items-center duration-300 transition-all cursor-pointer">
                                            {isHospitalMenuOpen ? (<img src={flecheDeroulanteBas} alt={"menu"} className="w-4 h-3"/>): (<img src={flecheDeroulanteHaut} alt={"menu"} className="w-4 h-3"/>)}
                                        </button>
                                    </div>
                                    <div className="flex flex-col border-t-2 border-t-gray-300 ml-5 mr-2">
                                        {isHospitalMenuOpen && (
                                            <>
                                                {HospitalisationHistory.map((item, index) => (
                                                    <div key={index} className="flex mt-2 bg-gray-200 rounded-lg p-2">
                                                        <div className="ml-2 w-1/2 py-1 border-r-2 border-r-gray-400">
                                                            <h3 className="text-xl font-bold">Registered On</h3>
                                                            <div className="mt-2 mb-1 flex justify-between">
                                                                <p className="w-1/4">{item.startDate}</p>
                                                                <p className="w-1/4 mr-10">{item.startTime}</p>
                                                            </div>
                                                            <p className="w-1/4">{item.bed}</p>
                                                        </div>
                                                        <div className="w-1/2 py-1 ml-10">
                                                            <h3 className="text-xl font-bold">Remved On</h3>
                                                            <div className="flex justify-between mt-3">
                                                                <p className="w-1/4">{item.endDate}</p>
                                                                <p className="w-1/4 mr-10">{item.endTime}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>



                                {/*Prescription content*/}
                                <div className="mt-2 mb-2">
                                    <div className="justify-between flex">
                                        <h2 className="text-xl text-secondary font-bold mt-8 ml-10 mb-2">Prescription</h2>
                                        <button
                                            onClick={()=>setIsPrescriptionMenuOpen(!isPrescriptionMenuOpen)}
                                            className="mr-5 mt-8 hover:bg-gray-300 hover:rounded-full w-8 h-8 flex justify-center items-center duration-300 transition-all cursor-pointer">
                                            {isPrescriptionMenuOpen ? (<img src={flecheDeroulanteBas} alt={"menu"} className="w-4 h-3"/>): (<img src={flecheDeroulanteHaut} alt={"menu"} className="w-4 h-3"/>)}
                                        </button>
                                    </div>
                                    <div className="flex flex-col border-t-2 border-t-gray-300 ml-5 mr-2">
                                        {isPrescriptionMenuOpen && (
                                            <>
                                                { prescriptionHistory.map((item, index) => (
                                                    <div key={index} className="flex mt-2 bg-gray-200 rounded-lg p-2">
                                                        <div className="ml-2 w-1/3 py-1 border-r-2 border-r-gray-400">
                                                            <h3 className="text-xl font-bold">Registered On</h3>
                                                            <div className="mb-1 flex justify-between mt-5">
                                                                <p >{item.date}</p>
                                                                <p className="mr-2">{item.time}</p>
                                                            </div>
                                                        </div>

                                                        <div className="ml-5 w-1/3 py-1 border-r-2 border-r-gray-400">
                                                            <h3 className="text-xl font-bold mb-1">Medicine Prescribed</h3>
                                                            <p className="text-md">{item.medicine}</p>
                                                            <div className="flex">
                                                                <p className="font-bold mr-2 ">Usage:</p>
                                                                <p>{item.dose}</p>
                                                            </div>

                                                        </div>

                                                        <div className="w-1/3 py-1 ml-10">
                                                            <h3 className="text-xl font-bold">prescribed by</h3>
                                                            <div className="flex justify-between mt-3">
                                                                <p className="text-secondary font-bold">{item.doctor}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>



                                {/*Exam content*/}
                                <div className="mt-2 mb-5">
                                    <div className="justify-between flex">
                                        <h2 className="text-xl text-secondary font-bold mt-8 ml-10 mb-2">Exams</h2>
                                        <button
                                            onClick={()=>setIsExamMenuOpen(!isExamMenuOpen)}
                                            className="mr-5 mt-8 hover:bg-gray-300 hover:rounded-full w-8 h-8 flex justify-center items-center duration-300 transition-all cursor-pointer">
                                            {isExamMenuOpen ? (<img src={flecheDeroulanteBas} alt={"menu"} className="w-4 h-3"/>): (<img src={flecheDeroulanteHaut} alt={"menu"} className="w-4 h-3"/>)}
                                        </button>
                                    </div>
                                    <div className="flex flex-col border-b-2 border-b-gray-300 ml-5 mr-2">
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </NurseNavBar>
            </DashBoard>
        </>

    )
}
