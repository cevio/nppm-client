import styles from './index.module.less';
import React, { Fragment } from 'react';
import { Flex } from 'react-flexable';
import { Divider, Space, Typography } from 'antd';
import { CopyrightOutlined, GithubOutlined } from '@ant-design/icons';

export function CopyRight(props: React.PropsWithChildren<{}>) {
  return <Fragment>
    {props.children}
    <Flex blocked align="center" valign="middle" direction="column" className={styles.copyright}>
      <Typography.Text>
        <span>Node Private Package Manager</span>
        <Divider type="vertical" />
        <span>MIT Licensed</span>
        <Divider type="vertical" />
        <Typography.Link href="https://github.com/cevio/nppm" target="_blank"><GithubOutlined /></Typography.Link>
      </Typography.Text>
      <Typography.Text>
        <span>Copyright <CopyrightOutlined />2019-present</span>
        <Divider type="vertical" />
        <Space>
          <Typography.Link href="https://github.com/cevio" target="_blank">Evio Shen</Typography.Link>
          <span>All Rights Reserved.</span>
        </Space>
      </Typography.Text>
    </Flex>
  </Fragment>
}