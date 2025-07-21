import express from 'express';
import EsewaController from '../controllers/esewaController.js'; //  Import default class

const router = express.Router();

router.post('/initiate', EsewaController.initiatePayment);
router.get('/success', EsewaController.handleSuccessCallback);
router.get('/failure', EsewaController.handleFailureCallback);
router.get('/status/:transaction_uuid', EsewaController.checkPaymentStatus);
router.get('/transaction/:transaction_uuid', EsewaController.getTransaction);

export default router;
