import * as fs from 'fs';
import { MakeRtk } from '.';

new MakeRtk({
  baseUrl: 'https://api.pentest.moralis.io',
  // swagger: 'file://core-swagger.json',
  swagger: 'https://api.pentest.moralis.io/documentation-json',
  // controllerOverride: 'core',
  debugJson: true,
  baseFile: '/api/base.ts',
  typesNamepace: 'AdminApi',
  outFolder: '/api',
  prettier: JSON.parse(fs.readFileSync('./.prettierrc', 'utf8')),
}).render();
