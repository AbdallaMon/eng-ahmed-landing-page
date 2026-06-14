// صفحة نجاح المعاملة — لا تُفهرس في محركات البحث.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function SuccessLayout({ children }) {
  return children;
}
