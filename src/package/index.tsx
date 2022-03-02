import * as gravatar from 'gravatar';
import classnames from 'classnames';
import styles from './index.module.less';
import dayjs from 'dayjs';
import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import licenseurl from 'oss-license-name-to-url';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Component, Controller, Middleware, useComponentWithMethod, useParam, redirect, useQuery, useLocation } from 'slox';
import { Layout } from '../components';
import { getPackage, TPackageState, TPackageVersionState, getMaintainers, getPackageStar, setPackageStar, getPackageEntity, setPackageTransfer } from './service';
import { useAsync, useAsyncCallback } from 'react-async-hook';
import { Col, Empty, Row, Spin, Space, Tag, Typography, Avatar, message, Select, Button, Tabs, Table, Menu, Dropdown, Popconfirm, Modal } from 'antd';
import { DatabaseFilled, StarFilled, AlertFilled, ApiFilled, GithubFilled, StarOutlined } from '@ant-design/icons';
import { Flex } from 'react-flexable';
import { ColumnsType } from 'antd/lib/table';
import { UserContext } from '../lib';

const { Option } = Select;
const { TabPane } = Tabs;

const ReachableContext = React.createContext('Light');
const UnreachableContext = React.createContext('Bamboo');

interface TVersion {
  label: string, 
  value: string, 
  alias?: string,
  time?: string,
}

@Component()
@Controller('/package/:pkg')
@Controller('/package/:pkg/v/:version')
@Controller('/package/@:scope/:pkg')
@Controller('/package/@:scope/:pkg/v/:version')
@Middleware(Layout)
export default class PackagePage {
  public render() {
    const scope = useParam('scope');
    const pkg = useParam('pkg');
    const _version = useParam('version');
    const pathname = useMemo(() => scope ? '@' + scope + '/' + pkg : pkg, [scope, pkg]);
    const { loading, result, error } = useAsync(getPackage, [pathname]);
    const __version = useMemo(() => {
      if (!result) return null;
      return !_version ? result['dist-tags']['latest'] : _version;
    }, [_version, result])
    const version = useMemo(() => {
      if (!result) return null;
      return result.versions[__version];
    }, [__version, result]);
    const versions = useMemo(() => this.getVersions(result), [result]);
    const ReadmeArea = useComponentWithMethod(this.readmeArea, this);
    const Title = useComponentWithMethod(this.title, this);
    const Versions = useComponentWithMethod(this.versions, this);
    const Keywords = useComponentWithMethod(this.keywords, this);
    const Maintainers = useComponentWithMethod(this.maintainers, this);
    const Deps = useComponentWithMethod(this.deps, this);
    const tab = useQuery('tab', 'readme');
    const url_pathname = useLocation(req => req.pathname);

    return <Spin spinning={loading} style={{ minHeight: 200 }} tip="加载公有模块会比较缓慢，请耐心等待...">
      {
        error 
          ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={error.message} />
          : <Row gutter={[12, 24]}>
              <Col span={24}>
                {!!version && <Title 
                  isNppm={!!result._nppm} 
                  current={__version} 
                  version={version} 
                  versions={versions} 
                  time={dayjs(result.time[version.version]).format('YYYY-MM-DD HH:mm:ss')} 
                />}
              </Col>
              <Col span={24}>
                <Tabs activeKey={tab} onChange={e => redirect(url_pathname + '?tab=' + e)}>
                  <TabPane tab="文档" key="readme">
                    {!!result && <ReadmeArea {...result} extra={
                      !!version && !!version.keywords && !!version.keywords.length && 
                      <Keywords dataSource={version.keywords} isPrivate={!!result._nppm} />
                    } />}
                  </TabPane>
                  <TabPane tab="版本" key="versions">
                    {!!result && <Versions dataSource={result} />}
                  </TabPane>
                  <TabPane tab="依赖" key="dependencies">
                    {!!version && <Deps dataSource={version?.dependencies || {}} />}
                  </TabPane>
                  <TabPane tab="贡献者" key="maintainers">
                    {!!version && <Maintainers name={pathname} maintainers={version?.maintainers || []} />}
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
      }
    </Spin>
  }

  private versions(props: React.PropsWithoutRef<{ dataSource: TPackageState }>) {
    const state = useMemo(() => this.getVersions(props.dataSource, true), [props.dataSource]);
    const columns = useMemo(() => this.versionColumns(props.dataSource.name), [props.dataSource.name]);
    return <Table pagination={false} dataSource={state} columns={columns} rowKey={rec => rec.value + ':' + rec.alias} />
  }

  private keywords(props: React.PropsWithoutRef<{ dataSource: string[], isPrivate: boolean }>) {
    return <Fragment>
      <Typography.Title level={2} style={{ marginTop: 24 }}>Keywords</Typography.Title>
      <Typography.Paragraph className={styles.keywords}>
        {
          props.dataSource.map(res => {
            return <Typography.Link key={res} onClick={() => redirect('/search?q=' + res + '&t=' + (props.isPrivate ? 'private' : 'public'))}>{res}</Typography.Link>
          })
        }
      </Typography.Paragraph>
    </Fragment>
  }

  private maintainers(props: React.PropsWithoutRef<{ name: string, maintainers: TPackageVersionState['maintainers'] }>) {
    const { result, error } = useAsync(getMaintainers, [props.name]);
    const maintainers = useMemo(() => {
      if (result && result.length) return result;
      return (props.maintainers || []).map(m => {
        return Object.assign(m, { avatar: gravatar.url(m.email), public: true });
      })
    }, [result])
    useEffect(() => {
      if (error) return message.error(error.message);
    }, [error]);
    return <Row className={styles.maintainers} gutter={[24, 24]}>
      {
        !maintainers.length
          ? <Empty description="此模块无贡献者" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ width: '100%' }} />
          : maintainers.map(maintainer => {
            return <Col span={6} key={maintainer.name}>
              <Flex blocked className={classnames(styles.maintainer, {
                [styles.clickable]: !maintainer.public,
              })} onClick={() => !maintainer.public && redirect('/user/' + maintainer.name)}>
                <Avatar src={maintainer.avatar} size={38} />
                <Flex span={1} scroll="hide" direction="column">
                  <Typography.Text ellipsis>{maintainer.name}</Typography.Text>
                  <Typography.Text ellipsis className={styles.email}>{maintainer.email}</Typography.Text>
                </Flex>
              </Flex>
            </Col>
          })
      }
    </Row>
  }

  private deps(props: React.PropsWithoutRef<{ dataSource: TPackageVersionState['dependencies'] }>) {
    const data = useMemo(() => {
      if (!props.dataSource) return [];
      const keys = Object.keys(props.dataSource);
      return keys.map(key => {
        return {
          label: key,
          value: props.dataSource[key],
        }
      })
    }, [props?.dataSource]);
    return <Row gutter={[24, 8]}>
      {
        !data.length 
          ? <Empty description="此模块无依赖" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ width: '100%' }} />
          : data.map(res => {
              return <Col span={6} key={res.label}>
                <Typography.Link ellipsis title={res.label} className={styles.dep} style={{ marginRight: 24 }} onClick={() => redirect('/package/' + res.label)}>
                  {res.label}
                </Typography.Link>
              </Col>
            })
      }
    </Row>
  }

  private versionColumns(name: string): ColumnsType<TVersion> {
    return [
      {
        title: '版本号',
        dataIndex: 'label',
        className: 'number',
        render(version: string){
          return <Typography.Link onClick={() => redirect(`/package/${name}/v/${version}`)}>{version}</Typography.Link>
        }
      },
      {
        title: '别名',
        dataIndex: 'alias',
        className: 'number'
      },
      {
        title: '发布时间',
        dataIndex: 'time',
        width: 200,
        className: 'number',
        render(time: string) {
          return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
        }
      }
    ];
  }

  private getVersions(props: TPackageState, timeable?: boolean): TVersion[] {
    if (!props) return [];
    const pools: TVersion[] = [];
    const keys: string[] = [];
    if (props['dist-tags']) {
      for (const key in props['dist-tags']) {
        pools.push({
          label: props['dist-tags'][key],
          value: props['dist-tags'][key],
          alias: key,
          time: timeable ? props.time[props['dist-tags'][key]] : undefined,
        })
        keys.push(props['dist-tags'][key]);
      }
    }
    pools.push(...Object.keys(props.versions).filter(version => !keys.includes(version)).map(version => {
      return {
        label: version,
        value: version,
        time: timeable ? props.time[version] : undefined
      }
    }).sort())
    return pools;
  }

  private readmeArea(props: React.PropsWithoutRef<TPackageState & { extra?: React.ReactNode }>) {
    return <div className={styles.markdown}>
      <Markdown 
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]} 
        remarkPlugins={[remarkGfm]}
      >{props.readme || 'No Readme'}</Markdown>
      {props.extra}
    </div>
  }

  private title(props: React.PropsWithoutRef<{ version: TPackageVersionState, time: string, versions: TVersion[], current: string, isNppm?: boolean }>) {
    const Star = useComponentWithMethod(this.star, this);
    const Transfer = useComponentWithMethod(this.transfer, this);
    const [v, setV] = useState<string>(props.current);
    useEffect(() => setV(props.current), [props.current]);
    return <Space direction="vertical" style={{ width: '100%' }} size={8}>
      <Flex align="between" valign="middle" blocked direction="row" className={styles.head} scroll="hide">
        <Flex span={1} scroll="hide" direction="row" className={styles.left} valign="middle">
          <Space className={styles.pathname}>
            {/* <DatabaseFilled /> */}
            {props.version.name}
          </Space>
          <Flex scroll="hide" className={styles.desc} valign="middle">
            <Tag color="volcano">@{props.version.version}</Tag>
            <Typography.Text className={styles.time} copyable={{ text: `npm i ${props.version.name} --registry=${window.location.origin}` }}>{props.time} Published</Typography.Text>
          </Flex>
        </Flex>
        <Flex className={styles.right} valign="middle">
          <Space align="center">
            <Select value={v} onChange={e => redirect('/package/' + props.version.name + '/v/' + e)}>
              {
                props.versions.map(version => {
                  return <Option value={version.value} key={version.value}>
                    <Flex align="between" valign="middle" style={{ columnGap: 24 }} title={version.label} className={styles.version}>
                      <span>v{version.label}</span>
                      <span className={styles.alias}>{version.alias ? '@' + version.alias : null}</span>
                    </Flex>
                  </Option>
                })
              }
            </Select>
            {!!props.isNppm && <Star pkg={props.version.name} />}
            {!!props.isNppm && !!props.version && <Transfer name={props.version.name} />}
          </Space>
        </Flex>
      </Flex>
      {
        (!!props.version.license || !!props.version.homepage || !!props.version.repository) && <Space className={styles.buttons} size={8}>
          {!!props.version.license && <div className={styles.item}><AlertFilled /> <Typography.Link href={licenseurl(props.version.license)} target="_blank">{props.version.license}</Typography.Link></div>}
          {!!props.version.homepage && <div className={styles.item}><ApiFilled /> <Typography.Link href={props.version.homepage} target="_blank">{props.version.homepage}</Typography.Link></div>}
          {!!props.version.repository && props.version.repository.url && <div className={styles.item}><GithubFilled /> <Typography.Link ellipsis href={props.version.repository.url.replace(/^[^\+]+\+/, '')} target="_blank">{props.version.repository.url.replace(/^[^\+]+\+/, '')}</Typography.Link></div>}
        </Space>
      }
      {!!props?.version?.description && <Typography.Paragraph ellipsis={{ rows: 2 }} className={styles.description} title={props.version.description}>{props.version.description}</Typography.Paragraph>}
    </Space>
  }

  private star(props: React.PropsWithoutRef<{ pkg: string }>) {
    const getter = useAsync(getPackageStar, [props.pkg]);
    const setter = useAsyncCallback(setPackageStar);
    const checked = !!getter?.result?.status;
    const count = getter?.result?.count || 0;
    const submit = () => {
      const status = !getter.result.status;
      setter.execute(props.pkg, status)
        .then(() => getter.execute(props.pkg))
        .then(() => message.success(status ? '收藏成功' : '取消收藏成功'))
        .catch(e => message.error(e.message));
    }
    useEffect(() => {
      if (getter.error) return message.error(getter.error.message);
    }, [getter.error])
    return <Spin spinning={!!getter.loading}>
      <Button icon={checked ? <StarFilled className={styles.likeIcon} /> : <StarOutlined className={styles.likeIcon} />} onClick={submit} className={styles.like}>
        <Space align="center">
          <span className={styles.likeText}>{checked ? 'Starred' : 'Star'}</span>
          <span className={classnames(styles.likeCount, 'number')}>{count}</span>
        </Space>
      </Button>
    </Spin>
  }

  private transfer(props: React.PropsWithoutRef<{ name: string }>) {
    const me = useContext(UserContext);
    const { loading, error, result, execute } = useAsync(getPackageEntity, [props.name]);
    const setter = useAsyncCallback(setPackageTransfer);
    const [modal, contextHolder] = Modal.useModal();
    
    const submit = (name: string, uid: number) => {
      modal.confirm({
        title: '确定转让给 ' + name + ' 吗？',
        content: '转让后你将不能以管理员身份操作这个模块！',
        onOk: () => {
          // alert(props.name)
          setter.execute(props.name, uid)
            .then(() => execute(props.name))
            .then(() => message.success('操作成功'))
            .catch(e => message.error(e.message));
        }
      })
    }

    const menu = (
      <Menu>
        {
          result?.members?.length && result?.members.map(member => {
            return <Menu.Item 
              disabled={member.uid === me.id} 
              key={member.uid} 
              onClick={() => submit(member.nickname, member.uid)}
            >
              <div>转让给 {member.nickname}</div>
            </Menu.Item>
          })
        }
      </Menu>
    );

    useEffect(() => error && message.error(error.message), [error]);
    return <ReachableContext.Provider value="Light">
      <Dropdown.Button type="primary" disabled={result?.uid !== me.id} loading={loading} overlay={menu}>转让</Dropdown.Button>
      {contextHolder}
      <UnreachableContext.Provider value="Bamboo" />
    </ReachableContext.Provider>
  }

  // private transferMember(props: React.PropsWithoutRef<{ uid: number, nickname: string }>) {
  //   const [visible, setVisible] = React.useState(false);
  //   const [confirmLoading, setConfirmLoading] = React.useState(false);
  //   const onClick = () => {

  //   }
  //   const handleOk = () => {}
  //   const handleCancel = () => {}
  //   return <div onClick={}>转让给 {props.nickname}</div>
  //   return <Popconfirm
  //     title={'确定转让给 ' + props.nickname + ' 吗？转让后你将不能以管理员身份操作这个模块！'}
  //     visible={visible}
  //     onConfirm={handleOk}
  //     okButtonProps={{ loading: confirmLoading }}
  //     onCancel={handleCancel}
  //   >
  //     <div>转让给 {props.nickname}</div>
  //   </Popconfirm>  
  // }
}