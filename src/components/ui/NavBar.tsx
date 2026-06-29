import {House,Menu,UserRound,LogOut} from "lucide-react"
import { useNavigate } from "react-router-dom";
import AppRoutes from "../../constants/AppRoutes";
import { logout } from "../../services/authService";
const NavBar = () => {
    const navigate = useNavigate();

    const handleNavHouse = ()=>(navigate(AppRoutes.DASHBOARD));
    const handleNavMenu = ()=>(navigate(AppRoutes.MENU));
    const handleNavUser = ()=>(navigate(AppRoutes.MENU));
    const handleNavLogOut = ()=>{
        logout();
        navigate(AppRoutes.LOGIN);
    };

    return(
        <div className="h-screen w-15 bg-primary text-white flex flex-col justify-between py-5">
            <div className="flex flex-col items-center gap-4">
                <div className="hover:bg-hover flex justify-center w-full py-2 active:bg-active">
                    <House onClick={handleNavHouse}/>
                </div>
                <div className="hover:bg-hover flex justify-center w-full py-2 active:bg-active">
                    <Menu onClick={handleNavMenu}/>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                <div className="hover:bg-hover flex justify-center w-full py-2 active:bg-active">
                    <UserRound onClick={handleNavUser}/>
                </div>
                <div className="hover:bg-hover flex justify-center w-full py-2 active:bg-active">
                    <LogOut onClick={handleNavLogOut}/>
                </div>
            </div>
        </div>
    );
}

export default NavBar;