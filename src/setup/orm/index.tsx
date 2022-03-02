import React, { Fragment, useMemo, useState } from 'react';
import dataBaseTypes from './databases';
import { Component, useComponentWithMethod } from 'slox';
import { Box } from '../../components';
import { Col, Row, Select, Input, InputNumber, Button, message } from 'antd';
import { setORMState } from '../service';
import { useAsyncCallback } from 'react-async-hook';
import { Flex } from 'react-flexable';

@Component()
export class ORMSetup {
  public readonly dataBaseTypes = dataBaseTypes;
  private readonly textLabelSize = 6;
  private readonly holderLabelSize = 18;

  public render() {
    const Config = useComponentWithMethod(this.config, this);
    const [type, setType] = useState<string>('mysql');
    const [host, setHost] = useState<string>(null);
    const [port, setPort] = useState<number>(null);
    const [username, setUsername] = useState<string>(null);
    const [password, setPassword] = useState<string>(null);
    const [database, setDatabase] = useState<string>(null);
    const { loading, execute } = useAsyncCallback(() => {
      if (!canStart) return Promise.reject(new Error('请将信息填写完整'));
      return setORMState({ type, host, port, username, password, database })
    });
    const canStart = useMemo(() => {
      if (!type || !dataBaseTypes.map(res => res.value).includes(type)) return false;
      if (!host) return false;
      if (!port || port < 0) return false;
      if (!username) return false;
      if (!password) return false;
      if (!database) return false;
      return true;
    }, [type, host, port, username, password, database]);
    const submit = () => {
      execute()
        .then(() => message.success('安装数据库成功'))
        .then(() => window.location.reload())
        .catch(e => message.error(e.message))
    }
    return <div className="setup_container">
      <Box traffic title="NPPM SETUP - 安装数据库">
        <Row gutter={[12, 12]} align="middle">
          <Config required title="数据库选择">
            <Select disabled={loading} options={this.dataBaseTypes} value={type} onChange={e => setType(e)}></Select>
          </Config>
          <Config required title="数据库连接地址">
            <Input disabled={loading} value={host} onChange={e => setHost(e.target.value)} placeholder="例如 127.0.0.1" style={{ width: 400 }} />
          </Config>
          <Config required title="数据库端口">
            <InputNumber disabled={loading} value={port} onChange={e => setPort(e)} placeholder="例如 8642" step={1} min={3000} style={{ width: 120 }} />
          </Config>
          <Config required title="数据库账号">
            <Input disabled={loading} value={username} onChange={e => setUsername(e.target.value)} placeholder="例如 admin" style={{ width: 180 }} />
          </Config>
          <Config required title="数据库密码">
            <Input disabled={loading} value={password} onChange={e => setPassword(e.target.value)} placeholder="例如 admin888" type="password" style={{ width: 180 }} />
          </Config>
          <Config required title="数据库名称">
            <Input disabled={loading} value={database} onChange={e => setDatabase(e.target.value)} placeholder="例如 mysql_database" style={{ width: 180 }} />
          </Config>
          <Config><Button type="primary" loading={loading} onClick={submit} disabled={!canStart}>开始</Button></Config>
        </Row>
      </Box>
    </div>
  }

  public config(props: React.PropsWithChildren<{ title?: string, required?: boolean }>) {
    return <Fragment>
      <Col span={this.textLabelSize}>
        <Flex align="right">{!!props.required && <span className="required">*</span>}{props.title}</Flex>
      </Col>
      <Col span={this.holderLabelSize}>{props.children}</Col>
    </Fragment>
  }
}