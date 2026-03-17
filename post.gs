// https://claude.ai/chat/a4a70733-b44f-4bba-b5e5-87cb84b1af4e

// NOTE - Google Script não suporta console.assert(), mas pra testar é melhor usar!
const USING_ASSERT = true;
const assert = USING_ASSERT ? console.assert : custom_assert;

// NOTE - Set pra true se quiser parar no primeiro erro quando testando direto no Google Script
const ASSERT_ERROR_THROWS_EXCEPTION = false;

const SHEET_NAME = "Gastos de 17/02 à 17/03 Novo";

// ─── Entry Point ─────────────────────────────────────────────────────────────

function doPost(e) {

	try {
		const notification = JSON.parse(e.postData.contents);

		const row = buildRow(notification);
		if (!row) return respondWithJSON({ status: "ignored" });

		writeRow(row);

		return respondWithJSON(row);
	}

	catch (err) {
		return respondWithJSON({ status: "error", message: err.toString() });
	}
}

// ─── Sheet ───────────────────────────────────────────────────────────────────

function writeRow(row) {
	const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
	const range = sheet.getRange(2, 1, 1, Object.keys(row).length);
	range.insertCells(SpreadsheetApp.Dimension.ROWS);
	range.setValues([Object.values(row)]);
}

// ─── Row Building ────────────────────────────────────────────────────────────

function buildRow(notification) {

	for (const handler of HANDLERS) {
		const rowData = row(notification, handler);
		if (rowData) return rowData;
	}
	
	return null;
}

function row(notification, handlerFunction) {
	
	const handler = handlerFunction(notification);
	if (!handler) return null;

	return {
		...ROW_DEFAULTS,
		date: new Date(),
		...handler,
		...resolveCategoryAndDescription(handler.expenseName ?? "")
	};
}

function resolveCategoryAndDescription(expenseName) {

	for (const [category, names] of Object.entries(CATEGORY_MAP)) {
		if (names.some(name => expenseName.includes(name))) {
			return { expenseCategory: category };
		}
	}

	return { expenseCategory: "" };
}

runTests();