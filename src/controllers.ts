import { createServer } from 'slox'
import WorkspacePage from './workspace';
import AdminORMSettingPage from './admin-orm-setting';
import AdminRedisSettingPage from './admin-redis-setting';
import AdminBaseSettingPage from './admin-base-setting';
import AdminUsersPage from './admin-users';
import UserPage from './user';
import PackagePage from './package';
import AdminPluginsPage from './plugins';
import MyStarsPage from './stars';
import SearchPage from './search';
import StarRankPage from './rank-stars';
import DownloadRankPage from './rank-downloads';

export function controllerRegister(defineController: ReturnType<typeof createServer>['defineController']) {
  defineController(WorkspacePage);
  defineController(AdminORMSettingPage);
  defineController(AdminRedisSettingPage);
  defineController(AdminBaseSettingPage);
  defineController(AdminUsersPage);
  defineController(UserPage);
  defineController(PackagePage);
  defineController(AdminPluginsPage);
  defineController(MyStarsPage);
  defineController(SearchPage);
  defineController(StarRankPage);
  defineController(DownloadRankPage);
}