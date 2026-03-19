function runTests() {
	testNuPay();
	testNu();
	testCaju();
	testIncoming();
	testPixAgendado();
}

function testNuPay() {

	compare(buildRow({
		title: "Compra com NuPay de R$ 16,57",
		body: "Compra em 1x no CRÉDITO sem juros APROVADA em iFood TESTE. kasldfsakdljfh",
	}), {
		expenseName: "iFood TESTE",
		value: -16.57,
		paymentMethod: "Crédito",
		expenseDescription: "Alimentação",
	});

	compare(buildRow({
		title: "Compra com NuPay de R$ 16,57",
		body: "Compra em 1x no crédito sem juros APROVADA em Uber TESTE.",
	}), {
		expenseName: "Uber TESTE",
		value: -16.57,
		paymentMethod: "Crédito",
		expenseDescription: "Uber / 99 Pop",
	});

	compare(buildRow({
		title: "Compra com NuPay de R$ 16,57",
		body: "Compra no Débito APROVADA em Uber TESTE.",
	}), {
		expenseName: "Uber TESTE",
		value: -16.57,
		paymentMethod: "Débito / Pix",
		expenseDescription: "Uber / 99 Pop",
	});
}

function testNu() {

	compare(buildRow({
		title: "Compra no crédito aprovada",
		body: "Compra de R$ 21,98 APROVADA em AMAZON BR Teste para o cartão com final 0000.",
	}), {
		expenseName: "AMAZON BR Teste",
		value: -21.98,
		paymentMethod: "Crédito",
	});
}

function testPixAgendado() {

	compare(buildRow({
		title: "Pix agendado enviado com sucesso ✅",
		body: "A transferência de R$ 0,01 para Fulano de Teste foi feita. Clique aqui para ver o comprovante.",
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
		body: "Você recebeu uma transferência de R$ 1.300,35 de Fulano de Teste.",
	}), {
		expenseName: "Pix de Fulano de Teste",
		value: 1300.35,
		paymentMethod: "Débito / Pix",
	});

	compare(buildRow({
		title: "Reembolso recebido pelo Pix",
		body: "Você recebeu um reembolso de R$ 20,35 de Fulano de Teste.",
	}), {
		expenseName: "Reembolso de Fulano de Teste",
		value: 20.35,
		paymentMethod: "Débito / Pix",
	});

	compare(buildRow({
		title: "Estorno",
		body: "A compra em Uber TESTE no valor de R$ 12,50 foi estornada.",
	}), {
		expenseName: "Estorno em Uber TESTE",
		value: 12.50,
		paymentMethod: "Crédito",
	});
}