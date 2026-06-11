"use client";

import { useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useGeoCountry } from "@/app/register/hooks/useGeoCountry";
import colors from "@/app/register/theme/colors";

/**
 * Renders the form for a FORM step (step 1: name/phone, step 9: email + agreements).
 * Validation is client-side via react-hook-form; server-side field errors are
 * surfaced alongside.
 */
export function StepForm({
  step,
  onNext,
  isSubmitting,
  formData,
  serverFieldErrors = {},
}) {
  const { translate } = useLanguage();
  const { defaultCountry } = useGeoCountry("INSIDE_UAE");

  const getStepDefaultValues = () => {
    const defaults = {};
    for (const field of step.fields || []) {
      defaults[field.id] =
        field.inputType === "checkbox"
          ? Boolean(formData?.[field.id])
          : formData?.[field.id] || "";
    }
    return defaults;
  };

  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: getStepDefaultValues(),
  });

  useEffect(() => {
    reset(getStepDefaultValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, reset, step.id]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onNext)}
      noValidate
      className="final-selection-form"
      sx={{
        background: "linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)",
        borderRadius: 3,
        p: { xs: 2, md: 3 },
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
    >
      <Stack spacing={2.5}>
        {step.fields.map((field) => {
          if (field.inputType === "tel") {
            return (
              <Controller
                key={field.id}
                name={field.id}
                control={control}
                defaultValue=""
                rules={{
                  required: translate(field.errorKey),
                  validate: (v) =>
                    matchIsValidTel(v) || translate("validation.invalidPhone"),
                }}
                render={({ field: ctrl }) => (
                  <MuiTelInput
                    {...ctrl}
                    defaultCountry={defaultCountry || "AE"}
                    label={translate(field.key)}
                    fullWidth
                    error={!!errors[field.id] || !!serverFieldErrors[field.id]}
                    helperText={
                      errors[field.id]?.message || serverFieldErrors[field.id]
                    }
                    sx={{ "& .MuiInputBase-root": { borderRadius: 2 } }}
                  />
                )}
              />
            );
          }

          if (field.inputType === "checkbox") {
            const isOptional = !field.required;
            return (
              <Controller
                key={field.id}
                name={field.id}
                control={control}
                defaultValue={false}
                rules={isOptional ? {} : { required: translate(field.errorKey) }}
                render={({ field: ctrl }) => (
                  <>
                    {isOptional ? (
                      <Alert
                        severity="info"
                        sx={{ mt: "8px !important", textAlign: "start" }}
                      >
                        {translate(field.key)}
                      </Alert>
                    ) : (
                      <FormControlLabel
                        control={<Checkbox {...ctrl} checked={ctrl.value} />}
                        label={translate(field.key)}
                        sx={{ mt: "8px !important" }}
                      />
                    )}
                    {errors[field.id] && (
                      <Box
                        sx={{
                          color: colors.error,
                          fontSize: "0.75rem",
                          ml: 1.5,
                          mt: "4px !important",
                        }}
                      >
                        {errors[field.id]?.message}
                      </Box>
                    )}
                    {!errors[field.id] && serverFieldErrors[field.id] && (
                      <Box
                        sx={{
                          color: colors.error,
                          fontSize: "0.75rem",
                          ml: 1.5,
                          mt: "4px !important",
                        }}
                      >
                        {serverFieldErrors[field.id]}
                      </Box>
                    )}
                  </>
                )}
              />
            );
          }

          return (
            <TextField
              key={field.id}
              label={translate(field.key)}
              fullWidth
              type={field.inputType}
              error={!!errors[field.id] || !!serverFieldErrors[field.id]}
              helperText={
                errors[field.id]?.message || serverFieldErrors[field.id]
              }
              InputProps={{ sx: { borderRadius: 2 } }}
              {...register(field.id, {
                required: translate(field.errorKey),
                ...(field.pattern && {
                  pattern: {
                    value: field.pattern,
                    message: translate(field.errorKey),
                  },
                }),
              })}
            />
          );
        })}

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          fullWidth
          sx={{
            mt: 1,
            py: 1.5,
            fontWeight: 700,
            fontSize: "1rem",
            backgroundColor: colors.primary,
            "&:hover": { backgroundColor: colors.primaryDark },
            "&.Mui-disabled": { opacity: 0.7, color: "#fff" },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={22} sx={{ color: "#fff" }} />
          ) : (
            translate("button.submit")
          )}
        </Button>
      </Stack>
    </Box>
  );
}
