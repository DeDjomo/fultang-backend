"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Calendar, User, Stethoscope, ArrowLeft, Printer, Download } from "lucide-react";
import { laboratoryNavLink } from "./LaboratoryNavLink.js";
import { LaboratoryNavBar } from "./LaboratoryNavBar.jsx";
import { LaboratoryDashBoard } from "./LaboratoryDashBoard.jsx";
import axiosInstance from "../../Utils/axiosInstance.js";
import Loader from "../../GlobalComponents/Loader.jsx";
import ServerErrorPage from "../../GlobalComponents/ServerError.jsx";
import { formatDateOnly, formatDateToTime } from "../../Utils/formatDateMethods.js";

export function ExamResultDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [examResult, setExamResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fonction de rafraîchissement de l'exam result
    const refreshExamResult = async () => {
        try {
            const response = await axiosInstance.get(`/exam-result/${id}/`);
            setExamResult(response.data);
        } catch (err) {
            console.error("Erreur lors du refresh:", err);
        }
    };

    useEffect(() => {
        const fetchExamResult = async () => {
            try {
                const response = await axiosInstance.get(`/exam-result/${id}/`);
                setExamResult(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExamResult();
    }, [id]);

    if (isLoading) {
        return (
            <LaboratoryDashBoard linkList={laboratoryNavLink} requiredRole={"Labtech"}>
                <LaboratoryNavBar />
                <div className="h-[500px] w-full flex justify-center items-center">
                    <Loader size={"medium"} color={"primary-end"} />
                </div>
            </LaboratoryDashBoard>
        );
    }

    if (error) {
        return <ServerErrorPage errorStatus={error.status} message={error.message} />;
    }

    return (
        <LaboratoryDashBoard linkList={laboratoryNavLink} requiredRole={"Labtech"}>
            <LaboratoryNavBar />
            <div className="flex flex-col min-h-screen p-8">
                {/* Header */}
                <div className="bg-gradient-to-br from-primary-end to-primary-start rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                            <FileText className="w-12 h-12 text-primary-start" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">Exam Result Details</h1>
                            {/* On a retiré l'affichage de l'ID */}
                        </div>
                        <div className="text-white text-right">
                            <p className="font-bold">{formatDateOnly(examResult.addDate)}</p>
                            <p>{formatDateToTime(examResult.addDate)}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="bg-gray-100 shadow-md rounded-lg mb-6 p-4">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-secondary text-xl transition-all duration-300 font-bold flex gap-2 items-center"
                        >
                            <div className="w-8 h-8 border-2 rounded-full flex justify-center items-center border-secondary">
                                <ArrowLeft />
                            </div>
                            <p className="text-[17px] mt-0.5">Back to Exam Results</p>
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={() => window.print()}
                                className="bg-secondary font-bold duration-300 text-white px-4 py-2 rounded-md hover:bg-primary-end transition-all"
                            >
                                <Printer size={20} className="inline mr-2" />
                                Print Result
                            </button>
                            {examResult.examFile && (
                                <a
                                    href={examResult.examFile}
                                    download
                                    className="bg-primary-start font-bold duration-300 text-white px-4 py-2 rounded-md hover:bg-primary-end transition-all"
                                >
                                    <Download size={20} className="inline mr-2" />
                                    Download File
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Exam Details */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-primary-start" />
                            <span className="font-semibold mr-2">Date:</span>
                            <span>{formatDateOnly(examResult.addDate)}</span>
                        </div>
                        <div className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-primary-start" />
                            <span className="font-semibold mr-2">Patient:</span>
                            <span>
                {examResult.idPatient
                    ? `${examResult.idPatient.firstName} ${examResult.idPatient.lastName}`
                    : "N/A"}
              </span>
                        </div>
                        <div className="flex items-center">
                            <Stethoscope className="w-5 h-5 mr-2 text-primary-start" />
                            <span className="font-semibold mr-2">Medical Staff:</span>
                            <span>
                {examResult.idMedicalStaff
                    ? `${examResult.idMedicalStaff.first_name} ${examResult.idMedicalStaff.last_name}`
                    : "N/A"}
              </span>
                        </div>
                        {/* On a retiré l'affichage de l'Exam Request ID */}
                    </div>
                </div>

                {/* Exam Notes */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam Notes</h2>
                    <p className="text-gray-600 whitespace-pre-wrap">
                        {examResult.notes || "No notes provided."}
                    </p>
                </div>

                {/* Exam File */}
                {examResult.examFile && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Exam File</h2>
                        <a
                            href={examResult.examFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-start hover:text-primary-end transition-colors"
                        >
                            View Exam File
                        </a>
                    </div>
                )}

                {/* Edit Section */}
                <EditExamResult examResult={examResult} refreshExamResult={refreshExamResult} />
            </div>
        </LaboratoryDashBoard>
    );
}

function EditExamResult({ examResult, refreshExamResult }) {
    const [newNotes, setNewNotes] = useState(examResult.notes || "");
    const [newFile, setNewFile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewFile(e.target.files[0]);
        }
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        setUpdateError(null);
        setUpdateSuccess(false);
        try {
            const formData = new FormData();
            formData.append("notes", newNotes);
            if (newFile) {
                formData.append("examFile", newFile);
            }
            const response = await axiosInstance.put(`/exam-result/${examResult.id}/`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.status === 200) {
                setUpdateSuccess(true);
                refreshExamResult();
            }
        } catch (err) {
            setUpdateError("Failed to update exam result.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Exam Result</h2>
            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Download Current File</label>
                {examResult.examFile ? (
                    <a
                        href={examResult.examFile}
                        download
                        className="text-primary-start hover:text-primary-end transition-colors inline-flex items-center gap-2"
                    >
                        <Download size={20} /> Download File
                    </a>
                ) : (
                    <p className="text-gray-500">No file available.</p>
                )}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Replace File</label>
                <input type="file" onChange={handleFileChange} className="w-full" />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Update Notes</label>
                <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:outline-none"
                    rows="4"
                ></textarea>
            </div>
            {updateError && <p className="text-red-600 mb-4">{updateError}</p>}
            {updateSuccess && <p className="text-green-600 mb-4">Exam result updated successfully.</p>}
            <div className="flex justify-end gap-4">
                <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-all"
                >
                    {isUpdating ? "Updating..." : "Update"}
                </button>
            </div>
        </div>
    );
}
