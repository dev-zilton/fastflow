import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const featuredRestaurants = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.isOpen, true))
    .limit(1);
  const featuredRestaurant = featuredRestaurants[0];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-lg">
              🍜
            </div>
            <span
              className="text-xl font-extrabold tracking-tight text-gray-900"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              FastFlow
            </span>
          </div>
          <nav className="flex items-center gap-2">
            {session?.user ? (
              <>
                <span className="text-sm text-gray-500">
                  Bem-vindo, {session.user.name}
                </span>
                <form
                  action={async () => {
                    "use server";
                    await auth.api.signOut({ headers: await headers() });
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Sair
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-gray-100">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-red-600">
              Delivery em Maputo
            </p>
            <h1
              className="mb-4 text-5xl font-extrabold leading-tight tracking-tight text-gray-900"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Comida japonesa{" "}
              <span className="text-red-600">direto para você.</span>
            </h1>
            <p className="mb-8 max-w-sm text-base leading-relaxed text-gray-500">
              Peça nos melhores restaurantes japoneses de Maputo. Rápido, fácil
              e rastreado em tempo real.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/restaurants"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Explorar restaurantes →
              </Link>
              <Link
                href={
                  featuredRestaurant
                    ? `/menu/${featuredRestaurant.id}`
                    : "/restaurants"
                }
                className="inline-flex items-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Ver cardápio
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: "🍣", name: "Sashimi", price: "MZN 450" },
              { emoji: "🍱", name: "Bento Box", price: "MZN 620" },
              { emoji: "🍤", name: "Tempurá", price: "MZN 380" },
              { emoji: "🍙", name: "Onigiri", price: "MZN 210" },
            ].map((dish) => (
              <div
                key={dish.name}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center hover:border-red-100 hover:bg-red-50 transition-colors"
              >
                <div className="mb-2 text-3xl">{dish.emoji}</div>
                <div className="text-sm font-semibold text-gray-800">
                  {dish.name}
                </div>
                <div className="text-xs font-semibold text-red-600">
                  {dish.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-gray-100">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-gray-100">
          {[
            { num: "12+", label: "Restaurantes" },
            { num: "30min", label: "Entrega média" },
            { num: "4.9★", label: "Avaliação média" },
          ].map((s) => (
            <div key={s.label} className="py-8 text-center">
              <div
                className="text-3xl font-extrabold tracking-tight text-gray-900"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {s.num}
              </div>
              <div className="mt-1 text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Por que FastFlow
          </p>
          <h2
            className="mb-8 text-3xl font-bold tracking-tight text-gray-900"
            style={{ fontFamily: "var(--font-syne)" }}
          >
            Simples, rápido e confiável
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                emoji: "⚡",
                title: "Entrega rápida",
                desc: "Rastreie seu pedido no mapa em tempo real, do restaurante até a sua porta.",
              },
              {
                emoji: "💳",
                title: "Formas de pagamento",
                desc: "PIX, cartão ou dinheiro na entrega. Você escolhe o que for mais cómodo.",
              },
              {
                emoji: "⭐",
                title: "Programa de pontos",
                desc: "Ganhe pontos em cada pedido e resgate em descontos nos próximos.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-xl">
                  {f.emoji}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-14">
          <div>
            <h2
              className="mb-1 text-2xl font-bold tracking-tight text-gray-900"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Pronto para pedir?
            </h2>
            <p className="text-sm text-gray-500">
              Explore o cardápio completo e faça seu primeiro pedido agora.
            </p>
          </div>
          <Link
            href={
              featuredRestaurant
                ? `/menu/${featuredRestaurant.id}`
                : "/restaurants"
            }
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors whitespace-nowrap"
          >
            Pedir agora →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <p className="text-xs text-gray-400">
            © 2026 FastFlow. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {["Termos", "Privacidade", "Suporte"].map((l) => (
              <span
                key={l}
                className="text-xs text-gray-400 cursor-pointer hover:text-gray-600"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
