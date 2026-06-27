# OpenDecision Frontend — Especificação Completa

## 📋 Visão Geral

Uma **aplicação visual no-code** onde analistas de negócios desenham fluxos de priorização de dados conectando nós (Node-Based UI). O resultado é um JSON publicável que o backend (Golang) executa.

**Usuário-Alvo:** Analista de negócios, não-desenvolvedor, intuitivo e visual.

---

## 🏗️ 1. Arquitetura de Stack

### Obrigatório
- **Frontend Framework:** React 18+ com TypeScript
- **Build Tool:** Vite (não SSR — SPA 100% client-side)
- **Visual Editor:** `@xyflow/react` (React Flow v12+)
- **State Management:** Zustand
- **UI/Styling:** Tailwind CSS + Headless UI + lucide-react (ícones)
- **HTTP Client:** axios ou fetch nativo

### Por Quê?
- React Flow é a melhor biblioteca para node-based UIs
- Vite compila rápido e gera `/dist` estático (será embutido no binário Go)
- Zustand é leve e não requer boilerplate (Redux é overkill)
- Tailwind + Headless UI = estilo profissional sem CSS custom

---

## 📦 2. Contrato de Dados (I/O)

### ➡️ Input: Backend → Frontend (GET /pipelines)
```json
{
  "id": "uuid-aqui",
  "name": "Priorização Crédito",
  "description": "Filtra e ordena leads por lucro estimado",
  "steps": [
    {"op": "filter", "expression": "score >= 60"},
    {"op": "compute", "property": "priority", "expression": "score * weight"},
    {"op": "sort", "property": "priority", "direction": "desc"}
  ],
  "created_at": "2026-06-27T...",
  "updated_at": "2026-06-27T..."
}
```

### ⬅️ Output: Frontend → Backend (POST /pipelines)
```json
{
  "name": "Minha Estratégia",
  "description": "Qualificar leads de vendas",
  "steps": [
    {
      "op": "filter",
      "expression": "score >= 60 && status == 'active'"
    },
    {
      "op": "compute",
      "property": "priority",
      "expression": "score * 2 + bonus"
    },
    {
      "op": "sort",
      "property": "priority",
      "direction": "desc"
    }
  ]
}
```

**Nota:** O frontend lê do grafo visual e **gera apenas o JSON de `steps`**. O backend cuida do resto.

---

## 🎨 3. Estrutura de Componentes

### Hierarquia
```
<App>
  ├── <Header/>
  │   ├── Logo + Título
  │   └── Botões: Nova, Salvar, Executar, Publicar
  │
  ├── <MainLayout>
  │   ├── <EditorPanel> (70%)
  │   │   └── <ReactFlow>
  │   │       ├── Nós de operações (Filter, Compute, Sort)
  │   │       └── Conexões entre nós
  │   │
  │   └── <SidebarPanel> (30%)
  │       ├── <NodePalette> — drag & drop nós
  │       ├── <PropertyPanel> — edita nó selecionado
  │       └── <PreviewPanel> — mostra JSON gerado
  │
  ├── <Modal/Dialog>
  │   ├── Criar nova estratégia
  │   ├── Abrir estratégia salva
  │   ├── Testar (execute com dados sample)
  │   └── Publicar (POST ao backend)
  │
  └── <Toast/Notifications>
      └── Feedback de ações (salvo, erro, etc)
```

---

## 🧩 4. Tipos TypeScript

```typescript
// Operações suportadas (alinhadas com decisionlib)
type OperationType = "filter" | "compute" | "sort";

// Um nó no editor (ReactFlow Node)
interface PipelineNode {
  id: string; // "filter_1", "compute_2", "sort_3"
  type: OperationType;
  position: { x: number; y: number };
  data: NodeData;
}

// Dados específicos de cada tipo de nó
interface NodeData {
  label: string;
  
  // Filter
  expression?: string; // "age >= 30"
  
  // Compute
  property?: string;   // "bonus"
  computeExpr?: string; // "salary * 0.1"
  
  // Sort
  sortBy?: string;     // "age"
  direction?: "asc" | "desc";
}

// Conexão entre nós
interface PipelineEdge {
  id: string;
  source: string; // id do nó anterior
  target: string; // id do nó seguinte
}

// Pipeline completa (estado global)
interface Strategy {
  id: string;
  name: string;
  description: string;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  createdAt: Date;
  updatedAt: Date;
}

// O que enviamos ao backend
interface StrategyPayload {
  name: string;
  description: string;
  steps: Array<{
    op: OperationType;
    expression?: string;
    property?: string;
    direction?: string;
  }>;
}

// Resposta do backend ao testar
interface ExecutionResult {
  result: Record<string, any>[];
  elapsed_ms: number;
  error?: string;
}
```

---

## 🎯 5. Fluxo de Usuário (UX Flow)

### Cenário 1: Criar nova estratégia
```
1. Click "Nova Estratégia"
2. Abre modal com campo "Nome" + "Descrição"
3. Cria Strategy vazia no Zustand
4. Mostra canvas vazio

5. User arrasta nó "Filter" da paleta para o canvas
6. Clica no nó, abre PropertyPanel
7. Digita expressão: "score >= 60"
8. Arrasta nó "Sort" para o canvas
9. Clica em Sort, define:
   - Propriedade: "score"
   - Direção: "DESC"
10. Clica em "Sort" e arrasta para "Filter" (cria aresta)

11. Click "Publicar"
12. Frontend compila grafo → steps JSON
13. POST /pipelines com payload
14. Backend salva em DynamoDB
15. Toast: "Estratégia publicada com sucesso!"
```

### Cenário 2: Abrir e editar existente
```
1. Click "Abrir"
2. Modal lista estratégias do backend (GET /pipelines)
3. User seleciona uma
4. Frontend converte steps JSON → nodes + edges no canvas
5. User edita nós
6. Click "Atualizar" ou "Publicar como Nova"
```

### Cenário 3: Testar antes de publicar
```
1. User preenche dados de teste (JSON ou CSV)
2. Click "Executar Test"
3. Frontend faz POST /execute com:
   - data: dados de teste
   - steps: JSON compilado do grafo
4. Backend executa e retorna resultado
5. Frontend mostra resultado em tabela/JSON viewer
```

---

## 🔧 6. Especificação por Tipo de Nó

### 6.1 Node: Filter
```
┌─────────────────────┐
│      🔍 FILTER      │
│                     │
│ Expression:         │
│ [age >= 30 &&...]   │
│                     │
└─────────────────────┘

Inputs: 
  - expression: string (expressão booleana)
  
Validação:
  - Campo obrigatório
  - Sintaxe básica check (parênteses balanceados)

Output step:
  {
    "op": "filter",
    "expression": "age >= 30"
  }
```

### 6.2 Node: Compute
```
┌─────────────────────────┐
│    🧮 COMPUTE          │
│                         │
│ Property: [bonus]      │
│ Expression: [sal*0.1]  │
│                         │
└─────────────────────────┘

Inputs:
  - property: string (nome do campo a criar/alterar)
  - expression: string (expressão matemática/lógica)

Suporte a dot notation:
  - property: "person.score" é válido

Output step:
  {
    "op": "compute",
    "property": "bonus",
    "expression": "salary * 0.1"
  }
```

### 6.3 Node: Sort
```
┌──────────────────────┐
│   ↕️ SORT            │
│                      │
│ Sort by: [salary]   │
│ Direction: [DESC ▼] │
│                      │
└──────────────────────┘

Inputs:
  - sortBy: string (propriedade para ordenar)
  - direction: "asc" | "desc" (dropdown)

Output step:
  {
    "op": "sort",
    "property": "salary",
    "direction": "desc"
  }
```

---

## 🎨 7. UI/UX Detalhes

### Header
```
┌─────────────────────────────────────────────────────────┐
│  [Logo] OpenDecision    │ Minha Estratégia v1.2       │
│                         │                              │
│  [Nova] [Abrir] [Salvar] [Testar] [Publicar] [Config] │
└─────────────────────────────────────────────────────────┘
```

### Left Panel (Node Palette)
```
┌──────────────────┐
│  OPERAÇÕES       │
│  ────────────    │
│ 🔍 Filter        │ ← draggable
│ 🧮 Compute       │
│ ↕️ Sort           │
│                  │
│  HELP            │
│ [?] Documentação │
└──────────────────┘
```

### Right Panel (Property Editor)
```
┌──────────────────────────┐
│  PROPRIEDADES            │
│  ────────────────────    │
│  Nó: Filter_1           │
│  ────────────────────    │
│  Expression:             │
│  [age >= 30 ...]        │
│                          │
│  [Validar] [Deletar]    │
└──────────────────────────┘

(Muda conteúdo baseado no tipo de nó selecionado)
```

### Bottom Preview
```
┌────────────────────────────────────────┐
│ JSON GERADO                            │
│ ────────────────────────────────────   │
│ {                                      │
│   "steps": [                           │
│     {"op": "filter", ...},             │
│     {"op": "compute", ...},            │
│     {"op": "sort", ...}                │
│   ]                                    │
│ }                                      │
└────────────────────────────────────────┘
```

---

## 📁 8. Estrutura de Pastas

```
web/                          ← Frontend SPA
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   │
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── EditorPanel.tsx
│   │   ├── SidebarPanel.tsx
│   │   ├── NodePalette.tsx
│   │   ├── PropertyPanel.tsx
│   │   ├── PreviewPanel.tsx
│   │   ├── modals/
│   │   │   ├── CreateStrategy.tsx
│   │   │   ├── OpenStrategy.tsx
│   │   │   ├── TestExecute.tsx
│   │   │   └── Publish.tsx
│   │   └── nodes/
│   │       ├── FilterNode.tsx
│   │       ├── ComputeNode.tsx
│   │       └── SortNode.tsx
│   │
│   ├── stores/
│   │   └── strategyStore.ts    ← Zustand (nós, arestas, compilação)
│   │
│   ├── hooks/
│   │   ├── useCompiler.ts      ← Converte grafo → JSON
│   │   ├── useBackendAPI.ts    ← Calls GET/POST/PUT/DELETE
│   │   └── useLocalStorage.ts  ← Persiste drafte
│   │
│   ├── types/
│   │   └── index.ts            ← TypeScript types
│   │
│   ├── utils/
│   │   ├── validators.ts       ← Valida expressões
│   │   ├── compiler.ts         ← Lógica de compilação grafo
│   │   └── api.ts              ← Client HTTP
│   │
│   └── styles/
│       └── globals.css         ← Tailwind config
│
├── public/
│   └── index.html
│
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 🔌 9. Integração com Backend

### Endpoints Consumidos
```
GET  /pipelines          → Listar estratégias
GET  /pipelines/{id}     → Abrir uma
POST /pipelines          → Publicar nova
PUT  /pipelines/{id}     → Atualizar existente
POST /execute            → Testar com dados sample
GET  /health             → Verificar servidor pronto
```

### Como Chama
```typescript
// api.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const api = {
  listStrategies: () => 
    fetch(`${API_BASE}/pipelines`).then(r => r.json()),
  
  getStrategy: (id: string) =>
    fetch(`${API_BASE}/pipelines/${id}`).then(r => r.json()),
  
  publishStrategy: (payload: StrategyPayload) =>
    fetch(`${API_BASE}/pipelines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(r => r.json()),
  
  executeTest: (steps: any[], data: any[]) =>
    fetch(`${API_BASE}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps, data })
    }).then(r => r.json())
};
```

---

## 🎯 10. Funcionalidades Principais

### ✅ Must Have (MVP)
- [ ] Canvas vazio com React Flow
- [ ] Drag & drop nós (Filter, Compute, Sort)
- [ ] Conectar nós com arestas
- [ ] Property panel edita nó selecionado
- [ ] Gera JSON compilado
- [ ] POST /pipelines (publicar)
- [ ] GET /pipelines (listar existentes)
- [ ] Local storage (draft auto-save)

### 🔄 Nice to Have (Post-MVP)
- [ ] Undo/Redo (Zustand history)
- [ ] Teste executar com dados sample
- [ ] Validação de expressões em tempo real
- [ ] Histórico de versões
- [ ] Share/export JSON
- [ ] Dark mode

### ⚡ Future
- [ ] Nós customizados de usuário
- [ ] Webhooks / integração SQS
- [ ] Colaboração em tempo real

---

## 🚀 11. Build & Deployment

### Dev
```bash
npm install
npm run dev          # Abre em http://localhost:5173
```

### Build
```bash
npm run build        # Gera /dist com index.html + assets
```

### Embed no Golang
```go
//go:embed web/dist
var webFS embed.FS

// No servidor HTTP
srv.Get("/*", http.FileServer(...))
```

---

## 📝 12. Constrangimentos & Decisões

| Tema | Decisão | Razão |
|------|---------|-------|
| SSR | NÃO | Será embutido em binário Go com `go:embed` |
| Componentes UI | Headless UI | Maximal control, minimal dependencies |
| State | Zustand | Leve, sem boilerplate (Redux overkill) |
| Styling | Tailwind | Rápido, consistente, combina com chi |
| Canvas | React Flow | Melhor solução node-based |
| Tipos | TypeScript | Type-safe, melhor DX |

---

## 🎬 Próximo Passo

Depois de aprovada esta especificação, começaremos:

1. Criar estrutura com `npm create vite@latest`
2. Instalar dependências (React, React Flow, Zustand, Tailwind, etc)
3. Implementar componentes base
4. Integração com backend

**Está tudo claro?** Quer que eu comece a implementação? 🚀