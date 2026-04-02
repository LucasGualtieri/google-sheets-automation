// TODO - Puxar da branch do Gemini a forma automatizada de fazer isso
const SHEET_NAME = "Gastos de 17/03/26 à 17/04/26 Novo";

const RUNNING_LOCALLY =
	typeof process !== "undefined" &&
	typeof process.versions?.node === "string";

const ASSERT_ERROR_THROWS_EXCEPTION = false; // Set pra true se quiser parar no primeiro erro quando testando direto no Google Script
const USING_ASSERT = RUNNING_LOCALLY; // Google Script não suporta console.assert(), mas pra testar é melhor usar!
const assert = USING_ASSERT ? console.assert : custom_assert;