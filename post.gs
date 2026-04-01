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

function writeRow(row) {
	const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
	const range = sheet.getRange(2, 1, 1, Object.keys(row).length);
	range.insertCells(SpreadsheetApp.Dimension.ROWS);
	range.setValues([[
		row.expenseName,
		row.value,
		row.date,
		row.paymentMethod,
		row.expenseDescription,
		row.expenseCategory,
		row.note,
	]]);
}

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
	const expenseName = resolveCommonExpenseName(handler.expenseName ?? "");

	return {
		...ROW_DEFAULTS,
		date: new Date(),
		...handler,
		expenseName,
		...resolveCategoryAndDescription(handler.expenseName)
	};
}

function resolveCommonExpenseName(expenseName) {

	const lower = expenseName.toLowerCase();

	for (const { expectedExpenseName: normalizedExpenseName, names } of Object.values(COMMON_NAME_MAP)) {
		if (names.some(name => lower.includes(name.toLowerCase()))) {
			return normalizedExpenseName;
		}
	}

	return expenseName;
}

function resolveCategoryAndDescription(expenseName) {

	const lower = expenseName.toLowerCase();

	for (const { expenseCategory, expenseDescription, names } of Object.values(CATEGORY_MAP)) {
		if (names.some(name => lower.includes(name.toLowerCase()))) {
			return { expenseCategory, expenseDescription };
		}
	}

	return { expenseCategory: "", expenseDescription: "" };
}

runTests();