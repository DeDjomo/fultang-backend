import {  Stethoscope, History, Eye } from 'lucide-react';
import PropTypes from "prop-types";
import {useNavigate} from "react-router-dom";
import {Tooltip} from "antd";





export function PatientList ({patients, setCanOpenViewPatientDetailModal, setSelectedPatient}){

    PatientList.propTypes = {
        patients: PropTypes.array.isRequired,
        setCanOpenViewPatientDetailModal: PropTypes.func.isRequired,
        setSelectedPatient: PropTypes.func.isRequired
    }

    const navigate = useNavigate();




    return (
        <table className="w-full border-separate border-spacing-y-2">
            <thead>
            <tr>
                <th className="text-center p-4 text-xl font-bold border-r-2 border-gray-200">No</th>
                <th className="text-center p-4 text-xl font-bold border-r-2 border-gray-200">Firstname
                </th>
                <th className="text-center p-4 text-xl font-bold border-r-2 border-gray-200 ">Lastname
                </th>
                <th className="text-center p-4 text-xl font-bold border-r-2 border-gray-200 ">Gender</th>
                 <th className="text-center p-4 text-xl font-bold border-r-2 border-gray-200 ">Birth Date</th>
                <th className="text-center p-4 text-xl font-bold  flex-col">
                    <p>Operations</p>
                </th>
            </tr>
            </thead>
            <tbody>
            {patients.map((patient, index) => (
                <tr key={patient.id || index} className="bg-gray-100">
                    <td className="p-4 text-md text-blue-900 rounded-l-lg text-center">{index + 1}</td>
                    <td className="p-4 text-md text-blue-900 font-bold text-center">{patient.firstName}</td>
                    <td className="p-4 text-md text-center font-semibold">{patient.lastName}</td>
                    <td className="p-4 text-md text-center">{patient.gender}</td>
                    <td className="p-4 text-md text-center">{patient.birthDate}</td>
                    <td className="p-4 relative rounded-r-lg">
                        <div className="flex items-center justify-center gap-3">


                            <Tooltip placement={"left"} title={"view patient information"}>
                                <button
                                    className="p-2 hover:bg-gray-300 rounded-full transition-all duration-300"
                                    onClick={() => {setSelectedPatient(patient), setCanOpenViewPatientDetailModal(true)}}
                                >
                                    <Eye className="h-6 w-6 text-primary-end"/>
                                </button>
                            </Tooltip>


                            <Tooltip placement={"top"} title={"Take medical parameters"}>
                                <button className="p-2 hover:bg-gray-300 rounded-full transition-all duration-300"
                                    onClick={() => navigate(`/nurse/patients/take-parameters/${patient.id}`, {state: {patient: patient}})}
                                >
                                    <Stethoscope className="h-6 w-6 text-primary-end"/>
                                </button>
                            </Tooltip>


                            <Tooltip placement={"right"} title={"View history"}>
                                <button className="p-2 hover:bg-gray-300 rounded-full transition-all duration-300"
                                        onClick={() => console.log('View history for:', patient.id)}
                                >
                                    <History className="h-6 w-6 text-primary-end"/>
                                </button>
                            </Tooltip>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>

)
}