import { FaFlag, FaBell, FaEnvelope, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import {useAuthentication} from "../../Utils/Provider.jsx";
import {Tooltip} from "antd";
import PropTypes from "prop-types";
import userIcon from "../../assets/userIcon.png";


export function NurseNavBar({children})
{


    NurseNavBar.propTypes = {
        children: PropTypes.node.isRequired,
    };



    const {logout} = useAuthentication();
    const applyNavLinkBtnStyle = () => {
        return " w-12 h-10 border-2 bg-gray-100 flex justify-center items-center rounded-xl shadow-xl hover:bg-secondary text-secondary text-xl hover:text-white transition-all duration-300";
    }


    const {userData} = useAuthentication();




    return (
        <div>
            <div className="border-b-2 m-3   border-b-gray-300">
                <div className="h-[70px] w-full  flex justify-between ">
                    <div className="text-5xl font-bold mt-3 ml-5">
                        <span>Nurse</span>
                    </div>
                    <div className="flex gap-2 mt-5 mb-4 mr-5">
                        {/*
                        <button className={applyNavLinkBtnStyle()}>
                            <FaFlag/>
                        </button>
                        <button className={applyNavLinkBtnStyle()}>
                            <FaCog/>
                        </button>
                        <Tooltip placement={"top"} title={"Notification"}>
                            <button className={applyNavLinkBtnStyle()}>
                                <FaBell/>
                            </button>
                        </Tooltip>
                        <button className={applyNavLinkBtnStyle()}>
                            <FaEnvelope/>
                        </button>
                        <Tooltip placement={"top"} title={"Profile"}>
                            <button className={applyNavLinkBtnStyle()}>
                                <FaUser/>
                            </button>
                        </Tooltip>*/}
                        <Tooltip placement={"top"} title={"LogOut"}>
                            <button
                                onClick={() => {
                                    logout()
                                }}
                                className={" w-12 h-10 border-2 bg-red-500 flex justify-center items-center rounded-xl shadow-xl hover:bg-white text-white text-xl hover:text-red-500 transition-all duration-300"}>
                                <FaSignOutAlt/>
                            </button>
                        </Tooltip>

                        <Tooltip placement={"top"} title={"Profile"}>
                            <div className="ml-3 flex">
                                <p className="font-bold text-secondary text-xl mt-2">{"Hello " +userData?.username + "!"}</p>
                                <img src={userIcon} alt={"user-icon"} className="w-12 h-12 ml-2 mr-3"/>

                            </div>
                        </Tooltip>
                    </div>
                </div>

            </div>
            <div className="flex-1  min-h-screen mt-5">
                {children}
            </div>
        </div>
    )
}