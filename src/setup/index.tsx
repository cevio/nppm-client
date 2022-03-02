import React, { useEffect } from 'react';
import { Component, inject, useComponent, useComponentWithMethod } from 'slox';
import { useAsync } from 'react-async-hook';
import { getWebsiteMode, getUserInfo } from './service';
import { message, Spin } from 'antd';
import { ORMSetup } from './orm';
import { RedisSetup } from './redis';
import { AdminSetup } from './admin';
import { defaultUserInfo, UserContext, GlobalContext } from '../lib';

@Component()
export default class Page {
  @inject(ORMSetup) private readonly ORMSetup: ORMSetup;
  @inject(RedisSetup) private readonly RedisSetup: RedisSetup;
  @inject(AdminSetup) private readonly AdminSetup: AdminSetup;
  public render(props: React.PropsWithChildren<{}>) {
    const ORMSETUP = useComponent(this.ORMSetup);
    const REDISSETUP = useComponent(this.RedisSetup);
    const ADMINSETUP = useComponent(this.AdminSetup);
    const User = useComponentWithMethod(this.user, this);
    const { loading, result, error } = useAsync(getWebsiteMode, []);
    useEffect(() => {
      if (error) {
        return message.error(error.message);
      }
    }, [error]);
    return <GlobalContext.Provider value={{ version: result?.version }}>
      <Spin spinning={loading} style={{ minHeight: 200 }}>
        {result?.mode === 1 && <ORMSETUP />}
        {result?.mode === 2 && <REDISSETUP />}
        {result?.mode === 3 && <ADMINSETUP />}
        {result?.mode === 0 && <User>{props.children}</User>}
      </Spin>
    </GlobalContext.Provider>
  }

  private user(props: React.PropsWithChildren<{}>) {
    const { loading, result, error } = useAsync(getUserInfo, []);
    useEffect(() => {
      if (error) {
        return message.error(error.message);
      }
    }, [error]);
    return <Spin spinning={loading}>
      <UserContext.Provider value={result || defaultUserInfo}>{props.children}</UserContext.Provider>
    </Spin>
  }
}