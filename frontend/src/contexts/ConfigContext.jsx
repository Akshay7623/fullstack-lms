import PropTypes from "prop-types";
import { createContext, useMemo } from "react";

// project-imports
import config from "config";
import useLocalStorage from "hooks/useLocalStorage";

// initial state
const initialState = {
  ...config,
  onChangeContainer: () => {},
  onChangeLocalization: () => {},
  onChangeMode: () => {},
  onChangePresetColor: () => {},
  onChangeDirection: () => {},
  onChangeMiniDrawer: () => {},
  onChangeThemeLayout: () => {},
  onChangeMenuOrientation: () => {},
  onChangeMenuCaption: () => {},
  onChangeFontFamily: () => {},
  onChangeContrast: () => {},
};

// ==============================|| CONFIG CONTEXT & PROVIDER ||============================== //

const ConfigContext = createContext(initialState);

function ConfigProvider({ children }) {
  const [config, setConfig] = useLocalStorage(
    "able-pro-material-react-ts-config",
    initialState
  );

  // All your handler functions
  const onChangeContainer = (container) => {
    let containerValue = container !== "fluid";
    setConfig({
      ...config,
      container: containerValue,
    });
  };

  const onChangeLocalization = (lang) => {
    setConfig({
      ...config,
      i18n: lang,
    });
  };

  const onChangeMode = (mode) => {
    console.log("setting to ", mode);
    setConfig({
      ...config,
      mode,
    });
  };

  const onChangePresetColor = (theme) => {
    setConfig({
      ...config,
      presetColor: theme,
    });
  };

  const onChangeDirection = (direction) => {
    setConfig({
      ...config,
      themeDirection: direction,
    });
  };

  const onChangeMiniDrawer = (miniDrawer) => {
    setConfig({
      ...config,
      miniDrawer,
    });
  };

  const onChangeThemeLayout = (direction, miniDrawer) => {
    setConfig({
      ...config,
      miniDrawer,
      themeDirection: direction,
    });
  };

  const onChangeContrast = (themeContrast) => {
    let contrastValue = themeContrast === "contrast";
    setConfig({
      ...config,
      themeContrast: contrastValue,
    });
  };

  const onChangeMenuCaption = (menuCaption) => {
    let captionValue = menuCaption === "caption";
    setConfig({
      ...config,
      menuCaption: captionValue,
    });
  };

  const onChangeMenuOrientation = (layout) => {
    setConfig({
      ...config,
      menuOrientation: layout,
    });
  };

  const onChangeFontFamily = (fontFamily) => {
    setConfig({
      ...config,
      fontFamily,
    });
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      ...config,
      onChangeContainer,
      onChangeLocalization,
      onChangeMode,
      onChangePresetColor,
      onChangeDirection,
      onChangeMiniDrawer,
      onChangeThemeLayout,
      onChangeMenuOrientation,
      onChangeMenuCaption,
      onChangeFontFamily,
      onChangeContrast,
    }),
    [
      config,
      onChangeContainer,
      onChangeLocalization,
      onChangeMode,
      onChangePresetColor,
      onChangeDirection,
      onChangeMiniDrawer,
      onChangeThemeLayout,
      onChangeMenuOrientation,
      onChangeMenuCaption,
      onChangeFontFamily,
      onChangeContrast,
    ]
  );

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
}

export { ConfigProvider, ConfigContext };

ConfigProvider.propTypes = { children: PropTypes.node };