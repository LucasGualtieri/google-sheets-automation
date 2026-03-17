// https://claude.ai/chat/a4a70733-b44f-4bba-b5e5-87cb84b1af4e

// NOTE - Google Script não suporta console.assert(), mas pra testar é melhor usar!
const USING_ASSERT = true;
const assert = USING_ASSERT ? console.assert : custom_assert;

// NOTE - Set pra true se quiser parar no primeiro erro quando testando direto no Google Script
const ASSERT_ERROR_THROWS_EXCEPTION = false;

const SHEET_NAME = "Gastos de 17/02 à 17/03 Novo";