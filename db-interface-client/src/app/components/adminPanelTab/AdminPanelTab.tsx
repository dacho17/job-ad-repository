import { AdminPanelTabType } from "../../../enums/adminPanelTabType";
import Constants from "../../assets/constants";
import { scrapeAndParseJobURL, scrapeJobURL, setActiveTab } from "../../services/slices/AdminRepositorySlice";
import { useAppDispatch, useAppSelector } from "../../services/store";
import ProcessUrlSection from "../processUrlSection/ProcessUrlSection";
import ScrapeJobAdsSection from "../scrapeJobAdsSection/ScrapeJobAdsSection";
import ScrapeJobsSection from "../scrapeJobsSection/ScrapeJobsSection";
import './AdminPanelTab.css';

interface AdminPanelTabProps {
    tabType: AdminPanelTabType;
}

export default function AdminPanelTab({ tabType }: AdminPanelTabProps) {
    const { activeTab } = useAppSelector(state => state.adminDashboard);
    const dispatch = useAppDispatch();

    function getTabsAndTabNames(): [JSX.Element[], string[]] {
        let buttonLabel;
        switch (tabType) {
            case AdminPanelTabType.SCRAPING:
                buttonLabel = 'Scrape';
                return [
                    [<ScrapeJobAdsSection />, <ProcessUrlSection onUrlSubmitFuntion={scrapeJobURL} buttonLabel={buttonLabel} />, <ScrapeJobsSection />],
                    ['Scrape Job Ads', 'Scrape Job from URL', 'Scrape Jobs']
                ];
            case AdminPanelTabType.PARSING:
                buttonLabel = 'Scrape and parse';
                return [
                    [<ProcessUrlSection onUrlSubmitFuntion={scrapeAndParseJobURL} buttonLabel={buttonLabel} />],
                    ['Scrape and Parse Job from URL']
                ];
        }
    }

    const [tabs, tabNames] = getTabsAndTabNames();

    return (<>
        <div className="admin-panel__tab-section-navigation-row">
            {tabNames.map((name, index) => {
                return <button
                    className="admin-panel__navigation-tab"
                    style={{backgroundColor:  activeTab === index
                        ? Constants.LIGHT_GREEN_BACKGROUND
                        : Constants.LIGHT_BLUE_BACKGROUND
                    }}
                    key={index}
                    type="button"
                    onClick={() => activeTab !== index ? dispatch(setActiveTab({
                        activeTab: index
                    })) : null}
                >{name}</button>
            })}
        </div>
        {tabs[activeTab]}
    </>
    );
}
