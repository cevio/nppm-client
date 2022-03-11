import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';
import classnames from 'classnames';
import { Component, redirect, useComponentWithMethod, useLocation, useQuery } from 'slox';
import { Flex } from 'react-flexable';
import { Logo } from '../logo';
import { TUser, UserContext, GlobalContext } from '../../lib';
import { useAsync, useAsyncCallback } from 'react-async-hook';
import { weblogin, webLogout, getLoginModules } from './service';
import { NavgatorBreadCrumb } from '../breadcrumb';
import { getPackage } from '../../package/service';
import { 
  Space, 
  Breadcrumb, 
  Divider, 
  Typography, 
  Button, 
  Modal, 
  Input, 
  message, 
  Avatar, 
  Menu, 
  Dropdown, 
  Row, 
  Col, 
  Affix, 
  Badge, 
  Result, 
  Tooltip,
  Tag,
} from 'antd';
import { 
  AlertOutlined, 
  GithubOutlined, 
  UserOutlined, 
  LockOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  LogoutOutlined, 
  TeamOutlined, 
  SettingOutlined, 
  DatabaseOutlined, 
  ClusterOutlined, 
  AppstoreAddOutlined, 
  StarOutlined,
  SearchOutlined,
  CaretDownOutlined,
  FileMarkdownOutlined,
  BugOutlined,
  InboxOutlined,
  CloudDownloadOutlined,
  NotificationFilled,
} from '@ant-design/icons';

interface TNavBase {
  label: string,
  key: string,
}

interface TNavBom extends TNavBase {
  url: string,
  icon: React.ReactElement,
  match?: (current: string, pathname: string) => boolean,
  disabled?: boolean | ((user: TUser) => boolean),
}

interface TNavTop extends TNavBase {
  children: TNavBom[]
}

@Component()
export class Layout {
  private readonly setAdminDisabled = (user: TUser) => !user?.admin;
  private readonly setUserDisabled = (user: TUser) => !user?.id;
  private readonly navs: TNavTop[] = [
    {
      label: '管理中心',
      key: 'admin',
      children: [
        {
          label: '数据库配置',
          key: 'orm',
          url: '/admin/setting/orm',
          icon: <DatabaseOutlined />,
          disabled: this.setAdminDisabled.bind(this),
        },
        {
          label: 'Redis配置',
          key: 'redis',
          url: '/admin/setting/redis',
          icon: <ClusterOutlined />,
          disabled: this.setAdminDisabled.bind(this),
        },
        {
          label: '整站基本设置',
          key: 'setting',
          url: '/admin/setting/base',
          icon: <SettingOutlined />,
          disabled: this.setAdminDisabled.bind(this),
        },
        {
          label: '注册用户管理',
          key: 'user',
          url: '/admin/users',
          icon: <TeamOutlined />,
          disabled: this.setAdminDisabled.bind(this),
        },
        {
          label: '插件安装及管理',
          key: 'plugin',
          url: '/admin/plugins',
          icon: <AppstoreAddOutlined />,
          disabled: this.setAdminDisabled.bind(this),
        },
      ]
    },
    {
      label: '个人中心',
      key: 'base',
      children: [
        {
          label: '我的信息',
          key: 'scope',
          url: '/user',
          icon: <UserOutlined />,
          match: current => /^\/user\/\d+$/.test(current),
          disabled: this.setUserDisabled.bind(this)
        },
        {
          label: '我的收藏',
          key: 'like',
          url: '/stars',
          icon: <StarOutlined />,
          disabled: this.setUserDisabled.bind(this)
        },
      ]
    },
    {
      label: '数据统计',
      key: 'rank',
      children: [
        {
          label: '模块收藏榜',
          key: 'stars',
          url: '/rank/stars',
          icon: <InboxOutlined />
        },
        {
          label: '模块下载榜',
          key: 'downloads',
          url: '/rank/downloads',
          icon: <CloudDownloadOutlined />
        },
      ]
    }
  ]
  public render(props: React.PropsWithChildren<{ login?: boolean, admin?: boolean }>) {
    const pathname = useLocation(req => req.pathname);
    const BannerNavs = useComponentWithMethod(this.banner_navs, this);
    const ChooseUserOrLogin = useComponentWithMethod(this.chooseUserOrLogin, this);
    const Content = useComponentWithMethod(this.content, this);
    const user = useContext(UserContext);
    const onSearch = (value: string) => {
      if (!value) return;
      return redirect('/search?q=' + encodeURIComponent(value) + '&t=' + (value.startsWith('@') ? 'private' : 'public'))
    }
    return <div className={styles.layout}>
      <div className={styles.banner}>
        <Flex className={styles.container} align="between" valign="middle">
          <Space className={styles.slogen}> 
            <AlertOutlined />
            Node Private Package Manager
          </Space>
          <BannerNavs />
        </Flex>
      </div>
      <div className={styles.head}>
        <Flex className={styles.container} valign="middle" align="between">
          <Logo width={70} onClick={() => redirect('/')} className={styles.logo} />
          <Flex span={1} valign="middle" className={styles.search}>
            <Input 
              placeholder="Search Packages" 
              bordered={false} 
              prefix={<SearchOutlined className={styles.searchIcon} />} 
              className={styles.searcher} 
              onPressEnter={e => onSearch(e.currentTarget.value)}
            />
          </Flex>
          <ChooseUserOrLogin />
        </Flex>
      </div>
      <div className={classnames(styles.container, styles.content)}>
        <Row gutter={24}>
          <Col span={5}>
            <Affix offsetTop={24}>
              <div>
              {
                this.navs.map(nav => {
                  return <div className={styles.navs} key={nav.key}>
                    <Typography.Paragraph className={styles.title}>{nav.label}</Typography.Paragraph>
                    <ul>
                      {
                        nav.children.map(child => {
                          const matched = (child.match ? child.match(pathname, child.url) : pathname === child.url) || pathname === child.url;
                          const disabled = typeof child.disabled === 'boolean' 
                            ? child.disabled 
                            : typeof child.disabled === 'function'
                              ? child.disabled(user)
                              : false;
                          return <li key={nav.key + ':' + child.key} className={styles.nav}>
                            <Flex align="between" valign="middle">
                              <Typography.Link onClick={() => pathname !== child.url && redirect(child.url)} disabled={disabled}>
                                <Space>
                                  <span>{child.icon}</span>
                                  <span>{child.label}</span>
                                </Space>
                              </Typography.Link>
                              {matched ? <Badge status="processing" /> : <Badge status="default" />}
                            </Flex>
                          </li>
                        })
                      }
                    </ul>
                  </div>
                })
              }
              </div>
            </Affix>
          </Col>
          <Col span={19}>
            {
              props.login && !user.id
                ? <Result
                    status="403"
                    title="403"
                    subTitle="抱歉，此页面仅对登录用户开放"
                    extra={<Button type="primary" onClick={() => redirect('/')}>回首页</Button>}
                  />
                : props.admin && !user.admin
                  ? <Result
                      status="403"
                      title="403"
                      subTitle="抱歉，此页面仅对管理员开放"
                      extra={<Button type="primary" onClick={() => redirect('/')}>回首页</Button>}
                    />
                  : <Content>{props.children}</Content>
            }
          </Col>
        </Row>
      </div>
    </div>
  }

  private content(props: React.PropsWithChildren<{}>) {
    const [group, setGroup] = useState<string>(null);
    const [space, setSpace] = useState<string>(null);
    const pathname = useLocation(req => req.pathname);
    useEffect(() => {
      let getted = false;
      for (let i = 0; i < this.navs.length; i++) {
        const nav = this.navs[i];
        for (let j = 0; j < nav.children.length; j++) {
          const chunk = nav.children[j];
          const matched = (chunk.match ? chunk.match(pathname, chunk.url) : pathname === chunk.url) || pathname === chunk.url;
          if (matched) {
            setGroup(nav.label);
            setSpace(chunk.label);
            getted = true;
            break;
          }
        }
      }
      if (!getted) {
        setGroup(null);
        setSpace(null);
      }
    }, [pathname])
    return <Row gutter={[24, 24]}>
      {!!group && !!space && <Col span={24}><NavgatorBreadCrumb group={group} space={space} /></Col>}
      <Col span={24}>{props.children}</Col>
    </Row>
  }

  private banner_navs() {
    const globals = useContext(GlobalContext);
    const { result, error } = useAsync(getPackage, ['@nppm/npm']);
    const version = useMemo(() => {
      if (!result) return globals.version;
      return result['dist-tags'].latest || globals.version;
    }, [result]);
    const matched = version === globals.version;
    const color = matched ? 'success' : 'warning';
    useEffect(() => error && message.error(error.message), [error]);
    return <Breadcrumb separator={<Divider type="vertical" />}>
      <Breadcrumb.Item>
        <Typography.Link href="https://cevio.github.io/nppm/" target="_blank"><FileMarkdownOutlined /> 文档</Typography.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Typography.Link href="https://github.com/cevio/nppm/issues" target="_blank"><BugOutlined /> 讨论</Typography.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Typography.Link href="https://github.com/cevio/nppm" target="_blank"><GithubOutlined /> GitHub</Typography.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Tooltip title={matched ? null : '可以升级到最新版本v' + version}>
          <Tag style={{ cursor: 'pointer' }} color={color} onClick={() => redirect('/package/@nppm/npm?tab=versions')}>
            <span className="number">v{globals.version}</span>
            {!matched && <NotificationFilled style={{ fontSize: 12 }} />}
          </Tag>
        </Tooltip>
      </Breadcrumb.Item>
    </Breadcrumb>
  }

  private chooseUserOrLogin() {
    const user = useContext(UserContext);
    const User = useComponentWithMethod(this.user, this);
    const Login = useComponentWithMethod(this.loginButton, this);
    return user.id > 0 ? <User /> : <Login />
  }

  private loginButton() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const LoginModal = useComponentWithMethod(this.loginModal, this);
    return <Fragment>
      <Button type="primary" onClick={() => setIsModalVisible(true)}>登录</Button>
      <Modal title={null} footer={null} visible={isModalVisible} onCancel={() => setIsModalVisible(false)} width={400}>
        <LoginModal onCancel={() => setIsModalVisible(false)} />
      </Modal>
    </Fragment>
  }

  private loginModal(props: React.PropsWithoutRef<{ onCancel: () => void }>) {
    const [eye, setEye] = useState(false);
    const [username, setUsername] = useState<string>(null);
    const [password, setPassword] = useState<string>(null);
    const { loading, execute } = useAsyncCallback(weblogin);
    const getter = useAsync(getLoginModules, []);
    const logins = useMemo(() => {
      if (!getter) return [];
      if (!getter.result) return [];
      return getter.result;
    }, [getter?.result]);
    const submitDefaultLogin = () => {
      execute('default', { username, password })
        .then(() => message.success('登录成功'))
        .then(() => {
          setUsername(null);
          setPassword(null);
          props.onCancel();
        })
        .then(() => window.location.reload())
        .catch(e => message.error(e.message));
    }
    const submitThirdPartyLogin = (name: string) => {
      execute(name, { redirect: window.location.href })
        .then(res => window.location.href = res.data.loginUrl)
        .catch(e => message.error(e.message));
    }
    return <Flex direction="column" align="center" valign="middle">
      <Typography.Paragraph><Logo color="#13bf89" width={100} /></Typography.Paragraph>
      <Typography.Paragraph>Node Private Package Manager</Typography.Paragraph>
      <Typography.Paragraph>
        <Input
          disabled={loading} 
          size="large" 
          placeholder="请输入账号" 
          style={{ width: 300 }} 
          prefix={<UserOutlined />} 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
        />
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Input 
          size="large" 
          disabled={loading} 
          type={eye ? 'text' : 'password'}
          placeholder="请输入账号" 
          style={{ width: 300 }} 
          prefix={<LockOutlined />}
          value={password}
          onChange={e => setPassword(e.target.value)}
          suffix={<span style={{ cursor: 'pointer' }} onClick={() => setEye(!eye)}>{eye ? <EyeOutlined /> : <EyeInvisibleOutlined />}</span>}
        />
      </Typography.Paragraph>
      <Typography.Paragraph style={{ width: 300 }}>
        <Button block type="primary" size="large" loading={loading} onClick={submitDefaultLogin}>登录</Button>
      </Typography.Paragraph>
      <Divider plain>其他登录方式</Divider>
      <Space size={24}>
        {
          !logins.length
            ? <Typography.Text style={{ color: '#bbb', fontSize: 12 }}>暂无其他第三方登录</Typography.Text> 
            : logins.map(res => {
              return <Tooltip title={res.plugin_name} key={res.name}>
                <div className={styles.loginModule} onClick={() => submitThirdPartyLogin(res.name)}>
                  <Avatar src={res.plugin_icon} />
                </div>
              </Tooltip>
            })
        }
      </Space>
    </Flex>
  }

  private user() {
    const user = useContext(UserContext);
    const { execute, loading } = useAsyncCallback(webLogout);
    const logout = () => {
      execute()
        .then(() => message.success('退出登录成功'))
        .then(() => window.location.reload())
        .catch(e => message.error(e.message))
    }
    const menu = (
      <Menu style={{ minWidth: 200 }}>
        <Menu.Item disabled key="account" icon={<UserOutlined />}>{user.account}</Menu.Item>
        <Menu.Item disabled key="type" icon={<LockOutlined />}>{user.login_code === 'default' ? 'NPM默认': user.login_code}</Menu.Item>
        <Menu.Item disabled key="admin" icon={<TeamOutlined />}>{user.admin ? '管理员': '普通用户'}</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout" icon={<LogoutOutlined />} danger onClick={() => logout()} disabled={loading}>退出登录</Menu.Item>
      </Menu>
    );
    return <Dropdown overlay={menu}>
      <Space style={{ cursor: 'pointer' }}>
        <Avatar src={user.avatar} />
        <span className="number">{user.nickname}</span>
        <CaretDownOutlined style={{ fontSize: 12, color: '#aaa' }} />
      </Space>
    </Dropdown>
  }
}