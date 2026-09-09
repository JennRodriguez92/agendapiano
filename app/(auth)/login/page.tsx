import { redirect } from "next/navigation";

/** El login ahora vive en "/" (ver app/page.tsx) — se deja este redirect por si algo enlaza aquí. */
export default function LoginPage() {
  redirect("/");
}
