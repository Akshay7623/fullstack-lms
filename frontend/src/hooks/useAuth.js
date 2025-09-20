import { useContext } from "react";
import AuthContext from "contexts/JWTContext";

// import AuthContext from 'contexts/FirebaseContext';
// import AuthContext from 'contexts/AWSCognitoContext';
// import AuthContext from 'contexts/Auth0Context';

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("context must be use inside provider");

  return context;
}
