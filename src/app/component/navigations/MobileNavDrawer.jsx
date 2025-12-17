"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { LinkButton } from "../buttons/LinkButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { colors } from "@/app/data/constants";

export function MobileNavDrawer({ navItems, bookingButton, lng }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const renderMobileListItem = (item, index) => {
    if (item.type === "SELECTOR") {
      return (
        <ListItem key={`selector-mobile-${index}`}>
          <LanguageSwitcher options={item.options} currentLanguage={lng} />
        </ListItem>
      );
    }

    return (
      <ListItem
        sx={{
          textAlign: lng === "ar" ? "right" : "left",
          "& .MuiButtonBase-root": {
            textAlign: lng === "ar" ? "right" : "left",
          },
        }}
        key={item.href || index}
        disablePadding
      >
        <ListItemButton
          component={Link}
          href={item.href}
          onClick={handleToggleDrawer(false)}
        >
          <ListItemText primary={item.label} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <>
      <IconButton
        edge="end"
        onClick={handleToggleDrawer(true)}
        sx={{ display: { xs: "inline-flex", md: "none" } }}
      >
        <Box
          component="img"
          src={"/menu.png"}
          alt="Menu"
          sx={{ width: 28, height: 28 }}
        />
      </IconButton>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleToggleDrawer(false)}
      >
        <Box
          sx={{
            width: 280,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
          role="presentation"
        >
          <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src={"/logo.png"}
              alt="Logo"
              fill
              sx={{
                objectFit: "contain",
                height: { xs: 40, md: 50 },
              }}
            />
          </Box>

          <Divider />

          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <List>
              {(navItems || []).map((item, index) =>
                renderMobileListItem(item, index)
              )}
            </List>
          </Box>

          <Box sx={{ p: 2 }}>
            <LinkButton
              {...bookingButton}
              bgColor={colors.primary}
              borderColor={colors.secondary}
              textColor={colors.white}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
