import {cashierNavLink} from './cashierNavLink.js'
import {CashierNavBar} from './CashierNavBar.jsx'
import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";
import Exams from './Exams.jsx'


export function ExamsList()
{


    return(
        <DashBoard linkList={cashierNavLink} requiredRole={"Cashier"}>
            <CashierNavBar/>
            <div className="flex flex-col">
            </div>
            <Exams/>
        </DashBoard>
    )
}