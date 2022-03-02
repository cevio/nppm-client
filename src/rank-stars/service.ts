import { ajax } from '../lib';
import { TPackage } from '../user/service';

export async function getRanks(page: number, size: number) {
  const result = await ajax.get('/stars/rank', {
    params: { page, size }
  })
  return result.data as [TPackage[], number];
}