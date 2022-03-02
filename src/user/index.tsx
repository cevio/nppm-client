import dayjs from 'dayjs';
import styles from './index.module.less';
import AdminBaseSetting from '../admin-base-setting';
import React, { useContext, useEffect, useState } from 'react';
import { Component, Controller, Middleware, useComponentWithMethod, useParam, inject, useComponent } from 'slox';
import { Layout, TagTreeInput, Package } from '../components';
import { TUser, UserContext } from '../lib';
import { Avatar, ButtonProps, Col, Divider, InputProps, message, Row, Select, Space, Spin, Switch, Tooltip, Typography, Pagination, Input, Empty } from 'antd';
import { getUser, setUserAdminForbiddenStatus, setUserAdminStatus, setUserScopes, getUserPackages } from './service';
import { useAsync, useAsyncCallback } from 'react-async-hook';
import { Flex } from 'react-flexable';
import { UserOutlined, MailOutlined, KeyOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { EnterOutlined, PlusOutlined } from '@ant-design/icons';


@Component()
@Controller('/user')
@Controller('/user/:id')
@Middleware(Layout, { login: true })
export default class UserPage {
  @inject(TagTreeInput) private readonly TagTreeInput: TagTreeInput;
  @inject(AdminBaseSetting) private readonly AdminBaseSetting: AdminBaseSetting;

  private readonly scopeButtonProps: ButtonProps = { type: 'primary', icon: <PlusOutlined /> }
  private readonly scopeInputProps: InputProps = {
    placeholder: '输入命名空间名称',
    prefix: '@',
    suffix: <EnterOutlined />,
  }

  private readonly conditions = [
    {
      label: '我发起的模块',
      value: 0
    },
    {
      label: '我参与的模块',
      value: 1
    }
  ]

  private readonly pageSizeOptions = ['9', '15', '30', '60'];

  public render() {
    const TagTreeInput = useComponent(this.TagTreeInput);
    const AdminBaseSettingConfig = useComponentWithMethod(this.AdminBaseSetting.config, this.AdminBaseSetting);
    const Switcher = useComponentWithMethod(this.switcher, this);
    const user = useContext(UserContext);
    const User = useComponentWithMethod(this.user, this);
    const id = useParam('id', user.account);
    const { loading, result, error } = useAsync(getUser, [id]);
    const [scopes, setScopes] = useState<string[]>([]);
    const [type, setType] = useState(this.conditions[0].value);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(15);
    const [keyword, setKeyword] = useState<string>(null);
    const scope = useAsyncCallback(setUserScopes);
    const getter = useAsync(() => {
      if (result?.id) {
        return getUserPackages(result.id, { page, size, keyword, type });
      }
    }, [result?.id, page, size, keyword, type]);
    const dataSource = getter && getter.result && getter.result[0] ? getter.result[0] : [];
    const count = getter && getter.result && getter.result[1] ? getter.result[1] : 0;
    const addScope = (value: string) => {
      if (result?.id) {
        const _scopes = scopes.slice(0);
        if (_scopes.indexOf('@' + value) === -1) {
          _scopes.push('@' + value);
          scope.execute(result.id, _scopes)
            .then(() => setScopes(_scopes))
            .then(() => message.success('更新成功'))
            .catch(e => message.error(e.message));
        }
      }
    }
    const removeScope = (value: string) => {
      if (result?.id) {
        const _scopes = scopes.slice(0);
        const index = _scopes.indexOf(value);
        if (index > -1) {
          _scopes.splice(index, 1);
          scope.execute(result.id, _scopes)
            .then(() => setScopes(_scopes))
            .then(() => message.success('更新成功'))
            .catch(e => message.error(e.message));
        }
      }
    }
    const onPageChange = (a: number, b: number) => {
      setPage(a);
      setSize(b);
    }
    useEffect(() => setScopes(result?.scopes || []), [result?.scopes]);
    useEffect(() => {
      if (error) {
        return message.error(error.message);
      }
    }, [error]);
    useEffect(() => {
      if (getter.error) {
        return message.error(getter.error.message);
      }
    }, [getter.error]);
    return <Spin spinning={loading}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Flex blocked>
            <Flex span={1} scroll="hide"><User {...result} /></Flex>
            <Flex direction="column" valign="bottom">
              <Switcher disabled={!user.admin || user?.id === result?.id} title="管理员" feedback={setUserAdminStatus} uid={result?.id} value={!!result?.admin} okText="是" noText="否" />
              <Switcher disabled={!user.admin || user?.id === result?.id} title="登录限制" feedback={setUserAdminForbiddenStatus} uid={result?.id} value={!!result?.login_forbiden} okText="允" noText="禁" reverse />
            </Flex>
          </Flex>
        </Col>
        <Col span={24}>
          <AdminBaseSettingConfig title="我的命名空间" description="用户单独可使用的scope前缀。比如@node，那么这个scope前缀的模块将可以被接受。如果管理员设定系统的scope前缀，将会与此项组合后判断是否接受。" descriptionPosition="top">
            <TagTreeInput
              disabled={!user?.admin} 
              loading={scope.loading}
              dataSource={scopes} 
              onAddone={addScope} 
              onRemoveone={removeScope} 
              button={this.scopeButtonProps}
              input={this.scopeInputProps}
              emptyText="暂无命名空间"
              buttonText="添加命名空间"
            />
          </AdminBaseSettingConfig>
        </Col>
        <Col span={24}>
          <AdminBaseSettingConfig 
            title={`我的模块(${count})`} 
            extra={
              <Space>
                <Select options={this.conditions} value={type} onChange={e => setType(e)} />
                <Input.Search placeholder="搜索模块的关键字..." onSearch={e => setKeyword(e)} onChange={e => {
                  if (!e.target.value) setKeyword(null);
                }} />
              </Space>
            }
          >
            <Spin spinning={getter.loading}>
              <Row gutter={[24, 24]}>
              {
                !!dataSource.length 
                  ? dataSource.map(res => {
                      return <Col span={8} key={res.id}><Package {...res} /></Col>
                    })
                  : <Col span={24}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无模块" /></Col>
              }
              {
                !!dataSource.length && <Col span={24}>
                  <Pagination 
                    showSizeChanger 
                    current={page} 
                    pageSize={size} 
                    total={count} 
                    onChange={onPageChange} 
                    pageSizeOptions={this.pageSizeOptions} 
                  />
                </Col>
              }
              </Row>
            </Spin> 
          </AdminBaseSettingConfig>
        </Col>
      </Row>
    </Spin>
  }

  private user(result: React.PropsWithoutRef<TUser>) {
    return <Flex blocked className={styles.user}>
      <Avatar src={result?.avatar} size={44} className={styles.avatar} />
      <Flex scroll="hide" direction="column" className={styles.info} span={1}>
        <Typography.Text ellipsis className={styles.nickname} title={result?.nickname}>
          {result?.nickname} 
          <Typography.Text className={styles.account} copyable={{ text: result?.account }}><UserOutlined /> {result?.account}</Typography.Text>
        </Typography.Text>
        <Typography.Text ellipsis className={styles.email} title={result?.email}>
          <Typography.Link href={'mailto:' + result.email} target="_blank"><MailOutlined /> {result?.email}</Typography.Link>
          <Divider type="vertical" />
          <Tooltip title="注册方式"><KeyOutlined /> {result.login_code === 'default' ? 'NPM默认' : result.login_code}</Tooltip>
          <Divider type="vertical" />
          <Tooltip title="注册时间">
            <FieldTimeOutlined /> {dayjs(result.gmt_create).format('YYYY-MM-DD HH:mm:ss')}
          </Tooltip>
          {/* <Divider type="vertical" />
          <Tooltip title="最后登录或更新时间">
            <ClockCircleOutlined /> {dayjs(result.gmt_modified).format('YYYY-MM-DD HH:mm:ss')}
          </Tooltip> */}
        </Typography.Text>
      </Flex>
    </Flex>
  }

  private switcher(props: React.PropsWithoutRef<{ 
    title: string,
    uid: number,
    value: boolean,
    okText?: string,
    noText?: string,
    feedback: (id: number, status: boolean) => Promise<unknown>,
    reverse?: boolean,
    disabled?: boolean,
  }>) {
    const [value, setValue] = useState(false);
    const { loading, execute } = useAsyncCallback(props.feedback);
    const submit = () => {
      if (!props.uid) return message.warn('未知用户');
      if (props.disabled) return;
      execute(props.uid, props.reverse ? value : !value)
        .then(() => setValue(!value))
        .then(() => message.success('更新成功'))
        .catch(e => message.error(e.message))
    }
    useEffect(() => setValue(props.reverse ? !props.value : props.value), [props.value, props.reverse]);
    return <Space>
      <span className={styles.switcherTitle}>{props.title}</span>
      <Switch disabled={props.disabled} size="small" loading={loading} checked={value} onChange={submit} checkedChildren={props.okText} unCheckedChildren={props.noText} />
    </Space>
  }
}