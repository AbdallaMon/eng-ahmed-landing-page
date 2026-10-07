import { redirect } from "next/navigation";

// /booking is closed on the main site — all booking traffic is funneled to the
// register flow. Redirects to NEXT_PUBLIC_REGISTER_URL (the booking domain in
// production); falls back to /register, which the proxy forwards to that domain.
export default function page() {
  redirect(process.env.NEXT_PUBLIC_REGISTER_URL || "/register");
}
