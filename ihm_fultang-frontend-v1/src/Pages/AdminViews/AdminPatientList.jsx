import {FaArrowLeft, FaArrowRight, FaEdit, FaEye, FaSearch, FaTrash,} from "react-icons/fa";
import {Tooltip} from "antd";
import {useEffect, useState} from "react";
import {SuccessModal} from "../Modals/SuccessModal.jsx";
import Wait from "../Modals/wait.jsx";
import {ErrorModal} from "../Modals/ErrorModal.jsx";
import {ViewPatientDetailsModal} from "../Receptionist/ViewPatientDetailsModal.jsx";
import {EditPatientInfosModal} from "../Receptionist/EditPatientInfosModal.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {AdminNavBar} from "./AdminNavBar.jsx";
import {adminNavLink} from "./adminNavLink.js";
import {ConfirmationModal} from "../Modals/ConfirmAction.Modal.jsx";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import noPatientImage from "../../assets/noPatients.png";
import {calculateNumberOfSlides} from "../../Utils/paginationFunctions.js";
//import {AddNewPatientModal} from "../Receptionist/addNewPatientModal.jsx";

export function AdminPatientList()
{


   // const [canOpenAddNewPatientModal, setCanOpenAddNewPatientModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPatientDetails, setSelectedPatientDetails] = useState({});
    const [canOpenSuccessModal, setCanOPenSuccessModal] = useState(false);
    const [canOpenErrorMessageModal, setCanOpenErrorMessageModal] = useState(false);
    const [canOpenViewPatientDetailModal, setCanOpenViewPatientDetailModal] = useState(false);
    const [canOpenConfirmActionModal, setCanOpenConfirmActionModal] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState({});
    const [canOpenEditPatientDetailModal, setCanOpenEditPatientDetailModal] = useState(false);
    const [patients, setPatients] = useState([]);
    const [numberOfPatients, setNumberOfPatients] = useState(0);
    const [nexUrlForRenderPatientList, setNexUrlForRenderPatientList] = useState("");
    const [previousUrlForRenderPatientList, setPreviousUrlForRenderPatientList] = useState("");
    const [actualPageNumber, setActualPageNumber] = useState(1);
    const [successMessage, setSuccessMessage] = useState("");

    const [errorStatus, setErrorStatus] = useState(null);
    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [waitFetchData, setWaitFetchData] = useState(false);






    function updateActualPageNumber(action) {
        if (action === "next")
        {
            if(actualPageNumber < calculateNumberOfSlides(numberOfPatients, 5))
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



    async function fetchPatientData(url = "/patients/") {
        setWaitFetchData(true);

        try {
            const response = await axiosInstance.get(url);
            setWaitFetchData(false);

            if (response.status === 200) {
                setPatients(response.data.results);
                setNumberOfPatients(response.data.count);
                setNexUrlForRenderPatientList(response.data.next);
                setPreviousUrlForRenderPatientList(response.data.previous);
                setServerErrorMessage("");
                setErrorStatus(null);
            }
        } catch (error) {
            setWaitFetchData(false);
            setPatients([]);
            setNumberOfPatients(0);
            setNexUrlForRenderPatientList("");
            setPreviousUrlForRenderPatientList("");
            setServerErrorMessage("Something went wrong went retrieving patient list");
            setErrorStatus(error.status);
            console.log(error);
        }
    }


    async function fetchPatients() {
        await fetchPatientData();
    }


    async function fetchNextOrPreviousPatientList(url) {
        if (url) {
            await fetchPatientData(url);
        }
    }

    useEffect(() => {
        fetchPatients();
    }, []);





    async function deletePatient(patientId){
        setIsLoading(true);
        try {
            const response = await axiosInstance.delete(`/patients/${patientId}/`);
            if (response.status === 204) {
                setIsLoading(false);
                setSuccessMessage("Patient deleted successfully !");
                setErrorMessage("");
                await fetchPatients();
                setCanOpenErrorMessageModal(false);
                setCanOPenSuccessModal(true);
            }
        }
        catch (error) {
            setIsLoading(false);
            setSuccessMessage("");
            setErrorMessage(error.response.data.detail)
            setCanOPenSuccessModal(false);
            setCanOpenErrorMessageModal(true);
            console.log(error);
        }
    }



    return (
        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar/>
            <div className="mt-5 flex flex-col relative">

                {/*Header content with search bar*/}
                <div className="flex justify-between mb-5">
                    <p className="font-bold text-xl mt-2 ml-5"> List Of Patient </p>
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

                { waitFetchData ? (
                    <div className="h-[500px] w-full flex justify-center items-center">
                        <Loader size={"medium"} color={"primary-end"}/>
                    </div>) : errorStatus ? (
                    <div className="mt-16">
                        <ServerErrorPage errorStatus={errorStatus} message={serverErrorMessage}/>
                    </div>) : patients.length > 0 ? (
                        <div className="ml-5 mr-5 ">
                            <table className="w-full border-separate border-spacing-y-2">
                                <thead>
                                <tr className="bg-gradient-to-l from-primary-start to-primary-end ">
                                    <th className="text-center text-white p-4 text-xl font-bold  border-gray-200 rounded-l-2xl ">No</th>
                                    <th className="text-center text-white p-4 text-xl font-bold border-gray-200">First Name</th>
                                    <th className="text-center text-white p-4 text-xl font-bold  border-gray-200 ">Last Name
                                    </th>
                                    <th className="text-center text-white p-4 text-xl font-bold  border-gray-200 ">Gender</th>
                                    <th className="text-center text-white p-4 text-xl font-bold  border-gray-200 ">Address</th>
                                    <th className="text-center text-white p-4 text-xl font-bold  flex-col rounded-r-2xl">
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
                                                <Tooltip placement={"left"} title={"view details"}>
                                                    <button
                                                        onClick={()=>{setSelectedPatientDetails(patient),setCanOpenViewPatientDetailModal(true)}}
                                                        className="flex items-center justify-center w-9 h-9 text-primary-end text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaEye/>
                                                    </button>
                                                </Tooltip>
                                                <Tooltip placement={"right"} title={"Edit"}>
                                                    <button
                                                        onClick={()=>{setSelectedPatientDetails(patient),setCanOpenEditPatientDetailModal(true)}}
                                                        className="flex items-center justify-center w-9 h-9 text-green-500 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaEdit/>
                                                    </button>
                                                </Tooltip>
                                                <Tooltip placement={"right"} title={"delete"}>
                                                    <button
                                                        onClick={()=>{setPatientToDelete(patient),setCanOpenConfirmActionModal(true)}}
                                                        className="flex items-center justify-center w-9 h-9 text-red-400 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaTrash/>
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
                                            onClick={async ()=> {await fetchNextOrPreviousPatientList(previousUrlForRenderPatientList), updateActualPageNumber("prev")}}
                                            className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                            <FaArrowLeft/>
                                        </button>
                                    </Tooltip>
                                    <p className="text-secondary text-2xl font-bold mt-4">{actualPageNumber}/{calculateNumberOfSlides(numberOfPatients, 5)}</p>
                                    <Tooltip placement={"right"} title={"next slide"}>
                                        <button
                                            onClick={async ()=> {await fetchNextOrPreviousPatientList(nexUrlForRenderPatientList), updateActualPageNumber("next")}}
                                            className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                            <FaArrowRight/>
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>


                            {/* Add new patient button & modal
                            <Tooltip placement={"top"} title={"Add new patient"}>
                                <button
                                    onClick={()=>setCanOpenAddNewPatientModal(true)}
                                    className="fixed bottom-5 right-16 rounded-full w-14 h-14 bg-gradient-to-r text-4xl font-bold text-white from-primary-start to-primary-end hover:text-5xl transition-all duration-300">
                                    +
                                </button>
                            </Tooltip> */}

                            {/* Modals content */}
                            {/* <AddNewPatientModal isOpen={canOpenAddNewPatientModal} onClose={()=>{setCanOpenAddNewPatientModal(false)}} setCanOpenSuccessModal={setCanOPenSuccessModal} setSuccessMessage={setSuccessMessage} setIsLoading={setIsLoading}/>*/}
                            <EditPatientInfosModal isOpen={canOpenEditPatientDetailModal} onClose={()=>{setCanOpenEditPatientDetailModal(false)}} setCanOpenSuccessModal={setCanOPenSuccessModal} setSuccessMessage={setSuccessMessage} setIsLoading={setIsLoading} patientData={selectedPatientDetails}/>
                            <SuccessModal isOpen={canOpenSuccessModal} message={successMessage} canOpenSuccessModal={setCanOPenSuccessModal} makeAction={async ()=> {await fetchPatients(), calculateNumberOfSlides(numberOfPatients, 5)}}/>
                            <ErrorModal isOpen={canOpenErrorMessageModal} onCloseErrorModal={()=>{setCanOpenErrorMessageModal(false)}} message={errorMessage}/>
                            <ViewPatientDetailsModal isOpen={canOpenViewPatientDetailModal} patient={selectedPatientDetails} onClose={()=>{setCanOpenViewPatientDetailModal(false)}}/>
                            {isLoading && <Wait/>}
                            <ConfirmationModal isOpen={canOpenConfirmActionModal} onClose={() => setCanOpenConfirmActionModal(false)} onConfirm={async () => await deletePatient(patientToDelete.id)} title={"Delete Patient"} message={`Are you sure you want to delete the patient ${patientToDelete.firstName + " " + patientToDelete.lastName} ?`}/>
                        </div>)
                        : (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center mt-20">
                            <img src={noPatientImage} alt={"image"} className="w-36 h-36 rounded-lg"/>
                            <h3 className="font-bold text-3xl mt-4 mb-2 text-gray-800">No patients recorded</h3>
                            <p className="text-gray-600 mb-6 max-w-xl text-xl font-medium">There are currently no patients registered in the system</p>
                        </div>
                    )
                }
            </div>
        </CustomDashboard>
    )
}