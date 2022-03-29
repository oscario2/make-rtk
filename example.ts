import * as fs from 'fs';
import { MakeRtk } from '.';

new MakeRtk({
  projectName: 'core',
  baseUrl: 'https://api.pentest.moralis.io',
  swagger: 'file://swagger/core.swagger.json',
  // swagger: 'https://api.pentest.moralis.io/documentation-json',
  controllerOverride: 'core',
  debugJson: true,
  baseFile: '/api/base.ts',
  typesNamepace: 'CoreApi',
  outFolder: '/api',
  prettier: JSON.parse(fs.readFileSync('./.prettierrc', 'utf8')),
  wrapQuery: true,
}).render();
