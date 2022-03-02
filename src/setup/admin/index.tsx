import React, { Fragment, useMemo, useState } from 'react';
import { Component, useComponentWithMethod } from 'slox';
import { Box } from '../../components';
import { Col, Row, Input, Button, message } from 'antd';
import { setAdminState } from '../service';
import { useAsyncCallback } from 'react-async-hook';
import { Flex } from 'react-flexable';

@Component()
export class AdminSetup {
  private readonly textLabelSize = 6;
  private readonly holderLabelSize = 18;

  public render() {
    const Config = useComponentWithMethod(this.config, this);
    const [username, setUsername] = useState<string>(null);
    const [password, setPassword] = useState<string>(null);
    const [confirm, setConfirm] = useState<string>(null);
    const [email, setEmail] = useState<string>(null);
    const { loading, execute } = useAsyncCallback(() => {
      if (!canStart) return Promise.reject(new Error('请将信息填写完整'));
      if (password !== confirm) return Promise.reject(new Error('两次输入的密码不一致'));
      return setAdminState({ username, password, email });
    });
    const canStart = useMemo(() => {
      if (!username) return false;
      if (!password) return false;
      if (!email) return false;
      return true;
    }, [username, password, email]);
    const submit = () => {
      execute()
        .then(() => message.success('创建管理员成功'))
        .then(() => window.location.reload())
        .catch(e => message.error(e.message))
    }
    return <div className="setup_container">
      <Box traffic title="NPPM SETUP - 创建管理员">
        <Row gutter={[12, 12]} align="middle">
          <Config required title="账号">
            <Input disabled={loading} value={username} onChange={e => setUsername(e.target.value)} placeholder="例如 admin" style={{ width: 150 }} />
          </Config>
          <Config required title="密码">
            <Input disabled={loading} value={password} onChange={e => setPassword(e.target.value)} placeholder="例如 admin888" type="password" style={{ width: 150 }} />
          </Config>
          <Config required title="重复密码">
            <Input disabled={loading} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="例如 admin888" type="password" style={{ width: 150 }} />
          </Config>
          <Config required title="邮箱">
            <Input disabled={loading} value={email} onChange={e => setEmail(e.target.value)} placeholder="例如 admin@qq.com" style={{ width: 300 }} />
          </Config>
          <Config><Button type="primary" loading={loading} onClick={submit} disabled={!canStart}>保存</Button></Config>
        </Row>
      </Box>
    </div>
  }

  private config(props: React.PropsWithChildren<{ title?: string, required?: boolean }>) {
    return <Fragment>
      <Col span={this.textLabelSize}>
        <Flex align="right">{!!props.required && <span className="required">*</span>}{props.title}</Flex>
      </Col>
      <Col span={this.holderLabelSize}>{props.children}</Col>
    </Fragment>
  }
}