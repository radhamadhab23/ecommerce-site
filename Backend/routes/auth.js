import express from 'express';
import { login, logout, signup } from '../controllers/auth.js'; // Correct now

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

export default router;
//Q2pl7voXUhFgrfTP