// import { ConfigProvider } from 'contexts/ConfigContext';
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router";

const container = document.getElementById("root");
const root = createRoot(container);
import { IntlProvider } from "react-intl";
import enMessages from "utils/locales/en.json";
import { ConfigProvider } from "./contexts/ConfigContext";


root.render(
  <ConfigProvider>
    <BrowserRouter>
      <IntlProvider locale="en" messages={enMessages}>
        <App />
      </IntlProvider>
    </BrowserRouter>
  </ConfigProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
