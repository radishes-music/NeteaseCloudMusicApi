// 歌曲链接 - v1
// 此版本不再采用 br 作为音质区分的标准
// 而是采用 standard, exhigh, lossless, hires, jyeffect(高清环绕声), sky(沉浸环绕声), jymaster(超清母带) 进行音质判断

const match = require('@radishes/unblock')
const crypto = require('crypto')

const find = (id, source) => {
  const playSource =
    typeof source === 'string'
      ? source.split(',')
      : ['qq', 'baidu', 'kugou', 'kuwo']
  return match(id, playSource)
    .then((url) => {
      return url.url
    })
    .catch((e) => {
      console.warn(e)
      return ''
    })
}

module.exports = (query, request) => {
  query.cookie.os = 'android'
  query.cookie.appver = '8.10.05'
  const data = {
    ids: '[' + query.id + ']',
    level: query.level,
    encodeType: 'flac',
  }
  if (data.level == 'sky') {
    data.immerseType = 'c51'
  }
  console.log(data)
  return request(
    'POST',
    `https://interface.music.163.com/eapi/song/enhance/player/url/v1`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
      url: '/api/song/enhance/player/url/v1',
    },
  ).then(async (v) => {
    const { body } = v
    if (Buffer.isBuffer(body)) {
      v.body = JSON.parse(body.toString())
    }

    try {
      let i = 0
      while (i < v.body.data.length) {
        if (!v.body.data[i].url || v.body.data[i].freeTrialInfo) {
          const url = await find(v.body.data[i].id, query.source)
          v.body.data[i].url = url
        }
        i++
      }
    } catch (e) {
      console.log(e)
    }

    return v
  })
}
