"use client";
import { Box, Button } from "@mui/material";
import { PhoneInput } from "./inputs/PhoneInput";
import { TextInput } from "./inputs/TextInput";
import { useState } from "react";
import { handleRequestSubmit } from "@/app/utility/handleSubmit";
import { useToastContext } from "@/app/providers/ToastLoadingProvider";
import { SuccessPage } from "../pages/booking/SuccessPage";
import { useSearchParams } from "next/navigation";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import rtlPlugin from "stylis-plugin-rtl";
const defaultCache = createCache({
  key: "mui",
});
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [rtlPlugin],
});

export function BookingForm({ bookingData }) {
  const initialFormValues = {};
  bookingData.inputs.forEach((input) => {
    initialFormValues[input.id] = "";
  });
  const [formValues, setFormValues] = useState(initialFormValues);
  const { loading, setLoading } = useToastContext();
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const lng = searchParams.get("lng") || "ar";
  const handleChange = (value, id) => {
    setFormValues({
      ...formValues,
      [id]: value,
    });
  };
  async function handleSubmit() {
    const checkIfAllRequiredFilled = bookingData.inputs.every((input) => {
      if (input.isRequired) {
        return formValues[input.id] !== "";
      }
    });
    if (checkIfAllRequiredFilled) {
      const req = await handleRequestSubmit(
        formValues,
        setLoading,
        `client/register?lng=${lng}`,
        lng === "ar" ? "جارى التسجيل..." : "Registering..."
      );
      if (req.status === 200) {
        setFormValues(initialFormValues);
        setSuccess(true);
      }
    }
  }
  if (success) {
    return <SuccessPage lng={lng} />;
  }
  return (
    <CacheProvider value={lng === "ar" ? cacheRtl : defaultCache}>
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
                value={formValues[input.id]}
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
      </Box>
    </CacheProvider>
  );
}
