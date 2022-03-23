import { OutgoingHttpHeaders } from 'http2';
import { request, RequestOptions } from 'https';
import { Deferred } from './deferred';

export const fetchJson = async <T = object>(
  url: string,
  headers?: OutgoingHttpHeaders,
) => {
  const { hostname, pathname: path, protocol } = new URL(url);
  const port = protocol == 'https:' ? 443 : 80;

  const opt: RequestOptions = {
    method: 'GET',
    hostname,
    path,
    port,
    headers: {
      ...{ 'content-type': 'application/json' },
      ...headers,
    },
  };

  const { promise, resolve } = new Deferred<T>();
  let json = {} as T;

  const req = request(opt, (res) => {
    let body = '';
    res.setEncoding('utf8');

    res.on('data', (data) => {
      body += data;
    });

    res.on('error', (err: Error) => {
      throw err;
    });

    res.on('end', () => {
      json = JSON.parse(body) as T;
      resolve(json);
    });
  });

  req.on('error', (err: Error) => {
    throw err;
  });

  req.end();

  return await promise;
};
