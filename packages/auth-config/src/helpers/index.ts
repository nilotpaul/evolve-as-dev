import { MiddlewareHandler } from 'hono';
import axios from 'axios';

export type Variables = {
  user: User | null;
};

export type User = {
  id: string;
  username: string;
  email: string;
  image: string | null;
  authProvider: 'Google' | 'GitHub';
  createdAt: Date;
  updatedAt: Date;
};

export const authSessionMiddleware: MiddlewareHandler = async (c, next) => {
  try {
    const { data, status } = await axios.get<User | null>(
      'http://localhost:3000/api/v1/auth/user',
      {
        withCredentials: true,
        headers: {
          Cookie: c.req.header('cookie'),
        },
      }
    );

    if (status !== 200 && !data?.id) {
      c.set('user', null);
      return next();
    }

    c.set('user', data);

    return next();
  } catch (err) {
    console.error('authSessionMiddleware error: ', err);
  }
};

export const withAuthMiddleware: MiddlewareHandler<{
  Variables: Variables;
}> = async (c, next) => {
  const user = c.get('user');

  if (!user?.id) {
    return c.json({
      errorMsg: 'no session found',
    });
  }

  return next();
};