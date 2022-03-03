import React, { useEffect } from 'react';
import { Component, Controller, Middleware, useQuery, redirect } from 'slox';
import { Layout, Package } from '../components';
import { useAsync } from 'react-async-hook';
import { getDownloads } from './service';
import { message, Row, Col, Spin, Empty, Pagination } from 'antd';

@Component()
@Controller('/rank/downloads')
@Middleware(Layout)
export default class DownloadRankPage {
  private readonly pageSizeOptions = ['9', '15', '30', '60'];
  public render() {
    const page = Number(useQuery('page', '1'));
    const size = Number(useQuery('size', '15'));
    const { loading, result, error } = useAsync(getDownloads, [page, size]);
    const state = result || [[], 0];
    const onPageChange = (a: number, b: number) => redirect(`/rank/downloads?page=${a}&size=${b}`);
    useEffect(() => error && message.error(error.message), [error]);
    return <Spin spinning={loading} style={{ minHeight: 200 }}>
      <Row gutter={[24, 24]}>
        {
          !state[0].length
            ? <Col span={24}><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></Col>
            : state[0].map(s => {
                return <Col span={8} key={s.id}>
                  <Package
                    name={s.name}
                    version={s.version}
                    description={s.description}
                    size={s.size}
                    downloads={s.downloads}
                    versions={s.versions}
                    maintainers={s.maintainers}
                    likes={s.likes}
                  />
                </Col>
              })
        }
        {
          !!state[1] && <Col span={24}>
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
    </Spin>
  }
}