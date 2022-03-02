import styles from './index.module.less';
import { Col, Row, Input, InputNumber, Button, message, Badge } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Component, Controller, Middleware, inject, useComponentWithMethod } from 'slox';
import { Layout } from '../components';
import { useAsync, useAsyncCallback } from 'react-async-hook';
import { getRedisState, setRedisState } from './service';
import AdminBaseSetting from '../admin-base-setting';
import { ExclamationCircleOutlined } from '@ant-design/icons';

@Component()
@Controller('/admin/setting/redis')
@Middleware(Layout, { login: true, admin: true })
export default class AdminRedisSettingPage {
  @inject(AdminBaseSetting) private readonly AdminBaseSetting: AdminBaseSetting;

  private readonly text = '修改`Redis`连接参数将自动重新连接`Redis`，系统将有秒级闪断，请慎重修改！';

  public render() {
    const getter = useAsync(getRedisState, []);
    const setter = useAsyncCallback(setRedisState)

    const [host, setHost] = useState<string>(null);
    const [port, setPort] = useState<number>(null);
    const [password, setPassword] = useState<string>(null);
    const [db, setDB] = useState<number>(null);

    const Config = useComponentWithMethod(this.AdminBaseSetting.config, this.AdminBaseSetting);
    const loading = useMemo(() => getter.loading || setter.loading, [getter.loading, setter.loading]);

    const canStart = useMemo(() => {
      if (!host) return false;
      if (!port || port < 0) return false;
      if (db && db < 0) return false;
      return true;
    }, [host, port, password, db]);
    
    const submit = () => {
      setter.execute({ host, port, password, db })
        .then(() => message.success('更新`Redis`成功'))
        .catch(e => message.error(e.message))
    }

    useEffect(() => {
      if (getter.result) {
        setHost(getter.result.host);
        setPort(getter.result.port);
        setPassword(getter.result.password);
        setDB(getter.result.db);
      }
    }, [getter.result])

    return <Row gutter={[24, 32]} style={{ width: 700 }}>
      <Col span={24}><div className={styles.tip}><ExclamationCircleOutlined /> {this.text}</div></Col>
      <Config title={<Badge status="error" text="链接地址" />} description="连接地址，一般以IP为主，请正确填写 例如 127.0.0.1">
        <Input disabled={loading} value={host} onChange={e => setHost(e.target.value)} placeholder="例如 127.0.0.1" style={{ width: 500 }} />
      </Config>
      <Config title={<Badge status="error" text="端口" />} description="默认`Redis`端口为6379，如果您自定义了端口，请写入端口，例如 8642">
        <InputNumber disabled={loading} value={port} onChange={e => setPort(e)} placeholder="例如 8642" step={1} min={3000} style={{ width: 120 }} />
      </Config>
      <Config title="密码" description="如果您设置了`Redis`登录密码，请输入，例如 admin888">
        <Input disabled={loading} value={password} onChange={e => setPassword(e.target.value)} placeholder="例如 admin888" type="password" style={{ width: 180 }} />
      </Config>
      <Config title="通道索引" description="一般的，您可以选择`Redis`存储通道，它是一个数字，例如 0">
        <InputNumber disabled={loading} value={db} onChange={e => setDB(e)} placeholder="例如 0 选填" step={1} min={0} style={{ width: 120 }} />
      </Config>
      <Col span={24}><Button type="primary" loading={loading} onClick={submit} disabled={!canStart}>保存</Button></Col>
    </Row>
  }
}