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

function CompraNuCreditoDebito(notification) {

	const titleMatch = notification.title.match(NU_NOTIFICATIONS.compraNuPayCredito.title);
	const bodyMatch = notification.body.match(NU_NOTIFICATIONS.compraNuPayCredito.body);

	if (!titleMatch || !bodyMatch) return null;

	return {
		value: -brlToFloat(titleMatch[1]),
		expenseName: bodyMatch[2],
		paymentMethod: capitalize(bodyMatch[1]) == "Débito" ? "Débito / Pix" : capitalize(bodyMatch[1]),
	};
}