'use strict';

const config = require('../../config/config');
const passport = require('./passport');
const Router = require('koa-router');
const Sync = require('./sync');
const models = require('./models');

const router = new Router();
const Playlist = models.Playlist;
const Sale = models.Sale;


const payment = {
  seller: "Bobo",
  playlist: "Rock-playlist",
  purchase: "0.99$"
};

router.get('/', async function (ctx) {
  await Sync.playlists(ctx.state.user);
<<<<<<< HEAD
  const playlists = await Playlist.findAll({where:{ownerId: ctx.state.user.dataValues.id}});
  const sellPlaylists = await Playlist.findAll({where:{status:"for sale"}});
  const purchasedVid = await models.Order.findAll({where:{userId:ctx.state.user.dataValues.id}});
  await ctx.render('main', {title: "Playlist Store", playlists: playlists, sell:sellPlaylists, userId:ctx.state.user.dataValues.id, purchased: purchasedVid});
=======

  const playlists = await Playlist.findAll({where: {ownerId: ctx.state.user.dataValues.id}});
  const sellPlaylists = await Playlist.findAll({where: {status: "for sale"}});
  const purchasedVid = await models.Order.findAll({where: {userId: ctx.state.user.dataValues.id}});

  await ctx.render('main', {
    title: "Playlist Store",
    playlists: playlists,
    sell: sellPlaylists,
    userId: ctx.state.user.dataValues.id,
    purchased: purchasedVid
  });
>>>>>>> 335c4fa3eb11fa53ee9d6de74b255cccaddaf012
});

router.get('/payment', async function (ctx) {
  await ctx.render('payment', {payment: payment});
});

router.get('/playlist', async function (ctx) {

  const playlistsArmen = Sync.playlists(ctx.state.user);

  const playlists = await ctx.state.youtubeAPI.getPlaylists();
  let myPlaylists = [];
  let myPlaylistVids = [];
  for (var a = 0; a < playlists.items.length; a++) {
    myPlaylists.push(playlists.items[a]);
    myPlaylistVids.push(await ctx.state.youtubeAPI.getPlaylistItems(myPlaylists[myPlaylists.length - 1].id));
    myPlaylistVids.push('end');
  }
  await ctx.render('playlist', {title: "Playlist page", playlist: myPlaylists, videos: myPlaylistVids});
});


router.get('/playlist-page', async function (ctx) {
  const videoAdd = await ctx.state.youtubeAPI.addVideoToPlaylist('PL5Hd9Buq4RCHps1mN3je3VGiXAhQWDaRv', 'EzfPo7LyDys');
  await ctx.render('playlist-page', {title: "Playlist page"});
});

router.get('/create-playlist', async function (ctx) {
  //youtubeAPI.createPlaylist(name);
  const newPlaylist = await ctx.state.youtubeAPI.createPlaylist("Armen test");
  await ctx.render('create-playlist', {title: "Create playlist"});
});

router.get('/auth/youtube',
  passport.authenticate('google',
    {scope: config.google.scope, accessType: config.google.accessType, approvalPrompt: config.google.approvalPrompt}
  )
);

router.get('/auth/youtube/callback',
  passport.authenticate('google',
    {successRedirect: '/', failureRedirect: '/armen'}
  )
);

router.get('/playlist/sell/:id', async function (ctx) {
  const id = parseInt(ctx.params.id);
  const playlist = await Playlist.findById(id);
  if (playlist.get('ownerId') !== ctx.state.user.id) {
    ctx.response.status = 403;
    ctx.response.body = {status: 'failed', err: "It's not your playlist"};
  }

  const videos = await ctx.state.youtubeAPI.getPlaylistItems(playlist.get('youtubeId'));
  const videoIds = videos.items.map((item) => {
    return item.contentDetails.videoId;
  });

  const json = JSON.stringify(videoIds);

  await playlist.update({status: "for sale", videos: json});

  await Sale.upsert({playlistId: id});

  ctx.response.body = {status: 'success', message: "The playlist is in the store now"};
});

router.get('/playlist/buy/:id', async function (ctx) {
  const playlistId = parseInt(ctx.params.id);
<<<<<<< HEAD
  let infoPlaylist = await  Playlist.findOne({where:{id: playlistId}});
  let plainPlaylist = infoPlaylist.get({plain:true});
=======
  let infoPlaylist = await Playlist.findById(playlistId);

>>>>>>> 335c4fa3eb11fa53ee9d6de74b255cccaddaf012
  let playlist = {
      userId: plainPlaylist.ownerId,
      playlistId: plainPlaylist.id,
      playlistTitle: plainPlaylist.title
  };

  await models.Order.upsert(playlist);

  ctx.response.body = {status: 'success', message: "The playlist is in the store now"};
  // TODO: create playlist in DB (set original ID)
  // TODO: create playlist in youtube
  // TODO: export videos
});


// TODO: LIST playlists for sale

router.use(async function (ctx, next) {
  if (ctx.isAuthenticated()) {
    return next()
  } else {
    ctx.redirect('/')
  }
});

module.exports = router;
