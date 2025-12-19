import {FaArrowLeft, FaArrowRight, FaEdit, FaEye, FaSearch} from "react-icons/fa";
import {Tooltip} from "antd";
import {useEffect, useState} from "react";
import {ViewPatientDetailsModal} from "../Receptionist/ViewPatientDetailsModal.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import {DoctorNavBar} from "./DoctorComponents/DoctorNavBar.jsx";
import {doctorNavLink} from "./lib/doctorNavLink.js";
import {useNavigate} from "react-router-dom";
import {useAuthentication} from "../../Utils/Provider.jsx";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";


export function DoctorPatientList()
{





    const [selectedPatientDetails, setSelectedPatientDetails] = useState({});
    const [canOpenViewPatientDetailModal, setCanOpenViewPatientDetailModal] = useState(false);
    const [patients, setPatients] = useState([]);
    const [numberOfPatients, setNumberOfPatients] = useState(0);
    const [nexUrlForRenderPatientList, setNexUrlForRenderPatientList] = useState("");
    const [previousUrlForRenderPatientList, setPreviousUrlForRenderPatientList] = useState("");
    const [actualPageNumber, setActualPageNumber] = useState(1);
    const {userData} = useAuthentication();
    const [isLoading, setIsLoading] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");



    function calculateNumberOfSlide() {
        return numberOfPatients % 5 === 0 ? numberOfPatients / 5 : Math.floor(numberOfPatients / 5) + 1;
    }


    function updateActualPageNumber(action) {
        if (action === "next")
        {
            if(actualPageNumber < calculateNumberOfSlide())
            {
                setActualPageNumber(actualPageNumber + 1);
            }
        }
        else
        {
            if(actualPageNumber > 1)
            {
                setActualPageNumber(actualPageNumber - 1);
            }
        }
    }


    async function fetchPatients () {
        setIsLoading(true);
        try
        {
            const response = await axiosInstance.get(`/patient/doctor/${userData?.id}/`);
            setIsLoading(false);
            if (response.status === 200)
            {
                setErrorMessage("");
                setErrorStatus(null);
                console.log(response);
                setPatients(response.data);
                setNumberOfPatients(response.data.length);
                setNexUrlForRenderPatientList(response.data.next);
                setPreviousUrlForRenderPatientList(response.data.previous);
            }
        }
        catch (error)
        {
            setIsLoading(false);
            setPatients([]);
            setNumberOfPatients(0);
            setNexUrlForRenderPatientList("");
            setPreviousUrlForRenderPatientList("");
            setErrorMessage("Something went wrong when retrieving patient list");
            setErrorStatus(error.status);
            console.log(error);
        }

    }

    useEffect(() => {
        fetchPatients();
    }, []);





    async function fetchNextOrPreviousPatientList(url)
    {
        if(url)
        {
            setIsLoading(true);
            try
            {
                const response = await axiosInstance.get(url);
                setIsLoading(false);
                if (response.status === 200)
                {
                    setErrorMessage("");
                    setErrorStatus(null);
                    setPatients(response.data.results);
                    setNumberOfPatients(response.data.count);
                    setNexUrlForRenderPatientList(response.data.next);
                    setPreviousUrlForRenderPatientList(response.data.previous);
                }
            } catch (error) {
                setIsLoading(false);
                setPatients([]);
                setNumberOfPatients(0);
                setPreviousUrlForRenderPatientList("");
                setNexUrlForRenderPatientList("");
                setErrorStatus("Something went wrong when retrieving patient list");
                setErrorStatus(error.status);
                console.log(error);
            }
        }
    }






    const navigate = useNavigate();


    return (
        <CustomDashboard linkList={doctorNavLink} requiredRole={"Doctor"}>
            <DoctorNavBar/>
            <div className="mt-5 flex flex-col relative">

                {/*Header content with search bar*/}
                <div className="flex justify-between mb-5 mt-2">
                    <p className="font-bold text-3xl  ml-5"> List Of Patient </p>
                    <div className="flex mr-5">
                        <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg">
                            <FaSearch className="text-xl text-secondary m-2"/>
                            <input
                                type="text"
                                placeholder={"search for a specific patient"}
                                className="border-none focus:outline-none focus:ring-0"
                            />
                        </div>
                        <button className="ml-2 w-20 h-10 text-white bg-secondary rounded-lg">
                            Search
                        </button>
                    </div>
                </div>

                {/*List of registered patients*/}

                {isLoading ? (
                    <div className="h-[500px] w-full flex justify-center items-center">
                        <Loader size={"medium"} color={"primary-end"}/>
                    </div>
                ) :( errorStatus ? (<ServerErrorPage errorStatus={errorStatus} message={errorMessage}/>) :
                        (
                            <div className="ml-5 mr-5 ">
                                <table className="w-full border-separate border-spacing-y-2">
                                    <thead>
                                    <tr className="">
                                        <th className="text-center text-white p-4 text-xl font-bold  bg-primary-end border-gray-200 rounded-l-2xl ">No</th>
                                        <th className="text-center text-white p-4 text-xl font-bold bg-primary-end border-gray-200">First
                                            Name
                                        </th>
                                        <th className="text-center text-white p-4 text-xl font-bold  bg-primary-end  border-gray-200 ">Last
                                            Name
                                        </th>
                                        <th className="text-center text-white p-4 text-xl font-bold bg-primary-end  border-gray-200 ">Gender</th>
                                        <th className="text-center text-white p-4 text-xl font-bold  bg-primary-end border-gray-200 ">Address</th>
                                        <th className="text-center text-white p-4 text-xl font-bold bg-primary-end flex-col rounded-r-2xl">
                                            <p>Operations</p>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {patients.map((patient, index) => (
                                        <tr key={patient.id || index} className="bg-gray-100">
                                            <td className="p-4 text-md text-blue-900 rounded-l-lg text-center">{index + 1}</td>
                                            <td className="p-4 text-md text-center font-bold">{patient.firstName}</td>
                                            <td className="p-4 text-md text-center">{patient.lastName}</td>
                                            <td className="p-4 text-md text-center">{patient.gender}</td>
                                            <td className="p-4 text-center text-md">{patient.address}</td>
                                            <td className="p-4 relative rounded-r-lg">
                                                <div className="w-full items-center justify-center flex gap-6">
                                                    <Tooltip placement={"left"} title={"view patient information"}>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedPatientDetails(patient), setCanOpenViewPatientDetailModal(true)
                                                            }}
                                                            className="flex items-center justify-center w-9 h-9 text-primary-end text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                            <FaEye/>
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip placement={"right"} title={"View Medical Folder"}>
                                                        <button
                                                            onClick={() => {
                                                                navigate(`/doctor/patients/medical-folder/${patient?.id}`, {state: {patient}})
                                                            }}
                                                            className="flex items-center justify-center w-9 h-9 text-green-500 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                            <FaEdit/>
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>


                                {/*Pagination content */}
                                <div className="fixed w-full justify-center -right-16 bottom-0 flex mt-6 mb-4">
                                    <div className="flex gap-4">
                                        <Tooltip placement={"left"} title={"previous slide"}>
                                            <button
                                                onClick={async () => {
                                                    await fetchNextOrPreviousPatientList(previousUrlForRenderPatientList), updateActualPageNumber("prev")
                                                }}
                                                className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                                <FaArrowLeft/>
                                            </button>
                                        </Tooltip>
                                        <p className="text-secondary text-2xl font-bold mt-4">{actualPageNumber}/{calculateNumberOfSlide()}</p>
                                        <Tooltip placement={"right"} title={"next slide"}>
                                            <button
                                                onClick={async () => {
                                                    await fetchNextOrPreviousPatientList(nexUrlForRenderPatientList), updateActualPageNumber("next")
                                                }}
                                                className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                                <FaArrowRight/>
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>


                                {/* Modals content */}
                                <ViewPatientDetailsModal isOpen={canOpenViewPatientDetailModal}
                                                         patient={selectedPatientDetails} onClose={() => {
                                    setCanOpenViewPatientDetailModal(false)
                                }}/>
                            </div>
                        )
                )}


            </div>
        </CustomDashboard>
    )
}