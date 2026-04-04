const REGEX = {
	brlValue: "\\d{1,3}(?:\\.\\d{3})*,\\d{2}",
};

const ROW_DEFAULTS = {
	transaction: "No transaction assigned",
	amount: 0.0,
	source: "No source assigned",
	category: "",
	type: "",
	notes: "Added automatically.",
};

const NU_NOTIFICATIONS = {
	transferenciaReembolso: {
		title: /(Transferência recebida|Reembolso recebido pelo Pix)/,
		body: new RegExp(`Você recebeu um(?:a)? (transferência|reembolso) de R\\$ (${REGEX.brlValue}) de (.+)\\.`),
		autoTransferenciaBody: new RegExp(`Recebemos sua transferência de R\\$ (${REGEX.brlValue})\\.`),
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
	},
	pagamentoVoucher: {
		title: /Pagamento aprovado/,
		body: new RegExp(`Compra de R\\$ (${REGEX.brlValue}) APROVADA em (.+) em (.+) no VOUCHER.`),
	},
	recebimento: {
		title: /Seu Caju caiu!/,
		body: new RegExp(`Oba! R\\$ (${REGEX.brlValue}) disponíveis no seu Caju. Aproveite`),
	}
}

const CATEGORY_MAP = [
	{
		category: "Uber / 99 Pop",
		type: "Variable Expense",
		names: ["uber", "99"]
	},
	{
		category: "Academia",
		type: "Fixed Expense",
		names: ["academia"]
	},
	{
		category: "Alimentação",
		type: "",
		names: [ "lanches", "ifood", "restaurante", "Ifd" ],
	},
	{
		category: "Assinaturas",
		type: "Fixed Expense",
		names: ["Google Storage"],
	},
	{
		category: "Metrô / Ônibus",
		type: "Variable Expense",
		names: ["metro bh*bilhetagem di"],
	},
	{
		category: "Income",
		type: "Fixed Income",
		names: ["Nexos Digital"],
	},
];

const COMMON_NAME_MAP = [
	{
		gotTransactionNames: ["metro bh*bilhetagem di"],
		expectedTransaction: "Passagem Metrô",
	},
	{
		gotTransactionNames: ["Viny Lanches"],
		expectedTransaction: "Trailer PUC",
	},
	{
		gotTransactionNames: ["Nexos Digital"],
		expectedTransaction: "Salário Nexos",
	},
	{
		gotTransactionNames: ["SUA ACADEMIA"],
		expectedTransaction: "Smart Fit",
	},
];

const HANDLERS = [

	NuReembolsoTransferencia = (notification) => {

		const titleMatch = notification.title.match(NU_NOTIFICATIONS.transferenciaReembolso.title);
		const bodyMatch = notification.body.match(NU_NOTIFICATIONS.transferenciaReembolso.body);

		if (!titleMatch || !bodyMatch) return null;

		let transfReembolso = capitalize(bodyMatch[1]);

		transfReembolso = transfReembolso == "Transferência" ? "Pix" : transfReembolso;

		return {
			amount: brlToFloat(bodyMatch[2]),
			transaction: `${transfReembolso} de ${bodyMatch[3]}`,
			source: "Débito / Pix",
			category: "Income",
			type: "Transfer"
		};
	},

	NuAutoTransferencia = (notification) => {

		const titleMatch = notification.title.match(NU_NOTIFICATIONS.transferenciaReembolso.title);
		const bodyMatch = notification.body.match(NU_NOTIFICATIONS.transferenciaReembolso.autoTransferenciaBody);

		if (!titleMatch || !bodyMatch) return null;

		return {
			amount: brlToFloat(bodyMatch[1]),
			transaction: "Pix de Lucas Gualtieri",
			source: "Débito / Pix",
			category: "Income",
			type: "Transfer"
		};
	},

	NuEstorno = (notification) => {

		const titleMatch = notification.title.match(NU_NOTIFICATIONS.estorno.title);
		const bodyMatch = notification.body.match(NU_NOTIFICATIONS.estorno.body);

		if (!titleMatch || !bodyMatch) return null;

		return {
			amount: brlToFloat(bodyMatch[2]),
			transaction: `Estorno em ${bodyMatch[1]}`,
			source: "Crédito",
			category: "Income",
			type: "Variable Income"
		};
	},

	CompraNuPay = (notification) => {

		const titleMatch = notification.title.match(NU_NOTIFICATIONS.compraNuPay.title);
		const bodyMatch = notification.body.match(NU_NOTIFICATIONS.compraNuPay.body);

		if (!titleMatch || !bodyMatch) return null;

		const paymentMathod = capitalize(bodyMatch[1]);
		
		return {
			amount: -brlToFloat(titleMatch[1]),
			transaction: bodyMatch[2],
			source: paymentMathod == "Débito" ? "Débito / Pix" : paymentMathod,
		};
	},

	CompraNu = (notification) => {

		const titleMatch = notification.title.match(NU_NOTIFICATIONS.compra.title);
		const bodyMatch = notification.body.match(NU_NOTIFICATIONS.compra.body);

		if (!titleMatch || !bodyMatch) return null;

		const source = capitalize(titleMatch[1]);

		return {
			amount: -brlToFloat(bodyMatch[1]),
			transaction: bodyMatch[2],
			source: source == "Débito" ? "Débito / Pix" : source,
		};
	},

	PixAgendado = (notification) => {

		const titleMatch = notification.title.match(NU_NOTIFICATIONS.pixAgendado.title);
		const bodyMatch = notification.body.match(NU_NOTIFICATIONS.pixAgendado.body);

		if (!titleMatch || !bodyMatch) return null;

		return {
			amount: -brlToFloat(bodyMatch[1]),
			transaction: `Pix para ${bodyMatch[2]}`,
			source: "Débito / Pix"
		};
	},

	CajuPagamento = (notification) => {

		const titleMatch = notification.title.match(CAJU_NOTIFICATIONS.pagamento.title);
		const bodyMatch = notification.body.match(CAJU_NOTIFICATIONS.pagamento.body);

		if (!titleMatch || !bodyMatch) return null;

		return {
			amount: -brlToFloat(bodyMatch[1]),
			transaction: bodyMatch[2],
			source: "Caju"
		};
	},

	CajuPagamentoVoucher = (notification) => {

		const titleMatch = notification.title.match(CAJU_NOTIFICATIONS.pagamentoVoucher.title);
		const bodyMatch = notification.body.match(CAJU_NOTIFICATIONS.pagamentoVoucher.body);

		if (!titleMatch || !bodyMatch) return null;

		return {
			amount: -brlToFloat(bodyMatch[1]),
			transaction: bodyMatch[3],
			source: "Caju",
			category: "Alimentação"
		};
	},

	CajuRecebimento = (notification) => {

		const titleMatch = notification.title.match(CAJU_NOTIFICATIONS.recebimento.title);
		const bodyMatch = notification.body.match(CAJU_NOTIFICATIONS.recebimento.body);

		if (!titleMatch || !bodyMatch) return null;

		return {
			amount: brlToFloat(bodyMatch[1]),
			transaction: "Crédito Caju",
			source: "Caju",
			category: "Income",
			type: "Fixed Income"
		};
	}
];
