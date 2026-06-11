"use client";

import { createContext, useContext, useState } from "react";
import { ToastContainer } from "react-toastify";

const ToastContext = createContext(null);

export default function LoadingToastProvider({ children }) {
  const [loading, setLoading] = useState(false);

  return (
    <ToastContext.Provider value={{ loading, setLoading }}>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            zIndex: 9999997,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />
      )}
      <ToastContainer
        position="top-center"
        style={{ width: "80%", maxWidth: "600px", zIndex: 9999999 }}
        closeOnClick
        pauseOnHover={false}
        autoClose={3000}
      />
      {children}
    </ToastContext.Provider>
  );
}

export const useToastContext = () => useContext(ToastContext);
