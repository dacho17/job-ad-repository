import { useState } from "react";
import AdminPanelTab from "../../components/adminPanelTab/AdminPanelTab";
import './AdminPanel.css';
import { AdminPanelTabType } from "../../../enums/adminPanelTabType";
import { useAppSelector } from "../../services/store";
import { UserRole } from "../../../enums/userRole";
import Button from "../../components/ctaButton/CtaButton";
import { useNavigate } from "react-router-dom";
import Constants from "../../assets/constants";


export default function AdminPanelPage() {
    const [tabOpenned, setTabOpenned] = useState(1);
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);


    if (user?.role !== UserRole.ADMIN) {
        return <div id="admin-panel" className="page-container">
            <div id="admin-panel__container">
                This page cannot be displayed
                <Button
                    label="Back"
                    isDisabled={false}
                    actionFn={() => navigate('/jobs')}/>
            </div>
        </div>
    }    

    const panelTabData = [
        { name: "Scraping" },
        { name: "Parsing" },
    ];
    function getAdminPanelTabs() {
        return panelTabData.map((item, index) => {
            return <button
                style={{backgroundColor:  tabOpenned === index ? Constants.LIGHT_GREEN_BACKGROUND : Constants.LIGHT_BLUE_BACKGROUND}}
                className="admin-panel__navigation-tab"
                key={index}
                type="button"
                onClick={() => setTabOpenned(index)}
            >{item.name}</button>
        })
    }

    function getActiveTab() {
        let buttonLabel;
        switch(tabOpenned) {
            case AdminPanelTabType.SCRAPING:
                buttonLabel = 'Scrape';
                return <AdminPanelTab
                    tabType={AdminPanelTabType.SCRAPING}
                />
            case AdminPanelTabType.PARSING:
                {/* TODO: Add parse jobs tab  */}
                buttonLabel = 'Scrape and parse';
                return <AdminPanelTab 
                    tabType={AdminPanelTabType.PARSING}
                />
            default:
                return <div>
                    An unknown situation has occurred.
                </div>
        }
    }

    return (
        <div id="admin-panel" className="page-container">
            <div id="admin-panel__container">
                <div id="admin-panel__tab-row">
                    {getAdminPanelTabs()}
                </div>
                <div id="admin-panel__content">
                    {getActiveTab()}
                </div>
            </div>
        </div>
    );
}
