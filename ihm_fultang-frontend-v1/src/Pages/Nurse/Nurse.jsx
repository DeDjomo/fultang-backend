import {NurseNavBar} from "./NurseNavBar.jsx";
import userIcon from "../../assets/userIcon.png"
import {FaArrowLeft, FaArrowRight,FaSearch} from "react-icons/fa";
import {PatientList} from "./PatientList.jsx";
import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";
import {nurseNavLink} from "./nurseNavLink.js";
import {useAuthentication} from "../../Utils/Provider.jsx";
import {Tooltip} from "antd";
import {useEffect, useState} from "react";
import axiosInstance from "../../Utils/axiosInstance.js";
import {ViewPatientDetailsModal} from "../Receptionist/ViewPatientDetailsModal.jsx";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import noPatientImage from "../../assets/noPatients.png";




export function Nurse()
{

    const {userData} = useAuthentication();


    const [patientList, setPatientList] = useState([]);
    const [numberOfPatients, setNumberOfPatients] = useState(0);
    const [nexUrlForRenderPatientList, setNexUrlForRenderPatientList] = useState("");
    const [previousUrlForRenderPatientList,setPreviousUrlForRenderPatientList] = useState("");
    const [actualPageNumber, setActualPageNumber] = useState(1);


    const [canOpenViewPatientDetailsModal, setCanOpenViewPatientDetailsModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState({});
    const [errorStatus, setErrorStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);



    async function fetchPatientList()
    {
        setIsLoading(true);
        try
        {
            const response = await axiosInstance.get("/patients/");
            setIsLoading(false);
            if (response.status === 200)
            {
                console.log(response.data);
                setPatientList(response.data.results);
                setNumberOfPatients(response.data.count);
                setNexUrlForRenderPatientList(response.data.next);
                setPreviousUrlForRenderPatientList(response.data.previous);
                setErrorStatus(null);
                setErrorMessage("");
            }
        }
        catch (error)
        {
            setIsLoading(false);
            console.log(error);
            setErrorMessage("Something went wrong when retrieving the patient list, please try again later !");
            setErrorStatus(error.status)
        }
    }


    async function fetchNextOrPreviousPatientList (url) {
        if(url)
        {
            setIsLoading(true);
            try {
                const response = await axiosInstance.get(url);
                setIsLoading(false);
                if (response.status === 200)
                {
                    //console.log(response)
                    setPatientList(response.data.results);
                    setNumberOfPatients(response.data.count);
                    setNexUrlForRenderPatientList(response.data.next);
                    setPreviousUrlForRenderPatientList(response.data.previous);
                    setErrorMessage("");
                    setErrorStatus(null);
                }
            } catch (error) {
                setIsLoading(false);
                console.log(error);
                setErrorMessage("Something went wrong when retrieving the patient list, please try again later !");
                setErrorStatus(error.status);
            }
        }
    }

    function computeNumberOfSlideToRender() {
        return numberOfPatients % 5 === 0 ? numberOfPatients / 5 : Math.floor(numberOfPatients / 5) + 1;
    }


    function updateActualPageNumber(action) {
        if (action === "next")
        {
            if(actualPageNumber < computeNumberOfSlideToRender())
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


    useEffect(() => {
        fetchPatientList();
    }, []);





    return (
        <>
            <DashBoard requiredRole={"Nurse"} linkList={nurseNavLink}>
                <NurseNavBar>
                    <div className="flex flex-col">

                        {/*Header with welcome text content */}
                        <div className="ml-5 mr-5 h-[150px] bg-gradient-to-t from-primary-start to-primary-end flex rounded-lg justify-between">
                            <div className="flex gap-4">
                                <div className="mt-5 mb-5 ml-5 w-28 h-28 border-4 border-white rounded-full">
                                    <img src={userIcon} alt="user icon" className="h-[105px] w-[105px] mb-2"/>
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-white text-4xl font-bold mt-6">Welcome Back!</p>
                                    <p className="text-2xl mt-2 text-white"> {userData.username}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-white mt-28 text-xl font-bold mr-4">12:30:25 AM</p>
                            </div>
                        </div>

                        {/*Search bar content */}
                        <div className="flex justify-between mt-3">
                            <div className="flex flex-col ml-5">
                                <p className="font-bold text-4xl mt-1">Reception</p>
                                <p className="font-medium text-xl mt-0.5">List of patients</p>
                            </div>
                            <div className="flex mr-5">
                                <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg">
                                    <FaSearch className="text-xl text-secondary m-2"/>
                                    <input
                                        type="text"
                                        className="border-none focus:outline-none focus:ring-0"
                                    />
                                </div>
                                <button className="ml-2 w-20 h-10 text-white bg-secondary rounded-lg">
                                    Search
                                </button>
                            </div>
                        </div>

                        {/*List of patients content */}
                        {isLoading ? (
                            <div className="h-[500px] w-full flex justify-center items-center">
                                <Loader size={"medium"} color={"primary-end"}/>
                            </div>
                        )
                        : ( errorStatus ? <ServerErrorPage errorStatus={errorStatus} message={errorMessage}/> :
                            (patientList.length >0 ? (
                                    <>
                                        <div className="ml-5 mr-5 mt-2 border-2  rounded-lg shadow-lg  p-2">
                                            <PatientList patients={patientList}
                                                         setCanOpenViewPatientDetailModal={setCanOpenViewPatientDetailsModal}
                                                         setSelectedPatient={setSelectedPatient}/>
                                        </div>

                                        {/* Pagination content */}
                                        <div className="justify-center  flex mt-6 mb-4">
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
                                                <p className="text-secondary text-xl font-bold mt-6">{`Page ${actualPageNumber} of ${computeNumberOfSlideToRender()}`}</p>
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
                                    </>
                                ): (
                                    <div
                                        className="flex flex-col items-center justify-center py-12 px-4 text-center mt-7">
                                        <img src={noPatientImage} alt={"image"} className="w-36 h-36 rounded-lg"/>
                                        <h3 className="font-bold text-2xl mt-4 mb-2 text-gray-800">No patients recorded</h3>
                                        <p className="text-gray-600 mb-6 max-w-xl text-md font-medium">
                                            There are currently no patients registered in the system.
                                        </p>
                                    </div>
                                )
                            )
                            )}
                    </div>
                </NurseNavBar>


                {/*Modal Content*/}
                <ViewPatientDetailsModal
                    isOpen={canOpenViewPatientDetailsModal} patient={selectedPatient}
                    onClose={() => {
                        setCanOpenViewPatientDetailsModal(false)
                    }}
                />
            </DashBoard>
        </>
    )
}