/**
 * 念念日记 H5 中转服务 - Vercel Serverless
 * 将 H5 前端请求转发到微信云函数
 * 
 * 路由：POST /api/{云函数名}
 * 支持的云函数：soulChat, diaryCloud, diaryGenerator, memoryCloud, userCloud, index
 */

const INVOKE_URL = 'https://api.weixin.qq.com/tcb/invokecloudfunction'
const ACCESS_TOKEN_URL = 'https://api.weixin.qq.com/cgi-bin/token'

// 简单内存缓存（Vercel 实例存活期间有效）
let cachedToken = null
let tokenExpireTime = 0

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpireTime) {
    return cachedToken
  }

  const appid = process.env.WX_APPID
  const secret = process.env.WX_SECRET

  if (!appid || !secret) {
    throw new Error('未配置 WX_APPID 或 WX_SECRET 环境变量')
  }

  const url = `${ACCESS_TOKEN_URL}?grant_type=client_credential&appid=${appid}&secret=${secret}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.access_token) {
    cachedToken = data.access_token
    tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000
    return cachedToken
  }

  throw new Error('获取 access_token 失败: ' + JSON.stringify(data))
}

async function invokeCloudFunction(funcName, params) {
  const accessToken = await getAccessToken()
  const envId = process.env.WX_ENV_ID || '3giou3yzccdf6c4e'

  const url = `${INVOKE_URL}?access_token=${accessToken}`
  const body = {
    env: envId,
    name: funcName,
    req_data: JSON.stringify(params)
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const data = await res.json()

  if (data.resp_data) {
    try {
      return JSON.parse(data.resp_data)
    } catch {
      return { raw: data.resp_data }
    }
  }

  if (data.errcode && data.errcode !== 0) {
    throw new Error(`云函数调用失败: ${data.errmsg} (code: ${data.errcode})`)
  }

  return data
}

export default async function handler(req, res) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '只支持 POST 请求' })
  }

  // 从路径获取云函数名 /api/soulChat → soulChat
  const funcName = req.query.func

  // 白名单
  const ALLOWED_FUNCTIONS = [
    'soulChat',
    'diaryCloud',
    'diaryGenerator',
    'memoryCloud',
    'userCloud',
    'asrRecognize',
    'index'
  ]

  if (!ALLOWED_FUNCTIONS.includes(funcName)) {
    return res.status(404).json({ success: false, error: `不支持的云函数: ${funcName}` })
  }

  try {
    const params = req.body || {}
    const result = await invokeCloudFunction(funcName, params)
    return res.status(200).json(result)
  } catch (error) {
    console.error(`[${funcName}] 调用失败:`, error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}
