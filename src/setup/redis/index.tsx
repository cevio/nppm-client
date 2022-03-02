import React, { Fragment, useMemo, useState } from 'react';
import { Component, useComponentWithMethod } from 'slox';
import { Box } from '../../components';
import { Col, Row, Input, InputNumber, Button, message } from 'antd';
import { setRedisState } from '../service';
import { useAsyncCallback } from 'react-async-hook';
import { Flex } from 'react-flexable';

@Component()
export class RedisSetup {
  private readonly textLabelSize = 6;
  private readonly holderLabelSize = 18;

  public render() {
    const Config = useComponentWithMethod(this.config, this);
    const [host, setHost] = useState<string>(null);
    const [port, setPort] = useState<number>(null);
    const [password, setPassword] = useState<string>(null);
    const [db, setDB] = useState<number>(null);
    const { loading, execute } = useAsyncCallback(() => {
      if (!canStart) return Promise.reject(new Error('请将信息填写完整'));
      return setRedisState({ host, port, password, db });
    });
    const canStart = useMemo(() => {
      if (!host) return false;
      if (!port || port < 0) return false;
      if (db && db < 0) return false;
      return true;
    }, [host, port, password, db]);
    const submit = () => {
      execute()
        .then(() => message.success('安装`Redis`成功'))
        .then(() => window.location.reload())
        .catch(e => message.error(e.message))
    }
    return <div className="setup_container">
      <Box traffic title="NPPM SETUP - 安装`Redis`">
        <Row gutter={[12, 12]} align="middle">
          <Config required title="连接地址">
            <Input disabled={loading} value={host} onChange={e => setHost(e.target.value)} placeholder="例如 127.0.0.1" style={{ width: 400 }} />
          </Config>
          <Config required title="端口">
            <InputNumber disabled={loading} value={port} onChange={e => setPort(e)} placeholder="例如 8642" step={1} min={3000} style={{ width: 120 }} />
          </Config>
          <Config title="数据库密码">
            <Input disabled={loading} value={password} onChange={e => setPassword(e.target.value)} placeholder="例如 admin888" type="password" style={{ width: 180 }} />
          </Config>
          <Config title="通道索引">
            <InputNumber disabled={loading} value={db} onChange={e => setDB(e)} placeholder="例如 0 选填" step={1} min={0} style={{ width: 120 }} />
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