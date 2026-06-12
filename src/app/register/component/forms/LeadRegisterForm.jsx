"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
  alpha,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import { useSearchParams } from "next/navigation";

import { useLanguage } from "@/app/register/providers/LanguageProvider";
import { useAlertContext } from "@/app/register/providers/AlertProvider";
import { useToastContext } from "@/app/register/providers/LoadingToastProvider";
import { useUploadContext } from "@/app/register/providers/UploadProgressProvider";
import { useGeoCountry } from "@/app/register/hooks/useGeoCountry";

import { handleRequestSubmit } from "@/app/register/lib/request";
import { uploadInChunks } from "@/app/register/lib/upload";

import {
  Emirate,
  LEAD_SOURCE_LABELS,
  LeadCategory,
  LeadType,
  DesignLeadPrice,
} from "@/app/register/data/constants";
import { CountrySelectField } from "@/app/register/component/forms/inputs/CountrySelectField";
import { FileUploadField } from "@/app/register/component/forms/inputs/FileUploadField";
import FormSuccessView from "@/app/register/component/feedback/FormSuccessView";
import {
  formFieldVariants,
  formFieldsContainerVariants,
  formGroupVariants,
  paperRevealVariants,
  titleMorphTransition,
} from "@/app/register/lib/animations";

const MotionStack = motion.create(Stack);
const MotionBox = motion.create(Box);
const MotionDiv = motion.create("div");
const MotionPaper = motion.create(Paper);
const MotionChip = motion.create(Chip);

// A single field rising into view. `style` lets row items keep their flex sizing
// while still being a motion item (so name / phone reveal independently).
function Field({ children, style }) {
  return (
    <MotionDiv variants={formFieldVariants()} style={{ width: "100%", ...style }}>
      {children}
    </MotionDiv>
  );
}

/**
 * Main lead contact form for /register. Collects contact details + project
 * info, then completes registration and redirects to checkout.
 */
export function LeadRegisterForm({ category, item, location, email }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesignLeadForm
        category={category}
        item={item}
        location={location}
        leadEmail={email}
      />
    </LocalizationProvider>
  );
}

function DesignLeadForm({ category, item, location, leadEmail }) {
  const { translate, lng } = useLanguage();
  const { setAlertError } = useAlertContext();
  const { loading, setLoading } = useToastContext();
  const { setProgress, setOverlay } = useUploadContext();
  const { defaultCountry } = useGeoCountry(location);
  const searchParams = useSearchParams();
  const externalLeadId = searchParams.get("leadId");

  const theme = useTheme();

  const [showPriceConfirm, setShowPriceConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    emirate: null,
    email: leadEmail || "",
    file: null,
    clientDescription: null,
    country: null,
    discoverySource: null,
  });
  const [renderSuccess, setRenderSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleEmirateChange = (event) => {
    setFormData((prev) => ({ ...prev, emirate: event.target.value }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    let { name, phone, email, emirate } = formData;
    if (leadEmail) email = leadEmail;

    if (!matchIsValidTel(phone)) {
      setAlertError(translate("validation.invalidPhone"));
      return;
    }
    if (!name || !phone || !email) {
      setAlertError(translate("validation.fillAll"));
      return;
    }
    if (location === "INSIDE_UAE" && !emirate) {
      setAlertError(translate("validation.fillAll"));
      return;
    }
    if (location !== "INSIDE_UAE" && !formData.country) {
      setAlertError(translate("validation.fillAll"));
      return;
    }
    if (!formData.discoverySource) {
      setAlertError(translate("form.tellUsHowFound"));
      return;
    }

    // Step 1: initial registration (only when no email was captured earlier).
    const initialRequest =
      !email &&
      (await handleRequestSubmit(
        formData,
        setLoading,
        `client/new-lead/register?lng=${lng}`,
        false,
        translate("loading.submitting"),
      ));
    // Old server: 200. Migrated server: 201 (created). Accept both.
    if (
      !email &&
      initialRequest.status !== 200 &&
      initialRequest.status !== 201
    )
      return;

    const leadId = externalLeadId || initialRequest.data.id;

    // Step 2: complete registration (with or without file).
    let completeData = { ...formData, category, item, lng, location };

    if (formData.file) {
      const fileUpload = await uploadInChunks(
        formData.file,
        setProgress,
        setOverlay,
      );
      if (fileUpload.status !== 200) return;
      completeData = { ...completeData, url: fileUpload.url };
    }

    const request = await handleRequestSubmit(
      completeData,
      setLoading,
      `client/new-lead/complete-register/${leadId}`,
      false,
      translate("loading.submitting"),
    );

    if (request.status === 200 || request.status === 201) {
      // Old server returned `data.leadId`; the migrated server returns the lead
      // object as `data` (so the id is `data.id`). Handle old || new.
      const completedLeadId = request.data?.leadId || request.data?.id;
      const completedClientId = request.data?.clientId;
      window.location.href = `/register/checkout?lng=${lng}&leadId=${completedLeadId}&clientId=${completedClientId}`;
    }
  };

  const emiratesOptions = Object.entries(Emirate).map(([key, value]) => ({
    key,
    label: value,
  }));

  if (!item) return null;

  const fieldSx = { "& .MuiInputBase-root": { borderRadius: 2 } };

  return (
    <Box sx={{ width: "100%", mx: "auto", maxWidth: 720 }}>
      {showPriceConfirm ? (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            {translate(DesignLeadPrice[item]) || ""}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2, borderRadius: 2, fontSize: "1rem", fontWeight: 600 }}
            onClick={() => setShowPriceConfirm(false)}
          >
            {translate("form.buttons.confirm")}
          </Button>
        </>
      ) : renderSuccess ? (
        <FormSuccessView showLevels={false} />
      ) : (
        <MotionPaper
          elevation={0}
          // The form's own surface fades in as the light panel finishes covering
          // the screen — one continuous beat, not a separate flash — then its
          // fields cascade in.
          variants={paperRevealVariants(0.3)}
          initial="hidden"
          animate="show"
          sx={{
            padding: { xs: 2.5, md: 5 },
            borderRadius: 3,
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.divider}`,
            direction: "ltr",
          }}
        >
          {/* ---------- Header ---------- */}
          {/* Visible WITH the paper (not in the delayed field cascade) so the
              chosen item title can MORPH straight into the type chip — it
              shrinks into its place inside the form. */}
          <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              component="h4"
              sx={{
                textAlign: "center",
                fontWeight: 700,
                color: "primary.main",
                maxWidth: { xs: 320, md: 600 },
              }}
            >
              {translate("hero.oneStepAway")}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              justifyContent="center"
              useFlexGap
            >
              <Chip
                label={translate(LeadCategory[category]) || ""}
                size="small"
                variant="outlined"
                color="primary"
              />
              {/* The morph landing zone — the item card's title travels here
                  SLOWLY (so the movement is clearly seen) and shrinks into the
                  chip before the rest of the form fills in. */}
              <MotionChip
                layoutId={`item-title-${item}`}
                transition={titleMorphTransition(0, 0.8)}
                label={translate(LeadType[item]) || ""}
                size="small"
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: "center",
                maxWidth: 480,
                px: 1,
                py: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
              }}
            >
              {translate("register.emailAnimatedNotice")}
            </Typography>
          </Stack>

          {/* The fields cascade in one by one (واحده واحده) after the background
              has grown and the title has settled into its chip. */}
          <MotionStack
            spacing={4}
            variants={formFieldsContainerVariants(0.8)}
            initial="hidden"
            animate="show"
          >
            {/* ---------- Contact details ---------- */}
            <MotionBox variants={formFieldVariants()}>
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", letterSpacing: 1 }}
              >
                {translate("form.name")} & {translate("form.phone")}
              </Typography>
              <Divider sx={{ mb: 2.5, mt: 0.5 }} />

              <MotionStack spacing={2.5} variants={formGroupVariants()}>
                <MotionStack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2.5}
                  variants={formGroupVariants()}
                >
                  <Field style={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label={translate("form.name")}
                      name="name"
                      variant="outlined"
                      value={formData.name}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                  </Field>

                  <Field style={{ flex: 1 }}>
                    <MuiTelInput
                      defaultCountry={defaultCountry}
                      value={formData.phone}
                      id="phone"
                      name="phone"
                      label={translate("form.phone")}
                      onChange={handlePhoneChange}
                      error={
                        formData.phone !== "" &&
                        !matchIsValidTel(formData.phone)
                      }
                      helperText={
                        formData.phone !== "" &&
                        !matchIsValidTel(formData.phone)
                          ? translate("validation.invalidPhone")
                          : ""
                      }
                      fullWidth
                      sx={fieldSx}
                    />
                  </Field>
                </MotionStack>

                {!leadEmail && (
                  <Field>
                    <TextField
                      fullWidth
                      label={translate("form.email")}
                      name="email"
                      type="email"
                      variant="outlined"
                      value={formData.email}
                      onChange={handleChange}
                      InputProps={{ sx: { borderRadius: 2 } }}
                    />
                  </Field>
                )}
              </MotionStack>
            </MotionBox>

            {/* ---------- Location / project details ---------- */}
            <MotionBox variants={formFieldVariants()}>
              <Typography
                variant="overline"
                sx={{ color: "text.secondary", letterSpacing: 1 }}
              >
                {location === "INSIDE_UAE"
                  ? translate("form.selectLocation")
                  : translate("form.country")}
              </Typography>
              <Divider sx={{ mb: 2.5, mt: 0.5 }} />

              <MotionStack spacing={2.5} variants={formGroupVariants()}>
                {location === "INSIDE_UAE" && (
                  <>
                    <Field>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="emirate-label">
                          {translate("form.selectLocation")}
                        </InputLabel>
                        <Select
                          labelId="emirate-label"
                          label={translate("form.selectLocation")}
                          value={formData.emirate || ""}
                          onChange={handleEmirateChange}
                          sx={{ borderRadius: 2 }}
                        >
                          {emiratesOptions.map((option) => (
                            <MenuItem value={option.key} key={option.key}>
                              {translate(option.label)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Field>

                    <Field>
                      <TextField
                        fullWidth
                        label={translate("form.additionalInfo")}
                        name="clientDescription"
                        variant="outlined"
                        multiline
                        minRows={2}
                        value={formData.clientDescription || ""}
                        onChange={handleChange}
                        InputProps={{ sx: { borderRadius: 2 } }}
                      />
                    </Field>
                  </>
                )}

                {location !== "INSIDE_UAE" && (
                  <Field>
                    <CountrySelectField
                      label={translate("form.country")}
                      name="country"
                      onChange={handleChange}
                      value={formData.country}
                      fullWidth
                    />
                  </Field>
                )}

                <Field>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="discovery-source-label">
                      {translate("form.whereHeard")}
                    </InputLabel>
                    <Select
                      labelId="discovery-source-label"
                      label={translate("form.whereHeard")}
                      value={formData.discoverySource || ""}
                      onChange={handleChange}
                      name="discoverySource"
                      sx={{ borderRadius: 2 }}
                    >
                      {Object.entries(LEAD_SOURCE_LABELS).map(
                        ([key, labelKey]) => (
                          <MenuItem value={key} key={key}>
                            {translate(labelKey)}
                          </MenuItem>
                        ),
                      )}
                    </Select>
                  </FormControl>
                </Field>

                <Field>
                  <FileUploadField
                    label={translate("form.addAttachmentOptional")}
                    id="file"
                    setData={setFormData}
                  />
                </Field>
              </MotionStack>
            </MotionBox>

            {/* ---------- Guarantee + CTA ---------- */}
            <MotionBox
              variants={formFieldVariants()}
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 2.5 }}>
                {translate("guarantee.refund")}
              </Typography>

              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                size="large"
                fullWidth
                sx={{
                  borderRadius: 2,
                  py: 1.75,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: theme.shadows[2],
                  "&:hover": { boxShadow: theme.shadows[4] },
                }}
              >
                {translate("form.buttons.proceedToCheckout")}
              </Button>
            </MotionBox>
          </MotionStack>
        </MotionPaper>
      )}
    </Box>
  );
}
