import { Router } from 'express';
import { getMe, login, register } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validate.js';
import { loginSchema, registerSchema } from '../validation/schemas.js';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
