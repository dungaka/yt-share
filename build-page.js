const get = require('./get')

module.exports = hash => get.html(`https://www.youtube.com/watch?v=${hash}`)
  .then(doc => ({
    title: doc.querySelector('meta[name="title"]').content,
    description: doc.querySelector('meta[name="description"]').content,
    //meta: Array.from(doc.querySelectorAll('meta'))
    //  .map(el => el.outerHTML).join('\n  '),
  })).then(({ title, description }) => `<!doctype html><html>
<head>
  <meta charset='utf-8'>
  <title>${title}</title>
  <meta name="description" content="${description}"/>
  <meta itemprop="name" content="${title}">
  <meta itemprop="description" content="${description}">
  <meta itemprop="image" content="https://i.ytimg.com/vi/${hash}/hqdefault.jpg">
  <meta property="og:title" content="${title}"/>
  <meta property="og:description" content="${description}"/>
  <meta property="og:image" content="https://i.ytimg.com/vi/${hash}/hqdefault.jpg"/>
  <meta property="og:site_name" content="yt-share"/>
  <meta property='og:video' content='http://www.youtube.com/v/${hash}?version=3'/>
  <meta property='og:video:height' content='349'/>
  <meta property='og:video:type' content='application/x-shockwave-flash'/>
  <meta property='og:video:width' content='560'/>
  <meta property='og:type' content='video'/>
  <style type="text/css">html,body{border:0;margin:0;padding:0;height:100%;overflow:hidden}</style>
</head>
<body>
<iframe
  width="100%"
  height="100%"
  id='ytplayer'
  type='text/html'
  src='https://www.youtube.com/embed/${hash}'
  frameborder='0'
  allowfullscreen></iframe>
</body>
</html>`)
