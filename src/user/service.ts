import { ajax, TUser } from '../lib';

export type TPackage = {
  name: string,
  id: number,
  description: string,
  version: string,
  size: number,
  downloads: number,
  versions: number,
  maintainers: number,
  likes: number,
}

export async function getUser(id: string) {
  const result = await ajax.get(`/user/${id}`);
  return result.data as TUser;
}

export function setUserAdminStatus(id: number, status: boolean) {
  return ajax.put(`/user/${id}/admin`, { value: status })
}

export function setUserAdminForbiddenStatus(id: number, status: boolean) {
  return ajax.put(`/user/${id}/forbidden`, { value: status })
}

export function setUserScopes(id: number, scopes: string[]) {
  return ajax.put('/user/' + id + '/scopes', scopes);
}

export async function getUserPackages(uid: number, options: { page: number, size: number, type: number, keyword: string }) {
  const result = await ajax.get('/user/' + uid + '/packages', { params: options });
  return result.data as [TPackage[], number];
}