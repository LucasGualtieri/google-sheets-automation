#!/bin/bash

# Copie para pushNdeploy.sh (gitignored) e defina DEPLOYMENT_ID, ou:
#   export DEPLOYMENT_ID='...' antes de rodar este script.
# ID da implantação: Apps Script → Implantar → Gerenciar implantações.
if [[ -z "${DEPLOYMENT_ID:-}" ]]; then
	echo "❌ Defina DEPLOYMENT_ID (export DEPLOYMENT_ID='...' ou use pushNdeploy.sh local com o ID fixo)." >&2
	exit 1
fi

echo "🚀 Iniciando push e deploy para a versão de produção..."

# Envia o código atual para o servidor
clasp push

# Realiza o deploy na instância específica
if clasp deploy -i "$DEPLOYMENT_ID"; then
	echo "✅ Deploy concluído com sucesso!"
else
	echo "❌ Erro ao realizar o deploy."
	exit 1
fi
