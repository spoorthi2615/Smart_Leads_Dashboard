import { Router } from 'express';
import {
  createLead,
  deleteLead,
  exportLeads,
  getLeadById,
  getLeads,
  updateLead,
} from '../controllers/leadController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.js';
import { leadQuerySchema, leadCreateSchema, leadUpdateSchema, leadIdParamSchema } from '../validation/schemas.js';

const router = Router();

router.use(protect);
router.get('/', validateQuery(leadQuerySchema), getLeads);
router.get('/export', validateQuery(leadQuerySchema), exportLeads);
router.post('/', restrictTo('Admin', 'Sales User'), validateBody(leadCreateSchema), createLead);
router.get('/:id', validateParams(leadIdParamSchema), getLeadById);
router.put('/:id', restrictTo('Admin', 'Sales User'), validateParams(leadIdParamSchema), validateBody(leadUpdateSchema), updateLead);
router.delete('/:id', restrictTo('Admin'), validateParams(leadIdParamSchema), deleteLead);

export default router;
