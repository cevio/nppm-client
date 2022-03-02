import React from 'react';
import { Result, Button } from 'antd';
import { redirect } from 'slox';

export default function NotFound() {
  return <Result
    status="404"
    title="404"
    subTitle="对不起，您访问的页面不存在！"
    extra={<Button type="primary" onClick={() => redirect('/')}>回首页</Button>}
  />
}