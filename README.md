# SheetAutomation

Projeto Google Apps Script que recebe notificações do celular via webhook e registra gastos automaticamente em uma planilha do Google Sheets.

Quando uma notificação chega (ex: compra no Nubank, transferência Pix, reembolso), o script faz o parse e escreve uma linha estruturada na planilha — com nome do gasto, valor, método de pagamento e categoria.

---

## Como funciona

```
Notificação → HTTP POST → doPost() → handler → writeRow() → Google Sheets
```

1. A notificação chega como um `POST` JSON para o web app GAS publicado.
2. `doPost()` faz o parse e passa a notificação por uma lista de **handlers**.
3. O primeiro handler que reconhecer a notificação retorna um objeto de linha.
4. A linha é escrita no topo da planilha configurada.

---

## Estrutura do projeto

O código Apps Script fica em `scripts/`. O [clasp](https://github.com/google/clasp) envia essa pasta junto com o manifesto na raiz — o GAS continua vendo um único escopo global (sem imports entre arquivos).

```
scripts/
  post.gs             — doPost, buildRow, writeRow, categorização auxiliar
  configs.gs          — SHEET_NAME, assert, etc.
  notifications.gs    — REGEX, mapas de notificação, HANDLERS (handlers em si)
  utilities.gs        — brlToFloat, compare, etc.
  tests.gs            — runTests()
appsscript.json       — Manifesto do GAS (runtime, webapp, fuso)
.clasp.json.example   — Modelo do clasp; copiar para .clasp.json (não versionado)
package.json          — npm: dependências de dev e comando de teste local
package-lock.json     — Lockfile npm (reprodutibilidade)
.eslintrc.json        — ESLint para ambiente GAS
pushNdeploy.example.sh — Exemplo: push + deploy usando DEPLOYMENT_ID no ambiente
```

---

## Configuração local (clasp e deploy sem expor IDs no Git)

O repositório versiona **modelos**; o que for específico da sua conta fica **fora** do Git (como no `.gitignore`):

| Item | No repositório | No seu disco (não commitado) |
|--------|---------|------------------------------|
| ID do projeto Apps Script (`scriptId`) | `.clasp.json.example` | Copie para `.clasp.json` e preencha o ID (Projeto GAS → Configurações do projeto → IDs). |
| ID da implantação do web app | — | `export DEPLOYMENT_ID='...'` ao usar o script de exemplo, ou um `pushNdeploy.sh` local copiado do `.example`. |

Passos típicos após clonar:

```bash
cp .clasp.json.example .clasp.json
# Edite .clasp.json e coloque o scriptId do seu projeto (ou do projeto compartilhado da equipe).
npm install
clasp login
clasp push
```

Para deploy em uma implantação **versionada** fixa:

```bash
cp pushNdeploy.example.sh pushNdeploy.sh
chmod +x pushNdeploy.sh
# Opção A: export DEPLOYMENT_ID='...' && ./pushNdeploy.sh
# Opção B: editar pushNdeploy.sh só na sua máquina (arquivo ignorado pelo Git)
```

Se esses IDs já entraram em commits antigos, considere tratá-los como expostos (novo deploy, ou revisar histórico com `git filter-repo`/BFG se a política do time exigir).

---

## Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/)
- [clasp](https://github.com/google/clasp) — CLI do Google para Apps Script

```bash
npm install -g @google/clasp
clasp login
```

### Instalar dependências

```bash
npm install
```

Instala `@types/google-apps-script` (autocomplete no VS Code) e `eslint`.

### Enviar código para o Google Apps Script

Na **raiz** do repositório, com `.clasp.json` configurado:

```bash
clasp push
```

Sincroniza `appsscript.json` e todos os `.gs` sob `scripts/` com o projeto vinculado (no modelo, `skipSubdirectories: false`, então subpastas entram no push).

> **Atenção:** `clasp push` só atualiza o código do projeto — ele **não cria um novo deploy**. Se o seu web app estiver configurado com a opção **"Implantar a partir do código mais recente"** (head deployment), o push já torna o código ativo imediatamente. Caso seja um deploy versionado, também é necessário rodar `clasp deploy` para que a nova versão entre em produção.

Para abrir o projeto no editor do GAS:

```bash
clasp open
```

---

## Rodando os testes

Os testes rodam localmente via Node.js — sem precisar do ambiente GAS.

```bash
npm test
```

Concatena os `.gs` na ordem correta (a partir de `scripts/`) e executa com Node. Resultados aparecem no console; falhas mostram um diff entre o esperado e o recebido.

> O test runner carrega `utilities.gs` → `notifications.gs` → `tests.gs` → `configs.gs` → `post.gs` juntos, reproduzindo o comportamento do GAS que trata todos os arquivos como um escopo global único.

---

## Adicionando um novo arquivo

O GAS trata todos os arquivos `.gs` do projeto como um único escopo global — não há imports. Para adicionar um novo arquivo:

1. Crie `scripts/seuarquivo.gs`.
2. Adicione-o ao `cat` no script `test` do `package.json`, na ordem correta (antes de qualquer arquivo que dependa dele):

```json
"test": "cd scripts && node -e \"$(cat utilities.gs notifications.gs seuarquivo.gs tests.gs configs.gs post.gs)\""
```

3. Rode `npm test` e, em seguida, `clasp push` na raiz do projeto.

---

## Adicionando um novo handler de notificação

A lógica vive em `scripts/notifications.gs`: constantes de regex (`NU_NOTIFICATIONS`, `CAJU_NOTIFICATIONS`, etc.), mapas opcionais (`CATEGORY_MAP`, `COMMON_NAME_MAP`) e o array **`HANDLERS`**, onde cada item é uma função que retorna `null` se não aplicar ou um objeto de linha se aplicar. `buildRow` em `post.gs` percorre **`HANDLERS` na ordem** — o **primeiro** handler que devolver dados ganha.

Fluxo recomendado:

1. **Regex / estrutura** — Adicione entradas no mapa certo (ex.: `NU_NOTIFICATIONS` para Nubank), reutilizando `REGEX.brlValue` quando fizer sentido. Para outro app, um mapa novo (como `CAJU_NOTIFICATIONS`) mantém o mesmo estilo.
2. **Categorização** — Se precisar normalizar nome ou categoria/descrição pela planilha, estenda `COMMON_NAME_MAP` e/ou `CATEGORY_MAP` conforme os handlers existentes.
3. **Handler** — Inclua uma nova função no array `HANDLERS` em `notifications.gs` (no mesmo padrão dos existentes: `NuEstorno`, `CompraNuPay`, `CajuPagamento`, etc.).
4. **Testes** — Para **cada** novo handler, adicione pelo menos um `compare(buildRow(...), { ... })` em `scripts/tests.gs` (em uma função `test...` e chame-a a partir de `runTests()`, como nos testes atuais). Assim o comportamento fica fixado e o `npm test` cobre o caso.

**Exemplo — mapa + handler** (`notifications.gs`; ajuste grupos de captura ao seu `title`/`body`):

```js
// Dentro de NU_NOTIFICATIONS (ou outro mapa), defina title/body:
minhaNovaRegra: {
	title: /Título esperado/,
	body: /R\$ (\d[...]) em (.+)\./,
},

// Novo item em HANDLERS (ordem importa — mais específicos antes dos genéricos):
MinhaNovaRegra = (notification) => {

	const titleMatch = notification.title.match(NU_NOTIFICATIONS.minhaNovaRegra.title);
	const bodyMatch = notification.body.match(NU_NOTIFICATIONS.minhaNovaRegra.body);

	if (!titleMatch || !bodyMatch) return null;

	return {
		value: -brlToFloat(bodyMatch[1]),
		expenseName: bodyMatch[2],
		paymentMethod: "Crédito",
	};
},
```

**Exemplo — teste** (`tests.gs`):

```js
function testMinhaNovaRegra() {
	compare(
		buildRow({
			title: "Título da notificação",
			body: "Corpo da notificação",
			app_name: "Nu",
		}),
		{
			expenseName: "Nome esperado",
			value: -16.57,
			paymentMethod: "Crédito",
		}
	);
}

// Em runTests():
//   testMinhaNovaRegra();
```

O objeto retornado pelo handler é mesclado com `ROW_DEFAULTS` e com o resultado de `resolveCategoryAndDescription` em `post.gs` — em geral você só precisa dos campos que quer sobrescrever:

| Campo                | Padrão                         |
|----------------------|--------------------------------|
| `expenseName`        | `"No name assigned"`           |
| `value`              | `0.0`                          |
| `paymentMethod`      | `"No payment method assigned"` |
| `expenseDescription` | `""`                           |
| `expenseCategory`    | `""`                           |
| `note`               | `"Added automatically."`       |

Depois: `npm test`, `clasp push` e, se usar deploy versionado, `clasp deploy` ou o script de deploy com `DEPLOYMENT_ID`.

---

## Configuração do VS Code

Instale estas extensões pelo marketplace:

- **ESLint** — detecta variáveis não definidas e outros problemas antes de rodar o código
- **Prettier** — formata automaticamente ao salvar (opcional)
- **GitLens** — histórico git mais legível (opcional)

Os tipos das APIs do GAS (`SpreadsheetApp`, `ContentService`, etc.) vêm do pacote npm já incluso em `devDependencies`:

```bash
npm install --save-dev @types/google-apps-script
```

O VS Code reconhece automaticamente — nenhuma extensão necessária. O `.eslintrc.json` já está configurado com `"env": { "googleappsscript": true }` para que o ESLint saiba que esses globals são válidos.
