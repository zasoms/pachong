const gm = require('gm')
const fs = require('fs')
const request = require('request')
// const imageMagick = gm.subClass({ imageMagick: true })


// 去除图片空白区


gm('111.tbi')
  .trim()
  .write('333format.tbi', function(err){
    if( !err ){
      gm('333format.tbi')
        .size({bufferStream: true}, function(err, size) {
          if( !err ){
            let width = 560
            let height = parseInt((width / size.width) * size.height)
            this.resize(width, height, '!')
            this.write('333format.tbi', function (err) {
              if( !err ){
                gm()
                .in('-page', '+0+0')
                .in('base.jpg')
                .in('-page', '+25+114')
                .in('333format.tbi')
                .mosaic()
                .write('333format.tbi', function(){})
              }

            })
          }
        })
      // 
    }
  })


// 旋转、图片大小变化
// gm('./111.tbi')
//   .trim()
//   .fuzz(100)
//   .rotate('white', -10)
//   .resize(900)
//   .autoOrient()
//   .write('22.tbi', function(err){
//     console.log(err)
//   })

// 拼接
  // gm()
  // .in('-page', '+0+0')
  // .in('base.jpg')
  // .in('-page', '+100+200')
  // .in('111.png')
  // .mosaic()
  // .write('22.png', function(err){
  //   console.log(err)
  // })

// 合成
  // gm()
  // .command("composite") 
  // .in("-gravity", "center")
  // .in('base.jpg')
  // .in('111.png')
  // .write( '22.jpg', function (err) {
  //   if (!err) 
  //     console.log(' hooray! ');
  //   else
  //     console.log(err);
  // });

  // quality 压缩 0 - 100
  // gm('./111.jpg')
    // .trim()
    // .transparent('white')
    // .fuzz(50)
    // .background('transparent')
    // .transparent('white')
    // .fill('red')
    // .write('22.jpg', function(err){
    //   console.log(err)
    // })
  // gm(900, 900, '#ffffff')
  //   .stroke("#000000")
  //   .write('22.jpg', function(err){
  //     console.log(err)
  //   })

  

// gm(request('https://s1.lativ.com/i/32550/32550011/3255001_900.jpg'))
//   .trim()
//   .size({bufferStream: true}, function(err, size) {
//     this.resize(size.width / 2, size.height / 2)
//     this.write('333.jpg', function (err) {
//       if (!err) console.log('done');
//     });
//   })