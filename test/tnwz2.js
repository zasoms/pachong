const request = require('request')
const rp = require('request-promise')
const crypto = require('crypto')
const fs = require('fs')

const QuizModel = require('./quizModel')

const options = {
  method: 'POST',
  hostname: 'question.hortor.net',
  path: '/question/fight/intoRoom',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}

/**
 * token: 登录唯一标识
 * uid: 用户id
 * t: 当前时间
 * sign: 签名
 */
const userForgeInfo = {
  player1: {
    uid: '111575573',
    token: 'd61cc141eb654f3def57b922e20a14de'
  },
  // 'zasoms'
  player2: {
    uid: '11254672',
    token: 'ff994eab5fc889a5ce27f2454db20fd6'
  }
}


const createSignature = (params, token) => {
  let obj = Object.assign(params, {
    token
  })

  const md5 = crypto.createHash("md5")
  let str = ''

  const keys = Object.keys(obj).sort()
  for (const key of keys) {
    str += `${key}=${obj[key]}`
  }

  md5.update(str)
  return md5.digest('hex')
}

let roomID = -1

const intoRoom = async (player) => {
  try {
    let params = {
      roomID,
      uid: userForgeInfo[player].uid,
      t: new Date().getTime()
    }
    let sign = createSignature(params, userForgeInfo[player].token)
    params.sign = sign
    console.log(params)
    const res = await rp.post(
      'https://question.hortor.net/question/bat/intoRoom', {
        form: params
      })
    console.log('intoRoom', res)
    roomID = JSON.parse(res).data.roomId
  } catch (err) {
    console.error(err.message)
  }
}

const leaveRoom = async (player) => {
  try {
    let params = {
      roomID,
      uid: userForgeInfo[player].uid,
      t: new Date().getTime()
    }
    let sign = createSignature(params, userForgeInfo[player].token)
    params.sign = sign
    console.log(params)
    const res = await rp.post(
      'https://question.hortor.net/question/bat/leaveRoom', {
        form: params
      })
    console.log(res)
    // roomID = JSON.parse(res).data.roomId
  } catch (err) {
    console.error(err.message)
  }
}

const beginFight = async () => {
  try {
    let params = {
      roomID,
      uid: userForgeInfo.player1.uid,
      t: new Date().getTime()
    }
    let sign = createSignature(params, userForgeInfo.player1.token)
    params.sign = sign

    const res = await rp.post(
      'https://question.hortor.net/question/bat/beginFight', {
        form: params
      }
    )
    console.log('beginFight: ', res)
  } catch (err) {
    console.error(err.message)
  }
}

const findQuiz = async (num) => {
  console.log('num: ', num)
  try {
    let params = {
      roomID,
      uid: userForgeInfo.player1.uid,
      t: new Date().getTime(),
      quizNum: num
    }
    let sign = createSignature(params, userForgeInfo.player1.token)
    params.sign = sign

    const res = await rp.post(
      'https://question.hortor.net/question/bat/findQuiz', {
        form: params
      }
    )
    console.log('findQuiz: ', res)
    return JSON.parse(res)
  } catch (err) {
    console.error(err.message)
  }
}

const chooseAnswer = async (player, num, answer = 0) => {
  try {
    let params = {
      roomID,
      uid: userForgeInfo[player].uid,
      t: new Date().getTime(),
      quizNum: num,
      options: answer
    }
    let sign = createSignature(params, userForgeInfo[player].token)
    params.sign = sign

    const res = await rp.post(
      'https://question.hortor.net/question/bat/choose', {
        form: params
      }
    )
    console.log('chooseAnswer: ', res)
    return JSON.parse(res)
  } catch (err) {
    console.error(err.message)
  }
}

const getResults = async (player) => {
  try {
    let params = {
      roomID,
      uid: userForgeInfo[player].uid,
      t: new Date().getTime()
    }
    let sign = createSignature(params, userForgeInfo[player].token)
    params.sign = sign

    const res = await rp.post(
      'https://question.hortor.net/question/bat/fightResult', {
        form: params
      }
    )
    console.log('getResults')
  } catch (err) {
    console.error(err.message)
  }
}

const sleep = (number) => new Promise(resolve => setTimeout(resolve, number * 1000))

const startAnswer = async () => {
  try {
    let success = 0
    for (let i = 0; i < 5; ++i) {
      let quiz = await findQuiz(i + 1)
      if (!quiz) {
        throw new Error('未找到题目')
      }
      let answer = Math.ceil(Math.random() * 4)
      // 查找题库内是否有该题
      let one = await QuizModel.findOne(quiz.data.quiz)
      if (one) {
        answer = one.answer
        ++success
      }
      let result = await chooseAnswer('player1', i + 1, answer)
      // 玩家2是否可以不作答？
      await chooseAnswer('player2', i + 1, Math.ceil(Math.random() * 4))

      let params = Object.assign(quiz.data, {
        answer: result.data.answer
      })
      if (!one) {
        const saved = await QuizModel.save(params)
        console.log('saved', 1111)
      }
      await sleep(0.2)
    }
    let count = await QuizModel.count()
    console.log(`success: ${success} total: ${count.length}`)
    fs.writeFileSync('./success.log', `success: ${success} total: ${count.length}\n`, {
      flag: 'a'
    });
  } catch (err) {
    console.error(err.message)
  }
}

const start = async () => {
  // let i = 100
  while (1) {
    // 1. 有可能上一次流程异常，则会无法进行下一次的阶段
    // 2. 有可能initRoom超时，则需要重新initRoom
    // play1创建房间
    roomID = -1
    await intoRoom('player1')
    // play2加入房间
    await intoRoom('player2')
    // 开始答题
    await beginFight()
    // 获取题目, 进行答题
    await startAnswer()
    await getResults('player1')
    await getResults('player2')
    await leaveRoom('player1')
    await leaveRoom('player2')
    console.log('答题结束，等待十秒进行下一轮')
    await sleep(1)
  }
} 
start()

// const find = async() => {
  // let res = await QuizModel.findOne('著名书画家郑板桥擅长画的植物是？')
  // let res = await QuizModel.save({
  //   "quiz": "著名书画家郑板桥擅长画的植物是？", 
  //   "options": ["梅", "菊", "竹", "兰"], 
  //   "num": 1, 
  //   "school": "文艺", 
  //   "type": "艺术", 
  //   "contributor": "", 
  //   "endTime": 1516248771, 
  //   "curTime": 1516248756,
  //   answer: 3
  // })
  // console.log(res)
// }
// find()