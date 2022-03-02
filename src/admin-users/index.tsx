import styles from './index.module.less';
import React, { useEffect, useState } from 'react';
import { Component, Controller, Middleware, redirect, useComponentWithMethod } from 'slox';
import { Layout } from '../components';
import { getUsers, TUser } from './service';
import { useAsync } from 'react-async-hook';
import { Col, Input, message, Row, Spin, Card, Avatar, Pagination, Typography } from 'antd';
import { Flex } from 'react-flexable';

const { Meta } = Card;

@Component()
@Controller('/admin/users')
@Middleware(Layout, { login: true, admin: true })
export default class AdminUsersPage {
  private readonly size = 8;
  public render() {
    const User = useComponentWithMethod(this.user, this);

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(15);
    const [keyword, setKeyword] = useState<string>(null);
    const { loading, result, error } = useAsync(() => getUsers({ page, size, keyword }), [page, size, keyword]);

    const onChange = (a: number, b: number) => {
      setPage(a);
      setSize(b);
    }

    useEffect(() => {
      if (error) {
        return message.error(error.message);
      }
    }, [error])

    return <Row gutter={[24, 24]}>
      <Col span={24}>
        <Flex align="between" valign="middle">
          <Pagination showSizeChanger={false} current={page} pageSize={size} total={result ? result[1] : 0} onChange={onChange} />
          <Input.Search 
            value={keyword} 
            onSearch={e => setKeyword(e)} 
            onChange={e => !e.target.value && setKeyword(undefined)} 
            placeholder="搜索关键账号或者昵称"
            style={{ width: 250 }}
          />
        </Flex>
      </Col>
      <Col span={24}>
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
          {
            (result || [[], 0])[0].map(res => {
              return <Col span={this.size} key={res.id}>
                <User dataSource={res} />
              </Col>
            })
          }
          </Row>
        </Spin>
      </Col>
    </Row>
  }

  private user(props: React.PropsWithoutRef<{ dataSource: TUser }>) {
    return <Flex className={styles.user} onClick={() => redirect('/user/' + props.dataSource.account)}>
      <Avatar src={props.dataSource.avatar} size="large" />
      <Flex span={1} className={styles.info} direction="column" scroll="hide">
        <Typography.Text ellipsis className={styles.name} title={props.dataSource.nickname + '(' + props.dataSource.account + ')'}>
          {props.dataSource.nickname} <span>({props.dataSource.account})</span>
        </Typography.Text>
        <Typography.Text ellipsis className={styles.email} title={props.dataSource.email}>{props.dataSource.email}</Typography.Text>
      </Flex>
    </Flex>
  }
}