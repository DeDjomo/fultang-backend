import { useState, useEffect } from 'react';
import { Tooltip } from 'antd';
import { FaSearch, FaEye, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import { receptionistNavLink } from "./receptionistNavLink.js";
import { ReceptionistNavBar } from "./ReceptionistNavBar.jsx";
import { getHospitalizedPatients } from '../../services/patientsApi';
import Loader from "../../GlobalComponents/Loader.jsx";
import { BedDouble } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Page des patients hospitalises.
 * Affiche la liste des patients actuellement hospitalises avec leurs infos de chambre.
 */
export function HospitalizedPatients() {
    const { t } = useTranslation();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHospitalizedPatients();
    }, []);

    const fetchHospitalizedPatients = async () => {
        setLoading(true);
        try {
            const response = await getHospitalizedPatients();
            const data = response.data || response.results || [];
            setPatients(data);
        } catch (error) {
            console.error('Error fetching hospitalized patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient => {
        const searchLower = searchTerm.toLowerCase();
        return (
            patient.nom?.toLowerCase().includes(searchLower) ||
            patient.prenom?.toLowerCase().includes(searchLower) ||
            patient.matricule?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <DashBoard requiredRole={"receptioniste"} linkList={receptionistNavLink}>
            <ReceptionistNavBar />
            <div className="mt-5 flex flex-col relative">
                {/* Header avec barre de recherche */}
                <div className="flex justify-between mb-5">
                    <p className="font-bold text-xl mt-2 ml-5">Patients Hospitalisés</p>
                    <div className="flex mr-5">
                        <div className="flex w-[300px] h-10 border-2 border-secondary rounded-lg">
                            <FaSearch className="text-xl text-secondary m-2" />
                            <input
                                type="text"
                                placeholder="Rechercher un patient..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-none focus:outline-none focus:ring-0 w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                {loading ? (
                    <div className="h-[500px] w-full flex justify-center items-center">
                        <Loader size={"medium"} color={"primary-end"} />
                    </div>
                ) : filteredPatients.length > 0 ? (
                    <div className="ml-5 mr-5">
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead>
                                <tr className="bg-gradient-to-l from-primary-start to-primary-end">
                                    <th className="text-center text-white p-4 text-xl font-bold rounded-l-2xl">No</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">Matricule</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">Nom Complet</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">Chambre</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">Début</th>
                                    <th className="text-center text-white p-4 text-xl font-bold">Statut</th>
                                    <th className="text-center text-white p-4 text-xl font-bold rounded-r-2xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient, index) => (
                                    <tr key={patient.id} className="bg-gray-100">
                                        <td className="p-4 text-md text-blue-900 rounded-l-lg text-center">{index + 1}</td>
                                        <td className="p-4 text-md text-center font-mono">{patient.matricule}</td>
                                        <td className="p-4 text-md text-center font-bold">
                                            {patient.nom} {patient.prenom}
                                        </td>
                                        <td className="p-4 text-md text-center">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                                {patient.hospitalisation?.numero_chambre || '-'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-md text-center">
                                            {patient.hospitalisation?.debut
                                                ? new Date(patient.hospitalisation.debut).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="p-4 text-md text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${patient.hospitalisation?.statut === 'en_cours'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {patient.hospitalisation?.statut || 'En cours'}
                                            </span>
                                        </td>
                                        <td className="p-4 relative rounded-r-lg">
                                            <div className="w-full items-center justify-center flex gap-4">
                                                <Tooltip placement="top" title="Voir détails">
                                                    <button className="flex items-center justify-center w-9 h-9 text-primary-end text-xl hover:bg-gray-300 hover:rounded-full transition-all duration-300">
                                                        <FaEye />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center mt-20">
                        <BedDouble className="w-36 h-36 text-gray-300" />
                        <h3 className="font-bold text-2xl mt-4 mb-2 text-gray-800">Aucun patient hospitalisé</h3>
                        <p className="text-gray-600 mb-6 max-w-xl text-md font-medium">
                            Il n'y a actuellement aucun patient hospitalisé dans le système.
                        </p>
                    </div>
                )}
            </div>
        </DashBoard>
    );
}
