import {Link, Navigate, useLocation} from "react-router-dom";
import PropTypes from "prop-types";
import {AccessDenied} from "./AccessDenied.jsx";
import {useAuthentication} from "../Utils/Provider.jsx";
import {useEffect, useState} from "react";
import {Loading} from "./Loading.jsx";

export function DashBoard ({children,linkList, requiredRole})
{
    DashBoard.propTypes = {
        children: PropTypes.node.isRequired,
        linkList: PropTypes.array.isRequired,
        requiredRole: PropTypes.string.isRequired
    }

    const location = useLocation();
    const activeLink = location.pathname;
    const {isAuthenticated, hasRole} = useAuthentication();
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const checkAuth = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            setIsLoading(false);
        };
        checkAuth();
    }, []);




      if (isLoading) {
        return <Loading/>
      }

      if (!isAuthenticated()) {
          return <Navigate to="/login" />;
      }

      if (!hasRole(requiredRole)) {
         return <AccessDenied Role={requiredRole}/>;
      }


    return (
        <div className="flex  h-screen">
            <div className="w-[15%] fixed h-screen bg-gradient-to-t from-primary-start to-primary-end  flex flex-col">
                <h1 className="text-3xl text-white font-bold ml-6 mb-10 mt-7">
                    Fultang Clinic
                </h1>
                <nav className="flex flex-col">
                    {linkList.map((item, index) => {
                        const IconComponent = item.icon;
                        const isActive = activeLink.startsWith(item.link);
                        //const isActive = activeLink === item.link;
                        return (
                            <Link
                                key={index}
                                className={`transition-all duration-400 flex p-4  ml-8 ${isActive ? "mt-1.5 bg-white rounded-l-full" : " mt-2 hover:bg-white/20 hover:p-3.5 hover:rounded-l-full"}`}
                                to={item.link}
                            >
                                <IconComponent
                                    className={isActive ? "text-black text-xl mr-3" : "text-xl mr-3 text-white"}/>
                                <p className={isActive ? "text-black  font-bold text-md " : "text-md font-bold text-white"}>{item.name}</p>
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="flex-1 min-h-screen overflow-x-hidden ml-[15.5%]">
                {children}
            </div>

        </div>
    )
}