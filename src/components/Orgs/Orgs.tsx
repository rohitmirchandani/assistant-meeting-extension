import { useEffect, useState } from "react";
import { UserDetails } from "../../api/interfaces";
import { getUserAndOrgs } from "../../api/user";
import { Radio, RadioGroup, FormControlLabel, FormControl, CircularProgress, Button } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { setInStorage, STORAGE, getFromStorage, removeFromStorage } from "../../../public/utility";
import "./Orgs.scss";

export function Orgs() {
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [currentOrgId, setCurrentOrgId] = useState<number | null>(null);
    const [hasRememberAgent, setHasRememberAgent] = useState(false);

    useEffect(() => {
      const fetchRememberAgent = async () => {
        if (currentOrgId) {
          const rememberAgent = await getFromStorage(STORAGE.rememberAgentSelection + currentOrgId);
          setHasRememberAgent(!!rememberAgent);
        }
      }
      fetchRememberAgent();
    }, [currentOrgId]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
              const userDetails = await getUserAndOrgs();
              const selectedOrgId = await getFromStorage(STORAGE.selectedOrgId);
              const currentOrgId = selectedOrgId ? Number(selectedOrgId) : userDetails.currentCompany.id;
              setUserDetails(userDetails);
              setCurrentOrgId(currentOrgId);
              await setInStorage(STORAGE.selectedOrgId, currentOrgId);
            } catch (error) {
                const err = error as Error;
                console.error(error);
                setError(err);
            }
        };
        fetchUserDetails();
    }, []);

    const handleOrgChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedOrgId = (event.target as HTMLInputElement).value;
        setCurrentOrgId(Number(selectedOrgId));
        await setInStorage(STORAGE.selectedOrgId, selectedOrgId);
        // @ts-expect-error Chrome API types not available
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (currentTab && currentTab.id) {
            // @ts-expect-error Chrome API types not available
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
            {hasRememberAgent && (
              <Button
                onClick={async () => {
                  await removeFromStorage(STORAGE.rememberAgentSelection + currentOrgId);
                  setHasRememberAgent(false);
                }}
                variant="outlined"
                startIcon={<RestartAltIcon />}
                sx={{
                  mt: 2,
                  width: '100%',
                  borderRadius: "8px",
                  textTransform: "none",
                  padding: "8px 16px",
                  fontSize: "0.875rem",
                  color: 'rgba(255,255,255,0.85)',
                  borderColor: 'rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderColor: 'rgba(255,255,255,0.35)'
                  }
                }}
              >
                Forget default agent
              </Button>
            )}
          </div>
        ) : (
          <div className="loading-wrapper">
            <CircularProgress size={24} />
          </div>
        )}
      </div>
    );
}
