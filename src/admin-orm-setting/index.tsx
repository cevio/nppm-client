import styles from './index.module.less';
import { Col, Row, Select, Input, InputNumber, Button, Badge, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { Component, Controller, Middleware, inject, useComponentWithMethod } from 'slox';
import { Layout } from '../components';
import { useAsync, useAsyncCallback } from 'react-async-hook';
import { getORMState, setORMState } from './service';
import { ORMSetup } from '../setup/orm';
import AdminBaseSetting from '../admin-base-setting';
import { ExclamationCircleOutlined } from '@ant-design/icons';

@Component()
@Controller('/admin/setting/orm')
@Middleware(Layout, { login: true, admin: true })
export default class AdminORMSettingPage {
  @inject(ORMSetup) private readonly ORMSetup: ORMSetup;
  @inject(AdminBaseSetting) private readonly AdminBaseSetting: AdminBaseSetting;

  private readonly text = `
    修改数据库连接参数将自动重新连接数据库，系统将有秒级闪断，请慎重修改！
    如果修改的为一个新库将丢失原有数据，建议在安装完毕后不要修改数据库，以免造成不必要的损失！
    如果您已做好备份或者做好丢失数据准备，那么请继续修改操作！
  `;

  public render() {
    const getter = useAsync(getORMState, []);
    const setter = useAsyncCallback(setORMState)

    const [type, setType] = useState<string>('mysql');
    const [host, setHost] = useState<string>(null);
    const [port, setPort] = useState<number>(null);
    const [username, setUsername] = useState<string>(null);
    const [password, setPassword] = useState<string>(null);
    const [database, setDatabase] = useState<string>(null);

    const Config = useComponentWithMethod(this.AdminBaseSetting.config, this.AdminBaseSetting);
    const loading = useMemo(() => getter.loading || setter.loading, [getter.loading, setter.loading]);

    const canStart = useMemo(() => {
      if (!type || !this.ORMSetup.dataBaseTypes.map(res => res.value).includes(type)) return false;
      if (!host) return false;
      if (!port || port < 0) return false;
      if (!username) return false;
      if (!password) return false;
      if (!database) return false;
      return true;
    }, [type, host, port, username, password, database]);
    
    const submit = () => {
      setter.execute({ type, host, port, username, password, database })
        .then(() => message.success('更新数据库成功'))
        .catch(e => message.error(e.message))
    }

    useEffect(() => {
      if (getter.result) {
        setType(getter.result.type);
        setHost(getter.result.host);
        setPort(getter.result.port);
        setUsername(getter.result.username);
        setPassword(getter.result.password);
        setDatabase(getter.result.database);
      }
    }, [getter.result])

    const dbText = useMemo(() => this.ORMSetup.dataBaseTypes.map(r => r.label).join(', '), []);

    return <Row gutter={[24, 24]}>
      <Col span={24}><div className={styles.tip}><ExclamationCircleOutlined /> {this.text}</div></Col>
      <Config title={<Badge status="error" text="类型" />} description={'选择您希望创建的数据库类型，我们支持的类型有 ' + dbText + '，请选择其一。'}>
        <Select disabled={loading} options={this.ORMSetup.dataBaseTypes} value={type} onChange={e => setType(e)}></Select>
      </Config>
      <Config title={<Badge status="error" text="地址" />} description="连接地址，一般以IP为主，请正确填写 例如 127.0.0.1">
        <Input disabled={loading} value={host} onChange={e => setHost(e.target.value)} placeholder="例如 127.0.0.1" style={{ width: 400 }} />
      </Config>
      <Config title={<Badge status="error" text="端口" />} description="请写入端口，例如 8642">
        <InputNumber disabled={loading} value={port} onChange={e => setPort(e)} placeholder="例如 8642" step={1} min={3000} style={{ width: 120 }} />
      </Config>
      <Config title={<Badge status="error" text="账号" />} description="请输入数据库的使用者账号">
        <Input disabled={loading} value={username} onChange={e => setUsername(e.target.value)} placeholder="例如 admin" style={{ width: 180 }} />
      </Config>
      <Config title={<Badge status="error" text="密码" />} description="请输入数据库的密码">
        <Input disabled={loading} value={password} onChange={e => setPassword(e.target.value)} placeholder="例如 admin888" type="password" style={{ width: 180 }} />
      </Config>
      <Config title={<Badge status="error" text="名称" />} description="请输入数据库的名称">
        <Input disabled={loading} value={database} onChange={e => setDatabase(e.target.value)} placeholder="例如 mysql_database" style={{ width: 180 }} />
      </Config>
      <Col span={24}><Button type="primary" onClick={submit} disabled={!canStart} loading={loading}>保存</Button></Col>
    </Row>
  }
}