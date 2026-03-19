async function runTests() {
	// await testNuPay();
	// await testNu();
	// await testCaju();
	// await testIncoming();
	// await testPixAgendado();
	testGemini();
}

async function testGemini() {

	// compare(await buildRow({
	// 	title: "Pagamento aprovado",
	// 	body: "Compra de R$ 13,50 APROVADA em Comidaria Guerra no CRÉDITO. Use VOUCHER no próximo pagamento.",
	// }), {
	// 	expenseName: "Comidaria Guerra",
	// 	value: -13.50,
	// 	paymentMethod: "Caju",
	// 	expenseDescription: "Alimentação",
	// });

	compare(await buildRow({
		title: "Pagamento aprovado",
		body: "Compra de R$ 13,50 APROVADA em Uber Eats, de papar, é eats, não Uber normal!! no CRÉDITO. Use VOUCHER no próximo pagamento.",
	}), {
		expenseName: "Uber Eats, de papar, é eats, não Uber normal!!",
		value: -13.50,
		paymentMethod: "Caju",
		expenseDescription: "Alimentação",
	});
}

async function testNuPay() {

	compare(await buildRow({
		title: "Compra com NuPay de R$ 16,57",
		body: "Compra em 1x no CRÉDITO sem juros APROVADA em iFood TESTE. kasldfsakdljfh",
	}), {
		expenseName: "iFood TESTE",
		value: -16.57,
		paymentMethod: "Crédito",
		expenseDescription: "Alimentação",
	});

	compare(await buildRow({
		title: "Compra com NuPay de R$ 16,57",
		body: "Compra em 1x no crédito sem juros APROVADA em Uber TESTE.",
	}), {
		expenseName: "Uber TESTE",
		value: -16.57,
		paymentMethod: "Crédito",
		expenseDescription: "Uber / 99 Pop",
	});

	compare(await buildRow({
		title: "Compra com NuPay de R$ 16,57",
		body: "Compra no Débito APROVADA em Uber TESTE.",
	}), {
		expenseName: "Uber TESTE",
		value: -16.57,
		paymentMethod: "Débito / Pix",
		expenseDescription: "Uber / 99 Pop",
	});
}

async function testNu() {

	compare(await buildRow({
		title: "Compra no crédito aprovada",
		body: "Compra de R$ 21,98 APROVADA em AMAZON BR Teste para o cartão com final 0000.",
	}), {
		expenseName: "AMAZON BR Teste",
		value: -21.98,
		paymentMethod: "Crédito",
	});
}

async function testPixAgendado() {

	compare(await buildRow({
		title: "Pix agendado enviado com sucesso ✅",
		body: "A transferência de R$ 0,01 para Fulano de Teste foi feita. Clique aqui para ver o comprovante.",
	}), {
		expenseName: "Pix para Fulano de Teste",
		value: -0.01,
		paymentMethod: "Débito / Pix",
	});
}

async function testCaju() {

	compare(await buildRow({
		title: "Pagamento aprovado",
		body: "Compra de R$ 13,50 APROVADA em Restaurante Uni TESTE no CRÉDITO. Use VOUCHER no próximo pagamento.",
	}), {
		expenseName: "Restaurante Uni TESTE",
		value: -13.50,
		paymentMethod: "Caju",
		expenseDescription: "Alimentação",
	});
}

async function testIncoming() {

	compare(await buildRow({
		title: "Transferência recebida",
		body: "Você recebeu uma transferência de R$ 1.300,35 de Fulano de Teste.",
	}), {
		expenseName: "Pix de Fulano de Teste",
		value: 1300.35,
		paymentMethod: "Débito / Pix",
	});

	compare(await buildRow({
		title: "Reembolso recebido pelo Pix",
		body: "Você recebeu um reembolso de R$ 20,35 de Fulano de Teste.",
	}), {
		expenseName: "Reembolso de Fulano de Teste",
		value: 20.35,
		paymentMethod: "Débito / Pix",
	});

	compare(await buildRow({
		title: "Estorno",
		body: "A compra em Uber TESTE no valor de R$ 12,50 foi estornada.",
	}), {
		expenseName: "Estorno em Uber TESTE",
		value: 12.50,
		paymentMethod: "Crédito",
	});
}