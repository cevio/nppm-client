import { ajax } from '../lib';
import { TPackage } from '../user/service';

export async function getDownloads(page: number, size: number) {
  const result = await ajax.get('/downloads/rank', {
    params: { page, size }
  })
  return result.data as [TPackage[], number];
}