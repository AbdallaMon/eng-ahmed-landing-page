"use client";

import { createContext, useContext, useState } from "react";
import {
  Backdrop,
  Box,
  CircularProgress,
  Fade,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { MdCloud } from "react-icons/md";
import { useLanguage } from "@/app/register/providers/LanguageProvider";

const StyledBackdrop = styled(Backdrop)(() => ({
  zIndex: 9999998,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(4px)",
}));

const ProgressContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  boxShadow: theme.shadows[10],
  minWidth: 400,
  maxWidth: 500,
  width: "90%",
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 12,
  borderRadius: 6,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 6,
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  },
}));

const AnimatedIcon = styled(MdCloud)(() => ({
  fontSize: 48,
  animation: "bounce 2s infinite",
  "@keyframes bounce": {
    "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
    "40%": { transform: "translateY(-8px)" },
    "60%": { transform: "translateY(-4px)" },
  },
}));

const UploadProgressContext = createContext(null);

export default function UploadProgressProvider({ children }) {
  const { translate } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [overlay, setOverlay] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadSpeed, setUploadSpeed] = useState("");

  const getProgressColor = () => {
    if (progress < 33) return "error";
    if (progress < 66) return "warning";
    return "success";
  };

  const getStatusMessage = () => {
    if (progress === 0) return translate("upload.initializing");
    if (progress < 100) return translate("upload.inProgress");
    return translate("upload.complete");
  };

  return (
    <UploadProgressContext.Provider
      value={{
        progress,
        setProgress,
        setOverlay,
        fileName,
        setFileName,
        uploadSpeed,
        setUploadSpeed,
      }}
    >
      <StyledBackdrop open={overlay} transitionDuration={300}>
        <Fade in={overlay} timeout={500}>
          <ProgressContainer elevation={10}>
            <Stack spacing={3} alignItems="center">
              <AnimatedIcon />

              {fileName && (
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: 500,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fileName}
                </Typography>
              )}

              <Typography variant="body1" color="text.secondary" align="center">
                {getStatusMessage()}
              </Typography>

              <Box sx={{ width: "100%" }}>
                <StyledLinearProgress
                  variant="determinate"
                  value={progress}
                  color={getProgressColor()}
                  sx={{ mb: 1 }}
                />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    {translate("upload.percentComplete").replace(
                      "{percent}",
                      Math.round(progress),
                    )}
                  </Typography>
                  {uploadSpeed && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      {uploadSpeed}
                    </Typography>
                  )}
                </Box>
              </Box>

              {progress === 100 && (
                <Box position="relative" display="inline-flex">
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={40}
                    thickness={4}
                    color="success"
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      component="div"
                      color="success.main"
                      fontWeight="bold"
                    >
                      ✓
                    </Typography>
                  </Box>
                </Box>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                sx={{ opacity: 0.8 }}
              >
                {translate("upload.keepOpen")}
              </Typography>
            </Stack>
          </ProgressContainer>
        </Fade>
      </StyledBackdrop>
      {children}
    </UploadProgressContext.Provider>
  );
}

export const useUploadContext = () => {
  const context = useContext(UploadProgressContext);
  if (!context) {
    throw new Error(
      "useUploadContext must be used within UploadProgressProvider",
    );
  }
  return context;
};
