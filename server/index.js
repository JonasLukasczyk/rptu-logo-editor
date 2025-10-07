'use strict';

import Server from './Server.js';
import LogoService from './LogoService.js';

(async ()=>{
  await Server.start();
  await Server.init([
    LogoService,
  ]);
})();
