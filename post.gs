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
	range.setValues([Object.values(row)]);
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