import * as fs from 'fs';
import { MakeRtk } from '.';

new MakeRtk({
  baseUrl: 'https://api.pentest.moralis.io',
  swagger: 'https://api.pentest.moralis.io/documentation-json',
  debugJson: true,
  baseFile: '/api/base.ts',
  typesNamepace: 'MApi',
  outFolder: '/api',
  prettier: JSON.parse(fs.readFileSync('./.prettierrc', 'utf8')),
}).render();
