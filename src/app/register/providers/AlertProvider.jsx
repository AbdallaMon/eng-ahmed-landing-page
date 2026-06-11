"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const AlertContext = createContext(null);

export default function AlertProvider({ children }) {
  const [error, setAlertError] = useState(null);
  const [severity, setSeverity] = useState("error");
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false);
    setAlertError(null);
  }

  useEffect(() => {
    setOpen(Boolean(error && error.length > 0));
  }, [error]);

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
