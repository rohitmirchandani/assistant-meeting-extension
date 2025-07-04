import { useEffect, useState } from "react";
import { UserDetails } from "../../api/interfaces";
import { getUserAndOrgs } from "../../api/user";
import { Radio, RadioGroup, FormControlLabel, FormControl, CircularProgress } from "@mui/material";
import { setInStorage, STORAGE, getFromStorage } from "../../../public/utility";
import "./Orgs.scss";

export function Orgs() {
    // @ts-ignore
    const [userDetails, setUserDetails] = useState<UserDetails>();
    const [error, setError] = useState<Error>();
    const [currentOrgId, setCurrentOrgId] = useState<number>();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userDetails = await getUserAndOrgs();
                const selectedOrgId = await getFromStorage(STORAGE.selectedOrgId);
                setUserDetails(userDetails);
                setCurrentOrgId(selectedOrgId || userDetails.currentCompany.id);
                await setInStorage(STORAGE.selectedOrgId, selectedOrgId || userDetails.currentCompany.id);
            } catch (error: any) {
                console.error(error);
                setError(error);
            }
        };
        fetchUserDetails();
    }, []);

    const handleOrgChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedOrgId = (event.target as HTMLInputElement).value;
        await setInStorage(STORAGE.selectedOrgId, selectedOrgId);
        //@ts-ignore
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (currentTab && currentTab.id) {
            //@ts-ignore
            chrome.tabs.sendMessage(currentTab.id, { type: "REFRESH_PAGE" });
        }
    };

    return (
      <div className="orgs-container">
        <h3 className="orgs-heading">
          🧩 <span>Select your organization</span>
        </h3>

        {error ? (
          <p className="error">Something went wrong: {error.message}</p>
        ) : userDetails ? (
          <div className="org-card">
            <FormControl>
              <RadioGroup
                aria-labelledby="org-radio-buttons-group-label"
                defaultValue={currentOrgId || userDetails.currentCompany.id}
                name="orgs-group"
                onChange={handleOrgChange}
              >
                {userDetails.c_companies.map((org) => (
                  <FormControlLabel
                    key={org.id}
                    value={org.id}
                    control={<Radio sx = {{'&.Mui-checked': { color: '#fff' }, color: '#fff'}} />}
                    label={<span className="radio-label">{org.name}</span>}
                    className="org-option"
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </div>
        ) : (
          <div className="loading-wrapper">
            <CircularProgress size={24} />
          </div>
        )}
      </div>
    );
}
