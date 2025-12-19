import axios from "axios";



/*const ErrorInterceptor = (axiosInstance) => {

    axiosInstance.interceptors.response.use(
        res => {
            return res;
        },
        error => {
            console.group("Error");
            console.log(error);
            console.groupEnd();

            return error.response
        }
    )
}
*/


const token = localStorage.getItem("token_key_fultang");


const axiosInstance = axios.create(
    {
    baseURL: import.meta.env.VITE_BACKEND_FULTANG_API_BASE_MEDICALSTAFF_URL,
    headers:
        {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        }
    }
);

//ErrorInterceptor(axiosInstance);
export default axiosInstance;