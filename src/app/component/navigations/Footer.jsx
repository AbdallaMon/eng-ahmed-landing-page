import {
  colors,
  developerLink,
  devloperName,
  siteEmail,
} from "@/app/data/constants";
import { getTranslation } from "@/app/i18n";
import {
  Box,
  Container,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import SocialMediaIcons from "./SolcialMediaIcons";

export async function Footer({ lng }) {
  const { t } = await getTranslation(lng);
  const data = t("footer", { returnObjects: true });
  const buttons = t("buttons", { returnObjects: true });
  return (
    <Box component="footer" sx={{ py: { xs: 4, md: 6 } }}>
      <Container maxWidth="xxl">
        <Divider color={"#ececec"} />
      </Container>
      <Container maxWidth="xl">
        <Box>
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              justifyContent: "center",
              alignItems: "center",
              mt: {
                xs: 4,
              },
            }}
          >
            <Box component="img" src="/logo.png" sx={{ width: "40px" }} />{" "}
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 3, md: 4 },
              mt: {
                xs: 4,
                md: 5,
              },
              mb: {
                xs: 2,
                md: 3,
              },
            }}
          >
            {data.navigations.map((item, index) => (
              <Box key={index} href={item.href} component={"a"}>
                {item.label}
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              borderBottom: "1px solid #D4D2E3",
              mt: 4,
              pb: 3,
            }}
          >
            <MyFakeInputEmail />

            <CopyrightText copyRight={data.copyRight} />
          </Box>
          <Box sx={{ pt: 3 }}>
            <SocialMediaIcons
              includeText={true}
              lng={lng}
              sx={{ flexDirection: "column", mb: 1, gap: 1.5 }}
            />
          </Box>
          <Box
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
            }}
          >
            <Grid
              container
              spacing={3}
              sx={{
                alignItems: "center",
                borderBottom: "1px solid #D4D2E3",
              }}
            >
              <Grid
                size={4}
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <SocialMediaIcons
                  includeText={true}
                  lng={lng}
                  sx={{ flexDirection: "column" }}
                />
              </Grid>
              <Grid size={4}>
                <MyFakeInputEmail />
              </Grid>
              <Grid
                size={4}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Box component="img" src="/logo.png" sx={{ width: "40px" }} />{" "}
              </Grid>
            </Grid>

            <CopyrightText copyRight={data.copyRight} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
function MyFakeInputEmail() {
  return (
    <Box>
      {/*  add email icon ./email.png */}
      <TextField
        variant="outlined"
        value={siteEmail}
        slotProps={{
          input: {
            readOnly: true,
            sx: {
              "& .MuiInputBase-input": {
                textAlign: "left !important",
              },
            },
            endAdornment: (
              <Box
                component="img"
                src="/email.png"
                sx={{ width: { xs: "20px", md: "25px" }, ml: 1.5 }}
              />
            ),
          },
        }}
        sx={{ width: { xs: "100%", md: "400px" } }}
        // email where to add the icon?
      />
    </Box>
  );
}

function CopyrightText({ copyRight }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: { xs: 1, md: 2 },
      }}
    >
      <Typography variant="body2" sx={{ textAlign: "center", mt: 3 }}>
        {copyRight.title}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "center", mt: 0.5 }}>
        {copyRight.subTitle}
        <Box
          component="a"
          sx={{
            color: "#0000EE",
            ml: 0.5,
            mr: 0.5,
          }}
          href={developerLink}
        >
          {devloperName}
        </Box>
      </Typography>
    </Box>
  );
}
