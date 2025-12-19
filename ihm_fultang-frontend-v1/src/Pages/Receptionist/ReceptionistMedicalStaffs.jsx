import {MedicalStaffList} from "../../GlobalComponents/MedicalStaffList.jsx";
import {receptionistNavLink} from "./receptionistNavLink.js";
import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";
import {ReceptionistNavBar} from "./ReceptionistNavBar.jsx";



export function ReceptionistMedicalStaffs()
{
    return (
       <>
           <DashBoard requiredRole={"receptioniste"} linkList={receptionistNavLink}>
               <ReceptionistNavBar/>
               <div className="mt-5">
                   <MedicalStaffList/>
               </div>
           </DashBoard>
       </>
    )
}