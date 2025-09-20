import { createContext, useContext, useState, useEffect } from "react";
import getEmailPreference from "../MyComponents/utils/api/getEmailPreference";
import config from "../config";

const EmailPreferenceContext = createContext();

export const EmailPreferenceProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    emailOnTimeChange: true,
    emailOnTrainerAssign: true,
    emailOnLectureCancel: true,
    emailOnLectureReschedule: true,
  });

  useEffect(() => {
    const fetchPref = async () => {
      try {
        const data = await getEmailPreference();
        setSettings((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Failed to fetch email preferences", err);
      }
    };
    fetchPref();
  }, []);

  const updatePreferences = async (newSettings, name) => {
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${config.hostUrl}/api/setting/update/email_preference`, {
        method: "PUT",
        body: JSON.stringify({ preferenceType: name }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (resp.status === 200) {
        setSettings((prev) => ({...prev, ...newSettings}));
      }
    } catch (Err) {
      console.log("Failed to update email preferences", Err);
    }
  }

  return (
    <EmailPreferenceContext.Provider value={{ settings, setSettings, updatePreferences }}>
      {children}
    </EmailPreferenceContext.Provider>
  );
};

export const useEmailPreference = () => useContext(EmailPreferenceContext);