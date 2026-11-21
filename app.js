const path = require('path');
const express = require('express');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const routes = require('./routes');
const authRoutes = require('./routes/auth');
const locals = require('./middlewares/locals');
const { carregarUsuario, requireAuth } = require('./middlewares/auth');
const seed = require('./seeders/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Necessário no Render (cookie "secure" atrás de proxy)
app.set('trust proxy', 1);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method')); // permite PUT/PATCH/DELETE via formulários (?_method=PUT)
app.use(express.static(path.join(__dirname, 'public')));
app.use(carregarUsuario); // descobre quem é o usuário logado
app.use(locals);

// Rotas públicas (login e sessão)
app.use(authRoutes);

// Daqui para baixo, só usuários logados
app.use(requireAuth);
app.use(routes);

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Página não encontrada' });
});

// Erros
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { title: 'Erro', error: err });
});

(async () => {
  try {
    await sequelize.sync();
    await seed({ onlyIfEmpty: true });
    app.listen(PORT, () => {
      console.log(`\n  HelpDesk TI rodando em http://localhost:${PORT}\n`);
    });
  } catch (err) {
    console.error('Falha ao iniciar a aplicação:', err);
    process.exit(1);
  }
})();