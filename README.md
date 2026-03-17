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

```
post.gs           — Entry point e lógica de construção de linhas
configs.gs        — Configurações globais (SHEET_NAME, assert, constantes)
notifications.gs  — Handlers para cada tipo de notificação
utilities.gs      — Funções utilitárias (brlToFloat, compare, etc.)
tests.gs          — Casos de teste, chamados via runTests()
appsscript.json   — Manifesto do GAS
.clasp.json       — Config do clasp (vincula ao projeto GAS)
package.json      — Config do npm (dependências de dev, script de teste)
.eslintrc.json    — Config do ESLint para ambiente GAS
```

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

```bash
clasp push
```

Sincroniza todos os arquivos `.gs` e `.json` locais com o projeto GAS vinculado (configurado em `.clasp.json`).

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

Concatena todos os arquivos `.gs` na ordem correta e os executa com Node. Resultados aparecem no console; falhas mostram um diff entre o esperado e o recebido.

> O test runner funciona carregando `utilities.gs` → `notifications.gs` → `tests.gs` → `configs.gs` → `post.gs` juntos, reproduzindo o comportamento do GAS que trata todos os arquivos como um escopo global único.

---

## Adicionando um novo arquivo

O GAS trata todos os arquivos `.gs` do projeto como um único escopo global — não há imports. Para adicionar um novo arquivo:

1. Crie um `seuarquivo.gs` na raiz do projeto.
2. Adicione-o ao comando `cat` no script `test` do `package.json`, na ordem correta (antes de qualquer arquivo que dependa dele):

```json
"test": "node -e \"$(cat utilities.gs notifications.gs seuarquivo.gs tests.gs configs.gs post.gs)\""
```

3. Rode `clasp push` para enviar ao GAS.

---

## Adicionando um novo handler de notificação

1. **Adicione o padrão regex** em `NU_NOTIFICATIONS` no `post.gs`:

```js
const NU_NOTIFICATIONS = {
    // ...padrões existentes...
    minhaNovaNotificacao: {
        title: /Regex do título aqui/,
        body: /Regex do corpo aqui com (grupos de captura)/,
    },
};
```

2. **Adicione a função handler** em `notifications.gs`:

```js
function MeuNovoHandler(notification) {
    const titleMatch = notification.title.match(NU_NOTIFICATIONS.minhaNovaNotificacao.title);
    const bodyMatch = notification.body.match(NU_NOTIFICATIONS.minhaNovaNotificacao.body);

    if (!titleMatch || !bodyMatch) return null;

    return {
        value: -brlToFloat(bodyMatch[1]),
        expenseName: bodyMatch[2],
        paymentMethod: "Crédito",
    };
}
```

O objeto retornado é mesclado com `ROW_DEFAULTS` — só é necessário especificar os campos que quer sobrescrever. Campos disponíveis por padrão, mas você pode modificá-los para que faça sentido com a sua planilha:

| Campo                | Padrão                         |
|----------------------|--------------------------------|
| `expenseName`        | `"No name assigned"`           |
| `value`              | `0.0`                          |
| `paymentMethod`      | `"No payment method assigned"` |
| `expenseDescription` | `""`                           |
| `expenseCategory`    | `""`                           |
| `note`               | `"Added automatically."`       |

3. **Registre o handler** no array `HANDLERS` em `post.gs`:

```js
const HANDLERS = [
    NuReembolsoTransferencia,
    NuEstorno,
    CompraNuCreditoDebito,
    MeuNovoHandler, // adicionar aqui
];
```

4. **Adicione um caso de teste** em `tests.gs`:

```js
compare(buildRow({
    title: "Título da notificação",
    body: "Corpo da notificação",
    app_name: "Nu"
}), {
    expenseName: "Nome esperado",
    value: -16.57,
    paymentMethod: "Crédito",
});
```

5. Rode `npm test` para verificar, depois `clasp push` para publicar e `clasp deploy` pra atualizar a versão ativa.

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
