import { Album, Armchair, LayoutDashboard, SquareMenu, Users } from "lucide-react";

export const SIDEBAR_MENU_LIST = {
    admin: [
        {
            title: "Dashboard",
            url: "/admin",
            icon: LayoutDashboard
        },
        {
            title: "Order",
            url: "/order",
            icon: Album
        },
        {
            title: "Menu",
            url: "/admin/order",
            icon: SquareMenu
        },
        {
            title: "Table",
            url: "/admin/table",
            icon: Armchair
        },
        {
            title: "User",
            url: "/admin/user",
            icon: Users
        },
    ],
    cashier: [],
    kitchen: [],
}

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;