import { ajax } from '../lib';

export interface TPackageVersionState {
  name: string,
  version: string,
  description: string,
  homepage?: string,
  license?: string,
  keywords?: string[],
  dependencies?: Record<string, string>,
  readme?: string,
  readmeFilename?: string,
  repository?: any,
  _id: string,
  _nodeVersion: string,
  _npmVersion: string,
  _npmUser: TPackageMaintainerState,
  maintainers: TPackageMaintainerState[],
  dist: {
    integrity: string,
    shasum: string,
    tarball: string,
  },
  deprecated?: string,
  rev?: string,
}

export interface TPackageState {
  name: string,
  description: string,
  'dist-tags': Record<string, string>,
  versions: Record<string, TPackageVersionState>,
  readme: string,
  maintainers: TPackageMaintainerState[],
  readmeFilename: string,
  time?: {
    modified: string,
    created: string,
    [key: string]: string,
  },
  _nppm: boolean
}

export interface TPackageMaintainerState {
  name: string,
  email: string,
  avatar?: string,
  public?: boolean,
  account: string,
}

export async function getPackage(pkg: string) {
  const result = await ajax.get('/package/' + pkg);
  return result.data as TPackageState;
}

export async function getMaintainers(pathname: string) {
  const result = await ajax.get(`/package/${encodeURIComponent(pathname)}/maintainers`);
  return result.data as TPackageMaintainerState[];
}

export function setPackageStar(pkg: string, status: boolean) {
  return ajax.put('/star/' + encodeURIComponent(pkg), { status });
}

export async function getPackageStar(pkg: string) {
  const result = await ajax.get('/star/' + encodeURIComponent(pkg));
  return result.data as { status: boolean, count: number }
}

export async function getPackageEntity(pkg: string) {
  const result = await ajax.get(`/package/${encodeURIComponent(pkg)}/entity`);
  return result.data as { uid: number, members: { uid: number, nickname: string }[] }
}

export function setPackageTransfer(name: string, uid: number) {
  return ajax.post(`/packages/${encodeURIComponent(name)}/transfer`, { uid });
}