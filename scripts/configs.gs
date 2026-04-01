const SHEET_NAME = "Gastos de 17/03/26 à 17/04/26 Novo";
const ASSERT_ERROR_THROWS_EXCEPTION = false; // Set pra true se quiser parar no primeiro erro quando testando direto no Google Script
const USING_ASSERT = false; // Google Script não suporta console.assert(), mas pra testar é melhor usar!
const assert = USING_ASSERT ? console.assert : custom_assert;