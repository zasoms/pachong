const $ = require('cheerio')
const request = require('axios')
const superagent = require('superagent')
const fs = require('fs')
const iconv = require('iconv-lite')
const opn = require('opn')
const puppeteer = require('puppeteer')
const {sleep, writeFile} = require('./utils/util')



const defaultInfo ={
  wxQrcodeLoginUrl: 'https://www.lativ.com/Home/WeixinQrcodeLogin',
  wxLoginUrl: 'https://www.lativ.com/Home/WeixinLogin',
  checkLogin: 'https://long.open.weixin.qq.com/connect/l/qrconnect',
  wxLoginParams: {
    state: '',
    code: ''
  },
  headers: {
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Connection': 'keep-alive',
    Host: 'www.lativ.com',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.62 Safari/537.36'
  },
  cookies: null,
  cookieData: null
}

puppeteer.launch().then(async browser => {
  console.log('------初始化完成，开始抓取页面------')
  const page = await browser.newPage()
  await page.goto(defaultInfo.wxQrcodeLoginUrl, {
    waitUntil: 'networkidle'
  })
  let cookies = await page.cookies(defaultInfo.wxQrcodeLoginUrl)
  console.log(cookies )
  // await sleep(1000)
  
  // console.log('------页面抓取完成，开始分析页面------')
  // const inputs = await page.evaluate(res => {
  //   const result = document.querySelectorAll('script')
  //   let data = []
  //   for(let node of result){
  //     if( node.innerHTML ){
  //       data = [...data, node.innerHTML.replace(/\n/gm, '').replace(/\'/gm, '"').replace(/\(\s+{/gm, '({').replace(/}\s+\)/gm, '})').match(/WxLogin\({.*?}\)/)[0]]
  //     }
  //   }
  //   let params = data[0].replace('WxLogin({', '').replace('})', '').replace(/\s+/gm, '')
  //   let conf = {}
  //   params.split(',').map(item => {
  //     let index = item.indexOf(':')
  //     let key = item.slice(0, index)
  //     let value = item.slice(index + 1)
  //     conf[key] = value.replace(/"/g, '')
  //   })
  //   return conf
  // })

  // defaultInfo.wxLoginParams.state = inputs.state
  // let wexinUrl = createQrcodeImg(inputs)
  // await page.goto(wexinUrl, {
  //   waitUntil: 'networkidle'
  // })

  // const url = await page.evaluate(res => {
  //   const img = document.querySelector('img')
  //   return 'https://open.weixin.qq.com' + img.getAttribute('src')
  // })

  // return {
  //   url,
  //   wexinUrl
  // }
  // console.log(url)
}).then(async ({url, wexinUrl}) => {
  console.log('------------')
  console.log('------请求扫码------')
  console.log('------------')
  const result = await request({
    method: 'get',
    url,
    responseType: 'arraybuffer'
  })
  
  await writeFile('qr.png', result.data)
  opn('qr.png')
  return {url, wexinUrl}
}).then(async ({url, wexinUrl}) => {
  console.log('------------')
  console.log('------检测登录------')
  console.log('------------')

  let flag = true
  let ticket
  let arr = url.split('/')
  let uuid = arr[arr.length - 1]

  while( flag ){
    const result = await request({
      method: 'get',
      url: defaultInfo.checkLogin,
      headers: {
        Host: 'long.open.weixin.qq.com',
        Referer: wexinUrl,
      },
      params: {
        uuid,
        _: Date.now()
      },
    })
    let data = result.data.replace(/'/g, '').split(';').reduce((prev, next) => { 
      let [key,value] = next.split('='); 
      prev[key] = value; 
      return prev
    }, {})
    if( data['window.wx_errcode'] === "405" ){
      console.log('------扫码成功------')
      flag = false
      ticket = data['window.wx_code']
    }else{
      console.log('------未检测到扫码------')
    }
    await sleep(1000)
  }
  
  return {ticket,wexinUrl}
}).then(async ({ticket,wexinUrl}) => {
  defaultInfo.wxLoginParams.code = ticket
  
  console.log('------登录------')

  superagent
  .get(defaultInfo.wxLoginUrl)
  .query(defaultInfo.wxLoginParams)
  .set(Object.assign({
    Referer: wexinUrl,
    'Content-Type': 'text/html; charset=utf-8',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
  }, defaultInfo.headers))
  .end((err, res) => {
    console.log(err, res )
  })
  // const result = await request({
  //   method: 'get',
  //   url: defaultInfo.wxLogin,
  //   headers: Object.assign({
  //     Referer: wexinUrl,
  //     'Content-Type': 'text/html; charset=utf-8',
  //     Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
  //   }, defaultInfo.headers),
  //   params: defaultInfo.wxLoginParams,
  // })

  // console.log( result )
})

function createQrcodeImg(a){
  var c = "default";
  a.self_redirect === !0 ? c = "true" : a.self_redirect === !1 && (c = "false");
  e = "https://open.weixin.qq.com/connect/qrconnect?appid=" + a.appid + "&scope=" + a.scope + "&redirect_uri=" + a.redirect_uri + "&state=" + a.state + "&login_type=jssdk&self_redirect=" + c;
  e += a.style ? "&style=" + a.style : "";
  e += a.href ? "&href=" + a.href : "";
  return e
}