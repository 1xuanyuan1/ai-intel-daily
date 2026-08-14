hexo.extend.injector.register(
  'head_end',
  '<link rel="stylesheet" href="/assets/css/ai-theme.css">',
  'default'
)

hexo.extend.injector.register(
  'body_begin',
  `<a class="ai-skip-link" href="#main">跳到主要内容</a>
  <div class="ai-ambient" aria-hidden="true">
    <span class="ai-ambient__grid"></span>
    <span class="ai-ambient__orb ai-ambient__orb--cyan"></span>
    <span class="ai-ambient__orb ai-ambient__orb--violet"></span>
  </div>
  <div class="ai-signal-line" aria-hidden="true"></div>
  <button class="ai-theme-toggle" type="button" onclick="switchTheme()" aria-label="切换明暗主题" title="切换浅色、深色或跟随系统">
    <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>
    <span>THEME</span>
  </button>
  <div class="ai-system-status" aria-hidden="true">
    <span><i></i> INTEL ONLINE</span>
    <span>SOURCES VERIFIED</span>
    <span>UTC+08</span>
  </div>`,
  'default'
)

hexo.extend.filter.register('after_render:html', (html) => html
  .replace(
    'content="width=device-width, initial-scale=1, maximum-scale=1"',
    'content="width=device-width, initial-scale=1"'
  )
  .replace(
    /<a class="avatar" href="([^"]*)">/g,
    '<a class="avatar" href="$1" aria-label="返回 AI 情报站首页">'
  )
  .replace(
    /<img no-lazy class="avatar"/g,
    '<img no-lazy class="avatar" alt="AI 情报站标志"'
  )
  .replace(
    /<img class="lazy bg"/g,
    '<img class="lazy bg" alt="" aria-hidden="true"'
  )
  .replace(
    /<input class="copy-area"/g,
    '<input class="copy-area" aria-label="文章永久链接"'
  )
  .replace(
    /<a class="social share-item link"/g,
    '<a class="social share-item link" role="button" tabindex="0" aria-label="复制文章链接" onkeydown="if(event.key===&quot;Enter&quot;||event.key===&quot; &quot;){event.preventDefault();this.click()}"'
  )
  .replace(
    /<img class="lazy"(?![^>]*\balt=)/g,
    '<img class="lazy" alt="" aria-hidden="true"'
  )
  .replace(
    /<table(?![^>]*\btabindex=)([^>]*)>/g,
    '<table tabindex="0"$1>'
  )
  .replace(
    /<button type='button' style='display:none' class='laptop-only rightbar-toggle mobile'/g,
    "<button type='button' style='display:none' class='laptop-only rightbar-toggle mobile' aria-label='打开文章目录'"
  )
  .replace(
    /<button type='button' style='display:none' class='mobile-only leftbar-toggle mobile'/g,
    "<button type='button' style='display:none' class='mobile-only leftbar-toggle mobile' aria-label='打开站点导航'"
  ), 100)
