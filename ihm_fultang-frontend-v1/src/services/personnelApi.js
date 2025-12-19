import axiosInstance from '../Utils/axiosInstance';

/**
 * Service API pour la gestion du personnel hospitalier.
 * Centralise tous les appels API lies au personnel.
 */

const BASE_URL = '/personnel';

/**
 * Recupere tous les personnels avec filtres optionnels.
 * 
 * @param {Object} filters - Filtres optionnels (poste, statut, service)
 * @returns {Promise} Liste des personnels
 */
export const getAllPersonnel = async (filters = {}) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/`, { params: filters });
        return response.data;
    } catch (error) {
        console.error('Error fetching personnel:', error);
        throw error;
    }
};

/**
 * Recupere un personnel par son ID.
 * 
 * @param {number} id - ID du personnel
 * @returns {Promise} Details du personnel
 */
export const getPersonnelById = async (id) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching personnel ${id}:`, error);
        throw error;
    }
};

/**
 * Cree un nouveau personnel.
 * Le mot de passe est auto-genere et envoye par email.
 * 
 * @param {Object} personnelData - Donnees du personnel
 * @returns {Promise} Personnel cree
 */
export const createPersonnel = async (personnelData) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/`, personnelData);
        return response.data;
    } catch (error) {
        console.error('Error creating personnel:', error);
        throw error;
    }
};

/**
 * Met a jour un personnel existant.
 * 
 * @param {number} id - ID du personnel
 * @param {Object} personnelData - Donnees a mettre a jour
 * @returns {Promise} Personnel mis a jour
 */
export const updatePersonnel = async (id, personnelData) => {
    try {
        const response = await axiosInstance.patch(`${BASE_URL}/${id}/`, personnelData);
        return response.data;
    } catch (error) {
        console.error(`Error updating personnel ${id}:`, error);
        throw error;
    }
};

/**
 * Supprime un personnel.
 * 
 * @param {number} id - ID du personnel a supprimer
 * @returns {Promise} Confirmation de suppression
 */
export const deletePersonnel = async (id) => {
    try {
        const response = await axiosInstance.delete(`${BASE_URL}/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting personnel ${id}:`, error);
        throw error;
    }
};

/**
 * Reinitialise le mot de passe d'un personnel (admin).
 * Un nouveau mot de passe est genere et envoye par email.
 * 
 * @param {string} email - Email du personnel
 * @returns {Promise} Confirmation
 */
export const resetPersonnelPassword = async (email) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/reset-password/`, { email });
        return response.data;
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
};
