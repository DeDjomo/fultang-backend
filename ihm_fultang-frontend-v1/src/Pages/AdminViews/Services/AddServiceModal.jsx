import { useState } from 'react';
import { Modal, message, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { Building2, User } from 'lucide-react';
import { createService } from '../../../services/servicesApi';

/**
 * Modal pour ajouter un nouveau service avec son chef.
 * Contient deux sections: informations du service et du chef.
 */
export function AddServiceModal({ isOpen, onClose, onSuccess }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);

    const [formData, setFormData] = useState({
        nom_service: '',
        desc_service: '',
        chef_nom: '',
        chef_prenom: '',
        chef_date_naissance: '',
        chef_email: '',
        chef_contact: '',
        chef_poste: '',
        chef_specialite: ''
    });

    // Postes correspondant exactement au backend
    const POSTES = [
        { value: 'receptioniste', label: t('personnel.positions.receptioniste') },
        { value: 'caissier', label: t('personnel.positions.caissier') },
        { value: 'infirmier', label: t('personnel.positions.infirmier') },
        { value: 'medecin', label: t('personnel.positions.medecin') },
        { value: 'laborantin', label: t('personnel.positions.laborantin') },
        { value: 'pharmacien', label: t('personnel.positions.pharmacien') },
        { value: 'comptable', label: t('personnel.positions.comptable') },
        { value: 'directeur', label: t('personnel.positions.directeur') }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
        setApiError(null);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nom_service.trim()) {
            newErrors.nom_service = t('services.required');
        }
        if (!formData.chef_nom.trim()) {
            newErrors.chef_nom = t('services.required');
        }
        if (!formData.chef_prenom.trim()) {
            newErrors.chef_prenom = t('services.required');
        }
        if (!formData.chef_date_naissance) {
            newErrors.chef_date_naissance = t('services.required');
        }
        if (!formData.chef_email.trim()) {
            newErrors.chef_email = t('services.required');
        }
        if (!formData.chef_contact.trim()) {
            newErrors.chef_contact = t('services.required');
        } else if (!/^6\d{8}$/.test(formData.chef_contact)) {
            newErrors.chef_contact = t('services.phoneFormat');
        }
        if (!formData.chef_poste) {
            newErrors.chef_poste = t('services.required');
        }
        if (formData.chef_poste === 'medecin' && !formData.chef_specialite.trim()) {
            newErrors.chef_specialite = t('services.specialtyRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatErrorMessage = (errorData) => {
        if (typeof errorData === 'string') return errorData;

        if (errorData.erreurs) {
            const erreurs = errorData.erreurs;
            const messages = [];
            for (const [field, fieldErrors] of Object.entries(erreurs)) {
                const errorList = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
                messages.push(`${field}: ${errorList.join(', ')}`);
            }
            return messages.join('\n');
        }

        if (errorData.detail) return errorData.detail;
        if (errorData.error) return `${errorData.error}: ${errorData.detail || ''}`;

        return JSON.stringify(errorData);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setApiError(null);

        try {
            // Formater les donnees correctement
            const dataToSend = {
                nom_service: formData.nom_service.trim(),
                desc_service: formData.desc_service.trim(),
                chef_nom: formData.chef_nom.trim(),
                chef_prenom: formData.chef_prenom.trim(),
                chef_date_naissance: formData.chef_date_naissance,
                chef_email: formData.chef_email.trim().toLowerCase(),
                chef_contact: formData.chef_contact.trim(),
                chef_poste: formData.chef_poste
            };

            // Ajouter specialite si medecin
            if (formData.chef_poste === 'medecin' && formData.chef_specialite.trim()) {
                dataToSend.chef_specialite = formData.chef_specialite.trim();
            }

            console.log('Sending data:', dataToSend);

            await createService(dataToSend);
            message.success(t('services.createSuccess'));
            resetForm();
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating service:', error);
            const errorData = error.response?.data;
            const errorMsg = formatErrorMessage(errorData);
            setApiError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nom_service: '',
            desc_service: '',
            chef_nom: '',
            chef_prenom: '',
            chef_date_naissance: '',
            chef_email: '',
            chef_contact: '',
            chef_poste: '',
            chef_specialite: ''
        });
        setErrors({});
        setApiError(null);
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-end" />
                    <span>{t('services.addService')}</span>
                </div>
            }
            open={isOpen}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={t('common.save')}
            cancelText={t('common.cancel')}
            width={700}
        >
            <div className="space-y-6 py-4">
                {/* Affichage des erreurs API */}
                {apiError && (
                    <Alert
                        type="error"
                        message={t('common.error')}
                        description={<pre className="whitespace-pre-wrap text-sm">{apiError}</pre>}
                        showIcon
                        closable
                        onClose={() => setApiError(null)}
                    />
                )}

                {/* Section Service */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {t('services.serviceInfo')}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('services.serviceName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nom_service"
                                value={formData.nom_service}
                                onChange={handleChange}
                                placeholder={t('services.enterServiceName')}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end focus:border-primary-end ${errors.nom_service ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.nom_service && <p className="text-red-500 text-xs mt-1">{errors.nom_service}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('services.serviceDescription')} <span className="text-gray-400">({t('services.optional')})</span>
                            </label>
                            <textarea
                                name="desc_service"
                                value={formData.desc_service}
                                onChange={handleChange}
                                placeholder={t('services.enterDescription')}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-end focus:border-primary-end"
                            />
                        </div>
                    </div>
                </div>

                {/* Section Chef de Service */}
                <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {t('services.chefInfo')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('services.lastName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="chef_nom"
                                value={formData.chef_nom}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_nom ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.chef_nom && <p className="text-red-500 text-xs mt-1">{errors.chef_nom}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('services.firstName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="chef_prenom"
                                value={formData.chef_prenom}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_prenom ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.chef_prenom && <p className="text-red-500 text-xs mt-1">{errors.chef_prenom}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('services.birthDate')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="chef_date_naissance"
                                value={formData.chef_date_naissance}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_date_naissance ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.chef_date_naissance && <p className="text-red-500 text-xs mt-1">{errors.chef_date_naissance}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('services.email')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="chef_email"
                                value={formData.chef_email}
                                onChange={handleChange}
                                placeholder="exemple@hospital.cm"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_email ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.chef_email && <p className="text-red-500 text-xs mt-1">{errors.chef_email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('services.phone')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="chef_contact"
                                value={formData.chef_contact}
                                onChange={handleChange}
                                placeholder="677123456"
                                maxLength={9}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_contact ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            <p className="text-xs text-gray-500 mt-1">{t('services.phoneFormat')}</p>
                            {errors.chef_contact && <p className="text-red-500 text-xs mt-1">{errors.chef_contact}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('services.position')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="chef_poste"
                                value={formData.chef_poste}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_poste ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">{t('services.selectPosition')}</option>
                                {POSTES.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                            {errors.chef_poste && <p className="text-red-500 text-xs mt-1">{errors.chef_poste}</p>}
                        </div>
                        {formData.chef_poste === 'medecin' && (
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('services.specialty')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="chef_specialite"
                                    value={formData.chef_specialite}
                                    onChange={handleChange}
                                    placeholder={t('services.enterSpecialty')}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-end ${errors.chef_specialite ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.chef_specialite && <p className="text-red-500 text-xs mt-1">{errors.chef_specialite}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
