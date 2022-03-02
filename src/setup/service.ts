import { ajax, TUser } from '../lib';

export async function getWebsiteMode() {
  const mode = await ajax.get('/setup/mode');
  return mode.data as { mode: number, version: string };
}

export function setORMState(data: {
  readonly type: string,
  readonly host: string,
  readonly port: number,
  readonly username: string,
  readonly password: string,
  readonly database: string,
}) {
  return ajax.post('/setup/orm', data);
}

export function setRedisState(data: {
  readonly host: string,
  readonly port: number,
  readonly password?: string,
  readonly db?: number
}) {
  return ajax.post('/setup/redis', data);
}

export function setAdminState(data: { 
  username: string, 
  password: string, 
  email: string 
}) {
  return ajax.post('/user', data);
}

export async function getUserInfo() {
  const result = await ajax.get('/user');
  return result.data as TUser;
}