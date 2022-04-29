import * as fs from 'fs';
import { MakeRtk } from '.';

/*
new MakeRtk({
  projectName: 'core',
  baseUrl: '',
  swagger: 'file://swagger/core.swagger.json',
  controllerOverride: 'core',
  debugJson: true,
  baseFile: '/api/base.ts',
  typesNamepace: 'AdminApi',
  outFolder: '/api',
  prettier: JSON.parse(fs.readFileSync('./.prettierrc', 'utf8')),
  wrapQuery: true,
}).render();
*/

new MakeRtk({
  projectName: 'admin',
  baseUrl: 'https://api.dashboard.moralis.io/',
  swagger: 'https://api.dashboard.moralis.io/documentation-json',
  debugJson: true,
  baseFile: './base/admin.base.ts',
  typesNamepace: 'AdminApi',
  outFolder: '/api',
  prettier: JSON.parse(fs.readFileSync('./.prettierrc', 'utf8')),
  wrapQuery: false,
}).render();
