import styles from './index.module.less';
import React, { useEffect } from 'react';
import { Component, Controller, Middleware, useComponentWithMethod } from 'slox';
import { Layout } from '../components';
import { Row, Col, message, Card, Statistic, Spin, Typography, Empty } from 'antd';
import { useAsync } from 'react-async-hook';
import { getUpdateRecently, getDashboardUsers, getDashboardPackages, getDashboardStars, getDashboardDownloads } from './service';
// import { PlusOutlined } from '@ant-design/icons';
import { Package } from '../components';

@Component()
@Controller('/')
@Middleware(Layout)
export default class Page {
  private readonly gutter = 24;
  public render() {
    const Statistics = useComponentWithMethod(this.statistics, this);
    const Recently = useComponentWithMethod(this.recently, this);
    return <Row gutter={[this.gutter, this.gutter]}>
      <Col span={24}>数据统计</Col>
      <Col span={24}><Statistics /></Col>
      <Col span={24}>最近更新的模块</Col>
      <Col span={24}><Recently top={15} /></Col>
    </Row>
  }

  private statistics() {
    const Users = useComponentWithMethod(this.users, this);
    const Packages = useComponentWithMethod(this.packages, this);
    const Stars = useComponentWithMethod(this.stars, this);
    const Downloads = useComponentWithMethod(this.downloads, this);
    return <Row gutter={[24, 24]}>
      <Col span={6}><Users /></Col>
      <Col span={6}><Packages /></Col>
      <Col span={6}><Stars /></Col>
      <Col span={6}><Downloads /></Col>
    </Row>
  }

  private recently(props: React.PropsWithoutRef<{ top: number }>) {
    const { loading, result, error } = useAsync(getUpdateRecently, [props.top]);
    const state = result || [];
    useEffect(() => {
      if (error) {
        return message.error(error.message);
      }
    }, [error])
    return <Spin spinning={loading} style={{ minHeight: 200 }}>
      {
        !state.length
          ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : <Row gutter={[24, 24]}>
              {
                state.map(res => <Col span={8} key={res.id}><Package {...res}/></Col>)
              }
            </Row>
      }
    </Spin>
  }

  private users() {
    const { loading, result, error } = useAsync(getDashboardUsers, []);
    useEffect(() => {
      if (error) {
        return message.error(error.message);
      }
    }, [error])
    return <Card size="small" title={null} loading={loading}>
      <Statistic title="Users" value={result?.count || 0} />
      <Typography.Text className={styles.tip}>近7天新增用户 <span>{result?.seven}</span> 人</Typography.Text>
    </Card>
  }

  private packages() {
    const { loading, result, error } = useAsync(getDashboardPackages, []);
    useEffect(() => {
      if (error) {
        return message.error(error.message);
      }
    }, [error])
    return <Card size="small" title={null} loading={loading}>
      <Statistic title="Packages" value={result?.count || 0} />
      <Typography.Text className={styles.tip}>近7天新增模块 <span>{result?.seven}</span> 个</Typography.Text>
    </Card>
  }

  private stars() {
    const { loading, result, error } = useAsync(getDashboardStars, []);
    useEffect(() => {
      if (error) {
        return message.error(error.message);
      }
    }, [error])
    return <Card size="small" title={null} loading={loading}>
      <Statistic title="Stars" value={result?.count || 0} />
      <Typography.Text className={styles.tip}>近7天新增收藏 <span>{result?.seven}</span> 个</Typography.Text>
    </Card>
  }

  private downloads() {
    const { loading, result, error } = useAsync(getDashboardDownloads, []);
    useEffect(() => {
      if (error) {
        return message.error(error.message);
      }
    }, [error])
    return <Card size="small" title={null} loading={loading}>
      <Statistic title="Downloads" value={result?.count || 0} />
      <Typography.Text className={styles.tip}>近7天新增下载 <span>{result?.seven}</span> 次</Typography.Text>
    </Card>
  }
}