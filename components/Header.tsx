import { getSiteSettings } from "@/lib/products";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const settings = await getSiteSettings();
  return <HeaderClient whatsapp={settings.whatsapp} />;
}
