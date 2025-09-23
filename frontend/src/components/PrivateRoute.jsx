import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import config from "../config";

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const [valid, setValid] = useState(null);

    useEffect(() => {
        if (!token) {
            setValid(false);
            return;
        }

        fetch(`${config.hostUrl}/api/auth/validate`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((resp) => resp.json())
            .then((data) => setValid(data.valid))
            .catch(() => setValid(false));
    }, [token]);

    if (valid === null) return null;
    if (!valid) return <Navigate to="/login" replace />;
    return children;
};

export default PrivateRoute;