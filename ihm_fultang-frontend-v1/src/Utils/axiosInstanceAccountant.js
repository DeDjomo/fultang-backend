import axios from "axios";


const token = localStorage.getItem("token_key_fultang");


const axiosInstanceAccountant = axios.create(
    {
        baseURL: import.meta.env.VITE_BACKEND_FULTANG_API_BASE_ACCOUNTANT_URL,
        headers:
            {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
    }
);

export default axiosInstanceAccountant;