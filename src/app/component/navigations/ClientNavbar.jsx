"use client";

import { useState } from "react";
import Link from "next/link";

import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Stack,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { LinkButton } from "../buttons/LinkButton";
import { colors } from "@/app/data/constants";

/**
 * Language switcher: uses options from languagesSelector.options
 * Each option is expected like: { label: "العربية", value: "ar" }
 */
function LanguageSwitcher({ options, currentLanguage, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (!options || !options.length) return null;

  const current =
    options.find((opt) => opt.value === currentLanguage) || options[0];

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (value) => {
    if (onChange && value !== currentLanguage) {
      onChange(value);
    }
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        sx={{
          textTransform: "none",

          px: 1.5,
          py: 0.5,
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
        }}
        // variant="outlined"
        size="small"
      >
        <Box
          component="img"
          src={"./chevron-down-colored.png"}
          alt="Language"
          sx={{
            width: 18,
            height: 18,
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease-in-out",
          }}
        />
        <Typography variant="body2">
          {current && current.label ? current.label : "Language"}
        </Typography>
        <Box
          component="img"
          src={"./language-selector.png"}
          alt="Language"
          sx={{ width: 18, height: 18 }}
        />
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {options.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={opt.value === currentLanguage}
            onClick={() => handleSelect(opt.value)}
            sx={{ px: 3, py: 1.5 }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function NavbarClient({ navItems, lng, bookingButton }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  // Find contact item to use as primary button

  const handleLanguageChange = (value) => {
    const url = new URL(window.location.href);
    url.searchParams.set("lng", value);
    window.location.href = url.toString();
  };

  const renderDesktopNavItem = (item, index) => {
    if (item.type === "SELECTOR") {
      return (
        <LanguageSwitcher
          key={`selector-${index}`}
          options={item.options}
          currentLanguage={lng}
          onChange={handleLanguageChange}
        />
      );
    }

    return (
      <Button
        key={item.href || index}
        component={Link}
        href={item.href}
        sx={{ textTransform: "none" }}
      >
        {item.label}
      </Button>
    );
  };

  const renderMobileListItem = (item, index) => {
    if (item.type === "SELECTOR") {
      return (
        <ListItem key={`selector-mobile-${index}`}>
          <LanguageSwitcher
            options={item.options}
            currentLanguage={lng}
            onChange={handleLanguageChange}
          />
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
          {/* Logo (left) */}

          {/* Desktop nav (right) */}
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
              {navItems.map((item, index) => {
                return renderDesktopNavItem(item, index);
              })}
            </Box>
          </Box>

          {/* Mobile menu icon (right) */}
          <IconButton
            edge="end"
            onClick={handleToggleDrawer(true)}
            sx={{ display: { xs: "inline-flex", md: "none" } }}
          >
            <Box
              component="img"
              src={"./menu.png"}
              alt="Menu"
              sx={{ width: 28, height: 28 }}
            />
          </IconButton>
          <Box
            component={Link}
            href="/"
            sx={{
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={"./logo.png"}
              alt="Logo"
              fill
              // style={{ objectFit: "contain" }}
              sx={{
                objectFit: "contain",
                // width: { xs: 100, md: 120 },
                height: { xs: 40, md: 50 },
              }}
              priority
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
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
          {/* Top inside drawer: logo */}
          <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
            <Box
              component="img"
              src={"./logo.png"}
              alt="Logo"
              fill
              // style={{ objectFit: "contain" }}
              sx={{
                objectFit: "contain",
                // width: { xs: 100, md: 120 },
                height: { xs: 40, md: 50 },
              }}
              priority
            />
          </Box>

          <Divider />

          {/* Links + language selector */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <List>
              {(navItems || []).map((item, index) =>
                renderMobileListItem(item, index)
              )}
            </List>
          </Box>

          {/* Contact button at bottom */}
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
