import { ajax } from '../lib';

type TORMState = {
  readonly type: string,
  readonly host: string,
  readonly port: number,
  readonly username: string,
  readonly password: string,
  readonly database: string,
}

export async function getORMState() {
  const result = await ajax.get('/setup/orm');
  return result.data as TORMState;
}

export function setORMState(data: TORMState) {
  return ajax.put('/setup/orm', data);
}