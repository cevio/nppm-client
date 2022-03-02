import { createContext } from 'react';

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

function createDefaultUserInfo(): TUser {
  return {
    id: 0,
    account: null,
    nickname: null,
    email: null,
    login_code: 'default',
    avatar: null,
    scopes: [],
    admin: false,
    gmt_create: new Date(),
    gmt_modified: new Date(),
    login_forbiden: false,
  }
}

export const defaultUserInfo = createDefaultUserInfo();
export const UserContext = createContext(defaultUserInfo);