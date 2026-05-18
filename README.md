# 🏆 Copa do Mundo 2026 - Simulador Pro

O simulador definitivo para acompanhar, projetar e gerenciar seus palpites da Copa do Mundo de 2026. Construído com tecnologias web modernas, design premium ("Deep Black") e uma robusta arquitetura multi-tenant (SaaS).

## 🚀 Stack Tecnológica

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend & Database:** Convex (Backend Real-time e Serverless)
- **Autenticação:** Clerk (Integrado perfeitamente via JWT template ao Convex)
- **Interface & Componentes:** Radix UI, componentes inspirados no shadcn/ui
- **Performance:** Progressive Web App (PWA) completo com service workers e Push Notifications

## 🌟 Funcionalidades de Destaque

1. **Simulador Completo:** Preveja placares da fase de grupos ao mata-mata. A tabela e o chaveamento são atualizados automaticamente com as regras complexas de desempate da FIFA.
2. **Modelo SaaS Multi-Tenant:** Contas isoladas; as simulações de cada usuário logado são persistidas em tempo real de forma privada e segura.
3. **PWA & Web Push:** Interface instalável em iOS/Android e disparo em massa de Web Push Notifications para retenção e engajamento.
4. **Painel Analítico (Admin):** Dashboard exclusivo, restrito à conta mestre (`leonardohs.fausto@gmail.com`), exibindo KPIs de crescimento, retenção e controle de envios Push.
5. **Motor de Dados Oficiais:** Estrutura pronta (CRON jobs / tabelas globais) para receber dados reais de placares, gols, assistências e cartões durante o torneio de 2026.

## 🛠️ Como Iniciar o Desenvolvimento

Antes de rodar o projeto, certifique-se de que suas chaves do Clerk e Convex estejam configuradas corretamente no arquivo `.env.local`.

```bash
# 1. Instale todas as dependências
npm install

# 2. Inicie o servidor Next.js
npm run dev

# 3. Em um novo terminal, inicie o servidor de banco de dados do Convex
npx convex dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para acessar a plataforma localmente.

## 📄 Planejamento e Arquitetura

- Para conferir o status de desenvolvimento de funcionalidades e os próximos passos, acesse o documento central [ROADMAP.md](./ROADMAP.md).
