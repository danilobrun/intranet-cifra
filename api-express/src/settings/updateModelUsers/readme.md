# Atualização em massa dos Usuários (MongoDB)

Este script tem como objetivo atualizar todos os documentos da coleção `Users` no banco de dados MongoDB, adicionando o campo:

- `number`: um campo de texto (string) contendo o número do usuário (inicialmente nulo ou string vazia)

## 🧠 Por que usar este script?

Quando você adiciona novos campos ao seu model no Mongoose, os documentos já existentes **não são automaticamente atualizados** no banco. Esse script garante que todos os registros antigos recebam os novos campos, evitando `undefined` ou falhas em interfaces que esperam esses dados.

---

## 📦 Pré-requisitos

- Node.js instalado
- Projeto com `mongoose` e dotenv configurados
- Arquivo `.env` com as variáveis de ambiente:

```env
DB_USER=seu_usuario
DB_PASS=sua_senha
```

## ▶️ Como rodar

- Salve o script com o nome update-portals.js (ou outro nome que preferir)
- No terminal, execute:

```bash
node scripts/update-portals.js
```

Se o script estiver fora da pasta scripts/, ajuste o caminho.

- Você deverá ver uma mensagem como:

```plaintext
Documentos atualizados com sucesso.
```
