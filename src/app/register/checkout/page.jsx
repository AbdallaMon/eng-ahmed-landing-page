import { Button, Container, Paper } from "@mui/material";
import { MdArrowBack } from "react-icons/md";
import CheckoutView from "@/app/register/component/checkout/CheckoutView";

// Transactional payment page — keep it out of search indexes.
export const metadata = { robots: { index: false, follow: false } };

export default async function CheckoutPage({ searchParams }) {
  const { lng, leadId, clientId, test } = await searchParams;
  const clientLead = { id: leadId, clientId };

  return (
    <Paper
      elevation={0}
      sx={{
        // Transparent so the persistent 3D canvas (or the 2D fallback gradient
        // backdrop) shows through behind the checkout surface.
        backgroundColor: "transparent",
        boxShadow: "none",
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
