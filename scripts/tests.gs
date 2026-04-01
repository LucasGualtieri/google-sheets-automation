function runTests() {
	testNuPay();
	testNu();
	testCaju();
	testIncoming();
	testPixAgendado();
}

function testNuPay() {

	compare(
		buildRow({
			title: "Compra com NuPay de R$ 16,57",
			body: "Compra em 1x no CRÉDITO sem juros APROVADA em iFood TESTE. kasldfsakdljfh",
		}),
		{
			transaction: "iFood TESTE",
			amount: -16.57,
			source: "Crédito",
			category: "Alimentação",
		}
	);

	compare(
		buildRow({
			title: "Compra com NuPay de R$ 16,57",
			body: "Compra em 1x no crédito sem juros APROVADA em Uber TESTE.",
		}),
		{
			transaction: "Uber TESTE",
			amount: -16.57,
			source: "Crédito",
			category: "Uber / 99 Pop",
		}
	);

	compare(
		buildRow({
			title: "Compra com NuPay de R$ 16,57",
			body: "Compra no Débito APROVADA em Uber TESTE.",
		}),
		{
			transaction: "Uber TESTE",
			amount: -16.57,
			source: "Débito / Pix",
			category: "Uber / 99 Pop",
		}
	);

	compare(
		buildRow({
			title: "Compra com NuPay de R$ 16,57",
			body: "Compra no Crédito APROVADA em METRO BH*Bilhetagem Di TESTE.",
		}),
		{
			transaction: "Passagem Metrô",
			amount: -16.57,
			source: "Crédito",
			category: "Metrô / Ônibus",
		}
	);
}

function testNu() {

	compare(
		buildRow({
			title: "Compra no crédito aprovada",
			body: "Compra de R$ 21,98 APROVADA em AMAZON BR Teste para o cartão com final 0000.",
		}),
		{
			transaction: "AMAZON BR Teste",
			amount: -21.98,
			source: "Crédito",
		}
	);
}

function testPixAgendado() {

	compare(
		buildRow({
			title: "Pix agendado enviado com sucesso ✅",
			body: "A transferência de R$ 0,01 para Fulano de Teste foi feita. Clique aqui para ver o comprovante.",
		}),
		{
			transaction: "Pix para Fulano de Teste",
			amount: -0.01,
			source: "Débito / Pix",
		}
	);
}

function testCaju() {

	compare(
		buildRow({
			title: "Pagamento aprovado",
			body: "Compra de R$ 13,50 APROVADA em Restaurante Uni TESTE no CRÉDITO. Use VOUCHER no próximo pagamento.",
		}),
		{
			transaction: "Restaurante Uni TESTE",
			amount: -13.50,
			source: "Caju",
			category: "Alimentação",
		}
	);

	compare(
		buildRow({
			title: "Pagamento aprovado",
			body: "Compra de R$ 13,50 APROVADA em Viny Lanches TESTE no CRÉDITO. Use VOUCHER no próximo pagamento.",
		}),
		{
			transaction: "Trailer PUC",
			amount: -13.50,
			source: "Caju",
			category: "Alimentação",
		}
	);

	compare(
		buildRow({
			title: "Seu Caju caiu!",
			body: "Oba! R$ 200,00 disponíveis no seu Caju. Aproveite!",
		}),
		{
			transaction: "Crédito Caju",
			amount: 200,
			source: "Caju",
		}
	);
}

function testIncoming() {

	compare(
		buildRow({
			title: "Transferência recebida",
			body: "Você recebeu uma transferência de R$ 1.300,35 de Fulano de Teste.",
		}),
		{
			transaction: "Pix de Fulano de Teste",
			amount: 1300.35,
			source: "Débito / Pix",
		}
	);

	compare(
		buildRow({
			title: "Transferência recebida",
			body: "Você recebeu uma transferência de R$ 1.800,00 de NEXOS DIGITAL T.",
		}),
		{
			transaction: "Salário Nexos",
			amount: 1800.00,
			source: "Débito / Pix",
		}
	);

	compare(
		buildRow({
			title: "Transferência recebida",
			body: "Recebemos sua transferência de R$ 108,28.",
		}),
		{
			transaction: "Pix de Lucas Gualtieri",
			amount: 108.28,
			source: "Débito / Pix",
		}
	);

	compare(
		buildRow({
			title: "Reembolso recebido pelo Pix",
			body: "Você recebeu um reembolso de R$ 20,35 de Fulano de Teste.",
		}),
		{
			transaction: "Reembolso de Fulano de Teste",
			amount: 20.35,
			source: "Débito / Pix",
		}
	);

	compare(
		buildRow({
			title: "Estorno",
			body: "A compra em Uber TESTE no valor de R$ 12,50 foi estornada.",
		}),
		{
			transaction: "Estorno em Uber TESTE",
			amount: 12.50,
			source: "Crédito",
		}
	);
}