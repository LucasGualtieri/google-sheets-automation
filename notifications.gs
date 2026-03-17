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
		...resolveCategoryAndDescription(bodyMatch[2] ?? ""),
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