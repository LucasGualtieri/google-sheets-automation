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
		row.transaction,
		row.amount,
		row.dateTime,
		row.source,
		row.category,
		row.type,
		row.notes,
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
	const transaction = resolveCommonTransactionName(handler.transaction ?? "");

	return {
		...ROW_DEFAULTS,
		dateTime: new Date(),
		...handler,
		transaction,
		...resolveCategoryAndType(handler.transaction)
	};
}

function resolveCommonTransactionName(transactionName) {

	const lowerCaseTransactionName = transactionName.toLowerCase();

	for (const { expectedTransaction, gotTransactionNames } of Object.values(COMMON_NAME_MAP)) {

		const isMatch = gotTransactionNames.some(
			name => lowerCaseTransactionName.includes(name.toLowerCase())
		);

		if (isMatch) {
			return expectedTransaction;
		}
	}

	return transactionName;
}

function resolveCategoryAndType(transactionName) {

	const transactionNameLower = transactionName.toLowerCase();

	for (const { type, category, names } of Object.values(CATEGORY_MAP)) {

		const isMatch = names.some(
			name => transactionNameLower.includes(name.toLowerCase())
		);

		if (isMatch) {
			return { type, category };
		}
	}

	return null;
}

runTests();