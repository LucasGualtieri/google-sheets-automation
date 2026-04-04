const SHEET_NAME = "Gastos de 17/03/26 à 17/04/26 Novo";
const BILLING_CLOSE_DAY = 17;

const RUNNING_LOCALLY =
	typeof process !== "undefined" &&
	typeof process.versions?.node === "string";


// Google Script não suporta console.assert(), mas pra testar localmente é melhor
const assert = RUNNING_LOCALLY ? console.assert : custom_assert;

// Set pra true se quiser parar no primeiro erro quando testando direto no Google Script
const ASSERT_ERROR_THROWS_EXCEPTION = false;
