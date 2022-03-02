import { ajax } from '../lib';

export interface TUser {
  id: number,
  account: string,
  nickname: string,
  email: string,
  login_code: string,
  avatar: string,
  scopes: string[],
  admin: boolean,
  gmt_create: string | Date,
  gmt_modified: string | Date,
  login_forbiden: boolean,
}

export async function getUsers(props: {
  page: number,
  size: number,
  keyword?: string,
}) {
  const result = await ajax.get('/users', { params: props });
  return result.data as [TUser[], number];
}