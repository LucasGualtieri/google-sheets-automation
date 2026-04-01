// TODO - Consertar essa função
function getSheetName() {
	const now = new Date();
	const from = Utilities.formatDate(now, "GMT-3", "dd/MM");
	const next = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
	const to = Utilities.formatDate(next, "GMT-3", "dd/MM");
	return `Gastos de ${from} à ${to}`;
}

function brlToFloat(value) {
	return parseFloat(value.replaceAll('.', '').replace(',', '.'));
}

function respondWithJSON(data) {
	return ContentService
		.createTextOutput(JSON.stringify(data, null, 2))
		.setMimeType(ContentService.MimeType.JSON);
}

function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
}

function custom_assert(condition, ...messages) {
	if (!condition) {
		const text = messages.map(m => typeof m === "object" ? JSON.stringify(m) : String(m)).join(" ");
		console.log("FAIL: " + text);
		if (ASSERT_ERROR_THROWS_EXCEPTION) {
			throw new Error("FAIL: " + text);
		}
	}
}

function compare(row, expected) {

	assert(row, "row is null");

	if (!row) return;

	const failed = Object.keys(expected).filter(key => row[key] !== expected[key]);

	if (failed.length > 0) {

		const diff = Object.fromEntries(
			failed.map(key => [key, { expected: expected[key], got: row[key] }])
		);
	
		assert(false, "row mismatch", diff);
	}
}
