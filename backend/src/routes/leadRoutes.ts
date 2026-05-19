import { Router } from 'express';
import {
  createLead,
  deleteLead,
  getLeadById,
  getLeads,
  updateLead,
} from '../controllers/leadController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect);
router.get('/', getLeads);
router.post('/', restrictTo('Admin', 'Sales User'), createLead);
router.get('/:id', getLeadById);
router.put('/:id', restrictTo('Admin', 'Sales User'), updateLead);
router.delete('/:id', restrictTo('Admin'), deleteLead);

export default router;
