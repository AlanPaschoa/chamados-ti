const express = require('express');
const dashboard = require('../controllers/dashboardController');
const tickets = require('../controllers/ticketController');
const comments = require('../controllers/commentController');
const technicians = require('../controllers/technicianController');
const categories = require('../controllers/categoryController');
const users = require('../controllers/userController');
const { requireRole } = require('../middlewares/auth');

const router = express.Router();
const staff = requireRole('tecnico', 'admin');
const admin = requireRole('admin');

// Dashboard
router.get('/', dashboard.index);

// Chamados
router.get('/tickets', tickets.index);
router.get('/tickets/new', tickets.new);
router.post('/tickets', tickets.create);
router.get('/tickets/:id', tickets.show);
router.get('/tickets/:id/edit', admin, tickets.edit);
router.put('/tickets/:id', admin, tickets.update);
router.post('/tickets/:id/assume', staff, tickets.assume);
router.patch('/tickets/:id/quick', staff, tickets.quickUpdate);
router.delete('/tickets/:id', admin, tickets.destroy);
router.post('/tickets/:id/comments', comments.create);

// Técnicos (gestão só do admin)
router.get('/technicians', admin, technicians.index);
router.get('/technicians/new', admin, technicians.new);
router.post('/technicians', admin, technicians.create);
router.get('/technicians/:id/edit', admin, technicians.edit);
router.put('/technicians/:id', admin, technicians.update);
router.delete('/technicians/:id', admin, technicians.destroy);

// Categorias (gestão só do admin)
router.get('/categories', admin, categories.index);
router.get('/categories/new', admin, categories.new);
router.post('/categories', admin, categories.create);
router.get('/categories/:id/edit', admin, categories.edit);
router.put('/categories/:id', admin, categories.update);
router.delete('/categories/:id', admin, categories.destroy);

// Gestão de usuários (admin)
router.get('/users', admin, users.index);
router.patch('/users/:uid/perfil', admin, users.updatePerfil);

module.exports = router;