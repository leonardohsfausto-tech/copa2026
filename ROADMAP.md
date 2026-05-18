# 🏆 Master Roadmap: SaaS Copa do Mundo 2026

Este documento centraliza as melhorias e novas funcionalidades projetadas para o simulador da Copa do Mundo 2026. A visão é consolidar um produto SaaS extremamente fluido, moderno e focado em um único propósito: entregar a melhor e mais rápida experiência de simulação e acompanhamento da Copa.

---

## ✅ Fases Concluídas (Resumo)

Os itens abaixo representam a fundação do nosso produto e já estão finalizados:

- **(  x  )** Multi-Tenant & Isolamento de Dados: Transição concluída para um modelo SaaS no Convex. Cada usuário logado possui uma simulação completamente independente.
- **(  x  )** PWA, SEO & Performance: Implementação de Service Worker, `manifest.json`, suporte total para instalação em dispositivos mobile, design "Deep Black" responsivo e SEO otimizado.

---

## ⏳ Pendentes e Pausadas (Pipeline de Desenvolvimento)

A tabela a seguir apresenta os recursos mapeados para as próximas iterações. Eles englobam a integração completa com dados reais e melhorias premium focadas em engajamento e retenção da plataforma SaaS.

| Status | Funcionalidade                             | Categoria            | Impacto   |
| :----: | :----------------------------------------- | :------------------- | :-------- |
| (    ) | 1. Configuração Final de Domínio e Infra   | Infra / Produção     | Essencial |
| (  x  ) | 2. Integração com API de Resultados Reais  | Backend / Automação  | Alto      |
| (  x  ) | 3. Telas de Estatísticas Oficiais          | Frontend / UI        | Alto      |
| (  x  ) | 4. Notificações Push (Início/Fim de Jogos) | UX / Retenção        | Médio     |
| (  x  ) | 5. Painel Analítico Simples (SaaS Admin)   | Gestão / Admin       | Baixo     |
| ( ⏸️ ) | 6. Compartilhamento Social (Palpites)      | Marketing            | Médio     |

---

## 📖 Detalhamento de Iniciativas

Abaixo, um aprofundamento estratégico de cada item listado na tabela, organizados para garantir que a plataforma permaneça profissional, enxuta e alinhada ao escopo do simulador.

### 1. Configuração Final de Domínio e Infra
**Status:** (   ) Pendente
Para que a plataforma ganhe a tração e credibilidade esperadas, o ambiente de produção precisa do seu setup definitivo.
*   **Ação:** Apontamento do domínio oficial (ex: `simuladorcopa2026.com.br`) para os servidores da Vercel.
*   **Ação:** Sincronização rigorosa das variáveis de ambiente de produção (Clerk e Convex) baseadas no domínio final para evitar problemas de CORS e garantir a autenticação imaculada do SaaS.

### 2. Integração com API de Resultados Reais
**Status:** ( x ) Concluído
Sendo um produto premium, o aplicativo brilhará ao atuar não apenas como simulador, mas também como uma fonte segura de acompanhamento histórico em tempo real da vida real.
*   **Ação:** Criação de CRON Jobs no Convex para buscar dados de APIs esportivas de forma programada.
*   **Ação:** Atualizar automaticamente uma base isolada (do Perfil Global) com placares reais.
*   **Ação:** Registrar autoria de gols, assistências, cartões amarelos e vermelhos alimentando uma tabela estruturada.

### 3. Telas de Estatísticas Oficiais
**Status:** ( x ) Concluído
Traduzir os dados capturados pela API em uma experiência visual "premium" e rica, focada em manter o usuário na plataforma enquanto assiste aos jogos.
*   **Ação:** Criação de uma aba de navegação ou modal de "Dados Oficiais" que servirá apenas para leitura.
*   **Ação:** Design de tabelas sofisticadas mostrando a **Artilharia**, líderes em **Assistências** e painel de punições/fair play (**Cartões**).
*   **Ação:** Adicionar detalhes expandidos nos cards de jogos reais, mostrando quem fez os gols em qual minuto.

### 4. Notificações Push (Nova Melhoria)
**Status:** ( x ) Concluído
Estratégia para manter o usuário engajado durante os dias de jogos usando a infraestrutura do PWA já existente.
*   **Ação:** Solicitar permissão de envio de notificações ao usuário através de um modal elegante e não intrusivo.
*   **Ação:** Enviar alertas estratégicos: *"A Copa começou!"* ou *"Fim de Jogo: Atualize suas simulações com os últimos resultados"*.
*   **Ação:** Arquitetura leve e simples baseada em Web Push API.

### 5. Painel Analítico Simples - SaaS Admin (Nova Melhoria)
**Status:** ( x ) Concluído
Toda operação SaaS precisa de uma visão clara sobre o seu crescimento e retenção em um dashboard protegido.
*   **Ação:** Uma rota oculta (ex: `/admin`) protegida, acessível apenas pela sua conta master pré-configurada no Clerk.
*   **Ação:** Acompanhamento métrico simples: novos usuários cadastrados por dia, total de usuários e simulações ativas no banco de dados.
*   **Ação:** Foco no monitoramento direto da plataforma, sem a necessidade de logar e gerenciar dashboards no Vercel ou Convex.

### 6. Compartilhamento Social de Palpites
**Status:** ( ⏸️ ) Pausado
O recurso de transformar a chave completa de simulação em uma imagem altamente customizada para gerar marketing orgânico via WhatsApp e Instagram.
*   **Situação:** O desenvolvimento inicial encontrou algumas barreiras técnicas com o renderizador de cores modernas (como `lab()`) no conversor de HTML para Canvas.
*   **Próximos Passos:** Ele está pausado até ser re-arquitetado. Será necessária uma abordagem onde o DOM seja limpo de formatações incompatíveis antes da captura para não comprometer a estética visual da imagem final.
