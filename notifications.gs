const REGEX = {
	brlValue: "\\d{1,3}(?:\\.\\d{3})*,\\d{2}",
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
		body: new RegExp(`Você recebeu um(?:a)? (transferência|reembolso) de R\\$ (${REGEX.brlValue}) de (.+)\\.`),
	},
	estorno: {
		title: /Estorno/,
		body: new RegExp(`A compra em (.+) no valor de R\\$ (${REGEX.brlValue}) foi estornada.`),
	},
	compraNuPay: {
		title: new RegExp(`Compra com NuPay de R\\$ (${REGEX.brlValue})`),
		body: /Compra (?:em \d+x )?no (crédito|débito)(?: sem juros)? APROVADA em (.+)\./i,
	},
	compra: {
		title: /Compra no (crédito|débito) aprovada/,
		body: new RegExp(`Compra de R\\$ (${REGEX.brlValue}) APROVADA em (.+) para o cartão com final \\d{4}\\.`),
	},
	pixAgendado: {
		title: /Pix agendado enviado com sucesso ✅/,
		body: new RegExp(`A transferência de R\\$ (${REGEX.brlValue}) para (.+) foi feita. Clique aqui para ver o comprovante.`),
	},
};

const CAJU_NOTIFICATIONS = {
	pagamento: {
		title: /Pagamento aprovado/,
		body: new RegExp(`Compra de R\\$ (${REGEX.brlValue}) APROVADA em (.+) no CRÉDITO.`),
	}
}

const CATEGORY_MAP = {
	uber99Pop: {
		expenseDescription: "Uber / 99 Pop",
		expenseCategory: "Variable Expense",
		names: ["Uber", "99"]
	},
	alimentacao: {
		expenseDescription: "Alimentação",
		expenseCategory: "",
		names: ["iFood", "Ifood", "Restaurante"],
	},
	assinaturas: {
		expenseDescription: "Assinaturas",
		expenseCategory: "Fixed Expense",
		names: ["Google Storage"],
	},
};

const HANDLERS = [
	NuReembolsoTransferencia,
	NuEstorno,
	CompraNuPay,
	CompraNu,
	PixAgendado,
	CajuPagamento,
];

function NuReembolsoTransferencia(notification) {

	const titleMatch = notification.title.match(NU_NOTIFICATIONS.transferenciaReembolso.title);
	const bodyMatch = notification.body.match(NU_NOTIFICATIONS.transferenciaReembolso.body);

	if (!titleMatch || !bodyMatch) return null;

	return {
		value: brlToFloat(bodyMatch[2]),
		expenseName: `${capitalize(bodyMatch[1])} de ${bodyMatch[3]}`,
		paymentMethod: "Débito / Pix",
	};
}

function NuEstorno(notification) {

	const titleMatch = notification.title.match(NU_NOTIFICATIONS.estorno.title);
	const bodyMatch = notification.body.match(NU_NOTIFICATIONS.estorno.body);

	if (!titleMatch || !bodyMatch) return null;

	return {
		value: brlToFloat(bodyMatch[2]),
		expenseName: `Estorno em ${bodyMatch[1]}`,
		paymentMethod: "Crédito",
	};
}

function CompraNuPay(notification) {

	const titleMatch = notification.title.match(NU_NOTIFICATIONS.compraNuPay.title);
	const bodyMatch = notification.body.match(NU_NOTIFICATIONS.compraNuPay.body);

	if (!titleMatch || !bodyMatch) return null;

	const paymentMathod = capitalize(bodyMatch[1]);
	
	return {
		value: -brlToFloat(titleMatch[1]),
		expenseName: bodyMatch[2],
		paymentMethod: paymentMathod == "Débito" ? "Débito / Pix" : paymentMathod,
	};
}

function CompraNu(notification) {

	const titleMatch = notification.title.match(NU_NOTIFICATIONS.compra.title);
	const bodyMatch = notification.body.match(NU_NOTIFICATIONS.compra.body);

	if (!titleMatch || !bodyMatch) return null;

	const paymentMethod = capitalize(titleMatch[1]);

	return {
		value: -brlToFloat(bodyMatch[1]),
		expenseName: bodyMatch[2],
		paymentMethod: paymentMethod  == "Débito" ? "Débito / Pix" : paymentMethod,
	};
}

function PixAgendado(notification) {

	const titleMatch = notification.title.match(NU_NOTIFICATIONS.pixAgendado.title);
	const bodyMatch = notification.body.match(NU_NOTIFICATIONS.pixAgendado.body);

	if (!titleMatch || !bodyMatch) return null;

	return {
		value: -brlToFloat(bodyMatch[1]),
		expenseName: `Pix para ${bodyMatch[2]}`,
		paymentMethod: "Débito / Pix"
	};
}

function CajuPagamento(notification) {

	const titleMatch = notification.title.match(CAJU_NOTIFICATIONS.pagamento.title);
	const bodyMatch = notification.body.match(CAJU_NOTIFICATIONS.pagamento.body);

	if (!titleMatch || !bodyMatch) return null;

	return {
		value: -brlToFloat(bodyMatch[1]),
		expenseName: bodyMatch[2],
		paymentMethod: "Caju"
	};
}