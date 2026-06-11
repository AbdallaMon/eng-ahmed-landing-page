"use client";

import { Box, Container, Paper } from "@mui/material";

import colors from "@/app/register/theme/colors";
import { useLeadAnimation } from "@/app/register/component/leadSelection/useLeadAnimation";
import { RegisterHeader } from "@/app/register/component/layout/RegisterHeader";
import { LeadCardGrid } from "@/app/register/component/leadSelection/LeadCardGrid";
import { DesignLeadGrid } from "@/app/register/component/leadSelection/DesignLeadGrid";
import { LeadCategoryGrid } from "@/app/register/component/leadSelection/LeadCategoryGrid";
import { EmailCaptureCard } from "@/app/register/component/forms/EmailCaptureCard";
import { EmailCapturedNote } from "@/app/register/component/forms/EmailCapturedNote";
import { LeadRegisterForm } from "@/app/register/component/forms/LeadRegisterForm";
import { CompleteRegisterForm } from "@/app/register/component/forms/CompleteRegisterForm";

/**
 * Shared animated lead-selection shell used by both /register and
 * /register/complete. The GSAP timelines target the `.page-container` /
 * `.form-page` className hooks rendered here — keep them verbatim.
 *
 * @param {{
 *   mode?: "register" | "complete",
 *   leadId?: string,
 * }} props
 */
export function LeadSelectionFlow({ mode = "register", leadId }) {
  const {
    leadCategory,
    leadEmail,
    location,
    leadItem,
    canReset,
    triggerCategoryAnimation,
    handleLocationClick,
    handleLeadItemClick,
    handleReverseAnimation,
    handleReset,
    handleEmailLeadSubmit,
  } = useLeadAnimation();

  const renderForm = () =>
    mode === "complete" ? (
      <CompleteRegisterForm
        category={leadCategory}
        item={leadItem}
        location={location}
        leadId={leadId}
      />
    ) : (
      <LeadRegisterForm
        category={leadCategory}
        item={leadItem}
        location={location}
        email={leadEmail}
      />
    );

  return (
    <>
      <RegisterHeader
        reverseAnimation={handleReverseAnimation}
        onReset={handleReset}
        canReset={canReset}
      />

      <Container
        maxWidth="md"
        sx={{
          height: !leadCategory ? "auto" : "100vh",
          overflow: { md: "hidden" },
          py: { xs: 3, md: 4 },
          pb: { xs: 16, md: 10 },
        }}
      >
        <Paper
          className="page-container"
          elevation={2}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: "12px",
            backgroundColor: colors.bgPrimary,
            width: "100%",
            minHeight: "calc(100vh - 48px)",
          }}
        >
          <EmailCapturedNote visible={Boolean(leadEmail)} />
          <EmailCaptureCard onSubmit={handleEmailLeadSubmit} />
          <LeadCardGrid handleClick={triggerCategoryAnimation} />

          {leadCategory && (
            <>
              {leadCategory === "DESIGN" && (
                <DesignLeadGrid
                  handleClick={handleLocationClick}
                  leadEmail={leadEmail}
                />
              )}
              <LeadCategoryGrid
                leadCategory={leadCategory}
                onItemClick={handleLeadItemClick}
                location={location}
              />
            </>
          )}
        </Paper>
      </Container>

      <Box
        className="form-page"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          background: colors.bgPrimary,
          zIndex: leadCategory === "CONSULTATION" ? 200000000000 : 20,
          display: "none",
          overflowY: "auto",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            height: "fit-content",
            py: { xs: 3, md: 4 },
            pb: { xs: leadCategory ? 25 : 18, md: 19 },
            ...(leadCategory && { pt: { xs: 12, md: 12 } }),
          }}
        >
          {renderForm()}
        </Container>
      </Box>
    </>
  );
}
