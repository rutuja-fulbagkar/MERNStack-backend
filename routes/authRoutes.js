import express from 'express';
import { register,verifyOTP, login,forgotPassword,resetPassword } from '../controllers/authController/authController.js';
import { requireSignIn,checkRole , isCustomer } from '../middlewares/authMiddleware/auth.js'

const router = express.Router();

// Public Routes:accessible to everyone without any authentication or role requirements.
router.post('/register', register);
router.post('/verifyOTP', verifyOTP);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/reset-password', resetPassword);



// Protected Routes: require users to be authenticated
router.get('/user', requireSignIn, checkRole(['user']), (req, res) => {
  res.json({ message: 'Welcome to the User dashboard!' });
});

router.get('/customer', requireSignIn, isCustomer, (req, res) => {
  res.json({ message: 'Welcome, customer!' });
});


export default router;