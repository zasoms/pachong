const $ = require('cheerio')
const request = require('axios')
const fs = require('fs')
const iconv = require('iconv-lite')
const opn = require('opn')
const puppeteer = require('puppeteer')

const args = {}

const defaultInfo = {
  header: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    'Content-Type': 'text/plain;charset=utf-8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6,en;q=0.4,en-US;q=0.2',
    'Connection': 'keep-alive',
  },
  qrUrl: 'https://qr.m.jd.com/show',
  scanUrl: 'https://qr.m.jd.com/check',
  loginUrl: 'https://passport.jd.com/uc/qrCodeTicketValidation',
  cookies: null,
  cookieData: null,
  areaId: args.a,
  goodId: args.g,
  time: +args.t || 10000,
  ticket: '',
  token: '',
  uuid: '',
  eid: '',
  fp: '',
}
// 初始化输出的商品信息
const outData = {
  name: '',
  price: '',
  link: `http://item.jd.com/${defaultInfo.goodId}.html`,
  stockStatus: '',
  time: '',
  cartLink: ''
}

console.log('------正在初始化浏览器------')
puppeteer.launch().then(async browser => {
  console.log('------初始化完成，开始抓取页面------')
  const page = await browser.newPage()
  await page.goto('https://passport.jd.com/new/login.aspx', {
    waitUntil: 'networkidle'
  })

  await sleep(1000)

  console.log('------页面抓取完成，开始分析页面------')
  const inputs = await page.evaluate(res => {
    const result = document.querySelectorAll('input')
    const data = {}

    for(let v of result){
      switch (v.getAttribute('id')) {
        case 'token':
          data.token = v.value
          break;
        case 'uuid':
          data.uuid = v.value
          break;
        case 'eid':
          data.eid = v.value
          break;
        case 'sessionId':
          data.fp = v.value
          break;
      }
    }

    return data  
  })
  Object.assign(defaultInfo, inputs)
  await browser.close()
  console.log('------参数到手，关闭浏览器------')

}).then(async () => {
  console.log('------------')
  console.log('------请求扫码------')
  console.log('------------')
  const result = await request({
    method: 'get',
    url: defaultInfo.qrUrl,
    headers: defaultInfo.header,
    params: {
      appid: 133,
      size: 147,
      t: Date.now()
    },
    responseType: 'arraybuffer'
  })

  defaultInfo.cookies = cookieParser(result.headers['set-cookie'])
  defaultInfo.cookieData = result.headers['set-cookie'];

  await writeFile('qr.png', result.data)
  opn('qr.png')

}).then(async () => {
  let flag = true
  let ticket

  while (flag) {
    const callback = {}
    let name

    callback[name = ('jQuery' + getRandomInt(100000, 999999))] = data => {
      console.log(`   ${data.msg || '扫码成功，正在登录'}`)
      if (data.code === 200) {
        flag = false;
        ticket = data.ticket
      }
    }

    const  result = await request({
      method: 'get',
      url: defaultInfo.scanUrl,
      headers: Object.assign({
        Host: 'qr.m.jd.com',
        Referer: 'https://passport.jd.com/new/login.aspx',
        Cookie: defaultInfo.cookieData.join(';')
      }, defaultInfo.header),
      params: {
        callback: name,
        appid: 133,
        token: defaultInfo.cookies['wlfstk_smdl'],
        _: Date.now()
      },
    })

    eval('callback.' + result.data)
    await sleep(1000)
  }
  return ticket
}).then(async ticket => {
  defaultInfo.trackid = ticket
  console.log('------开始登陆-------')
  const result = await request({
    method: 'get',
    url: defaultInfo.loginUrl,
    headers: Object.assign({
      Host: 'passport.jd.com',
      Referer: 'https://passport.jd.com/uc/login?ltype=logout',
      Cookie: defaultInfo.cookieData.join('')
    }, defaultInfo.header),
    params: {
      t: ticket
    }
  })

  defaultInfo.header['p3p'] = result.headers['p3p']

  return defaultInfo.cookieData = result.headers['set-cookie']
}).then(res => {
  console.log('登陆成功')
})


async function writeFile(fileName, file){
  return await new Promise(resolve => {
    fs.writeFile(fileName, file, 'binary', err => {
      resolve()
    })
  })
}

function getRandomInt(min, max){
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

function cookieParser(cookies){
  const result = {}
  cookies.forEach(cookie => {
    const temp = cookie.split(';')
    temp.forEach(val => {
      const flag = val.split('=')
      result[flag[0]] = flag.length === 1 ? '' : flag[1]
    })
  })
  return result;
}

function sleep(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  })
}