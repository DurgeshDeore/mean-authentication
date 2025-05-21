import express from 'express';
import { isAuthenticate, login,logout,register, resetOtp, resetPass, sendVerifyOtp, verifyEmail } from '../controller/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.post('/is-auth', userAuth, isAuthenticate);
authRouter.post('/resend-otp', userAuth, resetOtp);
authRouter.post('/reset-pass', userAuth, resetPass);

export default authRouter;