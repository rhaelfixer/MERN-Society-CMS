import React, {createContext, useContext, useState} from "react";


const ServerStatusContext = createContext();


export function useServerStatus() {
  return useContext(ServerStatusContext);
}


export function ServerStatusProvider({children}) {
  const [serverStatus, setServerStatus] = useState("Checking Server Status...");
  return (
    <ServerStatusContext.Provider value={{serverStatus, setServerStatus}}>
      {children}
    </ServerStatusContext.Provider>
  );
}
