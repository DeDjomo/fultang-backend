import axiosInstance from '../Utils/axiosInstance';

/**
 * Service API pour les medecins.
 */

const BASE_URL = '/medecins';

/**
 * Recupere tous les medecins.
 */
export const getAllMedecins = async () => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching medecins:', error);
        throw error;
    }
};

/**
 * Cree un nouveau medecin.
 * @param {Object} data - Donnees du medecin incluant specialite
 */
export const createMedecin = async (data) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/`, data);
        return response.data;
    } catch (error) {
        console.error('Error creating medecin:', error);
        throw error;
    }
};

/**
 * Recherche un medecin par matricule.
 */
export const getMedecinByMatricule = async (matricule) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/`, { params: { search: matricule } });
        return response.data;
    } catch (error) {
        console.error('Error searching medecin:', error);
        throw error;
    }
};
