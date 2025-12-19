import { useState, useEffect } from 'react'
import { User, Phone, MapPin, Calendar, Weight, Ruler, Thermometer, Heart, Activity, FileText, AlertCircle, Scissors, Save, UserPlus, Pill, Users } from 'lucide-react'
import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";
import {nurseNavLink} from "./nurseNavLink.js";
import {NurseNavBar} from "./NurseNavBar.jsx";
import {useLocation, useNavigate} from "react-router-dom";
import {ConfirmSaveParameters} from "./ConfirmSaveParameters.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import {useAuthentication} from "../../Utils/Provider.jsx";
import {ErrorModal} from "../Modals/ErrorModal.jsx";
import {SuccessModal} from "../Modals/SuccessModal.jsx";
import Wait from "../Modals/wait.jsx";
import {FaArrowLeft} from "react-icons/fa";
import {PrescribeDoctor} from "./PrescribeDoctor.jsx";






export  function PatientParameters() {

    const {state} = useLocation();
    const patientInfo = state?.patient;
    const {userData} = useAuthentication();
    const [parameters, setParameters] = useState({
        weight: '',
        height: '',
        temperature: '',
        bloodPressure: '',
        heartRate: '',
        chronicalDiseases: '',
        surgeries: '',
        allergies: '',
        currentMedication: '',
        familyMedicalHistory: '',
        idMedicalStaff: userData?.id,
    });
    const [errors, setErrors] = useState({});
    const [canOpenConfirmSaveParameters, setCanOpenConfirmSaveParameters] = useState(false);
    const [bmi, setBmi] = useState('-');
    const [isLoading, setIsLoading] = useState(false);
    const [canOpenSuccessModal, setCanOpenSuccessModal] = useState(false);
    const [canOpenErrorMessageModal, setCanOpenErrorMessageModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [canActivatePrescribeDoctorBtn, setCanActivatePrescribeDoctorBtn] = useState(false);
    const [canPrescribeDoctor, setCanPrescribeDoctor] = useState(false);





    useEffect(() => {
        if(parameters.weight && parameters.height) calculateBMI();
    }, [parameters.weight, parameters.height, userData, patientInfo.firstName])



    function calculateAge (birthDate) {
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }


    function handleChange (e)
    {
        const { name, value } = e.target
        setParameters(prev => ({ ...prev, [name]: value }))
        validateField(name, value)
    }


    function validateField (name, value) {
        let error = ''
        switch (name) {
            case 'weight':
                if (isNaN(Number(value)) || Number(value) <= 2.0 || Number(value) > 200.0) error = 'Invalid weight, weight must be between 2 and 200'
                break
            case 'height':
                if (isNaN(Number(value)) || Number(value) <= 0.50 || Number(value) > 2.50) error = 'Invalid height, height must be between 0.5 and 2.5'
                break
            case 'temperature':
                if (isNaN(Number(value)) || Number(value) < 35 || Number(value) > 42) error = 'Invalid temperature, temperature must be between 35 and 42'
                break
            case 'bloodPressure':
                if (!/^\d{2,3}\/\d{2,3}$/.test(value)) error = 'Invalid blood pressure format. Eg: 120/80'
                break
            case 'heartRate':
                if (isNaN(Number(value)) || Number(value) < 40 || Number(value) > 220) error = 'Invalid heart rate, heart rate must be between 40 and 220'
                break
        }
        setErrors(prev => ({ ...prev, [name]: error }))
    }



     function handleSubmit (e) {
         e.preventDefault()
         const formErrors = {}
         Object.entries(parameters).forEach(([key, value]) => {
             validateField(key, value)
             if (errors[key]) formErrors[key] = errors[key]
         })
         if (Object.keys(formErrors).length === 0)
         {
             setCanOpenConfirmSaveParameters(true)
         } else
         {
             setErrors(formErrors)
         }

    }



    function saveIdMedicalFolderPage (id) {
        localStorage.setItem('current_medical_folder_page', id);
    }



    async function saveParameters ()
    {
        setIsLoading(true);
        console.log(parameters);
        try {
            const response = await axiosInstance.post(`/medical-folder/${patientInfo.idMedicalFolder}/new-params/`, parameters);
            if (response.status === 201)
            {
                saveIdMedicalFolderPage(response.data.idMedicalFolderPage);
                setIsLoading(false);
                setCanActivatePrescribeDoctorBtn(true);
                setCanOpenConfirmSaveParameters(false);
                setSuccessMessage(`${patientInfo.firstName + patientInfo.lastName}'s medical parameters saved successfully!`);
                setErrorMessage("");
                setCanOpenSuccessModal(true);
                setCanOpenErrorMessageModal(false);
            }
        }
        catch (error)
        {
            setIsLoading(false);
            setSuccessMessage("");
            setErrorMessage(`Something went wrong when saving ${patientInfo.firstName +" " +patientInfo.lastName}'s medical parameters, please try again later!`);
            setCanOpenSuccessModal(false);
            setCanOpenErrorMessageModal(true);
            console.log(error);
        }
    }




    function calculateBMI ()  {
        const weight = parseFloat(parameters.weight)
        const height = parseFloat(parameters.height)
        if (!isNaN(weight) && !isNaN(height) && height > 0) {
            const bmiValue = (weight / (height * height)).toFixed(2)
            setBmi(bmiValue)
        } else {
            setBmi('-')
        }
    }


    function applyInputStyle()
    {
        return "w-full pl-10 pr-12 py-2 border-2 rounded-md focus:outline-none focus:border-2 focus:border-primary-end transition-all duration-300";
    }

    const navigate = useNavigate();


    return (

        <DashBoard linkList={nurseNavLink} requiredRole={"Nurse"}>
            <NurseNavBar>
                <div className="min-h-screen  p-6">

                    <button className="flex text-xl font-bold text-primary-start items-start hover:text-primary-end transition-all duration-300 gap-2 mb-3" onClick={()=>{navigate(-1)}}> <FaArrowLeft className="mt-1"/> <p>Go Back To Patient List</p></button>
                        <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-lg shadow-lg p-6 mb-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                                    <User className="w-12 h-12 text-black"/>
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white">{patientInfo.firstName} {patientInfo.lastName}</h1>
                                    <div className="mt-3.5 grid grid-cols-3 gap-4 font-semibold">
                                        <div className="flex items-center gap-2 text-white">
                                            <Calendar className="w-6 h-6"/>
                                            <span>{patientInfo.birthDate} ({calculateAge(patientInfo.birthDate)} years old)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white">
                                            <MapPin className="w-6 h-6"/>
                                            <span>{patientInfo.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-white">
                                            <Phone className="w-6 h-6"/>
                                            <span>{patientInfo.phoneNumber}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-primary-end to-primary-start p-4">
                                <h2 className="ml-5 text-2xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-7 h-7"/>
                                    Medical Parameters
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-4 p-6 space-y-14">
                                <div className="grid grid-cols-2 gap-12 mb-5">

                                    {/* Biometric parameters */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Biometric Parameters</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-md font-medium mb-2">Weight</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        name="weight"
                                                        value={parameters.weight}
                                                        onChange={handleChange}
                                                        required
                                                        className={`${applyInputStyle()} ${errors.weight ? 'border-red-500' : 'border-gray-400'}`}
                                                        placeholder="Weight"
                                                    />
                                                    <Weight className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                                    <span className="absolute right-3 top-2 text-gray-500">Kg</span>
                                                </div>
                                                {errors.weight && <p className="mt-1 text-sm font-bold text-red-500">{errors.weight}</p>}
                                            </div>
                                            <div>
                                                <label  className="text-md font-medium mb-2">Height</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        name="height"
                                                        value={parameters.height}
                                                        onChange={handleChange}
                                                        className={`${applyInputStyle()} ${errors.height ? 'border-red-500' : 'border-gray-400'}`}
                                                        placeholder="Height"
                                                        required
                                                    />
                                                    <Ruler className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                                    <span className="absolute right-3 top-2 text-gray-500">m</span>
                                                </div>
                                                {errors.height && <p className="mt-1 text-sm font-bold text-red-500">{errors.height}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label
                                                className="text-md font-medium mb-2">Temperature</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    name="temperature"
                                                    required
                                                    value={parameters.temperature}
                                                    onChange={handleChange}
                                                    className={`${applyInputStyle()} ${errors.temperature ? 'border-red-500' : 'border-gray-400'}`}
                                                    placeholder="Temperature"
                                                />
                                                <Thermometer className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                                <span className="absolute right-3 top-2 text-gray-500">°C</span>
                                            </div>
                                            {errors.temperature && <p className="mt-1 text-sm font-bold text-red-500">{errors.temperature}</p>}
                                        </div>
                                        <div>
                                            <label className="text-md font-medium mb-2">BMI (Body Mass Index)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={bmi}
                                                    readOnly
                                                    className={`${applyInputStyle()} bg-gray-100  border-gray-400`}
                                                />
                                                <Activity className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                                <span className="absolute right-3 top-2 text-gray-500">kg/m²</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cardiovascular parameters */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold">Cardiovascular
                                            Parameters</h3>
                                        <div>
                                            <label className="text-md font-medium mb-2">Blood Pressure</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="bloodPressure"
                                                    required
                                                    value={parameters.bloodPressure}
                                                    onChange={handleChange}
                                                    className={`${applyInputStyle()} ${errors.bloodPressure ? 'border-red-500' : 'border-gray-400'}`}
                                                    placeholder="e.g. 120/80"
                                                />
                                                <Heart className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                                <span className="absolute right-3 top-2 text-gray-500">mmHg</span>
                                            </div>
                                            {errors.bloodPressure && <p className="mt-1 text-sm font-bold text-red-500">{errors.bloodPressure}</p>}
                                        </div>
                                        <div>
                                            <label className="text-md font-medium mb-2">Heart Rate</label>
                                                <div className="relative">
                                                <input
                                                    type="number"
                                                    name="heartRate"
                                                    value={parameters.heartRate}
                                                    onChange={handleChange}
                                                    className={`${applyInputStyle()} ${errors.heartRate ? 'border-red-500' : 'border-gray-400'}`}
                                                    placeholder="Heart Rate"
                                                />
                                                <Activity className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                                <span className="absolute right-3 top-2 text-gray-500">bpm</span>
                                            </div>
                                            {errors.heartRate && <p className="mt-1 text-sm font-bold text-red-500">{errors.heartRate}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Medical history */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold">Medical History</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-md font-medium mb-2">Chronic
                                                Diseases</label>
                                            <div className="relative">
                                                <textarea
                                                    name="chronicDiseases"
                                                    value={parameters.chronicalDiseases}
                                                    onChange={handleChange}
                                                    rows={2}
                                                    className={`${applyInputStyle()} border-gray-400`}
                                                    placeholder="List chronic diseases"
                                                />
                                                <FileText className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-md font-medium mb-2">Allergies</label>
                                            <div className="relative">
                                                <textarea
                                                    name="allergies"
                                                    value={parameters.allergies}
                                                    onChange={handleChange}
                                                    rows={2}
                                                    className={`${applyInputStyle()} border-gray-400`}
                                                    placeholder="List allergies"
                                                />
                                                <AlertCircle className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-md font-medium mb-2">Surgeries</label>
                                            <div className="relative">
                                                <textarea
                                                    name="surgeries"
                                                    value={parameters.surgeries}
                                                    onChange={handleChange}
                                                    rows={2}
                                                    className={`${applyInputStyle()} border-gray-400`}
                                                    placeholder="List surgeries"
                                                />
                                                <Scissors className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-md font-medium mb-2">Current Medications</label>
                                            <div className="relative">
                                                <textarea
                                                    name="currentMedication"
                                                    value={parameters.currentMedication}
                                                    onChange={handleChange}
                                                    rows={2}
                                                    className={`${applyInputStyle()} border-gray-400`}
                                                    placeholder="List current medications"
                                                />
                                                <Pill className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Family history */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold">Family History</h3>
                                    <div>
                                        <label className="text-md font-medium mb-2">Family Medical
                                            History</label>
                                        <div className="relative">
                                              <textarea
                                                  name="familyMedicalHistory"
                                                  value={parameters.familyMedicalHistory}
                                                  onChange={handleChange}
                                                  rows={2}
                                                  className={`${applyInputStyle()} border-gray-400`}
                                                  placeholder="Describe family medical history"
                                              />
                                            <Users className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <button type="submit"
                                            className="px-6 py-4 bg-gradient-to-r from-primary-end to-primary-start font-bold hover:text-xl text-md text-white rounded-md hover:opacity-70 transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5"/>
                                        Preview
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!canActivatePrescribeDoctorBtn}
                                        onClick={()=>{setCanPrescribeDoctor(true)}}
                                        className={` py-4 px-6 rounded-md flex items-center justify-center gap-2 ${canActivatePrescribeDoctorBtn ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                    >
                                        <UserPlus className="w-5 h-5"/>
                                        Prescribe a Doctor
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
            </NurseNavBar>
            <ConfirmSaveParameters isOpen={canOpenConfirmSaveParameters} onClose={() => setCanOpenConfirmSaveParameters(false)} parameters={parameters} bmi={bmi} action={ async() => {await saveParameters()}} patientInfos={patientInfo}/>
            <ErrorModal isOpen={canOpenErrorMessageModal} onCloseErrorModal={() => setCanOpenErrorMessageModal(false)} message={errorMessage}/>
            <SuccessModal isOpen={canOpenSuccessModal} canOpenSuccessModal={() => setCanOpenSuccessModal(false)} message={successMessage}/>
            <PrescribeDoctor isOpen={canPrescribeDoctor} onClose={()=>setCanPrescribeDoctor(false)} patientInfos={patientInfo} setCanOpenSuccessModal={setCanOpenSuccessModal} setSuccessMessage={setSuccessMessage}/>
            {isLoading && <Wait/>}

        </DashBoard>

    )
}

