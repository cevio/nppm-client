import './style.less';
import React from 'react';
import NotFound from './404';
import SetupPage from './setup';
import { createServer } from 'slox';
import { CopyRight } from './components';
import { controllerRegister } from './controllers';
import zhCN from 'antd/lib/locale/zh_CN';
import ConfigProvider from 'antd/es/config-provider';
import moment from 'moment';
import 'moment/dist/locale/zh-cn';

moment.locale('zh-cn');

// Bootstrap logic code:
const {
  bootstrap,
  defineController,
  useGlobalMiddlewares,
  createNotFoundComponent,
} = createServer();
useGlobalMiddlewares(ZhCn)
useGlobalMiddlewares(CopyRight);
useGlobalMiddlewares(SetupPage);
controllerRegister(defineController);
createNotFoundComponent(() => <NotFound />);
bootstrap('popstate', document.getElementById('root'));

function ZhCn(props: React.PropsWithChildren<{}>) {
  return <ConfigProvider locale={zhCN}>{props.children}</ConfigProvider>
}