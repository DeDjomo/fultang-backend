import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../../Utils/axiosInstance.js";

export function EditPatientInfosModal({ isOpen, onClose, setCanOpenSuccessModal, setSuccessMessage, setIsLoading, patientData }) {

    EditPatientInfosModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        setCanOpenSuccessModal: PropTypes.func.isRequired,
        setSuccessMessage: PropTypes.func.isRequired,
        setIsLoading: PropTypes.func.isRequired,
        patientData: PropTypes.object.isRequired
    };


    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        gender: '',
        address: '',
        cniNumber: '',
        phoneNumber: '',
        email: '',
    });

    const [error, setError] = useState("");
    const [isYears, setIsYears] = useState(false);
    const [isMonth, setIsMonth] = useState(false);
    const [isWeeks, setIsWeeks] = useState(false);
    const [isDay, setIsDay] = useState(false);
    const [age, setAge] = useState(0);
    const [dateError, setDateError] = useState("");
    const [checkedFields, setCheckedFields] = useState({
        firstName: false,
        lastName: false,
        birthDate: false,
        gender: false,
        address: false,
        cniNumber: false,
        phoneNumber: false,
        email: false,
    });



    useEffect(() => {
        if (patientData) {
            setFormData(patientData);
            setAge(calculateAge(patientData.birthDate));
        }
    }, [patientData]);


    function calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        const diffTime = Math.abs(today - birth);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
            setIsDay(true);
            setIsWeeks(false);
            setIsMonth(false);
            setIsYears(false);
            return Math.floor(diffDays);
        }
        else if (diffDays < 30) {
            setIsDay(false);
            setIsWeeks(true);
            setIsMonth(false);
            setIsYears(false);
            return Math.floor(diffDays / 7);
        }
        else if (diffDays < 365) {
            setIsDay(false);
            setIsWeeks(false);
            setIsMonth(true);
            setIsYears(false);
            return Math.floor(diffDays / 30);
        } else {
            setIsDay(false);
            setIsWeeks(false);
            setIsMonth(false);
            setIsYears(true);
            let _age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                _age--;
            }
            return _age;
        }
    }



    function handleChange(e) {
        const { name, value } = e.target;
        if (name === 'birthDate') {
            const selectedDate = new Date(value);
            const today = new Date();
            if (selectedDate > today) {
                setDateError('The birth date cannot be in the future');
            } else {
                setDateError('');
                setFormData(prevData => ({ ...prevData, [name]: value }));
                setAge(calculateAge(value));
            }
        }
        else {
            setFormData(prevData => ({ ...prevData, [name]: value }));
        }
    }


    function handleCheckboxChange(e) {
        const { name, checked } = e.target;
        setCheckedFields(prev => ({ ...prev, [name]: checked }));
    }


    async function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        if (!dateError) {
            const updatedData = Object.keys(checkedFields).reduce((acc, key) => {
                if (checkedFields[key]) {
                    acc[key] = formData[key];
                }
                return acc;
            }, {});

            try {
                const response = await axiosInstance.patch(`/patients/${patientData.id}/`, updatedData);
                if (response.status === 200) {
                    setIsLoading(false);
                    setSuccessMessage("Patient information updated successfully!");
                    setCanOpenSuccessModal(true);
                    onClose();
                }
            } catch (error) {
                setIsLoading(false);
                setSuccessMessage("");
                setCanOpenSuccessModal(false);
                setError("Something went wrong, please try again later!");
                console.log(error);
            }
        }
        setIsLoading(false);
    }

    function applyFormStyle() {
        return "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-2 focus:border-primary-end";
    }

    function applyAgeStyle() {
        return "w-1/4 text-gray-500 text-md mr-1";
    }

    function applyCheckboxStyle() {
        return "form-checkbox h-3 w-3 mt-4 text-primary-end";
    }

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
                    <div className="bg-gradient-to-r from-primary-end to-primary-start px-6 py-4 rounded-t-lg flex-col flex justify-center items-center">
                        <h3 className="text-4xl font-bold text-white">Edit Patient Information</h3>
                        <div className="flex mt-3">
                            <p className="text-white font-semibold ml-3 italic">(Please check the fields you want to modify)</p>
                        </div>
                    </div>
                    {dateError && <p className="text-red-500 font-bold text-md ml-4">Error: {dateError}</p>}
                    {error && <p className="text-red-500 font-bold text-md ml-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="p-4 space-y-6">
                        <div className="flex space-x-3">
                            <div className="w-full flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="checkFirstName"
                                    name="firstName"
                                    checked={checkedFields.firstName}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="firstName"
                                           className="block text-sm font-medium text-gray-700 mb-1">Firstname</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="Enter patient's first name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.firstName}
                                        disabled={!checkedFields.firstName}
                                    />
                                </div>
                            </div>


                            <div className="w-full flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="checkLastName"
                                    name="lastName"
                                    checked={checkedFields.lastName}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="lastName"
                                           className="block text-sm font-medium text-gray-700 mb-1">Lastname</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Enter patient's last name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.lastName}
                                        disabled={!checkedFields.lastName}
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="flex space-x-2">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="checkBirthDate"
                                    name="birthDate"
                                    checked={checkedFields.birthDate}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Birth
                                        Date</label>
                                    <input
                                        type="date"
                                        id="birthDate"
                                        name="birthDate"
                                        placeholder="Enter patient's birth date"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.birthDate}
                                        disabled={!checkedFields.birthDate}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div>
                                    <label htmlFor="age"
                                           className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                    <div className={`${applyFormStyle()} flex justify-between`}>
                                        <input
                                            id="age"
                                            name="age"
                                            value={age}
                                            readOnly={true}
                                            className="w-3/4 outline-none focus:outline-none ring-0 focus:ring-0"
                                        />
                                        {isDay && <p className={applyAgeStyle()}> Day(s)</p>}
                                        {isWeeks && <p className={applyAgeStyle()}> Week(s)</p>}
                                        {isMonth && <p className={applyAgeStyle()}> Month(s)</p>}
                                        {isYears && <p className={applyAgeStyle()}> Year(s)</p>}
                                    </div>
                                </div>
                            </div>


                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="checkGender"
                                    name="gender"
                                    checked={checkedFields.gender}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="gender"
                                           className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.gender}
                                        disabled={!checkedFields.gender}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 space-x-2">
                            <div className="col-span-1 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="checkAddress"
                                    name="address"
                                    checked={checkedFields.address}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="address"
                                           className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        placeholder="Enter patient's address"
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.address}
                                        disabled={!checkedFields.address}
                                    />
                                </div>
                            </div>

                            <div className="col-span-2 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="checkEmail"
                                    name="email"
                                    checked={checkedFields.email}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="email"
                                           className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        placeholder="Enter patient's email"
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.email}
                                        disabled={!checkedFields.email}
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="grid grid-cols-3 space-x-2">

                            <div className="col-span-2 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="checkCniNumber"
                                    name="cniNumber"
                                    checked={checkedFields.cniNumber}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="cniNumber" className="block text-sm font-medium text-gray-700 mb-1">Identity
                                        Card Number</label>
                                    <input
                                        type="text"
                                        id="cniNumber"
                                        name="cniNumber"
                                        value={formData.cniNumber}
                                        placeholder="Enter patient's identity card number"
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.cniNumber}
                                        disabled={!checkedFields.cniNumber}
                                    />
                                </div>
                            </div>


                            <div className="col-span-1 flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="checkPhoneNumber"
                                    name="phoneNumber"
                                    checked={checkedFields.phoneNumber}
                                    onChange={handleCheckboxChange}
                                    className={applyCheckboxStyle()}
                                />
                                <div className="flex-1">
                                    <label htmlFor="phoneNumber"
                                           className="block text-sm font-medium text-gray-700 mb-1">Phone
                                        Number</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        placeholder="Enter patient's phone number"
                                        onChange={handleChange}
                                        className={applyFormStyle()}
                                        required={checkedFields.phoneNumber}
                                        disabled={!checkedFields.phoneNumber}
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="px-6 py-1 flex justify-center space-x-6">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary-end hover:text-xl text-md text-white rounded-lg font-bold transition-all duration-300"
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                onClick={()=>{setError(""),onClose()}}
                                className="px-4 py-2 border bg-red-400 text-md hover:text-xl hover:bg-red-500 text-white font-bold rounded-lg transition-all duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}



