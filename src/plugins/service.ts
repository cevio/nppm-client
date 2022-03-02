import { ajax } from '../lib';
import { TPlugin } from '../admin-base-setting/service';

export interface TPluginInstallProps { 
  name: string, 
  registry?: string, 
  dev?: boolean,
}

export interface TPluginInstallInfomation {
  id: number,
  name: string,
  status: -2 | -1 | 0 | 1 | 2,
  startTimeStamp: number,
  endTimeStamp: number,
  installedTimeStamp: number,
  msg: string[],
  error: string,
}

export async function getPlugins() {
  const result = await ajax.get('/plugins');
  return result.data as TPlugin[];
}

export function uninstall(pkg: string) {
  return ajax.delete(`/plugin/${encodeURIComponent(pkg)}`);
}

export function install(data: TPluginInstallProps) {
  return ajax.post('/plugin', data);
}

export async function getHistory(): Promise<TPluginInstallInfomation[]> {
  const result = await ajax.get('/plugin/history');
  return result.data as TPluginInstallInfomation[];
}

export function setPluginConfigs(name: string, data: Record<string, any>) {
  return ajax.put(`/plugin/${encodeURIComponent(name)}/configs`, data);
}

export function cancelPluginTask(id: number) {
  return ajax.delete(`/plugin/history/cancel/${id}`)
}