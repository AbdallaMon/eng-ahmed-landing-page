"use client";

import { createContext, useContext, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const AlertContext = createContext(null);

export default function AlertProvider({ children }) {
  const [error, setAlertError] = useState(null);
  const [severity, setSeverity] = useState("error");
  const open = Boolean(error && error.length > 0);

  function handleClose() {
    setAlertError(null);
  }

  return (
    <AlertContext.Provider value={{ setAlertError, setSeverity }}>
      <Snackbar open={open} onClose={handleClose} autoHideDuration={3000}>
        <Alert severity={severity} variant="filled" onClose={handleClose}>
          {error}
        </Alert>
      </Snackbar>
      {children}
    </AlertContext.Provider>
  );
}

export const useAlertContext = () => useContext(AlertContext);
