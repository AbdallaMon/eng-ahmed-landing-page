import { Button, Container, Paper } from "@mui/material";
import { MdArrowBack } from "react-icons/md";
import colors from "@/app/register/theme/colors";
import CheckoutView from "@/app/register/component/checkout/CheckoutView";

// Transactional payment page — keep it out of search indexes.
export const metadata = { robots: { index: false, follow: false } };

export default async function CheckoutPage({ searchParams }) {
  const { lng, leadId, clientId, test } = await searchParams;
  const clientLead = { id: leadId, clientId };

  return (
    <Paper
      elevation={2}
      sx={{
        backgroundColor: colors.bgPrimary,
        width: "100%",
        height: "100vh",
        overflowY: "hidden",
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          height: "100%",
          py: { xs: 5, md: 6 },
          pb: { xs: 16, md: 10 },
          position: "relative",
        }}
      >
        <Button
          variant="outlined"
          component="a"
          href="/register"
          sx={{
            position: "absolute",
            left: { xs: 15, md: 25 },
            top: 5,
          }}
        >
          <MdArrowBack size={20} />
        </Button>
        <CheckoutView lng={lng} clientLead={clientLead} test={test} />
      </Container>
    </Paper>
  );
}
