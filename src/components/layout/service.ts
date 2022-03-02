import { TPlugin } from '../../admin-base-setting/service';
import { ajax } from '../../lib';

export interface TWebloginState {
  username?: string, 
  password?: string, 
  redirect?: string
}

export function weblogin(type: string, data: TWebloginState) {
  return ajax.post('/webLogin?type=' + type, data);
}

export function webLogout() {
  return ajax.delete('/webLogout');
}

export async function getLoginModules() {
  const result = await ajax.get('/plugin/logins');
  return result.data as TPlugin[];
}