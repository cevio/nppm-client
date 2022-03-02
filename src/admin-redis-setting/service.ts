import { ajax } from '../lib';

type TRedisState = {
  readonly host: string,
  readonly port: number,
  readonly password?: string,
  readonly db?: number
}

export async function getRedisState() {
  const result = await ajax.get('/setup/redis');
  return result.data as TRedisState;
}

export function setRedisState(data: TRedisState) {
  return ajax.put('/setup/redis', data);
}