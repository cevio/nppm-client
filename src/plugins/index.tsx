import dayjs from 'dayjs';
import styles from './index.module.less';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { Component, Controller, inject, Middleware, redirect, useComponentWithMethod, useQuery } from 'slox';
import { Layout } from '../components';
import { getPlugins, uninstall, install, getHistory, TPluginInstallInfomation, setPluginConfigs, cancelPluginTask } from './service';
import { useAsync, useAsyncCallback } from 'react-async-hook';
import type { TPlugin, TLabelValue, TPluginConfigs } from '../admin-base-setting/service';
import { Flex } from 'react-flexable';
import { SettingOutlined, RestOutlined, AppstoreAddOutlined, AppstoreOutlined, HistoryOutlined } from '@ant-design/icons';
import { getConfigsState } from '../admin-base-setting/service';
import AdminBaseSettingPage from '../admin-base-setting';
import { ColumnsType } from 'antd/lib/table';
import { 
  Col, 
  message, 
  Row, 
  Space, 
  Spin, 
  Typography, 
  Avatar, 
  Button, 
  Popconfirm, 
  Modal, 
  Input, 
  Checkbox, 
  Select, 
  Badge, 
  Tabs, 
  Table, 
  Tooltip, 
  Tag,
  InputNumber,
  Radio,
  Switch,
} from 'antd';

const { TabPane } = Tabs;
const CheckboxGroup = Checkbox.Group;

@Component()
@Controller('/admin/plugins')
@Middleware(Layout, { login: true, admin: true })
export default class AdminPluginsPage {
  @inject(AdminBaseSettingPage) private readonly AdminBaseSettingPage: AdminBaseSettingPage;
  private readonly size = 8;
  private readonly components = {
    input: useComponentWithMethod(this.inputComponent, this),
    select: useComponentWithMethod(this.selectComponent, this),
    radio: useComponentWithMethod(this.radioComponent, this),
    switch: useComponentWithMethod(this.switchComponent, this),
    checkbox: useComponentWithMethod(this.checkboxComponent, this),
  }

  public render() {
    const _channel = useQuery('tab', 'installed');
    const Plugins = useComponentWithMethod(this.plugins, this);
    const Install = useComponentWithMethod(this.install, this);
    const Historyies = useComponentWithMethod(this.histories, this);
    const installGetter = useAsyncCallback(getPlugins);
    const historyGetter = useAsyncCallback(getHistory);
    const [channel, setChannel] = useState<string>(null);
    const loading = useMemo(() => !!installGetter.loading || !!historyGetter.loading, [installGetter.loading, historyGetter.loading]);

    const getInstallHandler = () => installGetter.execute().catch(e => message.error(e.message));
    const getHistoryHandler = () => historyGetter.execute().catch(e => message.error(e.message));

    const historyActiveCount = useMemo(() => {
      if (!historyGetter || !historyGetter.result || !historyGetter.result.length) return 0;
      return historyGetter.result.filter(res => [0, 1].includes(res.status)).length;
    }, [historyGetter?.result])

    useEffect(() => setChannel(_channel), [_channel]);

    useEffect(() => {
      switch (channel) {
        case 'installed': getInstallHandler(); break;
        case 'history': getHistoryHandler(); break;
      }
    }, [channel]);

    useEffect(() => {
      if (channel === 'history') {
        if (historyActiveCount) {
          const timer = setInterval(getHistoryHandler, 2000);
          return () => clearInterval(timer);
        }
      }
    }, [channel, historyActiveCount])

    return <Spin spinning={loading}>
      <Row gutter={[24, 12]}>
        <Col span={24}>
          <Flex align="between" valign="middle">
            <Tabs size="small" activeKey={channel} onChange={e => redirect('/admin/plugins?tab=' + e)}>
              <TabPane tab={<span><AppstoreOutlined />已安装的插件</span>} key="installed" />
              <TabPane tab={<span><HistoryOutlined />插件安装历史</span>} key="history" />
            </Tabs>
            <Install refetch={channel === 'installed' ? getInstallHandler : getHistoryHandler } />
          </Flex>
        </Col>
        {
          channel === 'installed'
            ? <Plugins dataSource={installGetter?.result || []} refetch={getInstallHandler} />
            : <Historyies dataSource={historyGetter?.result || []} />
        }
      </Row>
    </Spin>
  }

  private plugins(props: React.PropsWithoutRef<{ dataSource: TPlugin[], refetch: Function }>) {
    const Plugin = useComponentWithMethod(this.plugin, this);
    return <Fragment>
      {
        props.dataSource.map(res => {
          return <Col span={this.size} key={res.name}>
            <Plugin dataSource={res} refetch={props.refetch}></Plugin>
          </Col>
        })
      }
    </Fragment>
  }

  private histories(props: React.PropsWithoutRef<{ dataSource: TPluginInstallInfomation[] }>) {
    const columns = useMemo(() => this.columns(), []);
    return <Col span={24}>
      <Table pagination={false} dataSource={props.dataSource} columns={columns} rowKey="id" />
    </Col>
  }

  private columns(): ColumnsType<TPluginInstallInfomation> {
    const ViewProcess = useComponentWithMethod(this.viewProcess, this);
    const CancelTask = useComponentWithMethod(this.cancelTask, this);
    return [
      {
        title: '插件名',
        className: 'number',
        render(state: TPluginInstallInfomation) {
          return <Fragment>
            {state.status < 0 && <Badge status="error" text={state.name} />}
            {[0, 1].includes(state.status) && <Badge status="processing" text={state.name} />}
            {state.status === 2 && <Badge status="success" text={state.name} />}
          </Fragment>
        }
      },
      {
        title: '任务开始时间',
        dataIndex: 'startTimeStamp',
        className: 'number',
        render: this.formatTime,
      },
      {
        title: '下载结束时间',
        dataIndex: 'endTimeStamp',
        className: 'number',
        render: this.formatTime,
      },
      {
        title: '安装结束时间',
        dataIndex: 'installedTimeStamp',
        className: 'number',
        render: this.formatTime
      },
      {
        title: '下载',
        dataIndex: 'status',
        align: 'center',
        render(status: TPluginInstallInfomation['status']) {
          if (status < 0) return <Tag color="error">失败</Tag>;
          if (status === 0) return <Tag color="processing">进行中</Tag>;
          if (status >= 1) return <Tag color="success">成功</Tag>;
        }
      },
      {
        title: '安装',
        dataIndex: 'status',
        align: 'center',
        render(status: TPluginInstallInfomation['status']) {
          if (status < 0) return <Tag color="error">失败</Tag>;
          if (status === 0) return <Tag color="default">未开始</Tag>;
          if (status === 1) return <Tag color="processing">进行中</Tag>;
          if (status === 2) return <Tag color="success">成功</Tag>;
        }
      },
      {
        title: '操作',
        render(state: TPluginInstallInfomation) {
          return <Space>
            {![0, 1].includes(state.status) && <ViewProcess msg={state.msg} />}
            {state.status < 0 && <Tooltip title={state.error}><Typography.Link disabled>错误</Typography.Link></Tooltip>}
            {[0, 1].includes(state.status) && <CancelTask id={state.id} />}
          </Space>
        }
      }
    ]
  }

  private viewProcess(props: React.PropsWithoutRef<{ msg: string[] }>) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    return <Fragment>
      <Typography.Link onClick={() => setIsModalVisible(true)}>信息</Typography.Link>
      <Modal visible={isModalVisible} onCancel={() => setIsModalVisible(false)} title="安装过程信息" footer={null}>
        <Row gutter={[12,8]}>
          {props.msg.map((msg, index) => <Col span={24} key={index}>{msg}</Col>)}
        </Row>
      </Modal>
    </Fragment>
  }

  private cancelTask(props: React.PropsWithoutRef<{ id: number }>) {
    const { execute, loading } = useAsyncCallback(cancelPluginTask);
    const cancel = () => {
      execute(props.id)
        .then(() => message.success('取消任务成功'))
        .catch(e => message.error(e.message));
    }
    return <Typography.Link disabled={loading} onClick={cancel}>{loading ? '取消中...' : '取消'}</Typography.Link>
  }

  private formatTime(time: number) {
    if (!time) return null;
    return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
  }

  private plugin(props: React.PropsWithoutRef<{ dataSource: TPlugin, refetch: Function }>) {
    const Uninstall = useComponentWithMethod(this.uninstall, this);
    const Setting = useComponentWithMethod(this.setting, this);
    return <Flex className={styles.plugin} scroll="hide">
      <Avatar src={props.dataSource.plugin_icon} />
      <Flex span={1} scroll="hide" direction="column">
        <Typography.Text className={styles.label} ellipsis title={props.dataSource.plugin_name}>{props.dataSource.plugin_name}</Typography.Text>
        <Typography.Text className={styles.code} ellipsis title={`${props.dataSource.name}@${props.dataSource.version}`}>{props.dataSource.name}@{props.dataSource.version}</Typography.Text>
        <Typography.Paragraph className={styles.desc} ellipsis={{ rows: 2 }} title={props.dataSource.description}>{props.dataSource.description}</Typography.Paragraph>
        <Space className={styles.extra}>
          {!!props.dataSource.plugin_configs && <Setting name={props.dataSource.name} configs={props.dataSource.plugin_configs} />}
          <Uninstall name={props.dataSource.name} refetch={props.refetch} />
        </Space>
      </Flex>
    </Flex>
  }

  private uninstall(props: React.PropsWithoutRef<{ name: string, refetch: Function }>) {
    const { loading, execute } = useAsyncCallback(uninstall);
    const submit = () => {
      execute(props.name)
        .then(() => props.refetch())
        .then(() => message.success('卸载插件成功'))
        .catch(e => message.error(e.message));
    }
    return <Popconfirm title="确定要卸载此插件？" onConfirm={submit} cancelText="放弃" okText="卸载">
      <Typography.Link disabled={loading}><RestOutlined /> {loading ? '卸载中...' : '卸载'}</Typography.Link>
    </Popconfirm>
  }

  private install(props: React.PropsWithoutRef<{ refetch: Function }>) {
    const getter = useAsync(getConfigsState, []);
    const setter = useAsyncCallback(install);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [name, setName] = useState<string>(null);
    const [dev, setDev] = useState(false);
    const [registry, setRegistry] = useState<string>(null);
    const Config = useComponentWithMethod(this.AdminBaseSettingPage.config, this.AdminBaseSettingPage);
    const registies = useMemo(() => {
      if (!getter.result) return [];
      const pools: { label: string, value: string }[] = [
        {
          label: getter.result.domain,
          value: getter.result.domain,
        }
      ];
      pools.push(...getter.result.registries.map(registry => {
        return {
          label: registry,
          value: registry
        }
      }))
      return pools;
    }, [getter.result]);

    const submit = () => {
      setter.execute({ name, registry, dev })
        .then(() => setIsModalVisible(false))
        .then(() => props.refetch())
        .then(() => message.success(dev ? '安装调试插件成功' : '安装插件进行中，请前往插件历史查看安装进度'))
        .catch(e => message.error(e.message));
    }

    useEffect(() => {
      if (registies.length) {
        setRegistry(registies[0].value);
      }
    }, [registies])

    useEffect(() => getter.error && message.error(getter.error.message), [getter.error]);

    return <Fragment>
      <Button type="primary" icon={<AppstoreAddOutlined />} onClick={() => setIsModalVisible(true)}>安装插件</Button>
      <Modal 
        title="安装新插件" 
        visible={isModalVisible} 
        onOk={submit} 
        onCancel={() => setIsModalVisible(false)} 
        cancelText="取消" 
        okText="安装" 
        confirmLoading={setter.loading}
      >
        <Row gutter={[24, 32]}>
          <Config title={<Badge status="error" text="插件名" />} description="一般指插件的`package.json`的`name`属性，可以带上`@`的版本号，如 `@nppm/dingtalk@1.0.0`。如果选择开发调试，请输入插件文件夹完整路径。">
            <Input disabled={setter.loading} value={name} onChange={e => setName(e.target.value)} placeholder={ dev ? '请输入本地待调试插件文件夹地址...' : '请输入插件标识...' } />
          </Config>
          <Config title="调试" description="如果开启此选项，表示我们开始开发插件，在插件名中输入待开发插件的文件夹地址。">
            <Checkbox disabled={setter.loading} onChange={e => setDev(e.target.checked)} checked={dev}>本地开发调试</Checkbox>
          </Config>
          {
            !dev && <Config title="下载插件仓库选择" description="选择插件所在的私有仓库地址，您可以选择公有源，页可以选择本地源。">
              <Select disabled={setter.loading} value={registry} style={{ width: '100%' }} onChange={e => setRegistry(e)} options={registies} />
            </Config>
          }
        </Row>
      </Modal>
    </Fragment>
  }

  private setting(props: React.PropsWithoutRef<{ name: string, configs: TPluginConfigs[] }>) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [state, setState] = useState<Record<string, any>>({});
    const { loading, execute } = useAsyncCallback(setPluginConfigs);
    const Config = useComponentWithMethod(this.AdminBaseSettingPage.config, this.AdminBaseSettingPage);
    const submit = () => {
      execute(props.name, state)
        .then(() => setIsModalVisible(false))
        .then(() => message.success('更新插件配置成功'))
        .catch(e => message.error(e.message));
    }
    const update = (key: string, value: any) => {
      const {...params} = state;
      setState({
        ...params,
        [key]: value,
      })
    }

    useEffect(() => {
      const out: Record<string, any> = {};
      props.configs.forEach(config => out[config.key] = config.value);
      setState(out);
    }, [props.configs]);

    return <Fragment>
      <Typography.Link onClick={() => setIsModalVisible(true)}><SettingOutlined /> 设置</Typography.Link>
      <Modal title="更新配置" visible={isModalVisible} confirmLoading={loading} onOk={submit} onCancel={() => setIsModalVisible(false)} cancelText="取消" okText="更新">
        <Row gutter={[0, 16]}>
          {
            props.configs.map(config => {
              switch (config.type) {
                case 'input': 
                  const A = this.components.input;
                  return <Col span={24} key={config.key}>
                    <Config title={config.title} description={config.description}>
                      <A 
                        key={config.key} 
                        placeholder={config.placeholder} 
                        value={state[config.key]} 
                        onChange={e => update(config.key, e)} 
                        mode={config.mode} 
                        width={config.width} />
                    </Config>
                  </Col>
                case 'select':
                  const B = this.components.select;
                  return <Col span={24} key={config.key}>
                    <Config title={config.title} description={config.placeholder}>
                      <B 
                        key={config.key} 
                        placeholder={config.placeholder} 
                        value={state[config.key]} 
                        onChange={e => update(config.key, e)} 
                        fields={config.fields}
                        width={config.width} />
                    </Config>
                  </Col>
                case 'radio':
                  const C = this.components.radio;
                  return <Col span={24} key={config.key}>
                    <Config title={config.title} description={config.description}>
                      <C
                        key={config.key} 
                        value={state[config.key]} 
                        onChange={e => update(config.key, e)} 
                        fields={config.fields} />
                    </Config>
                  </Col>
                case 'switch':
                  const D = this.components.switch;
                  return <Col span={24} key={config.key}>
                    <Config title={config.title} description={config.description}>
                      <D
                        key={config.key} 
                        value={state[config.key]} 
                        placeholder={config.placeholder}
                        onChange={e => update(config.key, e)} />
                    </Config>
                  </Col>
                case 'checkbox':
                  const E = this.components.checkbox;
                  return <Col span={24} key={config.key}>
                    <Config title={config.title} description={config.description}>
                      <E
                        key={config.key} 
                        value={state[config.key]} 
                        fields={config.fields}
                        span={config.span}
                        gutter={config.gutter}
                        onChange={e => update(config.key, e)} />
                    </Config>
                  </Col>
              }
            })
          }
        </Row>
      </Modal>
    </Fragment>
  }

  private inputComponent(props: React.PropsWithoutRef<{ 
    placeholder?: string, 
    value: any, 
    onChange: (e: any) => void,
    mode?: string,
    width?: number | string,
  }>) {
    return props.mode === 'number'
      ? <InputNumber placeholder={props.placeholder} value={props.value} onChange={e => props.onChange(e)} style={{ width: props.width }} />
      : props.mode === 'textarea'
        ? <Input.TextArea placeholder={props.placeholder} value={props.value} onChange={e => props.onChange(e.target.value)} autoSize allowClear style={{ width: props.width }} />
        : <Input placeholder={props.placeholder} value={props.value} onChange={e => props.onChange(e.target.value)} allowClear type={props.mode} style={{ width: props.width }} />
  }

  private selectComponent(props: React.PropsWithoutRef<{ 
    placeholder?: string, 
    value: any, 
    onChange: (e: any) => void,
    width?: number | string,
    fields: TLabelValue[]
  }>) {
    return <Select value={props.value} options={props.fields} style={{ width: props.width }} onChange={e => props.onChange(e)} placeholder={props.placeholder}></Select>
  }

  private radioComponent(props: React.PropsWithoutRef<{ 
    value: any, 
    onChange: (e: any) => void,
    fields: TLabelValue[]
  }>) {
    return <Radio.Group onChange={e => props.onChange(e.target.value)} value={props.value} options={props.fields} />
  }

  private switchComponent(props: React.PropsWithoutRef<{ 
    value: boolean, 
    placeholder?: [string, string],
    onChange: (e: boolean) => void,
  }>) {
    return <Switch
      checkedChildren={props.placeholder[0]}
      unCheckedChildren={props.placeholder[1]}
      checked={props.value}
      onChange={e => props.onChange(e)}
    />
  }

  private checkboxComponent(props: React.PropsWithoutRef<{ 
    value: any[], 
    fields: TLabelValue[],
    onChange: (e: any[]) => void,
    span?: number,
    gutter?: number | [number, number],
  }>) {
    return <CheckboxGroup value={props.value} onChange={e => props.onChange(e)} style={{ width: '100%' }}>
      <Row gutter={props.gutter}>
        {
          props.fields.map(field => {
            return <Col span={props.span} key={field.value}>
              <Checkbox value={field.value}>{field.label}</Checkbox>
            </Col>
          })
        }
      </Row>
    </CheckboxGroup>
  }
}