import {CustomDashboard} from "../../GlobalComponents/CustomDashboard.jsx";
import {adminNavLink} from "./adminNavLink.js";
import {AdminNavBar} from "./AdminNavBar.jsx";

export function AddExam()
{
    return(
        <CustomDashboard linkList={adminNavLink} requiredRole={"Admin"}>
            <AdminNavBar/>
            Exam
        </CustomDashboard>
    )
}