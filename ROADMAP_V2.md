# Roadmap e Visão Pós-MVP - Copa do Mundo 2026

Este documento mapeia as melhorias e novas funcionalidades que podem elevar o simulador da Copa do Mundo 2026 do nível atual (MVP Funcional) para um produto maduro, escalável e altamente engajador.

---

## ✅ Realizado

### 2. Isolamento de Dados por Usuário (Simulações Privadas)
O app agora é um verdadeiro SaaS multi-usuário. Quando um usuário faz login, ele trabalha em sua própria simulação sem afetar os dados globais ou de outros usuários.
- **Implementação:** Schema do Convex modificado para incluir `userId` e mutações ajustadas para clonar dados oficiais para novos usuários.

### 6. Otimização de Performance, SEO e PWA
Site instalável (PWA) e otimizado para motores de busca.
- **Implementação:** Arquivo `manifest.json`, Service Worker, sitemap, robots.txt e metadata robusto (Open Graph/Twitter).

---

## ⏳ Pendente

### 1. Migração para Produção e Segurança (Domínio Customizado)
Configurar o domínio final e as chaves de produção definitivas no Clerk e Convex.
- **Impacto:** 🔴 Alto (Fundamental para credibilidade)
- **Status:** Infraestrutura preparada, aguardando apontamento de domínio.

### 3. Compartilhamento Social (Exportar Palpites) - ⏸️ Pausado
Permitir que o usuário compartilhe seus palpites em formato de imagem.
- **Status:** Removido temporariamente para reavaliação da implementação técnica.

### 4. Integração com API Externa de Resultados Reais
Atualização automática dos jogos oficiais durante o torneio.
- **Impacto:** 🔴 Alto (Retenção durante o evento)
- **O que fazer:** Criar CRON jobs para consumir APIs de esportes e atualizar o banco.

### 5. Gamificação e Sistema de Ranking (Bolão)
Transformar o simulador em uma competição de pontos entre usuários.
- **Impacto:** 🔴 Alto (Garante retorno diário)
- **O que fazer:** Criar sistema de pontuação, algoritmos de cálculo e ranking global/privado.

### 7. Estatísticas Detalhadas (Artilharia e Assistências)
Registro de autores de gols e cartões.
- **Impacto:** 🟢 Baixo (Funcionalidade de nicho)
- **O que fazer:** Adicionar tabelas de jogadores e interface de edição de estatísticas por partida.

---

## Resumo do Caminho Crítico Recomendado:
Com o **Item 2** (Isolamento de Dados) concluído, o foco agora deve ser o **Item 1** para o lançamento oficial. Em seguida, a **Gamificação (Item 5)** é o que trará mais engajamento para a plataforma.
