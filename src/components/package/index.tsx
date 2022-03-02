import React, { PropsWithoutRef } from 'react';
import styles from './index.module.less';
import classnames from 'classnames';
import filesize from 'filesize';
import { Flex } from 'react-flexable';
import { redirect } from 'slox';
import { Typography, Tooltip, Divider } from 'antd';
import { FileZipOutlined, CloudDownloadOutlined, BranchesOutlined, TeamOutlined, StarOutlined } from '@ant-design/icons';

export function Package(props: PropsWithoutRef<{
  name: string,
  version: string,
  description: string,
  size: number,
  downloads: number,
  versions: number,
  maintainers: number,
  likes: number,
}>) {
  return <Flex className={styles.package} direction="column" blocked onClick={() => redirect('/package/' + props.name)}>
    <Typography.Text ellipsis className={styles.name} title={props.name}>{props.name}</Typography.Text>
    <Typography.Text className={styles.version}>{props.version}</Typography.Text>
    <Typography.Paragraph className={styles.description} ellipsis={{ rows: 2 }} title={props.description}>{props.description}</Typography.Paragraph>
    <div className={classnames(styles.extra, 'number')}>
      <Tooltip title="模块体积"><FileZipOutlined /> {filesize(props.size)}</Tooltip>
      <Divider type="vertical" />
      <Tooltip title="总下载量"><CloudDownloadOutlined /> {props.downloads}</Tooltip>
      <Divider type="vertical" />
      <Tooltip title="版本个数"><BranchesOutlined /> {props.versions}</Tooltip>
      <Divider type="vertical" />
      <Tooltip title="总贡献者个数"><TeamOutlined /> {props.maintainers}</Tooltip>
      <Divider type="vertical" />
      <Tooltip title="总收藏数"><StarOutlined /> {props.likes}</Tooltip>
    </div>
  </Flex>
}