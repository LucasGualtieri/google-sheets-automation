// https://claude.ai/chat/a4a70733-b44f-4bba-b5e5-87cb84b1af4e

// NOTE - Google Script não suporta console.assert(), mas pra testar é melhor usar!
const USING_ASSERT = true;
const assert = USING_ASSERT ? console.assert : custom_assert;
// NOTE - Set pra true se quiser parar no primeiro erro quando testando direto no Google Script
const ASSERT_ERROR_THROWS_EXCEPTION = false;

const SHEET_NAME = "Gastos de 17/02 à 17/03 Novo";

// TODO - Consertar essa função
// function getSheetName() {
// 	const now = new Date();
// 	const from = Utilities.formatDate(now, "GMT-3", "dd/MM");
// 	const next = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
// 	const to = Utilities.formatDate(next, "GMT-3", "dd/MM");
// 	return `Gastos de ${from} à ${to}`;
// }

const REGEX = {
	brlValue: /R\$ (\d+,\d{2})/,
};

const ROW_DEFAULTS = {
	expenseName: "No name assigned",
	value: 0.0,
	paymentMethod: "No payment method assigned",
	expenseDescription: "",
	expenseCategory: "",
	note: "Added automatically.",
};

const NU_NOTIFICATIONS = {
	transferenciaReembolso: {
		title: /(Transferência recebida|Reembolso recebido pelo Pix)/,
		body: /Você recebeu um(?:a)? (transferência|reembolso) de R\$ (\d+,\d{2}) de (.+)\./,
	},
	estorno: {
		title: /Estorno/,
		body: /A compra em (.+) no valor de R\$ (\d+,\d{2}) foi estornada./,
	},
	compraNuPayCredito: {
		title: /Compra com NuPay de R\$ (\d+,\d{2})/,
		body: /Compra (?:em \d+x )?no (crédito|débito)(?: sem juros)? APROVADA em (.+)\./i,
	},
};

const CATEGORY_MAP = {
	"Uber / 99": ["Uber", "99"],
	"Alimentação": ["iFood", "Ifood"],
	"Assinaturas": ["Google Storage"]
};

const HANDLERS = [
	NuReembolsoTransferencia,
	NuEstorno,
	CompraNuCreditoDebito,
];

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
	};
}