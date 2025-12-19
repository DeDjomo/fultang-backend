import axiosInstance from '../Utils/axiosInstance';

/**
 * Service API pour la gestion des chambres.
 */

const BASE_URL = '/chambres';

/**
 * Recupere toutes les chambres avec filtres optionnels.
 */
export const getAllChambres = async (filters = {}) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/`, { params: filters });
        return response.data;
    } catch (error) {
        console.error('Error fetching chambres:', error);
        throw error;
    }
};

/**
 * Recupere une chambre par son ID.
 */
export const getChambreById = async (id) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching chambre ${id}:`, error);
        throw error;
    }
};

/**
 * Cree une nouvelle chambre.
 */
export const createChambre = async (chambreData) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/`, chambreData);
        return response.data;
    } catch (error) {
        console.error('Error creating chambre:', error);
        throw error;
    }
};

/**
 * Met a jour une chambre existante.
 */
export const updateChambre = async (id, chambreData) => {
    try {
        const response = await axiosInstance.patch(`${BASE_URL}/${id}/`, chambreData);
        return response.data;
    } catch (error) {
        console.error(`Error updating chambre ${id}:`, error);
        throw error;
    }
};

/**
 * Supprime une chambre.
 */
export const deleteChambre = async (id) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting chambre ${id}:`, error);
        throw error;
    }
};
