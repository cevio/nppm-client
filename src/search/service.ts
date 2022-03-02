import { ajax } from '../lib';

export async function getSearchResult(q: string, o: number, s: number, t: 'private' | 'public') {
  const result = await ajax.get('/search', {
    params: { q, o, s, t }
  })
  return result.data as SearchState[];
}

export interface SearchState {
  flags?: {
    unstable: true
  },
  "package": {
    "name": string,
    "scope": string,
    "version": string,
    "description": string,
    "keywords": string[],
    "date": string,
    "links": {
        "npm": string,
        "homepage": string,
        "repository": string,
        "bugs": string
    },
    "author": {
        "name": string,
        "email": string,
        "username": string,
        avatar: string
    },
    "publisher": {
        "username": string,
        "email": string,
        avatar: string,
    },
    "maintainers": {username: string, email: string}[]
  },
  "score": {
      "final": number,
      "detail": {
          "quality": number,
          "popularity": number,
          "maintenance": number
      }
  },
  "searchScore": number
}