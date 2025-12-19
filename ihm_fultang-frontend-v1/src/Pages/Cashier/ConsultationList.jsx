import { useState } from "react"
import {AlertCircle, Search, Calendar, User, DollarSign, Filter, CheckCircle } from "lucide-react"
import PropTypes from "prop-types";
import {FaUserDoctor} from "react-icons/fa6";
import {PaymentModal} from "./PayementModal.jsx";

export default function ConsultationList({consultationList}) {


  ConsultationList.propTypes = {
    consultationList: PropTypes.array.isRequired,
  }


  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedConsultation, setSelectedConsultation] = useState([]);
  const [canOpenPaymentModal, setCanOpenPaymentModal] = useState(false);

  const handlePayment = (consultation) => {
    setSelectedConsultation(consultation);
    setCanOpenPaymentModal(true);
  }

  const filteredConsultations = consultationList.filter((consultation) => {
    const patientFullName = `${consultation.idPatient.firstName} ${consultation.idPatient.lastName}`;
    const doctorFullName = `${consultation.idMedicalStaffGiver.first_name} ${consultation.idMedicalStaffGiver.last_name}`;
    return (
        (patientFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctorFullName.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === "all" || consultation.paymentStatus === filterStatus)
    )
  })


  return (
      <div className="w-full mx-auto p-6 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Management of Consulting Payments</h1>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-1/3">
            <input
                type="text"
                placeholder="Rechercher un patient ou un médecin"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center space-x-4">
            <Filter className="text-gray-400" />
            <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="Invalid">On load</option>
              <option value="Valid">Payed</option>
            </select>
          </div>
        </div>

          <div>
            {
              consultationList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-semibold text-gray-600">
                      No consultations available
                    </p>
                </div>
              ) : (
                  
                  <table className="w-full ">
                      <thead className="bg-primary-end">
                        <tr>
                          <th className="px-6 py-5 text-center text-md font-bold text-white uppercase  rounded-l-lg">
                            Patient
                          </th>
                          <th className="px-6 py-5 text-center text-md font-bold text-white uppercase ">
                            Doctor
                          </th>
                          <th className="px-6 py-5 text-center text-md font-bold text-white uppercase ">Date</th>
                          <th className="px-6 py-5 text-center text-md font-bold text-white uppercase ">
                            Price
                          </th>
                          <th className="px-6 py-5 text-center text-md font-bold text-white uppercase ">Status</th>
                          <th className="px-6 py-5 text-center text-md font-bold text-white uppercase  rounded-r-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {filteredConsultations.map((consultation) => {

                            const patientInfo = consultation.idPatient;
                            const doctorInfo = consultation.idMedicalStaffGiver;
                            return (
                              <tr key={consultation.id}>
                                <td className=" py-6 ">
                                  <div className="flex items-center justify-center">
                                    <User className="h-5 w-5 text-gray-400 mr-2" />
                                    <div className="text-md font-semibold text-gray-900">{patientInfo.firstName +" "+ patientInfo.lastName}</div>
                                  </div>
                                </td>
                                <td className=" py-6 ">
                                  <div className="flex items-center justify-center">
                                    <FaUserDoctor className="h-5 w-5 text-gray-400 mr-2" />
                                    <div className="text-md  font-semibold text-gray-900">{doctorInfo.first_name + " "+ doctorInfo.last_name}</div>
                                  </div>
                                </td>
                                <td className=" py-6 ">
                                  <div className="flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                    <div className="text-md text-center font-semibold text-gray-900">{new Date(consultation.consultationDate).toLocaleDateString()}</div>
                                  </div>
                                </td>
                                <td className=" py-6  ">
                                  <div className="flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                                    <div className="text-md text-center font-bold text-gray-900">{consultation.consultationPrice} FCFA</div>
                                  </div>
                                </td>
                                <td className=" py-6  items-center justify-center flex ">
                                  <span className={`px-3  py-1 inline-flex text-sm leading-5 border-2  font-semibold rounded-full ${consultation.paymentStatus === "Valid" ? "bg-green-100 text-green-600 border-green-600" : "bg-yellow-100 text-yellow-600 border-yellow-600"}`}
                                  >
                                    {consultation.paymentStatus === "Valid" ? "Paid" : "Pending"}
                                  </span>
                                </td>
                                <td className="text-md font-medium text-center py-6">
                                  {consultation.paymentStatus === "Invalid" && (
                                      <button
                                          onClick={() => handlePayment(consultation)}
                                          className="text-primary-end hover:text-green-700 transition-all duration-500 flex items-center justify-center mx-auto"
                                      >
                                        <CheckCircle className="h-6 w-6 mr-1" />
                                        Pay
                                      </button>
                                  )}
                                </td>
                              </tr>
                            )})}
                      </tbody>
                  </table>
              )}
          </div>
          

        <PaymentModal
            isOpen={canOpenPaymentModal}
            onClose={()=>{setCanOpenPaymentModal(false)}}
            consultationData={selectedConsultation}
        />
      </div>
  )
}

