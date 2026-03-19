// TODO - Consertar essa função
function getSheetName() {
	const now = new Date();
	const from = Utilities.formatDate(now, "GMT-3", "dd/MM");
	const next = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
	const to = Utilities.formatDate(next, "GMT-3", "dd/MM");
	return `Gastos de ${from} à ${to}`;
}

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

function getApiKey_() {
	if (RUNNING_ON_GAS) {
		return PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
	}
	return GEMINI_API_KEY_LOCAL;
}

async function postJSON_(url, payload) {
	if (RUNNING_ON_GAS) {
		const response = UrlFetchApp.fetch(url, {
			method: "post",
			contentType: "application/json",
			payload: JSON.stringify(payload),
			muteHttpExceptions: true,
		});
		if (response.getResponseCode() !== 200) {
			console.log("Gemini API error: " + response.getContentText());
			return null;
		}
		return JSON.parse(response.getContentText());
	}

	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!response.ok) {
		console.log("Gemini API error: " + response.status);
		return null;
	}
	return await response.json();
}

async function classifyWithGemini(expenseName, notificationTitle) {

	if (SKIP_GEMINI) return null;

	const apiKey = getApiKey_();
	if (!apiKey) return null;

	const categoriesList = EXPENSE_CATEGORIES
		.map((c, i) => `${i}. "${c.expenseDescription}" (expenseCategory: "${c.expenseCategory}") — ${c.hint}`)
		.join("\n");

	const prompt = [
		"Você é um classificador de despesas financeiras. Dado o nome de uma despesa vinda de uma notificação bancária, classifique-a em uma das categorias abaixo.",
		"",
		"Categorias:",
		categoriesList,
		"",
		`Nome da despesa: "${expenseName}"`,
		// `Título da notificação: "${notificationTitle}"`,
		"",
		'Responda com {"index": <número>} onde número é o índice (base 0) da categoria, ou {"index": -1} se nenhuma se aplica.',
	].join("\n");

	// promt = prompt + " " + prompt;

	const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

	const payload = {
		contents: [{ parts: [{ text: prompt }] }],
		generationConfig: {
			responseMimeType: "application/json",
			responseSchema: {
				type: "OBJECT",
				properties: { index: { type: "INTEGER" } },
				required: ["index"],
			},
		},
	};

	const responseBody = await postJSON_(url, payload);
	if (!responseBody) return null;

	const text = responseBody.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) return null;

	const result = JSON.parse(text);
	const idx = result.index;

	if (idx >= 0 && idx < EXPENSE_CATEGORIES.length) {
		return EXPENSE_CATEGORIES[idx];
	}

	return null;
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
