"use client"

import  { useState } from "react"
import { ArrowLeft, User, Calendar, CreditCard, Printer, FileText } from "lucide-react"

import { FaSearch, FaUser, FaChevronRight, FaHistory, FaPills } from "react-icons/fa"
import { BsExclamationTriangle } from "react-icons/bs"
import { IoMedkit } from "react-icons/io5"
import { GiStethoscope } from "react-icons/gi"
import { doctorNavLink } from "../lib/doctorNavLink.js"
import {DoctorNavBar} from "../DoctorComponents/DoctorNavBar.jsx"
import {CustomDashboard} from "../../../GlobalComponents/CustomDashboard.jsx";


const patients = [
  { id: 1, name: "Jean Dupont", age: 45, email: "jean@email.com", phone: "0123456789" },
  { id: 2, name: "Marie Martin", age: 32, email: "marie@email.com", phone: "0123456788" },
  { id: 3, name: "Pierre Durant", age: 28, email: "pierre@email.com", phone: "0123456787" },
]

const mockMedicalRecords = {
  1: [
    { date: "2023-05-15", symptoms: "Maux de tête", diagnosis: "Migraine", treatment: "Ibuprofène" },
    { date: "2023-03-02", symptoms: "Toux persistante", diagnosis: "Bronchite", treatment: "Antibiotiques" },
  ],
  2: [{ date: "2023-06-01", symptoms: "Douleurs abdominales", diagnosis: "Gastrite", treatment: "Antiacides" }],
  3: [],
  4: [
    {
      date: "2023-06-10",
      symptoms: "Fatigue chronique",
      diagnosis: "Anémie suspectée",
      treatment: "Examens complémentaires prescrits",
    },
  ],
}

const consultationTypes = ["Consultation générale", "Suivi", "Urgence", "Spécialiste", "Téléconsultation"]

export const MedicalRecord2 = () => {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [searchPatient, setSearchPatient] = useState("")
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    cost: "",
    reason: "",
    notes: "",
    allergies: "",
    medicalHistory: "",
    consultationType: consultationTypes[0],
    temperature: "",
    bloodPressure: "",
    heartRate: "",
    weight: "",
    height: "",
    currentMedications: "",
    familyHistory: "",
    prescriptions: [],
    exams: [],
  })

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchPatient.toLowerCase()),
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Formulaire soumis:", formData)
    // Ici, vous ajouteriez la logique pour envoyer les données au serveur
  }

  const addPrescription = () => {
    setFormData((prevState) => ({
      ...prevState,
      prescriptions: [...prevState.prescriptions, { medication: "", dosage: "", frequency: "", duration: "" }],
    }))
  }

  const updatePrescription = (index, field, value) => {
    const newPrescriptions = [...formData.prescriptions]
    newPrescriptions[index][field] = value
    setFormData((prevState) => ({
      ...prevState,
      prescriptions: newPrescriptions,
    }))
  }

  const addExam = () => {
    setFormData((prevState) => ({
      ...prevState,
      exams: [...prevState.exams, { name: "", details: "" }],
    }))
  }

  const updateExam = (index, field, value) => {
    const newExams = [...formData.exams]
    newExams[index][field] = value
    setFormData((prevState) => ({
      ...prevState,
      exams: newExams,
    }))
  }

  if (!selectedPatient) {

        return (
            <div className="min-h-screen bg-gray-100">
              <div className="bg-gradient-to-r from-primary-end to-primary-start p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">Carnet Médical</h1>
                <p className="opacity-90 font-semibold text-md">Sélectionnez un patient pour commencer la consultation</p>
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
        <h1 className="text-3xl font-bold mb-2">
          Consultation de {selectedPatient.name} 
        </h1>
        <p className="opacity-90 font-semibold text-md">
          Enregistrez les détails de la consultation de {selectedPatient.name}, incluant le diagnostic établi, les examens
          effectués et le traitement prescrit.
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
          <div className="flex items-center">
            <button
              onClick={() => {
                alert("Implémentation de la fonction d'impression")
              }}
              className="bg-secondary font-bold duration-300 text-white px-4 py-2 rounded-md hover:bg-primary-end hover:text-white transition-all mr-2"
            >
              <Printer size={20} className="inline mr-2" />
              Imprimer
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
                  <p className="text-md font-bold">Date et Heure</p>
                  <div className="mt-1 text-md text-gray-900 flex items-center">
                    <Calendar className="mr-2 h-8 w-8 text-gray-600" />
                    <input
                      type="datetime-local"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <p className="text-md font-bold">Type de consultation</p>
                  <select
                    id="consultationType"
                    name="consultationType"
                    value={formData.consultationType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {consultationTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1">
                  <p className="text-md font-bold">Coût</p>
                  <div className="mt-1 text-md text-blue-500 font-bold flex items-center">
                    <CreditCard className="mr-2 h-8 w-8 text-gray-400" />
                    <input
                      type="number"
                      id="cost"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      className="border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                    <span className="ml-2">FCFA</span>
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <div className="flex gap-2 mb-2 mt-4">
                  <IoMedkit className="w-7 h-7" />
                  <p className="text-md font-bold mt-1">Paramètres du patient</p>
                </div>
                <div className="mt-1 text-sm text-gray-900">
                  <div className="grid gap-4 grid-cols-4">
                    <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                      <FaPills className="w-7 h-7 text-primary-end mr-2" />
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Poids</p>
                        <input
                          type="number"
                          id="weight"
                          name="weight"
                          value={formData.weight}
                          onChange={handleInputChange}
                          className="text-xl font-semibold bg-transparent w-full"
                          placeholder="70"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                      <FaPills className="w-7 h-7 text-primary-end mr-2" />
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Taille</p>
                        <input
                          type="number"
                          id="height"
                          name="height"
                          value={formData.height}
                          onChange={handleInputChange}
                          className="text-xl font-semibold bg-transparent w-full"
                          placeholder="1.75"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                      <FaPills className="w-7 h-7 text-primary-end mr-2" />
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Température</p>
                        <input
                          type="number"
                          id="temperature"
                          name="temperature"
                          value={formData.temperature}
                          onChange={handleInputChange}
                          className="text-xl font-semibold bg-transparent w-full"
                          placeholder="37.0"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                      <FaPills className="w-7 h-7 text-primary-end mr-2" />
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Pression artérielle</p>
                        <input
                          type="text"
                          id="bloodPressure"
                          name="bloodPressure"
                          value={formData.bloodPressure}
                          onChange={handleInputChange}
                          className="text-xl font-semibold bg-transparent w-full"
                          placeholder="120/80"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                      <FaPills className="w-7 h-7 text-primary-end mr-2" />
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Fréquence cardiaque</p>
                        <input
                          type="number"
                          id="heartRate"
                          name="heartRate"
                          value={formData.heartRate}
                          onChange={handleInputChange}
                          className="text-xl font-semibold bg-transparent w-full"
                          placeholder="72"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                      <BsExclamationTriangle className="w-7 h-7 text-primary-end mr-2" />
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Allergies</p>
                        <input
                          type="text"
                          id="allergies"
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          className="text-xl font-semibold bg-transparent w-full"
                          placeholder="Aucune"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                      <FaPills className="w-7 h-7 text-primary-end mr-2" />
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Médicaments actuels</p>
                        <input
                          type="text"
                          id="currentMedications"
                          name="currentMedications"
                          value={formData.currentMedications}
                          onChange={handleInputChange}
                          className="text-xl font-semibold bg-transparent w-full"
                          placeholder="Aucun"
                        />
                      </div>
                    </div>
                    <div className="bg-gray-200 p-3 rounded-lg flex items-center">
                      <FaHistory className="w-7 h-7 text-primary-end mr-2" />
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Antécédents familiaux</p>
                        <input
                          type="text"
                          id="familyHistory"
                          name="familyHistory"
                          value={formData.familyHistory}
                          onChange={handleInputChange}
                          className="text-xl font-semibold bg-transparent w-full"
                          placeholder="Aucun"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-3">
                <div className="flex gap-2">
                  <GiStethoscope className="w-7 h-7 mb-1" />
                  <p className="text-md font-bold mt-1">Diagnostic</p>
                </div>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Entrez le diagnostic ici..."
                ></textarea>
              </div>

              <div className="col-span-2 mt-3">
                <div className="flex gap-2">
                  <FileText className="w-7 h-7 mb-1" />
                  <p className="text-md font-bold">Notes du médecin</p>
                </div>
                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ajoutez vos notes ici..."
                ></textarea>
              </div>

              <div className="col-span-2">
                <div className="flex gap-2">
                  <FaPills className="w-7 h-7 mb-1" />
                  <p className="text-md font-bold">Prescriptions</p>
                </div>
                {formData.prescriptions.map((prescription, index) => (
                  <div key={index} className="mt-2 grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={prescription.medication}
                      onChange={(e) => updatePrescription(index, "medication", e.target.value)}
                      placeholder="Médicament"
                      className="col-span-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      value={prescription.dosage}
                      onChange={(e) => updatePrescription(index, "dosage", e.target.value)}
                      placeholder="Dosage"
                      className="col-span-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      value={prescription.frequency}
                      onChange={(e) => updatePrescription(index, "frequency", e.target.value)}
                      placeholder="Fréquence"
                      className="col-span-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      value={prescription.duration}
                      onChange={(e) => updatePrescription(index, "duration", e.target.value)}
                      placeholder="Durée"
                      className="col-span-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPrescription}
                  className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ajouter une prescription
                </button>
              </div>

              <div className="col-span-2">
                <div className="flex gap-2">
                  <GiStethoscope className="w-7 h-7 mb-1" />
                  <p className="text-md font-bold mt-1">Examens</p>
                </div>
                {formData.exams.map((exam, index) => (
                  <div key={index} className="mt-2 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exam.name}
                      onChange={(e) => updateExam(index, "name", e.target.value)}
                      placeholder="Nom de l'examen"
                      className="col-span-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <input
                      type="text"
                      value={exam.details}
                      onChange={(e) => updateExam(index, "details", e.target.value)}
                      placeholder="Détails"
                      className="col-span-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExam}
                  className="mt-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Ajouter un examen
                </button>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-end to-primary-start text-white rounded-lg hover:from-primary-start hover:to-primary-end transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-start focus:ring-offset-2 flex items-center justify-center"
              >
                <FileText className="mr-2" />
                Enregistrer la consultation
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}


export  function DoctorAddConsultation() {
  return (
    <CustomDashboard linkList={doctorNavLink} requiredRole="Doctor">
        <DoctorNavBar/>
      <MedicalRecord2></MedicalRecord2>
    </>
  )
}

