import { cashierNavLink } from "./cashierNavLink.js";
import { CashierNavBar } from "./CashierNavBar.jsx";
import { DashBoard } from "../../GlobalComponents/DashBoard.jsx";
import userIcon from "../../assets/userIcon.png";
import { useAuthentication } from "../../Utils/Provider.jsx";
import ConsultationList from "./ConsultationList.jsx";
import { useEffect, useState } from "react";
import axiosInstance from "../../Utils/axiosInstance.js";

export function Cashier() {
  const { userData } = useAuthentication();
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000); 

    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    async function fetchConsultations() {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/consultation/");
        setIsLoading(false);
        if (response.status === 200) {
          setConsultations(response.data.results);
        }
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    }
    fetchConsultations();
  }, []);

  return (
    <DashBoard linkList={cashierNavLink} requiredRole={"Cashier"}>
      <CashierNavBar />
      <div className="flex flex-col">
        <div className="ml-5 mr-5 h-[150px] bg-gradient-to-t from-primary-start to-primary-end flex rounded-lg justify-between">
          <div className="flex gap-4">
            <div className="mt-5 mb-5 ml-5 w-28 h-28 border-4 border-white rounded-full">
              <img
                src={userIcon}
                alt="user icon"
                className="h-[105px] w-[105px] mb-2"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-white text-4xl font-bold mt-6">
                Welcome Back!
              </p>
              <p className="text-2xl mt-2 text-white"> {userData.username}</p>
            </div>
          </div>
          <div>
            <p className="text-white mt-28 text-xl font-bold mr-4">
              {time}
            </p>
          </div>
        </div>
        <ConsultationList consultationList={consultations} />
      </div>
    </DashBoard>
  );
}
