import { Request, Response } from 'express';
import * as s from '../services/auth.service';

export async function register(req: Request, res: Response) {
  await s.register(req.body);
  res.status(201).json({ ok: true });
}
export async function login(req: Request, res: Response) {
  const data = await s.login(req.body);
  // si usas cookie httpOnly:
  // res.cookie('access_token', data.access_token, { httpOnly: true, sameSite: 'lax', secure: true });
  res.json(data);
}
export async function me(req: Request, res: Response) {
  res.json({ user: (req as any).user });
}
export async function logout(_req: Request, res: Response) {
  // si cookie: res.clearCookie('access_token');
  res.json({ ok: true });
}
export const forgotPassword = async (req: Request, res: Response) => { await s.forgotPassword(req.body.email); res.json({ ok: true }); };
export const resetPassword = async (req: Request, res: Response) => { await s.resetPassword(req.body.token, req.body.password); res.json({ ok: true }); };

// OAuth (si usas Passport o Supabase, ajusta):
export const oauthGoogleStart = (req: Request, res: Response) => {
  const url = s.getGoogleAuthUrl(); // genera URL
  res.redirect(url);
};
export const oauthGoogleCallback = async (req: Request, res: Response) => {
  const { code } = req.query as { code: string };
  const token = await s.handleGoogleCallback(code);
  // set cookie o redirige al frontend con ?token=
  res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
};
