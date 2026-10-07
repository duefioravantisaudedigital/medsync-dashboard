'use client';

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

// Páginas abertas a qualquer visitante, sem login e sem sidebar
const PUBLIC_PATHS = ["/privacidade"];

export default function NavigationWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    // Página pública: não exige sessão nem redireciona
    if (isPublicPage) {
      setIsLoading(false);
      return;
    }

    // Verifica se o token existe nos cookies
    const token = Cookies.get('medsync_token');
    const isLoginPage = pathname === "/login";

    if (!token && !isLoginPage) {
      // Se não tem token e não está no login, expulsa
      router.push("/login");
    } else if (token && isLoginPage) {
      // Se tem token e está no login, manda pro dashboard
      router.push("/");
      setIsAuthenticated(true);
    } else if (token) {
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, [pathname, router, isPublicPage]);

  const isLoginPage = pathname === "/login";

  // Página pública: renderiza direto (inclusive no HTML do servidor)
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Enquanto verifica a sessão, mostra uma tela branca ou loading simples
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  // Se for página de login, renderiza sem sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Se não estiver autenticado e não for login, não mostra nada (será redirecionado)
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
