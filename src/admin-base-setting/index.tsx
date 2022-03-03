import styles from './index.module.less';
import classnames from 'classnames';
import { Col, Input, Row, Space, Checkbox, ButtonProps, InputProps, Button, message, Spin, Avatar, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Component, Controller, Middleware, useComponentWithMethod, inject, useComponent } from 'slox';
import { Layout, TagTreeInput } from '../components';
import { useAsync, useAsyncCallback } from 'react-async-hook';
import { getConfigsState, setConfigsState, getLoginModules, TPlugin } from './service';
import { EnterOutlined, PlusOutlined } from '@ant-design/icons';
import { Flex } from 'react-flexable';

@Component()
@Controller('/admin/setting/base')
@Middleware(Layout, { login: true, admin: true })
export default class AdminBaseSettingPage {
  @inject(TagTreeInput) private readonly TagTreeInput: TagTreeInput;
  private readonly scopeButtonProps: ButtonProps = {
    type: 'link',
    icon: <PlusOutlined />
  };

  private readonly scopeInputProps: InputProps = {
    placeholder: '输入命名空间名称',
    prefix: '@',
    suffix: <EnterOutlined />
  }

  private readonly registryButtonProps: ButtonProps = {
    type: 'link',
    icon: <PlusOutlined />
  };

  private readonly registryInputProps: InputProps = {
    placeholder: '输入公有源地址，以 HTTP 或者 HTTPS 开头',
    suffix: <EnterOutlined />
  }

  public render() {
    const Config = useComponentWithMethod(this.config, this);
    const TagTreeInput = useComponent(this.TagTreeInput);
    const Logins = useComponentWithMethod(this.logins, this);

    const [domain, setDomain] = useState<string>(null);
    const [scopes, setScopes] = useState<string[]>([]);
    const [registries, setRegistries] = useState<string[]>([]);
    const [loginCode, setLoginCode] = useState('default');
    const [dictionary, setDictionary] = useState('packages');
    const [registerAble, setRegisterAble] = useState(false);
    const [installable, setInstallable] = useState(true);

    const getter = useAsync(getConfigsState, []);
    const setter = useAsyncCallback(setConfigsState);

    const addScope = (value: string) => {
      const _scopes = scopes.slice(0);
      if (!_scopes.includes('@' + value)) {
        _scopes.push('@' + value);
        setScopes(_scopes);
      }
    }

    const removeScope = (value: string) => {
      const _scopes = scopes.slice(0);
      const index = _scopes.indexOf(value);
      if (index > -1) {
        _scopes.splice(index, 1);
        setScopes(_scopes);
      }
    }

    const addRegistry = (value: string) => {
      const _registry = registries.slice(0);
      if (!_registry.includes(value)) {
        _registry.unshift(value);
        setRegistries(_registry);
      }
    }

    const removeRegistry = (value: string) => {
      const _registry = registries.slice(0);
      const index = _registry.indexOf(value);
      if (index > -1) {
        _registry.splice(index, 1);
        setRegistries(_registry);
      }
    }

    const submit = () => {
      setter.execute({ domain, scopes, registries, login_code: loginCode, dictionary, registerable: registerAble, installable })
        .then(() => message.success('保存配置成功'))
        .catch(e => message.error(e.message));
    }

    useEffect(() => {
      if (getter.result) {
        setDomain(getter.result.domain);
        setScopes(getter.result.scopes);
        setRegistries(getter.result.registries);
        setLoginCode(getter.result.login_code);
        setDictionary(getter.result.dictionary);
        setRegisterAble(getter.result.registerable);
        setInstallable(!!getter.result.installable);
      }
    }, [getter.result]);

    return <Row gutter={[24, 32]} style={{ width: 700 }}>
      <Config title="网站地址" description="此选项关系到模块包tgz文件的下载，所以为必填项。你必须设置为本服务可访问域名。">
        <Input value={domain} onChange={e => setDomain(e.target.value)} style={{ width: 500 }} placeholder="请输入网站域名地址 HTTP 或 HTTPS 开头" />
      </Config>
      <Config title="注册" description="开关，关系到新注册用户是否可以注册NPM默认模式，即NPM的账号密码，第三方登录不受影响。如果已注册用户，则不影响登录。">
        <Checkbox checked={registerAble} onChange={e => setRegisterAble(e.target.checked)}>开放NPM默认注册模式</Checkbox>
      </Config>
      <Config title="安装模块" description="开关，关系到是否在未登录情况下能够安装模块。此功能结合注册选项用于将本程序搭建在外网的情况下保障模块不被窃取。">
        <Checkbox checked={installable} onChange={e => setInstallable(e.target.checked)}>允许开放安装模块</Checkbox>
      </Config>
      <Config title="网站允许使用的命名空间" description="可使用的scope前缀。比如@node，那么这个scope前缀的模块将可以被接受。如果管理员设定用户自身的scope前缀，将会与此项组合后判断是否接受。">
        <TagTreeInput 
          buttonText = "添加命名空间"
          button={this.scopeButtonProps} 
          input={this.scopeInputProps}
          dataSource={scopes} 
          onAddone={addScope} 
          onRemoveone={removeScope} 
          emptyText="暂无命名空间"
          loading={getter.loading}
        />
      </Config>
      <Config title="网站允许使用的公有源" description="在非私有模块被请求的时候，将按照我们设置的同步源去获取模块信息。此项具有顺序性，根据顺序将自动获取模块信息。">
        <TagTreeInput 
          buttonText = "添加共有源"
          button={this.registryButtonProps} 
          input={this.registryInputProps}
          dataSource={registries} 
          onAddone={addRegistry} 
          onRemoveone={removeRegistry} 
          emptyText="暂无公有源"
          loading={getter.loading}
        />
      </Config>
      <Config title="发布包文件保存文件夹地址" description="一旦初期设定好这个变量，建议不要更换，以免影响使用。目前还没有实现修正这个目录功能。">
        <Input value={dictionary} onChange={e => setDictionary(e.target.value)} placeholder="请输入包存在文件夹地址" />
      </Config>
      <Config title="选择NPM命令行默认登录方式">
        <Logins value={loginCode} onChange={setLoginCode} />
      </Config>
      <Col span={24}>
        <Button type="primary" onClick={submit} loading={setter.loading} disabled={getter.loading}>保存配置</Button>
      </Col>
    </Row>
  }

  public config(props: React.PropsWithChildren<{ title: React.ReactNode, description?: string, descriptionPosition?: 'top' | 'bottom', extra?: React.ReactNode }>) {
    return <Col span={24}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Flex blocked align="between" valign="middle">
          <Flex span={1} scroll="hide" style={{ marginRight: 24 }}>
            <Typography.Text ellipsis>{props.title}</Typography.Text>
          </Flex>
          {props.extra}
        </Flex>
        {!!props.description && props.descriptionPosition === 'top' && <div className={styles.description}>{props.description}</div>}
        <div>{props.children}</div>
        {!!props.description && props.descriptionPosition !== 'top' && <div className={styles.description}>{props.description}</div>}
      </Space>
    </Col>
  }

  private readonly pluginColSpan = 12;
  private readonly pluginDefaultLoginState: TPlugin = {
    name: 'default',
    version: __VERSION__,
    description: '基于NPM的默认登录方式，以用户名和密码登录为主。',
    plugin_name: 'NPM默认登录',
    plugin_icon: <Avatar style={{ backgroundColor: '#EA2039' }} size="large">DEFAULT</Avatar>,
    nppm: true,
  }

  private logins(props: React.PropsWithoutRef<{ value: string, onChange: (e: string) => void }>) {
    const Login = useComponentWithMethod(this.login, this);
    const { loading, result, error } = useAsync(getLoginModules, []);
    useEffect(() => {
      if (error) {
        return message.error(error.message);
      }
    }, [error])
    return <Spin spinning={loading}>
      <Row gutter={[24, 24]}>
        <Col span={this.pluginColSpan}><Login dataSource={this.pluginDefaultLoginState} current={props.value} onChange={props.onChange} /></Col>
        {
          (result || []).map(res => {
            return <Col span={this.pluginColSpan} key={res.name}>
              <Login dataSource={res} current={props.value} onChange={props.onChange} />
            </Col>
          })
        }
      </Row>
    </Spin>
  }

  private login(state: React.PropsWithoutRef<{
    dataSource: TPlugin,
    current: string,
    onChange: (e: string) => void,
  }>) {
    return <Flex blocked className={classnames(styles.login, { [styles.active]: state.dataSource.name === state.current })} onClick={() => state.onChange(state.dataSource.name)}>
      {
        typeof state.dataSource.plugin_icon === 'string'
          ? <Avatar size="large" src={state.dataSource.plugin_icon} />
          : state.dataSource.plugin_icon
      }
      <Flex span={1} scroll="hide" direction="column" className={styles.content}>
        <Typography.Text ellipsis title={state.dataSource.plugin_name}>{state.dataSource.plugin_name}</Typography.Text>
        <div className={styles.version}>{state.dataSource.name}@{state.dataSource.version}</div>
        <Typography.Paragraph ellipsis={{ rows: 2 }} className={styles.desc}>{state.dataSource.description}</Typography.Paragraph>
      </Flex>
    </Flex>
  }
}