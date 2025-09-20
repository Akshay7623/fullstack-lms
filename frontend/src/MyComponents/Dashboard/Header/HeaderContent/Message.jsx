import { useState, useContext } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// project-imports
import MessageCard from "components/cards/statistics/MessageCard";
import IconButton from "components/@extended/IconButton";
import MainCard from "components/MainCard";
import SimpleBar from "components/third-party/SimpleBar";
import { ThemeMode } from "config";
import { Moon, Sun } from "lucide-react";
import { ConfigContext } from "contexts/ConfigContext";
import { RadioGroup, FormControlLabel, Radio } from "@mui/material";

// assets
import { Add, NotificationStatus } from "iconsax-react";

import message1Light from "assets/images/widget/message/message1Light.svg";
import message1Dark from "assets/images/widget/message/message1Dark.svg";
import message2Light from "assets/images/widget/message/message2Light.svg";
import message2Dark from "assets/images/widget/message/message2Dark.svg";
import message3Light from "assets/images/widget/message/message3Light.svg";
import message3Dark from "assets/images/widget/message/message3Dark.svg";
import message4Light from "assets/images/widget/message/message4Light.svg";
import message4Dark from "assets/images/widget/message/message4Dark.svg";

// ==============================|| HEADER CONTENT - CUSTOMIZATION ||============================== //

const themeOptions = [
  { name: "theme1", color: "#f5f5f5" },
  { name: "theme2", color: "#1e1e1e" },
  { name: "theme3", color: "#2196f3" },
  { name: "theme4", color: "#4caf50" },
  { name: "theme5", color: "#f44336" },
  { name: "theme6", color: "#9c27b0" },
  { name: "theme7", color: "#ff9800" },
];

export default function Customization() {
  const theme = useTheme();
  const configContext = useContext(ConfigContext);
  const [count, setCount] = useState(0);
  const message1 =
    theme.palette.mode === ThemeMode.DARK ? message1Dark : message1Light;
  const message2 =
    theme.palette.mode === ThemeMode.DARK ? message2Dark : message2Light;
  const message3 =
    theme.palette.mode === ThemeMode.DARK ? message3Dark : message3Light;
  const message4 =
    theme.palette.mode === ThemeMode.DARK ? message4Dark : message4Light;

  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };


  const toggleTheme = () => {
    const localTheme = localStorage.getItem("able-pro-material-react-ts-config")

    if (localTheme) {
      const themeObj = JSON.parse(localTheme);
      console.log(themeObj);
      if (theme.palette.mode === "dark") {
        configContext.onChangeMode("light");
        // localStorage.setItem("able-pro-material-react-ts-config", JSON.stringify({ ...themeObj, mode: "light" }));
      } else {
        // localStorage.setItem("able-pro-material-react-ts-config", JSON.stringify({ ...themeObj, mode: "dark" }));
        configContext.onChangeMode("dark");
      }
      // window.location.reload();
    }
  };


  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 0.75 }}>
        <IconButton
          color="secondary"
          variant="light"
          onClick={handleToggle}
          aria-label="settings toggler"
          size="large"
          sx={(theme) => ({
            p: 1,
            color: "secondary.main",
            bgcolor: open ? "secondary.200" : "secondary.100",
            ...theme.applyStyles("dark", {
              bgcolor: open ? "background.paper" : "background.default",
            }),
          })}
        >
          <NotificationStatus variant="Bulk" />
        </IconButton>
      </Box>
      <Drawer
        sx={{ zIndex: 2001 }}
        anchor="right"
        onClose={handleToggle}
        open={open}
        PaperProps={{ sx: { width: { xs: 350, sm: 474 } } }}
      >
        {open && (
          <MainCard
            content={false}
            sx={{ border: "none", borderRadius: 0, height: "100vh" }}
          >
            <SimpleBar
              sx={{
                "& .simplebar-content": {
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              <Box sx={{ p: 2.5 }}>
                <IconButton color="inherit" onClick={toggleTheme}>
                  {theme.palette.mode === "dark" ? (
                    <Sun size={20} />
                  ) : (
                    <Moon size={20} />
                  )}
                </IconButton>
                <Stack
                  direction="row"
                  sx={{
                    gap: 1.5,
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h5">What’s new announcement?</Typography>
                  <IconButton
                    color="error"
                    sx={{ p: 0 }}
                    onClick={handleToggle}
                  >
                    <Add size={28} style={{ transform: "rotate(45deg)" }} />
                  </IconButton>
                </Stack>
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Choose Theme
                  </Typography>
                  <RadioGroup
                    row
                    value={configContext.presetColor || themeOptions[0].name}
                    onChange={(e) => configContext.onChangePresetColor(e.target.value)}
                    sx={{ gap: 2 }}
                  >
                    {themeOptions.map((theme) => (
                      <FormControlLabel
                        key={theme.name}
                        value={theme.name}
                        control={
                          <Radio
                            sx={{
                              color: theme.color,
                              "&.Mui-checked": { color: theme.color },
                            }}
                          />
                        }
                        label={theme.name}
                      />
                    ))}
                  </RadioGroup>

                </Box>
              </Box>
            </SimpleBar>
          </MainCard>
        )}
      </Drawer>
    </>
  );
}
