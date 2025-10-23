import { Router } from 'express';
import * as c from '../controllers/auth.controller';
import requireAuth from '../middlewares/requireAuth';

const r = Router();
r.post('/login', c.login);
r.post('/register', c.register);
r.post('/forgot-password', c.forgotPassword);
r.post('/reset-password', c.resetPassword);
r.post('/logout', c.logout);
r.get('/me', requireAuth, c.me);

// OAuth (redirección a Google y callback)
r.get('/oauth/google', c.oauthGoogleStart);
r.get('/oauth/google/callback', c.oauthGoogleCallback);

export default r;
