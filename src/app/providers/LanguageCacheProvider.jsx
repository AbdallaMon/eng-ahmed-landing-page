import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import stylisRTLPlugin from "stylis-plugin-rtl";
const defaultCache = createCache({
  key: "mui",
});
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [stylisRTLPlugin],
});
export default function LanguageCacheProvider({ children, rtl }) {
  return (
    <CacheProvider value={rtl ? cacheRtl : defaultCache}>
      {children}
    </CacheProvider>
  );
}
