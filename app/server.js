'use strict';

const Koa = require('koa');
const koaStatic = require('koa-static');
const views = require('koa-views');
const session = require('koa-session');
const path = require('path');

const server = new Koa();

const router = require("./services/router.js");
const passport = require('./services/passport');
const config = require('../config/config');
const YoutubeAPI = require('./services/youtube');

server.keys = [config.koaSecret];

server
  .use(views(path.join(__dirname, '/view'), { extension: 'ejs' }))
  .use(koaStatic('./public'))
  .use(session(server))
  .use(passport.initialize())
  .use(passport.session())
  .use(function(ctx, next) {
    if(ctx.isAuthenticated()) {
      ctx.state.youtubeAPI = new YoutubeAPI(config.google.clientID, config.google.clientSecret, config.google.callbackURL, ctx.state.user.accessToken, ctx.state.user.refreshToken);
    }
    // else {
    //   ctx.redirect('/');
    // }
    next();
  })
  .use(router.routes())
  .use(router.allowedMethods());

module.exports = server;
