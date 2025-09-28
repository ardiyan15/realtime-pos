import MenuManagemenet from "./_components/menu";
import { Menu } from "@/validations/menu-validation";

export const revalidate = 60; // waktu revalidate untuk mendapatkan data terbaru

async function getMenus(): Promise<Menu[]> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/menus?select=*`;

  const res = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      Prefer: "count=exact"
    },
    next: { revalidate, tags: ["menus"]},
    cache: "force-cache"
  })

  if(!res.ok) throw new Error("Failed to fetch menus");
  return res.json();
}

export const metadata = {
  title: "My Cafe | Menu Management",
};

export default async function MenuManagementPage() {
  const menus = await getMenus();

  return <MenuManagemenet initialMenus={menus}/>;
}
