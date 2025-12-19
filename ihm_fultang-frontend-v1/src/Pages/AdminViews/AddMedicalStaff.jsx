import {useEffect, useState} from 'react';
import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {adminNavLink} from "./adminNavLink.js";
import {AdminNavBar} from "./AdminNavBar.jsx";
import joinOurStaffImage from "../../assets/regoignezNotreStaffMedical.png";
import axiosInstance from "../../Utils/axiosInstance.js";
import {SuccessModal} from "../Modals/SuccessModal.jsx";
import {ErrorModal} from "../Modals/ErrorModal.jsx";
import Wait from "../Modals/wait.jsx";
import { Eye, EyeOff } from 'lucide-react';

export function AddMedicalStaff() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [medicalStaffData, setMedicalStaffData] = useState({
        first_name: '',
        last_name: '',
        role: 'NoRole',
        username: '',
        cniNumber: '',
        email: '',
        gender: 'Male',
        password:'',
        is_staff:false,
        is_active: true,
        is_superuser: false,
        birthDate:'',
        address: '',
        phoneNumber: '',
        userType:'',
    });

    function handleChange (e) {
        const { name, value } = e.target;
        setMedicalStaffData(prevData => ({
            ...prevData,
            [name]: value
        }));
        setPassword(medicalStaffData.password);
    }

    useEffect(() => {
        if (medicalStaffData.role)
        {
            medicalStaffData.isStaff = medicalStaffData.role === 'Admin';
        }
        if(medicalStaffData.role === "Accountant")
        {
           medicalStaffData.userType = "Accountant";
        }
        else
        {
            medicalStaffData.userType = "Medical";
        }
    }, [medicalStaffData]);



    useEffect(() => {
        console.log(medicalStaffData);
    }, [medicalStaffData]);


    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [canOpenErrorModal, setCanOpenErrorModal] = useState(false);


    async function handleSubmit (e) {
        e.preventDefault();
        setIsLoading(true);
        try
        {
            const response = await axiosInstance.post("/medical-staff/", medicalStaffData);
            if (response.status === 201)
            {
                setIsLoading(false);
                setErrorMessage("");
                setSuccessMessage(`The ${medicalStaffData.role === "Labtech" ? "Laboratory Assistant" : medicalStaffData.role + "" + " " + medicalStaffData.username + " "} created successfully`);
                setCanOpenSuccessModal(true);
                setCanOpenErrorModal(false);
            }
        }
        catch (error)
        {
            setIsLoading(false);
            console.log(error);
            setSuccessMessage("");
            setErrorMessage(`Error when registering the ${medicalStaffData.role + " " + medicalStaffData.username} please retry !`);
            setCanOpenSuccessModal(false);
            setCanOpenErrorModal(true);
        }
    }



    function applyInputStyle()
    {
        return "w-full px-4 py-2 border-2 border-gray-200 rounded-md focus:outline-none  focus:border-2  focus:border-primary-end";
    }



    function applyLabelStyle()
    {
        return "block text-md font-semibold text-gray-600 mb-1";
    }

    return (
        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar/>
            <div className="flex m-5">
                <div className="w-1/2 mr-6 flex flex-col items-center justify-center">
                    <h1 className="text-4xl font-bold text-secondary mb-8">Add a new medical staff member</h1>
                        <p className="text-justify italic text-red-500 font-semibold text-md mb-5">Please complete all
                            fields below to add a new medical staff member to Fultang Clinic. Make sure the information
                            entered is accurate as it will be used to create the staff member's official profile.</p>

                    <img src={joinOurStaffImage} alt={"image"} className={"w-[600px] h-[400px] rounded-2xl"}/>
                </div>
                <div className="w-1/2 p-8 flex items-center justify-center">
                    <form onSubmit={handleSubmit} className="space-y-6">


                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className={applyLabelStyle()}>
                                    Firstname
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={medicalStaffData.first_name}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    placeholder="Enter the user's firstname"
                                    required
                                />
                            </div>
                            <div>
                                <label className={applyLabelStyle()}>
                                    Lastname
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={medicalStaffData.last_name}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    placeholder="Enter the user's lastname"
                                    required
                                />
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={applyLabelStyle()}>
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={medicalStaffData.username}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    placeholder="Enter the user's username"
                                    required
                                />
                            </div>
                            <div >
                                <label className={applyLabelStyle()}>
                                    Password
                                </label>
                                <div className="h-12 mt-2 rounded-lg flex items-center relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={medicalStaffData.password}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    placeholder="Enter the user's password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-2 p-2 hover:bg-gray-400 rounded-full transition-all duration-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-600"/>
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-600"/>
                                    )}
                                </button>
                                </div>
                            </div>
                        </div>


                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className={applyLabelStyle()}>
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={medicalStaffData.birthDate}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    required
                                />
                            </div>
                            <div>
                                <label className={applyLabelStyle()}>
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={medicalStaffData.gender}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    required
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className={applyLabelStyle()}>
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={medicalStaffData.address}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    placeholder={"enter the user's address"}
                                    required
                                />
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={applyLabelStyle()}>
                                    ID Card Number
                                </label>
                                <input
                                    type="tel"
                                    name="cniNumber"
                                    value={medicalStaffData.cniNumber}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    placeholder="Enter the user's ID card number"
                                    required
                                />
                            </div>
                            <div>
                                <label className={applyLabelStyle()}>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={medicalStaffData.phoneNumber}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    placeholder="Enter the user's phone number"
                                    required
                                />
                            </div>
                        </div>


                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={applyLabelStyle()}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={medicalStaffData.email}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    placeholder="Enter the user's email address"
                                    required
                                />
                            </div>
                            <div>
                                <label className={applyLabelStyle()}>
                                    Spécialisation
                                </label>
                                <select
                                    name="role"
                                    value={medicalStaffData.role}
                                    onChange={handleChange}
                                    className={applyInputStyle()}
                                    required
                                >
                                    <option value="NoRole">Select the medical staff specialisation</option>
                                    <option value="Doctor">Doctor</option>
                                    <option value="Pharmacist">Pharmacist</option>
                                    <option value="Nurse">Nurse</option>
                                    <option value="Receptionist">Receptionist</option>
                                    <option value="Labtech">Laboratory Assistant</option>
                                    <option value="Ophthalmologist">Ophthalmologist</option>
                                    <option value="Cashier">Cashier</option>
                                    <option value="Accountant">Accountant</option>
                                    <option value="Admin">Administrator</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button
                                type="submit"
                                className="bg-secondary text-white py-2 px-12 font-bold rounded-lg hover:bg-[#3d9d94] transition-colors duration-300"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <SuccessModal isOpen={canOpenSuccessModal} canOpenSuccessModal={setCanOpenSuccessModal} message={successMessage}/>
            <ErrorModal isOpen={canOpenErrorModal} onCloseErrorModal={setCanOpenErrorModal} message={errorMessage}/>
            {isLoading && <Wait/>}
        </CustomDashboard>
    );
}

