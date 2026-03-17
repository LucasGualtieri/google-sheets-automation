function runTests() {
	testNuPay();
	testCaju();
	testIncoming();
	testPixAgendado();
}

function testNuPay() {

	compare(buildRow({
		title: "Compra com NuPay de R$ 16,57",
		body: "Compra em 1x no CRÉDITO sem juros APROVADA em iFood TESTE. kasldfsakdljfh",
		app_name: "Nu"
	}), {
		expenseName: "iFood TESTE",
		value: -16.57,
		paymentMethod: "Crédito",
		expenseDescription: "Alimentação",
	});

	compare(buildRow({
		title: "Compra com NuPay de R$ 16,57",
		body: "Compra em 1x no crédito sem juros APROVADA em Uber TESTE.",
		app_name: "Nu"
	}), {
		expenseName: "Uber TESTE",
		value: -16.57,
		paymentMethod: "Crédito",
		expenseDescription: "Uber / 99 Pop",
	});

	compare(buildRow({
		title: "Compra com NuPay de R$ 16,57",
		body: "Compra no Débito APROVADA em Uber TESTE.",
		app_name: "Nu"
	}), {
		expenseName: "Uber TESTE",
		value: -16.57,
		paymentMethod: "Débito / Pix",
		expenseDescription: "Uber / 99 Pop",
	});
}

function testPixAgendado() {

	compare(buildRow({
		title: "Pix agendado enviado com sucesso ✅",
		body: "A transferência de R$ 0,01 para Fulano de Teste foi feita. Clique aqui para ver o comprovante.",
		app_name: "Nu"
	}), {
		expenseName: "Pix para Fulano de Teste",
		value: -0.01,
		paymentMethod: "Débito / Pix",
	});
}

function testCaju() {

	compare(buildRow({
		title: "Pagamento aprovado",
		body: "Compra de R$ 13,50 APROVADA em Restaurante Uni TESTE no CRÉDITO. Use VOUCHER no próximo pagamento.",
		app_name: "Caju"
	}), {
		expenseName: "Restaurante Uni TESTE",
		value: -13.50,
		paymentMethod: "Caju",
		expenseDescription: "Alimentação",
	});
}

function testIncoming() {

	compare(buildRow({
		title: "Transferência recebida",
		body: "Você recebeu uma transferência de R$ 20,35 de Fulano de Teste.",
		app_name: "Nu"
	}), {
		expenseName: "Transferência de Fulano de Teste",
		value: 20.35,
		paymentMethod: "Débito / Pix",
	});

	compare(buildRow({
		title: "Reembolso recebido pelo Pix",
		body: "Você recebeu um reembolso de R$ 20,35 de Fulano de Teste.",
		app_name: "Nu"
	}), {
		expenseName: "Reembolso de Fulano de Teste",
		value: 20.35,
		paymentMethod: "Débito / Pix",
	});

	compare(buildRow({
		title: "Estorno",
		body: "A compra em Uber TESTE no valor de R$ 12,50 foi estornada.",
		app_name: "Nu"
	}), {
		expenseName: "Estorno em Uber TESTE",
		value: 12.50,
		paymentMethod: "Crédito",
	});
}