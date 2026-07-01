import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  UtensilsCrossed,
  Store,
  Users,
  BarChart3,
  Ticket,
  LogOut,
} from "lucide-react";

export const metadata = {
  title: "FastFlow Admin - Gerenciar Restaurante",
  description:
    "Painel administrativo para gerenciar pedidos, cardápio e relatórios",
};

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/orders", icon: Package, label: "Pedidos" },
  { href: "/admin/menu", icon: UtensilsCrossed, label: "Cardápio" },
  { href: "/admin/restaurant", icon: Store, label: "Restaurante" },
  { href: "/admin/drivers", icon: Users, label: "Entregadores" },
  { href: "/admin/reports", icon: BarChart3, label: "Relatórios" },
  { href: "/admin/coupons", icon: Ticket, label: "Cupons" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  // Admin allowlist (comma-separated emails)
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const userEmail = session?.user?.email ?? "";
  const isAdmin = adminEmails.length ? adminEmails.includes(userEmail) : false;

  if (!isAdmin) {
    // If logged in but not admin, redirect to app home
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🍜</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">FastFlow Admin</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <p className="text-xs text-gray-500 px-4">
            Logado como {session.user.name || session.user.email}
          </p>
          <form
            action={async () => {
              "use server";
              await auth.api.signOut({ headers: await headers() });
              redirect("/");
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Painel Administrativo
            </h2>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  Ver App
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
