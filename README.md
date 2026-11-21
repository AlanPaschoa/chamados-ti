# HelpDesk TI — Organização de Chamados

**Aluno(a):** Alan dos Santos Paschoa
**Aplicação no Render:** https://chamados-ti-g4e6.onrender.com

## Credenciais de teste

| Perfil  | E-mail             | Senha     |
|---------|--------------------|-----------|
| user    | cleber@empresa.com | cleber123 |
| tecnico | carlos@empresa.com | carlos123 |
| admin   | jorge@empresa.com  | jorge123  |

> O login também pode ser feito com Google. Todo novo usuário nasce com o perfil `user`; apenas o admin altera perfis.


---

Sistema web para abertura, acompanhamento e organização de chamados de TI, construído no padrão **MVC** com **Node.js, Express, EJS, CSS e Sequelize** (SQLite), com autenticação via **Firebase Authentication** e controle de acesso por perfis (RBAC).

## Autenticação e perfis de acesso

- Login com **E-mail/Senha** e **Google** (Firebase Authentication).
- Perfis armazenados na coleção `usuarios` do Firestore, vinculados ao `uid` da conta.
- Primeiro acesso: o usuário é salvo automaticamente com o perfil `user`.

| Perfil  | Permissões |
|---------|------------|
| user    | Cria chamados e visualiza apenas os próprios. |
| tecnico | Visualiza todos os chamados, assume chamados e altera status. |
| admin   | Acesso total: edita e exclui chamados, gerencia usuários e perfis. |

As permissões são validadas no servidor (middlewares `requireAuth` e `requireRole`), e não apenas escondidas na interface.

## Como rodar localmente

1. `npm install`
2. Salve a chave de serviço do Firebase em `config/serviceAccountKey.json` (arquivo ignorado pelo Git) e configure o `firebaseConfig` em `public/js/firebase-config.js`.
3. `npm start` e acesse http://localhost:3000

- `npm run dev` — reinicia automaticamente ao salvar arquivos (`node --watch`).
- `npm run seed` — **recria** o banco com os dados de exemplo.

Em produção (Render), a chave é lida da variável de ambiente `FIREBASE_SERVICE_ACCOUNT`.

## Funcionalidades

- **Dashboard**: indicadores, fila prioritária, chamados por prioridade/status, carga da equipe, distribuição por categoria e tempo médio de resolução.
- **Chamados**: CRUD completo, busca (título, solicitante, protocolo `CH-00001`), filtros por status, prioridade, categoria e técnico.
- **Ações rápidas**: alterar status, prioridade e responsável com registro automático no histórico.
- **Comentários** e linha do tempo por chamado.
- **Técnicos** e **Categorias**: cadastro, edição e remoção (admin).
- **Gestão de Usuários**: listagem e alteração de perfil (admin).

## Estrutura (MVC)

```
app.js                 # inicialização do Express e do banco
config/                # Sequelize, Firebase Admin e constantes
models/                # Category, Technician, Ticket, Comment + associações
controllers/           # regras de cada recurso
routes/                # mapeamento de URLs -> controllers (inclui auth)
middlewares/           #