import React from 'react';
import styles from './index.module.less';
import classnames from 'classnames';
import { Flex } from 'react-flexable';

export function Box(props: React.PropsWithChildren<{
  className?: string,
  style?: React.CSSProperties,
  title?: string | React.ReactElement,
  traffic?: boolean,
  extra?: string | React.ReactElement,
}>) {
  return <div className={classnames(styles.wraper, props.className)} style={props.style}>
    <div className={styles.header}>
      <div className={styles.action}>
        {props.traffic && <div className={styles.traffic}>
          <div className={classnames(styles.windowIcon, styles.windowClose)}></div>
          <div className={classnames(styles.windowIcon, styles.windowMinimize)}></div>
          <div className={classnames(styles.windowIcon, styles.windowFullScreen)}></div>
        </div>}
        {props.extra}
      </div>
      {!!props.title && <div className={styles.title}>{props.title}</div>}
    </div>
    <div className={styles.body}>{props.children}</div>
  </div>
}