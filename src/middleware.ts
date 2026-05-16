import { clerkMiddleware } from "@clerk/nextjs/server";

// Todas as rotas são públicas — a autenticação é verificada
// individualmente nos componentes/mutations que precisam.
// Isso evita redirects automáticos para o Clerk que causam CORS errors.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
