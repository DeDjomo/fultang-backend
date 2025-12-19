import {
    Activity,
    AlertCircle,
    FileText,
    Heart,
    Pill,
    Ruler,
    Save,
    Scissors,
    Thermometer,
    UserPlus,
    Users,
    Weight,
    X
} from "lucide-react";
import PropTypes from "prop-types";



export function ConfirmSaveParameters({isOpen, onClose, parameters, bmi, action, patientInfos})
{


    ConfirmSaveParameters.propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        parameters: PropTypes.object.isRequired,
        bmi: PropTypes.string.isRequired,
        action: PropTypes.func.isRequired,
        patientInfos: PropTypes.object.isRequired
    }

   if(!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl  text-primary-start font-bold">Saved Medical Parameters of {patientInfos.firstName + ' ' + patientInfos.lastName}</h2>
                    <button onClick={() => onClose()}>
                        <X className="text-secondary font-bold w-8 h-8 hover:w-10 hover:h-10 hover:text-primary-end transition-all duration-300"/>
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Biometric parameters */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold ">Biometric Parameters</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-200 p-4 rounded-lg flex items-center gap-3">
                                <Weight className="h-5 w-5 text-primary-start"/>
                                <div>
                                    <span className="text-sm text-gray-600">Weight</span>
                                    <p className="text-lg font-medium text-gray-900">{parameters.weight || '-'} Kg</p>
                                </div>
                            </div>
                            <div className="bg-gray-200 p-4 rounded-lg flex items-center gap-3">
                                <Ruler className="h-5 w-5 text-primary-start"/>
                                <div>
                                    <span className="text-sm text-gray-600">Height</span>
                                    <p className="text-lg font-medium text-gray-900">{parameters.height || '-'} m</p>
                                </div>
                            </div>
                            <div className="bg-gray-200 p-4 rounded-lg flex items-center gap-3">
                                <Activity className="h-5 w-5 text-primary-start"/>
                                <div>
                                    <div className="flex gap-1">
                                        <span className="text-sm text-gray-600">BMI</span>
                                        <span className="text-xs mt-0.5  text-gray-600">(Body Mass Index)</span>
                                    </div>
                                    <p className="text-lg font-medium text-gray-900">{bmi} kg/m²</p>
                                </div>
                            </div>
                            <div className="bg-gray-200 p-4 rounded-lg flex items-center gap-3">
                                <Thermometer className="h-5 w-5 text-primary-start"/>
                                <div>
                                    <span className="text-sm text-gray-600">Temperature</span>
                                    <p className="text-lg font-medium text-gray-900">{parameters.temperature || '-'} °C</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cardiovascular parameters */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold ">Cardiovascular
                            Parameters</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-200 p-4 rounded-lg flex items-center gap-3">
                                <Heart className="h-5 w-5 text-primary-start"/>
                                <div>
                                    <span className="text-sm text-gray-600">Blood Pressure</span>
                                    <p className="text-lg font-medium text-gray-900">{parameters.bloodPressure || '-'} mmHg</p>
                                </div>
                            </div>
                            <div className="bg-gray-200 p-4 rounded-lg flex items-center gap-3">
                                <Activity className="h-5 w-5 text-primary-start"/>
                                <div>
                                    <span className="text-sm text-gray-600">Heart Rate</span>
                                    <p className="text-lg font-medium text-gray-900">{parameters.heartRate || '-'} bpm</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical history */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Medical History</h3>
                        <div className="space-y-4">
                            <div className="bg-gray-200 p-4 rounded-lg flex items-start gap-3">
                                <FileText className="h-5 w-5 text-primary-start mt-1"/>
                                <div>
                                    <span className="text-sm text-gray-600">Chronic Diseases</span>
                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{parameters.chronicalDiseases || '-'}</p>
                                </div>
                            </div>
                            <div className="bg-gray-200 p-4 rounded-lg flex items-start gap-3">
                                <Scissors className="h-5 w-5 text-primary-start mt-1"/>
                                <div>
                                    <span className="text-sm text-gray-600">Surgeries</span>
                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{parameters.surgeries || '-'}</p>
                                </div>
                            </div>
                            <div className="bg-gray-200 p-4 rounded-lg flex items-start gap-3">
                                <Pill className="h-5 w-5 text-primary-start mt-1"/>
                                <div>
                                    <span className="text-sm text-gray-600">Current Medications</span>
                                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{parameters.currentMedication || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Family history */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Family History</h3>
                        <div className="bg-gray-200 p-4 rounded-lg flex items-start gap-3 mt-4">
                            <Users className="h-5 w-5 text-primary-startmt-1"/>
                            <div>
                                <span className="text-sm text-gray-600">Family Medical History</span>
                                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{parameters.familyMedicalHistory || '-'}</p>
                            </div>
                        </div>

                        <div className="bg-gray-200 p-4 rounded-lg flex items-start gap-3 mt-4 ">
                            <AlertCircle className="h-5 w-5 text-primary-start mt-1"/>
                            <div>
                                <span className="text-sm text-gray-600">Allergies</span>
                                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{parameters.allergies || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-5  justify-center">
                            <button type="button"
                                    onClick={action}
                                    className="px-4 py-2 bg-gradient-to-r from-primary-end to-primary-start font-bold hover:text-xl text-md text-white rounded-md hover:opacity-70 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5"/>
                                Save Parameters
                            </button>
                            <button type="button"
                                    onClick={onClose}
                                    className={` py-2 px-4 rounded-md flex items-center justify-center gap-2 bg-red-400 text-white font-bold hover:bg-red-500 transition-all duration-300`}
                            >
                                <UserPlus className="w-5 h-5"/>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}