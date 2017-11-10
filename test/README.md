安装 puppeteer

yarn add puppeteer
# or "npm i puppeteer"
可能会遇到 无法下载Chromium 问题

是因为在执行安装的过程中需要执行install.js，这里会下载Chromium,官网建议是进行跳过，我们可以执行 —ignore-scripts 忽略这个js执行

./node/npm i --save puppeteer --ignore-scripts