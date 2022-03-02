import React from 'react';
import { Space, Breadcrumb } from 'antd';
import {EnvironmentOutlined  } from '@ant-design/icons';

export function NavgatorBreadCrumb(props: React.PropsWithoutRef<{ group:string, space: string }>) {
  return <Space>
    <EnvironmentOutlined />
    <Breadcrumb>
      <Breadcrumb.Item>工作台</Breadcrumb.Item>
      <Breadcrumb.Item>{props.group}</Breadcrumb.Item>
      <Breadcrumb.Item>{props.space}</Breadcrumb.Item>
    </Breadcrumb>
  </Space>
}