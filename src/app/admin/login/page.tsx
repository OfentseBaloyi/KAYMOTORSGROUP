import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { siteConfig } from "@/config/site";
import { isAdminEnabled } from "@/lib/admin/access";

export const metadata = { title: "Sign in" };

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Image
          src={siteConfig.brand.logo}
          alt={siteConfig.legalName}
          width={siteConfig.brand.logoWidth}
          height={siteConfig.brand.logoHeight}
          className="mx-auto h-20 w-auto"
          priority
        />
        <div className="mt-6 rounded-card border border-line bg-white p-6">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Admin sign in</h1>
          <div className="kombi-stripe mt-2 mb-5 w-12" aria-hidden="true" />
          <Suspense>
            <Login searchParams={searchParams} />
          </Suspense>
        </div>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="inline-flex min-h-11 items-center text-muted hover:text-navy-950">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}

async function Login({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  await connection();
  if (!isAdminEnabled()) notFound();
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const notice =
    one(params.error) === "not-allowed" ? "That account doesn't have admin access." : undefined;
  return <LoginForm next={one(params.next)} notice={notice} />;
}
