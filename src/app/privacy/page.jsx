import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { getTranslation } from "../i18n";
import { cookies } from "next/headers";

export async function generateMetadata() {
  const cookieStore = await cookies();
  const lng = cookieStore.get("i18next")?.value || "ar";
  const { t } = await getTranslation(lng);
  const metaData = t("meta", { returnObjects: true });
  return metaData.privacyPage;
}

function Section({ section }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
        {section.title}
      </Typography>

      {section.body?.map((paragraph, idx) => (
        <Typography
          key={idx}
          variant="body1"
          sx={{ lineHeight: 1.9, mt: idx ? 1 : 0 }}
        >
          {paragraph}
        </Typography>
      ))}

      {section.list && (
        <List dense sx={{ pl: 1 }}>
          {section.list.map((item) => (
            <ListItem key={item} sx={{ py: 0.25 }}>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      )}

      {section.subSections?.map((sub) => (
        <Box key={sub.title} sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 1 }}>
            {sub.title}
          </Typography>
          {sub.body?.map((paragraph, idx) => (
            <Typography
              key={idx}
              variant="body1"
              sx={{ lineHeight: 1.9, mt: idx ? 1 : 0 }}
            >
              {paragraph}
            </Typography>
          ))}

          {sub.list && (
            <List dense sx={{ pl: 1, mt: 1 }}>
              {sub.list.map((item) => (
                <ListItem key={item} sx={{ py: 0.25 }}>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default async function PrivacyPage({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const lng = awaitedSearchParams.lng || "ar";
  const { t } = await getTranslation(lng);
  const privacy = t("privacy", { returnObjects: true });

  return (
    <Box sx={{ py: { xs: 4, md: 7 }, bgcolor: "background.default" }}>
      <Container maxWidth="md">
        <Paper elevation={1} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            {privacy.title}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            {lng === "ar" ? "تاريخ السريان:" : "Effective date:"}{" "}
            {privacy.effectiveDate}
          </Typography>

          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: "info.main",
              color: "common.white",
              fontWeight: 600,
            }}
          >
            {lng === "ar"
              ? "الربط مع Google اختياري بالكامل. ننشئ فقط الأحداث الجديدة التي تطلبها ويمكنك إلغاء الصلاحية في أي وقت من صفحة أذونات Google."
              : "Linking Google is fully optional. We only create the new events you request, and you can revoke access anytime from your Google permissions page."}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body1" sx={{ lineHeight: 1.9 }}>
            {privacy.brand}
          </Typography>

          <Typography variant="body1" sx={{ lineHeight: 1.9, mt: 1 }}>
            {privacy.intro}
          </Typography>

          {privacy.sections.map((section) => (
            <Section key={section.id} section={section} />
          ))}
        </Paper>
      </Container>
    </Box>
  );
}
