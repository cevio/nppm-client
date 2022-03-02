import React, { useRef, useState } from 'react';
import styles from './index.module.less';
import { Component } from 'slox';
import { Button, Space, Tag, Empty, Input, Spin } from 'antd';
import type { ButtonProps } from 'antd/es/button';
import type { InputProps } from 'antd/es/input';
import { IGroupProps, TweenOneGroup } from 'rc-tween-one';

@Component()
export class TagTreeInput {
  private readonly onEnter: IGroupProps['enter'] = {
    scale: 0.8,
    opacity: 0,
    type: 'from',
    duration: 100,
  }

  private readonly onLeave: IGroupProps['leave'] = { 
    opacity: 0, 
    width: 0, 
    scale: 0, 
    duration: 200 
  }

  private readonly onEnd: IGroupProps['onEnd'] = e => {
    if (e.type === 'appear' || e.type === 'enter') {
      // @ts-ignore
      e.target.style = 'display: inline-block';
    }
  }

  public render<T = any>(props: React.PropsWithChildren<{
    dataSource: T[],
    button?: ButtonProps,
    buttonText?: string,
    input?: InputProps,
    onAddone: (value: string) => void,
    onRemoveone: (value: T) => void,
    color?: string,
    disabled?: boolean,
    loading?: boolean,
    emptyText?: string | React.ReactNode
  }>) {
    const [inputVisible, setInputVisible] = useState(false);
    const ref = useRef<Input>(null);

    const onConfirm = (value: string) => {
      if (props.disabled || props.loading) return;
      if (value) {
        props.onAddone(value);
        setInputVisible(false);
      }
    }

    const onCancel = () => setInputVisible(false);
    const onEnter = () => {
      setInputVisible(true);
      setTimeout(() => ref?.current.focus());
    }

    return <Space direction="vertical" style={{ width: '100%' }}>
      <div className={styles.container}>
        <Spin spinning={props.loading}>
        {
          !props.dataSource.length
            ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={props.emptyText} />
            : <TweenOneGroup enter={this.onEnter} leave={this.onLeave} appear={false} onEnd={this.onEnd}>
              {
                props.dataSource.map(data => {
                  return <span key={data + ''} style={{ display: 'inline-block' }}>
                    <Tag color={props.color} closable={!props.disabled} onClose={(e) => {
                      e.preventDefault();
                      if (props.disabled || props.loading) return;
                      props.onRemoveone(data);
                    }}>{data}</Tag>
                  </span>
                })
              }
              </TweenOneGroup>
        }
        </Spin>
      </div>
      {
        props.disabled
          ? null
          : inputVisible
            ? <Input {...(props.input || {})} ref={ref} onPressEnter={e => onConfirm(e.currentTarget.value)} onBlur={onCancel} disabled={props.disabled || props.loading} />
            : <Button {...(props.button || {})} onClick={onEnter} disabled={props.disabled} loading={props.loading}>{props.buttonText || '添加'}</Button>
      }
    </Space>
  }
}