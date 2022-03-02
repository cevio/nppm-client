import styles from './index.module.less';
import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { Component, Controller, Middleware, useComponentWithMethod, useQuery, redirect } from 'slox';
import { Layout } from '../components';
import { Row, Col, message, List, Spin, Tag, Space, Typography, Avatar, Radio, Button } from 'antd';
import { useAsyncCallback } from 'react-async-hook';
import { getSearchResult, SearchState } from './service';
import dayjs from 'dayjs';
import * as gravatar from 'gravatar';
import { Flex } from 'react-flexable';
import { FileSearchOutlined } from '@ant-design/icons';

@Component()
@Controller('/search')
@Middleware(Layout)
export default class SearchPage {
  private readonly size = 10;
  public render() {

    const SinglePackage = useComponentWithMethod(this.singlePackage, this);
    const _q = useQuery('q');
    const _t = useQuery('t', 'private') as 'private' | 'public';
    
    const [q, setQ] = useState<string>(null);
    const [t, setT] = useState<'private' | 'public'>('private');
    const [state, setState] = useState<SearchState[]>([]);

    useEffect(() => setQ(_q), [_q]);
    useEffect(() => setT(_t), [_t]);

    const { loading, execute } = useAsyncCallback(getSearchResult);
    const get = (i: number) => {
      execute(q, i, this.size, t)
        .catch(e => message.error(e.message))
        .then(res => {
          const newState = (i === 0 ? [] : state).concat(res);
          setState(newState);
        })
    }

    useEffect(() => {
      if (q && t) get(0);
    }, [q, t]);

    return <Spin spinning={loading} style={{ minHeight: 200 }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Flex align="between" valign="middle" className={styles.searchFields}>
            <span><FileSearchOutlined /> 搜索关键字：{!!q && <Tag color="blue">{q}</Tag>}</span>
            <Radio.Group onChange={(e) => redirect(`/search?q=${q}&t=${e.target.value}`)} value={t}>
              <Radio value="private">本源</Radio>
              <Radio value="public">公共源</Radio>
            </Radio.Group>
          </Flex>
        </Col>
        <Col span={24}>
          <List
            // header={<div>Header</div>}
            // footer={<div>Footer</div>}
            bordered={false}
            dataSource={state}
            renderItem={item => {
              return <List.Item>
                <SinglePackage dataSource={item} type={t} />
              </List.Item>
            }}
          />
        </Col>
        <Col span={24} style={{ textAlign: 'center' }}>
          {state.length > 0 && state.length % this.size === 0 && <Button onClick={() => get(state.length)}>下一页</Button>}
        </Col>
      </Row>
    </Spin>
  }

  private singlePackage(props: React.PropsWithoutRef<{ dataSource: SearchState, type: 'private' | 'public' }>) {
    return <Row gutter={[24, 24]} style={{ width: '100%' }}>
      <Col span={18}>
        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          <Space className={styles.name}>
            <Typography.Link onClick={() => redirect('/package/' + props.dataSource.package.name)}>
              {props.dataSource.package.name}
            </Typography.Link>
            {props.dataSource?.flags?.unstable && <Tag color="purple">unstable</Tag>}
          </Space>
          <Typography.Text ellipsis className={styles.description} title={props.dataSource.package.description}>{props.dataSource.package.description}</Typography.Text>
          {!!props.dataSource.package?.keywords && <div className={styles.tags}>
            {
              props.dataSource.package.keywords.map((keyword, index) => {
                return <Tag className={styles.tag} key={keyword + ':' + index} onClick={() => redirect('/search?q=' + encodeURIComponent(keyword) + '&t=' + props.type)}>{keyword}</Tag>
              })
            }
          </div>}
          <Space className={classnames(styles.extra, 'number')}>
            <Avatar src={props.dataSource.package.publisher.avatar || gravatar.url(props.dataSource.package.publisher.email)} shape="square" size={22} />
            <Typography.Link onClick={() => props.type === 'private' && redirect('/user/' + props.dataSource.package.publisher.username)}>{props.dataSource.package.publisher.username}</Typography.Link>
            <span className={styles.publish}>Published <span>v{props.dataSource.package.version}</span></span>
            <span>•</span>
            <span>{dayjs(props.dataSource.package.date).format('YYYY-MM-DD HH:mm:ss')}</span>
          </Space>
        </Space>
      </Col>
      {
        props.type === 'public' && !!props.dataSource?.score && <Col span={6}>
          <Flex direction="column" valign="bottom">
            <Flex valign="middle" className={styles.o}>p <div style={{ width: props.dataSource.score.detail.popularity * 100 }} className={classnames(styles.p, styles.l)}></div></Flex>
            <Flex valign="middle" className={styles.o}>q <div style={{ width: props.dataSource.score.detail.quality * 100 }} className={classnames(styles.q, styles.l)}></div></Flex>
            <Flex valign="middle" className={styles.o}>m <div style={{ width: props.dataSource.score.detail.maintenance * 100 }} className={classnames(styles.m, styles.l)}></div></Flex>
          </Flex>
        </Col>
      }
    </Row>
  }
}