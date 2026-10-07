"use client";
import { useEffect, useRef } from "react";
import styles from "./DotsLoader.module.css";
import { Box } from "@mui/material";

export default function DotsLoader({ instantLoading }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (instantLoading) return;
    const timer = window.setTimeout(() => {
      containerRef.current?.remove();
    }, 100);
    return () => window.clearTimeout(timer);
  }, [instantLoading]);

  return (
    <div ref={containerRef} className={`dot_container ${styles.dot_container}`}>
      <Box sx={{ width: "100%", height: "20px", textAlign: "center" }}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </Box>
    </div>
  );
}
