import React from 'react';
import { ajax } from '../lib';

export interface TConfigs {
  id: number,
  domain: string,
  scopes: string[],
  login_code: string,
  registries: string[],
  dictionary: string,
  registerable: boolean,
  installable: boolean,
  ips: string[],
}

export interface TPlugin {
  name: string,
  version: string,
  description: string,
  plugin_name: string,
  plugin_icon: string | React.ReactElement,
  main?: string,
  devmain?: string,
  nppm: true,
  plugin_configs?: TPluginConfigs[],
}

export type TPluginConfigs<T = any> = TPluginConfigInput<T> | TPluginConfigSelect<T> | TPluginConfigRadio<T> | TPluginConfigSwitch | TPluginConfigCheckbox<T>;

export interface TPluginConfigBase<T = any> {
  key: string,
  value: T,
  title: string,
  description?: string,
}

export interface TLabelValue<T = any> {
  label: string,
  value: T
}

export interface TPluginConfigInput<T> extends TPluginConfigBase<T> {
  type: 'input',
  placeholder?: string,
  mode?: string,
  width?: number | string,
}

export interface TPluginConfigSelect<T> extends TPluginConfigBase<T> {
  type: 'select',
  placeholder?: string,
  fields: TLabelValue<T>[],
  width?: number | string,
}

export interface TPluginConfigRadio<T> extends TPluginConfigBase<T> {
  type: 'radio',
  fields: TLabelValue<T>[],
}

export interface TPluginConfigSwitch extends TPluginConfigBase<boolean> {
  type: 'switch',
  placeholder?: [string, string],
}

export interface TPluginConfigCheckbox<T> extends TPluginConfigBase<T[]> {
  type: 'checkbox',
  fields: TLabelValue<T>[],
  span?: number,
  gutter?: number | [number, number],
}

export async function getConfigsState() {
  const result = await ajax.get('/configs');
  return result.data as TConfigs;
}

export function setConfigsState(data: Omit<TConfigs, 'id'>) {
  return ajax.put('/configs', data);
}

export async function getLoginModules() {
  const result = await ajax.get('/plugin/logins');
  return result.data as TPlugin[];
}