import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const password = req.headers['x-dashboard-password'];
  const correctPassword = process.env.DASHBOARD_PASSWORD;

  if (!correctPassword || password === correctPassword) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Invalid Dashboard Password' });
};
