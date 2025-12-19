import PropTypes from "prop-types";
import userIcon from "../../assets/userIcon.png";
import { Mail, Phone, MapPin, Calendar, CreditCard, User } from 'lucide-react';


export function ViewPatientDetailsModal({isOpen, patient, onClose})
{
    ViewPatientDetailsModal.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        patient: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired
    };

    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-lg shadow-xl w-[600px] ">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="flex flex-row">
                        {/* Left Section - Avatar and Name */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex flex-col items-center text-center w-1/3">
                            <div className="w-40 h-40 rounded-full bg-sky-200 overflow-hidden mb-4">
                                <img
                                    src = {userIcon}
                                    alt="Profile avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h1 className="text-2xl font-bold text-navy-900 mb-1">{patient.lastName}</h1>
                            <h2 className="text-xl text-navy-700 mb-4">{patient.firstName}</h2>
                            <div className="flex items-center text-gray-600">
                                <User className="w-4 h-4 mr-2"/>
                                <p className="text-xl font-bold">{patient.gender}</p>
                            </div>
                        </div>

                        {/* Right Section - Personal Information */}
                        <div className="p-6 md:w-2/3">
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <MapPin className="w-7 h-7 text-primary-start mt-1 mr-3"/>
                                    <div>
                                        <p className="text-md text-gray-500 font-medium">Address</p>
                                        <p className="text-gray-700 font-bold">{patient.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Mail className="w-7 h-7 text-primary-start mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Email</p>
                                        <p className="text-gray-700 font-bold">{patient.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <CreditCard className="w-7 h-7 text-primary-start mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">CNI Number</p>
                                        <p className="text-gray-700 font-bold">{patient.cniNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Phone className="w-7 h-7 text-primary-start mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                                        <p className="text-gray-700 font-bold">{patient.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Calendar className="w-7 h-7 text-primary-start mt-1 mr-3"/>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Date of Birth</p>
                                        <p className="text-gray-700 font-bold">{patient.birthDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-1 bg-primary-end text-md hover:text-xl font-bold text-md text-white rounded-md transition-all duration-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}