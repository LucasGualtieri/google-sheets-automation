const SHEET_NAME = "Gastos de 17/03/26 à 17/04/26 Novo";
const RUNNING_ON_GAS = false;
const SKIP_GEMINI = false && !RUNNING_ON_GAS;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_KEY_LOCAL = "AIzaSyBEcrcgt9SXiJWUkXGubbK0OD5G0L2QM68";
const ASSERT_ERROR_THROWS_EXCEPTION = false; // Set pra true se quiser parar no primeiro erro quando testando direto no Google Script
const USING_ASSERT = !RUNNING_ON_GAS; // Google Script não suporta console.assert(), mas pra testar é melhor usar!
const assert = USING_ASSERT ? console.assert : custom_assert;