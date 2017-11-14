const gm = require('gm')
const fs = require('fs')
// const imageMagick = gm.subClass({ imageMagick: true })


// 去除图片空白区
// gm('./111.jpg')
//   .trim()
//   .autoOrient()
//   .write('22.jpg', function(err){
//     console.log(err)
//   })

// 旋转、图片大小变化
gm('./111.tbi')
  .trim()
  .fuzz(100)
  .rotate('white', -10)
  .resize(900)
  .autoOrient()
  .write('22.tbi', function(err){
    console.log(err)
  })

// 拼接
  // gm()
  // .in('-page', '+0+0')
  // .in('111.jpg')
  // .in('-page', '+100+200')
  // .in('logo.png')
  // .mosaic()
  // .write('22.jpg', function(err){
  //   console.log(err)
  // })

// 合成
  // gm()
  // .command("composite") 
  // .in("-gravity", "center")
  // .in('logo.png')
  // .in('111.jpg')
  // .write( '22.jpg', function (err) {
  //   if (!err) 
  //     console.log(' hooray! ');
  //   else
  //     console.log(err);
  // });

  // quality 压缩 0 - 100
  // gm('./111.jpg')
  //   .fuzz(50)
  //   .background('transparent')
  //   .transparent('white')
  //   .fill('none')
  //   .write('22.jpg', function(err){
  //     console.log(err)
  //   })

