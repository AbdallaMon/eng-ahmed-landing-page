import { AppBar, Toolbar, Box, Button } from "@mui/material";
import { LinkButton } from "../buttons/LinkButton";
import { colors } from "@/app/data/constants";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNavDrawer } from "./MobileNavDrawer";

export function NavbarClient({ navItems, lng, bookingButton }) {
  const renderDesktopNavItem = (item, index) => {
    if (item.type === "SELECTOR") {
      return (
        <LanguageSwitcher
          key={`selector-${index}`}
          options={item.options}
          currentLanguage={lng}
        />
      );
    }
    return (
      <Button
        sx={{ textTransform: "none" }}
        key={item.href || index}
        component={"a"}
        href={item.href}
      >
        {item.label}
      </Button>
    );
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        color="transparent"
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Toolbar
          sx={{
            px: { xs: 2, md: 4 },
            minHeight: { xs: 64, md: 80 },
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box
            // spacing={2}
            alignItems="center"
            sx={{ display: { xs: "none", md: "flex" }, gap: 5 }}
          >
            {/* Primary contact button first */}

            <LinkButton
              {...bookingButton}
              bgColor={colors.primary}
              borderColor={colors.secondary}
              textColor={colors.white}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              {(navItems || []).map((item, index) =>
                renderDesktopNavItem(item, index)
              )}
            </Box>
          </Box>

          <MobileNavDrawer
            navItems={navItems}
            bookingButton={bookingButton}
            lng={lng}
          />
          <Box
            component={"a"}
            href="/"
            sx={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={"/logo.png"}
              alt="Logo"
              fill
              // style={{ objectFit: "contain" }}
              sx={{
                objectFit: "contain",
                // width: { xs: 100, md: 120 },
                height: { xs: 40, md: 50 },
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}
