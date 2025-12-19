import { FaCog, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import { Tooltip } from "antd";
import { useAuthentication } from "../../Utils/Provider.jsx";
import userIcon from "../../assets/userIcon.png";
import { LanguageSwitcher } from "../../GlobalComponents/LanguageSwitcher.jsx";

export function AdminNavBar() {

    const { logout, userData } = useAuthentication();

    const applyNavLinkBtnStyle = () => {
        return " w-12 h-10 mt-1 border-2 bg-gray-100 flex justify-center items-center rounded-xl shadow-xl hover:bg-secondary text-secondary text-xl hover:text-white transition-all duration-300";
    }


    return (
        <>
            <div className="border-b-2 m-3  border-b-gray-300">
                <div className="w-full h-[70px] flex justify-between">
                    <h1 className="ml-3 text-4xl text-secondary mt-3.5 font-bold">
                        Administrator
                    </h1>
                    <div className="flex gap-3 mt-3.5 mb-4 mr-5">
                        {/* <Tooltip placement={"top"} title={"settings"}>
                            <button className={applyNavLinkBtnStyle()}>
                                <FaCog/>
                            </button>

                        </Tooltip>

                        <Tooltip placement={"top"} title={"Messages"}>
                            <button className={applyNavLinkBtnStyle()}>
                                <FaEnvelope/>
                            </button>
                        </Tooltip> */}
                        <LanguageSwitcher />
                        <Tooltip placement={"top"} title={"LogOut"}>
                            <button
                                onClick={() => { logout() }}
                                className={" w-12 h-10 mt-1 border-2 bg-red-400 flex justify-center items-center rounded-xl shadow-xl hover:bg-white text-white text-xl hover:text-red-500 transition-all duration-300"}>
                                <FaSignOutAlt />
                            </button>
                        </Tooltip>
                        <Tooltip placement={"top"} title={"Profile"}>
                            <div className="ml-3 flex">
                                <p className="font-bold text-secondary text-xl mt-2">{"Hello " + userData?.username + "!"}</p>
                                <img src={userIcon} alt={"user-icon"} className="w-12 h-12 ml-2 mr-3" />

                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </>
    )
}