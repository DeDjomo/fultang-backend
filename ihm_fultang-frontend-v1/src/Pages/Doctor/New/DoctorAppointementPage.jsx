import  { useState } from "react"
import {
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  Pill,
  Stethoscope,
  ClipboardList,
  Users,
  Search,
  UserPlus,
  User,
  X,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"
import { FaSearch, FaUser, FaChevronRight } from "react-icons/fa"
import { DoctorNavBar } from "../DoctorComponents/DoctorNavBar.jsx"
import { doctorNavLink } from "../lib/doctorNavLink.js"
import {CustomDashboard} from "../../../GlobalComponents/CustomDashboard.jsx";

const patients = [
  { id: 1, name: "Jean Dupont", age: 45, email: "jean@email.com", phone: "0123456789" },
  { id: 2, name: "Marie Martin", age: 32, email: "marie@email.com", phone: "0123456788" },
  { id: 3, name: "Pierre Durant", age: 28, email: "pierre@email.com", phone: "0123456787" },
]

const doctors = [
  { id: 1, name: "Dr. Sophie Bernard", speciality: "Généraliste" },
  { id: 2, name: "Dr. Thomas Robert", speciality: "Cardiologue" },
  { id: 3, name: "Dr. Claire Dubois", speciality: "Pédiatre" },
]

export const AppointmentForm2 = () => {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [appointmentData, setAppointmentData] = useState({
    date: "",
    time: "",
    reason: "",
    requirements: "",
    status: "pending",
  })

  const [searchPatient, setSearchPatient] = useState("")
  const [searchDoctor, setSearchDoctor] = useState("")
  const [notification, setNotification] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPatient || !selectedDoctor) {
      setNotification({
        message: "Veuillez sélectionner un patient et un médecin.",
        type: "error",
      })
      return
    }

    const appointmentPayload = {
      ...appointmentData,
      patientId: selectedPatient.id,
      doctorId: selectedDoctor.id,
    }

    try {
      // await createAppointment(appointmentPayload);
      setNotification({
        message: "Rendez-vous enregistré avec succès",
        type: "success",
      })
    } catch (error) {
      setNotification({
        message: "Erreur lors de l'enregistrement du rendez-vous",
        type: "error",
      })
    }
  }

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchPatient.toLowerCase()),
  )

  const filteredDoctors = doctors.filter((doctor) => doctor.name.toLowerCase().includes(searchDoctor.toLowerCase()))

  if (!selectedPatient) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-gradient-to-r from-primary-end to-primary-start p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Nouveau Rendez-vous</h1>
          <p className="opacity-90 font-semibold text-md">
            Commencez par sélectionner un patient pour programmer le rendez-vous
          </p>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Rechercher un patient..."
                  value={searchPatient}
                  onChange={(e) => setSearchPatient(e.target.value)}
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:border-primary-end focus:ring-2 focus:ring-primary-start outline-none transition-all"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>

              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className="w-full p-4 flex items-center space-x-4 hover:bg-gray-50 rounded-lg transition-all border border-gray-200"
                  >
                    <div className="w-12 h-12 bg-primary-start rounded-full flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-800">{patient.name}</h3>
                      <div className="text-sm text-gray-500 space-x-4">
                        <span>{patient.age} ans</span>
                        <span>•</span>
                        <span>{patient.phone}</span>
                      </div>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="bg-gradient-to-r from-primary-end to-primary-start rounded-lg p-6 text-white mb-5">
        <h1 className="text-3xl font-bold mb-2">Nouveau Rendez-vous pour {selectedPatient.name}</h1>
        <p className="opacity-90 font-semibold text-md">
          Remplissez les détails du rendez-vous pour {selectedPatient.name}
        </p>
      </div>
      <div className="bg-gray-100 shadow-md rounded-lg mb-5 p-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-start">
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-secondary text-xl hover:text-primary-end transition-all duration-300 font-bold flex items-center"
            >
              <ArrowLeft />
              Retour à la liste des patients
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gray-100 rounded-lg">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <p className="text-xl font-bold">Patient</p>
                  <div className="mt-1 text-md text-gray-900 flex items-center">
                    <User className="mr-2 h-8 w-8 text-gray-600" />
                    {selectedPatient.name}
                  </div>
                </div>
                <div className="col-span-1">
                  <p className="text-md font-bold">Médecin</p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher un médecin..."
                      value={searchDoctor}
                      onChange={(e) => setSearchDoctor(e.target.value)}
                      className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:border-primary-end focus:ring-2 focus:ring-primary-start outline-none transition-all"
                    />
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  <div className="mt-2 space-y-2">
                    {filteredDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        type="button"
                        onClick={() => setSelectedDoctor(doctor)}
                        className={`w-full p-2 rounded-lg border transition-all ${
                          selectedDoctor?.id === doctor.id
                            ? "border-primary-end bg-primary-start text-white"
                            : "border-gray-200 hover:border-primary-start hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-end" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-medium">{doctor.name}</h4>
                            <p className="text-sm opacity-75">{doctor.speciality}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={appointmentData.date}
                      onChange={(e) =>
                        setAppointmentData({
                          ...appointmentData,
                          date: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:border-primary-end focus:ring-2 focus:ring-primary-start outline-none"
                      required
                    />
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={appointmentData.time}
                      onChange={(e) =>
                        setAppointmentData({
                          ...appointmentData,
                          time: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:border-primary-end focus:ring-2 focus:ring-primary-start outline-none"
                      required
                    />
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Raison du rendez-vous</label>
                <textarea
                  value={appointmentData.reason}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      reason: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-end focus:ring-2 focus:ring-primary-start outline-none resize-none"
                  rows={3}
                  required
                  placeholder="Décrivez la raison de la consultation..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exigences particulières</label>
                <textarea
                  value={appointmentData.requirements}
                  onChange={(e) =>
                    setAppointmentData({
                      ...appointmentData,
                      requirements: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-end focus:ring-2 focus:ring-primary-start outline-none resize-none"
                  rows={2}
                  placeholder="Ex: Être à jeun, apporter les résultats d'analyses..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-end to-primary-start text-white rounded-lg hover:from-primary-start hover:to-primary-end transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-start focus:ring-offset-2 flex items-center justify-center"
              >
                <FileText className="mr-2" />
                Confirmer le rendez-vous
              </button>
            </form>

            {notification && (
              <div
                className={`mt-6 p-4 rounded-lg flex items-center space-x-3 ${
                  notification.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-700" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-700" />
                )}
                <p className={`text-sm ${notification.type === "success" ? "text-green-700" : "text-red-700"}`}>
                  {notification.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function DoctorAppointementPage() {
  return (
    <CustomDashboard linkList={doctorNavLink} requiredRole="Doctor">
      <DoctorNavBar />
      <AppointmentForm2 />
    </CustomDashboard>
  )
}



