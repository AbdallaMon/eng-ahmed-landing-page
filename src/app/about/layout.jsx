// ميتا الصفحة (بما فيها canonical/hreflang) تُولَّد في about/page.jsx حيث تتوفّر
// searchParams (?lng=) — الـ layout في Next.js لا يستقبل searchParams.
export default function AboutLayout({ children }) {
  return children;
}
