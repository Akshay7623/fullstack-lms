// ==============================|| THEME CONSTANT ||============================== //

export const facebookColor = "#3b5998";
export const linkedInColor = "#0e76a8";

export const APP_DEFAULT_PATH = "/dashboard/default";
export const HORIZONTAL_MAX_ITEM = 8;
export const DRAWER_WIDTH = 280;
export const MINI_DRAWER_WIDTH = 90;
export const HEADER_HEIGHT = 74;
export const GRID_COMMON_SPACING = { xs: 2, md: 2.5 };

export let SimpleLayoutType;

(function (SimpleLayoutType) {
  SimpleLayoutType["SIMPLE"] = "simple";
  SimpleLayoutType["LANDING"] = "landing";
})(SimpleLayoutType || (SimpleLayoutType = {}));

export let ThemeMode;

(function (ThemeMode) {
  ThemeMode["LIGHT"] = "light";
  ThemeMode["DARK"] = "dark";
  ThemeMode["AUTO"] = "auto";
})(ThemeMode || (ThemeMode = {}));

export let MenuOrientation;

(function (MenuOrientation) {
  MenuOrientation["VERTICAL"] = "vertical";
  MenuOrientation["HORIZONTAL"] = "horizontal";
})(MenuOrientation || (MenuOrientation = {}));

export let ThemeDirection;

(function (ThemeDirection) {
  ThemeDirection["LTR"] = "ltr";
  ThemeDirection["RTL"] = "rtl";
})(ThemeDirection || (ThemeDirection = {}));

export let NavActionType;

(function (NavActionType) {
  NavActionType["FUNCTION"] = "function";
  NavActionType["LINK"] = "link";
})(NavActionType || (NavActionType = {}));

export let Gender;

(function (Gender) {
  Gender["MALE"] = "Male";
  Gender["FEMALE"] = "Female";
})(Gender || (Gender = {}));

export let DropzopType;

(function (DropzopType) {
  DropzopType["DEFAULT"] = "default";
  DropzopType["STANDARD"] = "standard";
})(DropzopType || (DropzopType = {}));

// ==============================|| THEME CONFIG ||============================== //
// console.log("locastorage is", localStorage.getItem("able-pro-material-react-ts-config"));

const localConfig = localStorage.getItem("able-pro-material-react-ts-config");
const parsedConfig = JSON.parse(localConfig) || {};

const config = {
  fontFamily: parsedConfig.fontFamily || `Inter var`,
  i18n: parsedConfig.i18n || "en",
  menuOrientation: parsedConfig.menuOrientation || MenuOrientation.VERTICAL,
  menuCaption: parsedConfig.menuCaption || true,
  miniDrawer: parsedConfig.miniDrawer || false,
  container: parsedConfig.container || true,
  mode: parsedConfig.mode || ThemeMode.LIGHT,
  presetColor: parsedConfig.presetColor || "theme3",
  themeDirection: parsedConfig.themeDirection || ThemeDirection.LTR,
  themeContrast: parsedConfig.themeContrast || false,
  hostUrl: "http://localhost:3001",
};

export const bgColor = config.mode === "dark" ? "#1D2630" : "white";
export const textColor = config.mode === "dark" ? "white" : "#1D2630";

export const modalStyles = {
  header: {
    borderRadius: 0,
    paddingInlineStart: 5,
    backgroundColor: bgColor,
  },
  body: {
    borderRadius: 5,
    overflowY: "auto",
    maxHeight: "85vh",
  },
  footer: {
    borderTop: "1px solid #333",
    backgroundColor: bgColor,
  },
  content: {
    backgroundColor: bgColor,
  },
};


export default config;