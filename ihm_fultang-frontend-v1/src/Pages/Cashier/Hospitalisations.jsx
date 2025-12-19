import {cashierNavLink} from './cashierNavLink.js'
import {CashierNavBar} from './CashierNavBar.jsx'
import {DashBoard} from "../../GlobalComponents/DashBoard.jsx";
import HospitalisationList from './HospitalisationsList.jsx'


export function Hospitalisations()
{


    return(
        <DashBoard linkList={cashierNavLink} requiredRole={"Cashier"}>
            <CashierNavBar/>
            <div className="flex flex-col">
            </div>
            <HospitalisationList/>
        </DashBoard>
    )
}