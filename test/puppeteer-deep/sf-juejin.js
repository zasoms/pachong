const puppeteer = require('puppeteer')
const { sleep } = require('../utils/util')


puppeteer.launch({ headless: false }).then(async browser => {
  var page = await browser.newPage()
  page.setViewport({ width: 1200, height: 600 })

  /** 1. 到sf获取最新的前端文章 **/
  try {
    await page.goto('https://segmentfault.com/news/frontend')
    await sleep(1000)

    var SfFeArticleList = await page.evaluate(() => {
      var list = [...document.querySelectorAll('.news__list .news__item-title a')]

      return list.map(el => {
        return { href: el.href.trim(), title: el.innerText }
      })
    })

    console.log('SfFeArticleList:', SfFeArticleList);

    await page.screenshot({ path: './data/sf.png', type: 'png' });
  } catch (e) {
    console.log('sf err:', e);
  }

  /** 登录juejin **/
  try {
    await sleep(1000)
    await page.goto('https://juejin.im')
    await sleep(1000)

    var login = await page.$('.login')
    await login.click()

    await page.type('[name=loginPhoneOrEmail]', '623064100@qq.com', { delay: 20 })

    await page.type('[placeholder=请输入密码]', 'zh19930721', { delay: 20 })


    var authLogin = await page.$('.panel .btn')
    console.log('authLogin:', authLogin);
    await authLogin.click()

  } catch (e) { }

  /** 随机推荐一篇从sf拿来的文章到掘金 **/
  try {
    await sleep(2500)
    var seed = Math.floor(Math.random() * 30)
    var theArtile = SfFeArticleList[seed]

    var add = await page.$('.main-container .user-action-nav .left [href]')
    await add.click()
    await sleep(2500)

    await page.type('.entry-form-input .url-input', theArtile.href, { delay: 20 })
    
    await page.type('.entry-form-input .title-input', theArtile.title, { delay: 20 })

    await page.type('.entry-form-input .description-input', theArtile.title, { delay: 20 })

    await page.evaluate(() => {
      let li = [...document.querySelectorAll('.category-list-box .category-list .item')]
      li.forEach(el => {
        if (el.innerText == '前端')
          el.click()
      })
    })

    var submitBtn = await page.$('.submit-btn')
    await submitBtn.click()
    await sleep(1000)

  } catch (e) {
    await page.screenshot({ path: './data/err.png', type: 'png' });
  }

  await page.screenshot({ path: './data/done.png', type: 'png' });
  await page.close()
  browser.close()
})