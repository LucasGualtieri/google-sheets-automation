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

function calendarPartsSaoPaulo(date) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Sao_Paulo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);

	return {
		y: parseInt(parts.find((p) => p.type === "year").value, 10),
		m: parseInt(parts.find((p) => p.type === "month").value, 10),
		d: parseInt(parts.find((p) => p.type === "day").value, 10),
	};
}

function formatDmyYy(y, m, d) {
	const yy = y % 100;
	return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${String(yy).padStart(2, "0")}`;
}

/**
 * Período da fatura: [fechamento M] até [fechamento M+1], meia-aberta no fim.
 * Ex.: entre 17/03 e 16/04 → "Gastos de 17/03/26 à 17/04/26"; em 17/04 já entra o próximo ciclo.
 */
function getSheetName() {

	const { y, m, d } = calendarPartsSaoPaulo(new Date());
	const close = BILLING_CLOSE_DAY;
	let sy, sm, ey, em;

	if (d >= close) {
		sy = y;
		sm = m;
		em = m + 1;
		ey = y;
		if (em > 12) {
			em = 1;
			ey = y + 1;
		}
	}
	
	else {
		ey = y;
		em = m;
		sm = m - 1;
		sy = y;
		if (sm < 1) {
			sm = 12;
			sy = y - 1;
		}
	}

	const fromStr = formatDmyYy(sy, sm, close);
	const toStr = formatDmyYy(ey, em, close);

	return `Gastos de ${fromStr} à ${toStr}`;
}

if (RUNNING_LOCALLY) {
	console.log(getSheetName() + " Novo");
}
