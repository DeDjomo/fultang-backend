import {laboratoryNavLink} from "./LaboratoryNavLink.js";
import {LaboratoryNavBar} from "./LaboratoryNavBar.jsx";
import {LaboratoryDashBoard} from "./LaboratoryDashBoard.jsx";
import NotificationsList from "../../GlobalComponents/Notification.jsx";


export function Notification (){

    return(
        <LaboratoryDashBoard linkList={laboratoryNavLink} requiredRole={"Labtech"}>
            <LaboratoryNavBar />
            <NotificationsList />
        </LaboratoryDashBoard>
    );
}