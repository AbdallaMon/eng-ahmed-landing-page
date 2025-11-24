"use client";
import { Box, Button, Snackbar, Alert } from "@mui/material";
import { PhoneInput } from "./inputs/PhoneInput";
import { TextInput } from "./inputs/TextInput";
import { useState } from "react";
import { handleRequestSubmit } from "@/app/utility/handleSubmit";
import { useToastContext } from "@/app/providers/ToastLoadingProvider";
import { SuccessPage } from "../pages/booking/SuccessPage";
import { useSearchParams } from "next/navigation";
import { matchIsValidTel } from "mui-tel-input";
import LanguageCacheProvider from "@/app/providers/LanguageCacheProvider";

export function BookingForm({ bookingData }) {
  const initialFormValues = {};

  bookingData.inputs.forEach((input) => {
    initialFormValues[input.id] = "";
  });

  const [formValues, setFormValues] = useState(initialFormValues);
  const { loading, setLoading } = useToastContext();
  const [success, setSuccess] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const searchParams = useSearchParams();
  const lng = searchParams.get("lng") || "ar";

  const handleChange = (value, id) => {
    setFormValues({
      ...formValues,
      [id]: value,
    });
  };

  async function handleSubmit() {
    // 1) Check if all required fields are filled
    const hasEmptyRequired = bookingData.inputs.some((input) => {
      if (!input.isRequired) return false;
      const value = formValues[input.id];
      return value === "" || value == null;
    });

    if (hasEmptyRequired) {
      setSnackbarMessage(
        lng === "ar"
          ? "يرجى تعبئة جميع الحقول المطلوبة قبل المتابعة."
          : "Please fill in all required fields before continuing."
      );
      setSnackbarOpen(true);
      return;
    }

    // 2) Check phone validity if there is a tel input
    const phoneInput = bookingData.inputs.find((input) => input.type === "tel");
    if (phoneInput) {
      const phoneValue = formValues[phoneInput.id] || "";
      if (phoneValue !== "" && !matchIsValidTel(phoneValue)) {
        setSnackbarMessage(
          lng === "ar"
            ? "الرجاء إدخال رقم هاتف صالح."
            : "Please enter a valid phone number."
        );
        setSnackbarOpen(true);
        return;
      }
    }

    // 3) All good → submit
    const req = await handleRequestSubmit(
      formValues,
      setLoading,
      `client/new-lead/register?lng=${lng}`,
      lng === "ar" ? "جارى التسجيل..." : "Registering..."
    );
    if (req.status === 200) {
      setFormValues(initialFormValues);
      setSuccess(true);
    }
  }

  if (success) {
    return <SuccessPage lng={lng} />;
  }

  return (
    <LanguageCacheProvider rtl={lng === "ar"}>
      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          direction: lng === "ar" ? "ltr" : "ltr",
        }}
      >
        {bookingData.inputs.map((input) => (
          <>
            {input.type === "tel" ? (
              <PhoneInput
                key={input.id}
                input={input}
                lng={bookingData.lng}
                handleChange={handleChange}
                value={
                  Object.keys(formValues).length ? formValues[input.id] : null
                }
              />
            ) : (
              <TextInput
                key={input.id}
                input={input}
                lng={bookingData.lng}
                handleChange={handleChange}
                value={formValues[input.id]}
              />
            )}
          </>
        ))}

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            borderRadius: 1,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: { xs: "0.8rem", md: "1.1rem" },
            flexDirection: lng === "en" ? "row-reverse" : "row",
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {bookingData.buttonText}
          <Box component="img" src={"/arrow-left.png"} sx={{ width: "16px" }} />
        </Button>

        {/* Snackbar for validation errors */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{
            vertical: "top",
            horizontal: lng === "ar" ? "left" : "right",
          }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LanguageCacheProvider>
  );
}
