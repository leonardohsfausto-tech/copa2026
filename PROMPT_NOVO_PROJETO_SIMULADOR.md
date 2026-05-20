# Prompt para Criação de Simulador de Competições Esportivas Premium

Este documento contém a especificação técnica detalhada, a stack de tecnologias, o esquema do banco de dados, os fluxos de arquitetura e as regras de implementação do projeto. Use este prompt como instrução inicial para criar um novo simulador esportivo de alta qualidade focado em outra competição (ex: Champions League, Campeonato Brasileiro, Copa Libertadores, etc.).

---

## 1. Visão Geral do Sistema
O sistema consiste em um simulador esportivo premium que opera em dois modos:
1. **Modo Oficial / Perfil Global (`userId: "global"`)**: Onde os resultados reais são exibidos. Este perfil é atualizado via integração automatizada (CRON) com uma API esportiva (ex: API-Football) ou manualmente pelo painel de controle do Administrador.
2. **Modo Simulação (Usuário Autenticado)**: Cada usuário autenticado pode criar sua própria simulação paralela. Ao iniciar, a aplicação clona os times e o calendário do Perfil Global para o perfil individual do usuário (`userId` do Clerk). O usuário pode alterar os placares de qualquer jogo, ver a tabela de classificação se reorganizar instantaneamente e assistir aos times avançarem na árvore de mata-mata.

---

## 2. Stack Tecnológica

### Frontend
- **Framework**: Next.js 16+ (App Router) com TypeScript.
- **Estilização**: Tailwind CSS v4 para estilização base e gerenciamento avançado de cores.
- **Animações**: Framer Motion para transições de rotas e micro-interações dinâmicas (especialmente no chaveamento do mata-mata).
- **Ícones**: Lucide React.
- **Biblioteca de Temas**: `next-themes` para suporte completo a Dark Mode (prioritário para visual premium) e Light Mode.
- **Exportação Visual**: `html-to-image` para que o usuário possa gerar e baixar um arquivo `.png` com o resumo da simulação ou de seu grupo favorito.
- **UI Base**: Componentes adaptados do Shadcn/UI (Button, Dialog, Badge, Card, Sheets, etc.).

### Autenticação & Gestão de Usuários
- **Serviço**: Clerk (`@clerk/nextjs`).
- **Configurações adicionais**: Uso de `@clerk/localizations` em português do Brasil e aplicação de `@clerk/themes` (Dark) combinando com a identidade visual premium.

### Backend & Banco de Dados Real-time
- **Serviço**: Convex (`convex`).
- **Estrutura**: Queries, Mutations e Actions.
- **Integrações Externas**: Convex Actions com runtime `"use node"` para operações de rede e envio de notificações push via biblioteca `web-push`.
- **Automação**: CRON jobs internos do Convex rodando em segundo plano para busca automática de dados externos.

### PWA (Progressive Web App)
- **Suporte Offline**: Service Worker customizado (`public/sw.js`).
- **Notificações**: Web Push API com integração direta do Service Worker para escuta de notificações e abertura do link enviado.

---

## 3. Esquema de Banco de Dados (Convex Schema)

Defina o esquema do Convex (`convex/schema.ts`) com as tabelas e índices necessários:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela de Times/Equipes
  teams: defineTable({
    userId: v.optional(v.string()),       // ID do Clerk ou "global" para o template base
    name: v.string(),                      // Nome do time
    group: v.string(),                     // Grupo no qual o time está inserido (ex: "A", "B")
    flag: v.string(),                      // URL da bandeira/logo
    played: v.number(),                    // Jogos jogados
    wins: v.number(),                      // Vitórias
    draws: v.number(),                     // Empates
    losses: v.number(),                    // Derrotas
    points: v.number(),                    // Pontos acumulados
    goalsScored: v.number(),               // Gols pró
    goalsAgainst: v.number(),              // Gols contra
    goalDifference: v.number(),            // Saldo de gols
    rank: v.number(),                      // Posição dentro do grupo (atualizado por algoritmo)
    fifaRanking: v.optional(v.number()),   // Ranking oficial (usado para desempates secundários)
    yellowCards: v.optional(v.number()),   // Estatística de cartões amarelos
    redCards: v.optional(v.number()),      // Estatística de cartões vermelhos
  })
    .index("by_group", ["group"])
    .index("by_user", ["userId"]),

  // Tabela de Partidas
  matches: defineTable({
    userId: v.optional(v.string()),        // ID do Clerk ou "global"
    group: v.string(),                     // Grupo ("A", "B") ou "Knockout" para mata-mata
    phase: v.string(),                     // "Group", "R32", "R16", "Quarter", "Semi", "3rdPlace", "Final"
    homeTeamId: v.optional(v.id("teams")), // Referência ao time mandante
    awayTeamId: v.optional(v.id("teams")), // Referência ao time visitante
    homeTeamPlaceholder: v.optional(v.string()), // Ex: "1A", "2B" para definir mata-mata inicial
    awayTeamPlaceholder: v.optional(v.string()),
    homeGoals: v.optional(v.number()),     // Gols do mandante
    awayGoals: v.optional(v.number()),     // Gols do visitante
    homeYellowCards: v.optional(v.number()),
    awayYellowCards: v.optional(v.number()),
    homeRedCards: v.optional(v.number()),
    awayRedCards: v.optional(v.number()),
    isExtraTime: v.optional(v.boolean()),  // Houve prorrogação?
    isPenalties: v.optional(v.boolean()),  // Houve pênaltis?
    date: v.string(),                      // Data formatada (DD/MM/AAAA)
    time: v.string(),                      // Hora formatada (HH:MM)
    stadium: v.string(),                   // Nome do estádio
    city: v.string(),                      // Cidade
    country: v.string(),                   // País
    status: v.string(),                    // "agendado", "ao vivo", "encerrado"
    winnerId: v.optional(v.id("teams")),   // ID do time que avançou (relevante no mata-mata)
  })
    .index("by_user", ["userId"])
    .index("by_phase", ["phase"]),

  // Classificação Consolidada (Opcional, para consultas otimizadas)
  standings: defineTable({
    userId: v.optional(v.string()),
    groupId: v.string(),
    teamId: v.id("teams"),
    played: v.number(),
    won: v.number(),
    drawn: v.number(),
    lost: v.number(),
    goalsFor: v.number(),
    goalsAgainst: v.number(),
    goalDifference: v.number(),
    points: v.number(),
  }).index("by_user", ["userId"]),

  // Eventos de Partidas (Gols, Assistências, Cartões por jogador)
  match_events: defineTable({
    userId: v.optional(v.string()),        // ID do Clerk ou "global"
    matchId: v.id("matches"),              // Referência à partida
    teamId: v.id("teams"),                 // Referência ao time do evento
    type: v.string(),                      // "goal", "assist", "yellow_card", "red_card"
    playerName: v.string(),                // Nome do atleta
    minute: v.number(),                    // Minuto do evento
  })
    .index("by_match", ["matchId"])
    .index("by_user", ["userId"]),

  // Inscrições de Notificações Web Push
  push_subscriptions: defineTable({
    userId: v.optional(v.string()),        // ID opcional do usuário autenticado
    endpoint: v.string(),                  // Endpoint da notificação
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  // Histórico de logs de sincronização da API Externa
  api_sync_logs: defineTable({
    timestamp: v.number(),
    status: v.string(),                    // "sucesso" | "erro"
    message: v.string(),
    matchesSynced: v.optional(v.number()),
  }),
});
```

---

## 4. Fluxos de Dados e Regras de Negócio Críticas

### 4.1. Isolamento de Simulação por Usuário
O fluxo de clonagem garante que cada usuário tenha total autonomia para mexer no simulador sem afetar os outros.
- **Template Base**: O arquivo `convex/seed.ts` inicializa o banco de dados criando todos os times e partidas configurando o campo `userId` para `"global"`.
- **Clonagem Dinâmica**: Quando o usuário clica em "Iniciar Simulação" no frontend, chamamos a mutation `convex/simulations.ts:initialize`.
  - Ela deleta qualquer time, partida ou favorito antigo com o `userId` daquele usuário.
  - Busca todos os times e partidas que tenham `userId: "global"`.
  - Salva os times copiados no banco vinculando o `userId` do usuário, mantendo um mapeamento temporário (`Map<ID_Original, ID_Clonado>`).
  - Salva as partidas copiadas atualizando os campos `homeTeamId`, `awayTeamId` e `winnerId` usando o mapa de IDs gerado.
- **Leitura nos Componentes**: Sempre que o cliente renderizar dados, ele deve enviar o `userId` ativo (se logado) ou `"global"` (se visitante/visualizando dados oficiais).

### 4.2. Algoritmo de Cálculo e Desempate de Grupos
À medida que as partidas do grupo são salvas (seja no modo simulação ou global), o sistema deve recalcular as estatísticas dos times do grupo correspondente em tempo real.
- **Mapeamento de Resultados**: Para cada partida atualizada, adicione vitórias, pontos, gols a favor, gols contra e saldo aos respectivos times.
- **Ordenação (Exemplo de Regras Oficiais)**:
  1. Maior número de pontos.
  2. Melhor saldo de gols.
  3. Maior número de gols marcados.
  4. Confronto direto (pontos, saldo e gols marcados apenas entre as equipes empatadas).
  5. Menor número de pontos de disciplina/Fair Play (calculado com base em cartões: Amarelo = -1, Vermelho Indireto = -3, Vermelho Direto = -4, Amarelo + Vermelho Direto = -5).
  6. Sorteio / Ranking Oficial (ex: FIFA Ranking) cadastrado na tabela de times.
- **Atualização**: A cada mudança de placar, atualize o `rank` do time no banco para refletir sua posição (1º, 2º, 3º, 4º) de forma que a UI se atualize em tempo real.

### 4.3. Chaveamento do Mata-Mata Dinâmico (Bracket)
O avanço do mata-mata ocorre com base no encerramento das partidas e na classificação dos grupos.
- **Mapeamento de Placeholders**: No início (fase de grupos), as partidas do mata-mata têm `homeTeamPlaceholder` e `awayTeamPlaceholder` (ex: `"1A"`, `"2B"` - significando 1º do grupo A, 2º do grupo B).
- **Propagação de Grupos para R32 / R16 / Oitavas**:
  - Quando a fase de grupos é concluída (todos os jogos encerrados no perfil), o backend localiza as partidas do mata-mata correspondentes aos placeholders e insere os campos reais `homeTeamId` e `awayTeamId` baseando-se no `rank` calculado dos times nos grupos.
- **Propagação de Vencedores (Mata-Mata subsequente)**:
  - Partidas de mata-mata subsequentes usam placeholders como `"Venc R32-1"` (Vencedor da partida de 32 avos de final #1).
  - Quando a partida anterior é marcada como `status: "encerrado"`, o backend avalia o time vencedor (`winnerId`) e atualiza automaticamente o time correspondente no jogo seguinte.
  - Se for semifinal, os perdedores também são mapeados para a disputa de 3º lugar (`Perd SF-1` e `Perd SF-2`).
- **Disputa de Pênaltis e Prorrogação**:
  - A partida de mata-mata não pode terminar empatada. A interface do usuário e o banco devem permitir o registro de `isExtraTime` (prorrogação) e `isPenalties` (pênaltis), definindo explicitamente o vencedor (`winnerId`) no banco.

### 4.4. Painel do Administrador Seguro (Controle do Template Global)
O template oficial da competição deve ser protegido contra gravações não autorizadas.
- **Validação no Servidor (Convex)**:
  ```typescript
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.email !== "leonardohs.fausto@gmail.com") {
    throw new Error("Não autorizado.");
  }
  ```
- **Validação no Cliente (Next.js)**:
  - Proteja a rota `/admin` verificando o e-mail do usuário Clerk. Caso não coincida, redirecione o usuário ou renderize um estado de acesso negado.
  - O Admin tem controle para editar os placares globais, disparar a sincronização da API externa de futebol e enviar notificações Push globais para todos os usuários inscritos.

### 4.5. Sincronização Automatizada via API e logs
Para manter os placares reais atualizados sem esforço manual:
- **Convex Actions**: Utilize `internalAction` que faça o `fetch` para uma API de resultados externos (ex: API-Football).
- **Mapeamento**: Busque os dados reais e mapeie para os times e jogos do template global (`userId: "global"`). Atualize placares, status ("encerrado", "ao vivo", "agendado") e insira os eventos (`match_events`) correspondentes.
- **CRON**: Configure um agendador (`convex/crons.ts`) que ative a action de sincronização em intervalos específicos (ex: de hora em hora).
- **Logs**: Salve cada tentativa de sincronização na tabela `api_sync_logs` para acompanhamento no painel administrativo.

### 4.6. Mecanismo de Push Notifications no Convex (Evitando Limitações)
- **O problema do Runtime**: Por padrão, o runtime do Convex não suporta certas primitivas do Node que a biblioteca `web-push` requer para cifrar as chaves VAPID.
- **A Solução**: Separe o código de notificações em dois arquivos:
  1. `convex/push.ts`: Contém queries e mutations puras do banco de dados (ex: salvar inscrições, buscar inscrições de um usuário, remover inscrições falhas).
  2. `convex/pushActions.ts`: Começa com a diretiva `"use node"` no topo. Ele atua como uma Action, busca as inscrições chamando a query do Convex e faz os disparos assíncronos usando a biblioteca `web-push`. Se uma inscrição falhar com erro 410/404, dispara uma mutation para apagá-la do banco.

---

## 5. Design e Experiência do Usuário (Aesthetic Premium)

### Visual Premium
- **Tema Escuro Nativo**: Interface imersiva baseada em tons escuros e ricos (ex: HSL tailoreados como azul escuro profundo, grafite e cinza-azulado), evitando preto puro (#000) e cinzas genéricos.
- **Glassmorphism**: Aplicação de efeitos de desfoque de fundo (`backdrop-blur-md`) e bordas semitransparentes nos cards de jogos e painéis de estatísticas.
- **Cores Dinâmicas por Fase**: No mata-mata, mude as bordas ou badges dinamicamente dependendo da fase (R32, R16, Quartas, Semis, Final) para guiar a atenção visual.

### Micro-animações e Interatividade
- **Framer Motion**:
  - Animar a reorganização da tabela de classificação de grupos usando `<motion.div layout>`. Quando um placar é alterado, os times devem deslizar suavemente para suas novas posições.
  - Criar um efeito de transição de "slide" ao alternar as rotas da barra de navegação superior (`top-nav.tsx`).
- **Feedback Visual Instantâneo**:
  - Inputs de placares que mudam de coloração temporariamente ao salvar ou mostram um micro-indicador de carregamento enquanto o Convex sincroniza a informação em tempo real.
  - Estados vazios desenhados com ilustrações ou esqueletos (`skeleton`) elegantes para evitar oscilações de layout.

---

## 6. Configuração e Scripts de Instalação Rápida

### Passos de Execução do Novo Projeto
1. **Inicializar o Repositório**:
   ```bash
   npx -y create-next-app@latest ./ --typescript --eslint --tailwind --src-dir --app --import-alias "@/*"
   ```
2. **Instalar Dependências de Produção**:
   ```bash
   npm install convex @clerk/nextjs @clerk/localizations @clerk/themes lucide-react framer-motion next-themes class-variance-authority clsx tailwind-merge web-push html-to-image
   ```
3. **Instalar Dependências de Desenvolvimento**:
   ```bash
   npm install -D @tailwindcss/postcss tailwindcss @types/web-push
   ```
4. **Configurar o Convex**:
   - Inicialize o Convex rodando: `npx convex dev`
   - Configure o schema (`convex/schema.ts`) e crie o seed com as informações dos times da nova competição (`convex/seed.ts`).
   - Execute o seed para o template global:
     `npx convex run seed:seed`
5. **Configurar Variáveis de Ambiente**:
   No arquivo `.env.local` e no Dashboard do Convex, insira:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` e `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` (para notificações push)
   - `API_FOOTBALL_KEY` (se for sincronizar dados em tempo real)
   - `NEXT_PUBLIC_CONVEX_URL`

### Tratamento do Bug do PWA (Service Worker)
- **Atenção**: Para evitar o erro de travamento/loop de requisições de rede ("ERR_FAILED"), configure o Service Worker (`sw.js`) para **ignorar requisições com modo `navigate`** e requisições que não sejam do tipo `GET` (como requisições WebSocket e mutations do Convex). O Service Worker deve apenas guardar cache estático local e manipular o evento de `push`.

---

## 7. Instruções Adicionais para a IA
- **Preserve as Convenções do Convex**: Siga rigorosamente as diretrizes em `convex/_generated/ai/guidelines.md`. Não misture runtime do Node nas Mutations nativas.
- **SEO Automático**: Adicione metadados em todas as rotas principais (Layout, Grupos, Calendário, Mata-mata e Estatísticas).
- **Tradução**: Mantenha toda a interface em Português do Brasil por padrão.
- **Organização de Pastas**: Concentre todos os arquivos de código-fonte dentro de `src/`, incluindo `src/components`, `src/app`, `src/lib`. Não misture no diretório raiz.
