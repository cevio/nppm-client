import { ajax } from '../lib';
import type { TPackage } from '../user/service';

export async function getMyStars(page: number, size: number) {
  const result = await ajax.get('/stars', { params: { page, size } });
  return result.data as [TPackage[], number];
}