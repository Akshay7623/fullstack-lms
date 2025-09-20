import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useEmailPreference } from "../../../../../contexts/EmailPreferenceContext";

import { CloseSquare, NoteAdd, Profile, Timer1 } from 'iconsax-react';
import { FormControlLabel, Switch } from '@mui/material';

export default function SettingTab() {
  const { pathname } = useLocation();

  const { settings, updatePreferences } = useEmailPreference();

  const [selectedIndex, setSelectedIndex] = useState();

  useEffect(() => {
    const pathToIndex = {
      '/apps/profiles/account/settings': 1
    };

    setSelectedIndex(pathToIndex[pathname] ?? undefined);
  }, [pathname]);

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>

      <ListItemButton selected={selectedIndex === 0} onClick={(e) => {
        updatePreferences({ emailOnTimeChange: !settings.emailOnTimeChange }, "emailOnTimeChange")
      }}>

        <ListItemIcon>
          <Timer1 variant="Bulk" size={18} />
        </ListItemIcon>

        <ListItemText primary="Mail on time change" />

        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={settings.emailOnTimeChange}
            />
          }
        />
      </ListItemButton>

      <ListItemButton selected={selectedIndex === 1} onClick={(e) => {
        updatePreferences({ emailOnTrainerAssign: !settings.emailOnTrainerAssign }, "emailOnTrainerAssign")
      }}>
        <ListItemIcon>
          <Profile variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Mail on trainer assignment" />
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={settings.emailOnTrainerAssign}
            />
          }
        />
      </ListItemButton>

      <ListItemButton selected={selectedIndex === 2} onClick={(e) => {
        updatePreferences({ emailOnLectureCancel: !settings.emailOnLectureCancel }, "emailOnLectureCancel")
      }}>
        <ListItemIcon>
          <CloseSquare variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Mail on lecture cancellation" />
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={settings.emailOnLectureCancel}
            />
          }
        />
      </ListItemButton>

      <ListItemButton selected={selectedIndex === 3} onClick={(e) => {
        updatePreferences({ emailOnLectureReschedule: !settings.emailOnLectureReschedule }, "emailOnLectureReschedule")
      }}>
        <ListItemIcon>
          <NoteAdd variant="Bulk" size={18} />
        </ListItemIcon>
        <ListItemText primary="Mail on lecture rescheduling" />
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={settings.emailOnLectureReschedule}
            />
          }
        />
      </ListItemButton>
    </List>
  );
}
