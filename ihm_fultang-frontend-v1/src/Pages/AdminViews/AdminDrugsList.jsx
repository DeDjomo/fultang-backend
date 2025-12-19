import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {adminNavLink} from "./adminNavLink.js";
import {AdminNavBar} from "./AdminNavBar.jsx";
import {FaArrowLeft, FaArrowRight, FaEdit, FaEye, FaPlus, FaSearch, FaTrash,} from "react-icons/fa";
import {Tooltip} from "antd";
import {useEffect, useState} from "react";
import {SuccessModal} from "../Modals/SuccessModal.jsx";
import Wait from "../Modals/wait.jsx";
import {ErrorModal} from "../Modals/ErrorModal.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import {ConfirmationModal} from "../Modals/ConfirmAction.Modal.jsx";
import {AppRoutesPaths as appRouterPaths} from "../../Router/appRouterPaths.js";
import {useNavigate} from "react-router-dom";
import {EditDrugInfosModal} from "./EditDrugInfosModal.jsx";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";


export function AdminDrugsList(){


    const [waitFetchingData, setWaitFetchingData] = useState(false);
    const [errorStatus, setErrorStatus] = useState(null);
    const [serverErrorMessage, setServerErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDrugDetails, setSelectedDrugDetails] = useState({});
    const [canOpenSuccessModal, setCanOPenSuccessModal] = useState(false);
    const [canOpenErrorMessageModal, setCanOpenErrorMessageModal] = useState(false);
    const [canOpenViewDrugDetailModal, setCanOpenViewDrugDetailModal] = useState(false);
    const [canOpenConfirmActionModal, setCanOpenConfirmActionModal] = useState(false);
    const [drugToDelete, setDrugToDelete] = useState({});
    const [canOpenEditDrugDetailModal, setCanOpenEditDrugDetailModal] = useState(false);
    const [drugList, setDrugList] = useState([]);
    const [numberOfDrug, setNumberOfDrug] = useState(0);
    const [nexUrlForRenderDrugList, setNexUrlForRenderDrugList] = useState("");
    const [previousUrlForRenderDrugList, setPreviousUrlForRenderDrugList] = useState("");
    const [actualPageNumber, setActualPageNumber] = useState(1);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");





    function calculateNumberOfSlide() {
        return numberOfDrug % 5 === 0 ? numberOfDrug / 5 : Math.floor(numberOfDrug / 5) + 1;
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



    async function fetchDrugData(url = "/medicament/") {
        if (!url) return;

        setWaitFetchingData(true);

        try {
            const response = await axiosInstance.get(url);
            setWaitFetchingData(false);

            if (response.status === 200) {
                setDrugList(response.data);
                setNumberOfDrug(response.data.count);
                setNexUrlForRenderDrugList(response.data.next);
                setPreviousUrlForRenderDrugList(response.data.previous);
                setServerErrorMessage("");
                setErrorStatus(null);
            }
        } catch (error) {
            setWaitFetchingData(false);
            setDrugList([]);
            setNumberOfDrug(0);
            setNexUrlForRenderDrugList("");
            setPreviousUrlForRenderDrugList("");
            setServerErrorMessage("Something went wrong when retrieving medical staff list !!")
            setErrorStatus(error.status);
            console.log(error);
        }
    }


    async function fetchDrugList() {
        await fetchDrugData();
    }


    async function fetchNextOrPreviousDrugList(url) {
        await fetchDrugData(url);
    }

    useEffect(() => {
        fetchDrugList();
    }, []);



    async function deleteDrug(drugId){
        setIsLoading(true);
        try {
            const response = await axiosInstance.delete(`/medicament/${drugId}/`);
            if (response.status === 204) {
                setIsLoading(false);
                setSuccessMessage("Drug deleted successfully !");
                setErrorMessage("");
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

    function formatDateForInput(isoDate){
        try {
            const date = new Date(isoDate);
            return date.toISOString().slice(0, 16);
        } catch (error) {
            console.error( error);
            return '';
        }
    }

    return(
        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar/>
        <div className="mt-5 flex flex-col relative">
            {/*Header content with search bar*/}
            <div className="flex justify-between mb-5">
                    <p className="font-bold text-xl mt-2 ml-5"> List Of Drug </p>
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

            
        {/*List of registered drug*/}

        {waitFetchingData ? (
                <div className="h-[500px] w-full flex justify-center items-center">
                    <Loader size={"medium"} color={"primary-end"}/>
                </div>
            ) :
            errorStatus ? (
                    <div className="mt-16">
                        <ServerErrorPage errorStatus={errorStatus} message={serverErrorMessage}/>
                    </div>
                ) :
                drugList.length >0 ? (
                    <div className="ml-5 mr-5 ">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                            <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                <th className="text-center text-white p-4 text-xl font-bold  rounded-l-lg ">No</th>
                                <th className="text-center text-white p-4 text-xl font-bold">Quantity</th>
                                <th className="text-center text-white p-4 text-xl font-bold">Name</th>
                                <th className="text-center text-white p-4 text-xl font-bold">Status</th>
                                <th className="text-center text-white p-4 text-xl font-bold">Price</th>
                                <th className="text-center text-white p-4 text-xl font-bold">ExpiryDate</th>
                                <th className="text-center text-white p-4 text-xl font-bold">Description</th>
                                <th className="text-center text-white p-4 text-xl font-bold  rounded-r-lg">
                                    <p>Operations</p>
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {drugList.map((drug, index) => (
                                <tr key={drug.id || index} className="bg-gray-100">
                                    <td className="p-4 text-md text-blue-900 rounded-l-lg text-center">{index + 1}</td>
                                    <td className="p-4 text-md text-center font-bold">{drug.quantity}</td>
                                    <td className="p-4 text-md text-center">{drug.name}</td>
                                    <td className="p-4 text-md text-center">{drug.status}</td>
                                    <td className="p-4 text-center text-md">{drug.price}</td>
                                    <td className="p-4 text-center text-md">{formatDateForInput(drug.expiryDate)}</td>
                                    <td className="p-4 text-center text-md">{drug.description}</td>
                                    <td className="p-4 relative rounded-r-lg">
                                        <div className="w-full items-center justify-center flex gap-6">
                                            <Tooltip placement={"top"} title={"Edit Patient Informations"}>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDrugDetails(drug), setCanOpenEditDrugDetailModal(true)
                                                    }}
                                                    className="flex items-center justify-center w-9 h-9 text-green-500 text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                    <FaEdit/>
                                                </button>
                                            </Tooltip>
                                            <Tooltip placement={"top"} title={"delete patient"}>
                                                <button
                                                    onClick={() => {
                                                        setDrugToDelete(drug), setCanOpenConfirmActionModal(true)
                                                    }}
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
                                                onClick={async ()=> {await fetchNextOrPreviousDrugList(previousUrlForRenderDrugList), updateActualPageNumber("prev")}}
                                                className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                                <FaArrowLeft/>
                                            </button>
                                        </Tooltip>
                                        <p className="text-secondary text-2xl font-bold mt-4">{actualPageNumber}/{calculateNumberOfSlide()}</p>
                                        <Tooltip placement={"right"} title={"next slide"}>
                                            <button
                                                onClick={async ()=> {await fetchNextOrPreviousDrugList(nexUrlForRenderDrugList), updateActualPageNumber("next")}}
                                                className="w-14 h-14 border-2 rounded-lg hover:bg-secondary text-xl  text-secondary hover:text-2xl duration-300 transition-all  hover:text-white shadow-xl flex justify-center items-center mt-2">
                                                <FaArrowRight/>
                                            </button>
                                        </Tooltip>
                                    </div>
                                </div>


                                {/* Add new drug button */}
                                <Tooltip placement={"top"} title={"Add New Medical Staff"}>
                                    <button
                                        onClick={()=>navigate(appRouterPaths.addDrug)}
                                        className="flex justify-center items-center fixed bottom-5 right-16 rounded-full w-14 h-14 bg-gradient-to-r text-3xl font-bold text-white from-primary-start to-primary-end hover:text-4xl transition-all duration-300">
                                        <FaPlus/>
                                    </button>
                                </Tooltip>


                                {/* Modals content */}
                                <EditDrugInfosModal isOpen={canOpenEditDrugDetailModal} onClose={()=>{setCanOpenEditDrugDetailModal(false)}} setCanOpenSuccessModal={setCanOPenSuccessModal} setSuccessMessage={setSuccessMessage} setIsLoading={setIsLoading} drugData={selectedDrugDetails}/>
                                <SuccessModal isOpen={canOpenSuccessModal} message={successMessage} canOpenSuccessModal={setCanOPenSuccessModal} makeAction={async ()=> {await fetchDrugList(), calculateNumberOfSlide()}}/>
                                <ErrorModal isOpen={canOpenErrorMessageModal} onCloseErrorModal={()=>{setCanOpenErrorMessageModal(false)}} message={errorMessage}/>
                                {isLoading && <Wait/>}
                                <ConfirmationModal isOpen={canOpenConfirmActionModal} onClose={() => setCanOpenConfirmActionModal(false)} onConfirm={async () => await deleteDrug(drugToDelete.id)} title={"Delete Medical Staff"} message={`Are you sure you want to delete the ${drugToDelete.role + " "} ${drugToDelete.first_name + " " + drugToDelete.last_name} ?`}/>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[600px]  bg-gradient-to-b from-white to-teal-50   p-8">
                                <div className="mb-6 relative">
                                    <svg
                                        className="w-24 h-24 text-primary-end"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    <span className="absolute top-0 left-0 w-full h-full bg-teal-200 rounded-full animate-ping opacity-75"></span>
                                </div>
                                <h2 className="text-2xl font-bold text-teal-700 mb-4">No registered medical personnel</h2>
                                <p className="text-gray-600 text-center mb-8 max-w-xl">
                                    Your medical team is the heart of your clinic. Start building your team by adding your first member of the medical staff.
                                </p>
                                <button
                                    onClick={()=>navigate(appRouterPaths.addDrug)}
                                    className="bg-primary-end hover:bg-primary-start text-white font-bold py-2 px-4 rounded-full transition-all duration-300 flex items-center"
                                >
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add a drug
                                </button>
                            </div>
                        )
                }
            </div>
        </CustomDashboard>
    )
}