import {NurseNavBar} from "./NurseNavBar.jsx";
import {MedicalStaffList} from "../../GlobalComponents/MedicalStaffList.jsx";
import {nurseNavLink} from "./nurseNavLink.js";
import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";


export function MedicalStaffs()
{
    return (
       <>
           <DashBoard linkList={nurseNavLink} requiredRole={"Nurse"} >
               <NurseNavBar>
                   <MedicalStaffList/>
               </NurseNavBar>
           </DashBoard>
       </>
    )
}