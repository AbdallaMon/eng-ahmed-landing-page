import { matchIsValidTel, MuiTelInput } from "mui-tel-input";
import { useEffect, useState } from "react";

export function PhoneInput({ input, value, lng, handleChange }) {
  const [defaultCountry, setDefaultCountry] = useState("AE");
  const [loading, setLoading] = useState(true);
  async function getDefaultCountryCode() {
    const defaultCountry = "AE";
    try {
      // set fetched location to current locaiton state

      const geoRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?`
      );
      const geoData = await geoRes.json();
      if (geoData && geoData.countryCode) {
        setDefaultCountry(geoData.countryCode);
        return geoData.countryCode;
      }

      const response = await fetch("https://geolocation-db.com/json/");
      const data = await response.json();
      if (data && data.country_code && data.country_code !== "Not found") {
        setDefaultCountry(data.country_code);
        return data.country_code;
      } else {
        setDefaultCountry(defaultCountry);
        return defaultCountry;
      }
    } catch (e) {
      setDefaultCountry(defaultCountry);

      return defaultCountry;
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    getDefaultCountryCode();
  }, []);
  return (
    <>
      <MuiTelInput
        defaultCountry={defaultCountry}
        value={value}
        id={input.id}
        name={input.id}
        label={input.label}
        loading={loading}
        onChange={(value) => handleChange(value, input.id)}
        error={matchIsValidTel(value) || value === "" ? false : true}
        helperText={
          matchIsValidTel(value) || value === ""
            ? ""
            : lng === "ar"
            ? "الرجاء إدخال رقم هاتف صالح"
            : "Please enter a valid phone number"
        }
        fullWidth
        sx={{
          "& .MuiInputBase-root": { borderRadius: 2 },
          "&:hover fieldset": { borderColor: "primary.main" },
        }}
      />
    </>
  );
}
