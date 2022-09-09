import { Router } from 'express';

import { chart, sign, generateSignature, verifySignature } from 'controllers/test';

const router = Router();

router.get('/chart', chart);
router.get('/sign', sign, generateSignature);
router.get('/verify', sign, verifySignature);

export default router;
