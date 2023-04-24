import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "../../../enums/userRole";
import Button from "../../components/ctaButton/CtaButton";
import { refreshUserLogin, signOut } from "../../services/slices/AuthSlice";
import { useAppDispatch, useAppSelector } from "../../services/store";
import './Header.css';

const headerTitle = "Job Ad DB Interface";

export default function Header() {
    let navigate = useNavigate();
    const { user, isLoading } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    function handleLogout() {
        if (user) {
            dispatch(signOut(user));            
        }
        navigate('/');
    }

    useEffect(() => {
        if (!user) {
            dispatch(refreshUserLogin());
        }
    }, [user]);

    return (
        <div id="header">
            <div className="header__links">
                <div className="header__link-container" onClick={() => navigate('/')}>
                    <span className="header__link">{headerTitle}</span>
                </div>
                { user && user.role === UserRole.ADMIN &&
                <div className="header__link-container" onClick={() => navigate('/admin-panel')}>
                    <span className="header__link">Admin panel</span>
                </div>
                }
            </div>
            <div style={{ minWidth: '120px' }}>
                {!user && !isLoading 
                    && <Button
                        label="Sign in"
                        actionFn={() => navigate('/signup')}
                        isDisabled={false}
                    ></Button>
                }
                {user && !isLoading && 
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        alignContent: "center",
                    }}>
                        <span id="header__logged-in-user">
                            {`Logged in as ${user.username}`}
                        </span>
                        <Button
                            label="Log out"
                            actionFn={() => handleLogout()}
                            isDisabled={false}
                        ></Button>
                    </div>
                }
            </div>
        </div>
    );
}
