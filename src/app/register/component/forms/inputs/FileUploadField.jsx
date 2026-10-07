"use client";
import { Alert, Box, Link, Snackbar, TextField } from "@mui/material";
import { useState } from "react";
import { useLanguage } from "@/app/register/providers/LanguageProvider";

const MAX_FILE_SIZE = 80 * 1024 * 1024; // 80 MB

/**
 * File input with inline preview link and size validation.
 *
 * @param {{
 *   id: string,
 *   label: string,
 *   setData: Function,   // (prev) => ({ ...prev, [id]: file })
 *   handleUpload?: Function,
 *   variant?: "outlined" | "filled",
 * }} props
 */
export function FileUploadField({
  id,
  label,
  setData,
  handleUpload,
  variant = "filled",
}) {
  const { translate } = useLanguage();
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setPreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(translate("form.fileTooLarge"));
      setPreview(null);
      setFileName("");
      return;
    }

    setError(null);
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));

    if (setData) setData((prev) => ({ ...prev, [id]: file }));
    if (handleUpload) handleUpload(file);
  };

  return (
    <>
      <Box display="flex" gap={2} alignItems="center">
        <TextField
          label={label}
          id={id}
          type="file"
          InputLabelProps={{ shrink: true }}
          variant={variant}
          helperText={translate("form.maxUploadSize")}
          fullWidth
          onChange={handleFileChange}
          sx={(theme) => ({
            backgroundColor:
              variant === "outlined"
                ? theme.palette.background.default
                : "inherit",
          })}
        />
        {preview && (
          <Link
            href={preview}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ whiteSpace: "nowrap" }}
          >
            {fileName || translate("form.showFile")}
          </Link>
        )}
      </Box>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={3000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" variant="filled" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
