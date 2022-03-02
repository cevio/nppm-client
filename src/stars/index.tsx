import styles from './index.module.less';
import React, { useEffect, useState } from 'react';
import { Component, Controller, Middleware, redirect, useComponentWithMethod, useQuery } from 'slox';
import { Layout } from '../components';
import { Row, Col, message, Spin, Empty, Pagination } from 'antd';
import { useAsync } from 'react-async-hook';
import { getMyStars } from './service';
import { Package } from '../components';

@Component()
@Controller('/stars')
@Middleware(Layout, { login: true })
export default class MyStarsPage {
  private readonly size = 8;
  private readonly pageSizeOptions = ['9', '15', '30', '60'];
  public render() {
    const _page = Number(useQuery('page', '1'));
    const _size = Number(useQuery('size', '15'));
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(15);
    const { loading, result, error } = useAsync(getMyStars, [page, size]);
    const onPageChange = (a: number, b: number) => redirect(`/stars?page=${a}&size=${b}`);
    useEffect(() => error && message.error(error.message), [error]);
    useEffect(() => setPage(_page), [_page]);
    useEffect(() => setSize(_size), [_size]);
    return <Spin spinning={loading} style={{ minHeight: 200 }}>
      {
        result && result[0] && result[0].length
          ? <Row gutter={[24, 24]}>
              {
                result[0].map(res => {
                  return <Col span={this.size} key={res.id}>
                    <Package 
                      name={res.name}
                      version={res.version}
                      description={res.description} 
                      size={res.size}
                      downloads={res.downloads}
                      versions={res.versions}
                      maintainers={res.maintainers}
                      likes={res.likes}
                    />
                  </Col>
                })
              }
              {
                !!result[1] && <Col span={24}>
                  <Pagination 
                    showSizeChanger 
                    current={page} 
                    pageSize={size} 
                    total={result[1]} 
                    onChange={onPageChange} 
                    pageSizeOptions={this.pageSizeOptions} 
                  />
                </Col>
              }
            </Row>
          : loading 
            ? null 
            : <Empty description="此模块无贡献者" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ width: '100%' }} />
      }
    </Spin>
  }
}