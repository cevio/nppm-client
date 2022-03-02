import { ajax } from '../lib';
import { TPackage } from '../user/service';

export async function getUpdateRecently(top: number) {
  const result = await ajax.get('/package/update/recently?top=' + top);
  return result.data as TPackage[];
}

export async function getDashboardUsers() {
  const result = await ajax.get('/dashboard/users');
  return result.data as {
    count: number,
    seven: number,
  }
}

export async function getDashboardPackages() {
  const result = await ajax.get('/dashboard/packages');
  return result.data as {
    count: number,
    seven: number,
  }
}

export async function getDashboardStars() {
  const result = await ajax.get('/dashboard/stars');
  return result.data as {
    count: number,
    seven: number,
  }
}

export async function getDashboardDownloads() {
  const result = await ajax.get('/dashboard/downloads');
  return result.data as {
    count: number,
    seven: number,
  }
}