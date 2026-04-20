# 念念日记 H5 中转服务

> 将 H5 前端请求安全转发到微信云函数，部署在 Vercel

## 📌 接口说明

所有接口均为 `POST` 请求：

| 路径 | 对应云函数 | 说明 |
|------|-----------|------|
| `/api/soulChat` | soulChat | 灵魂对话（AI 心理咨询）|
| `/api/diaryCloud` | diaryCloud | 日记增删改查 |
| `/api/diaryGenerator` | diaryGenerator | AI 生成日记 |
| `/api/memoryCloud` | memoryCloud | 记忆管理 |
| `/api/userCloud` | userCloud | 用户信息 |
| `/api/index` | index | 通用入口 |

## 🚀 部署步骤

### 1. Fork / Clone 本仓库到 GitHub

### 2. 在 Vercel 导入项目
1. 访问 https://vercel.com → New Project
2. 选择 GitHub 仓库 `niannian-proxy`
3. 点击 Deploy

### 3. 配置环境变量
在 Vercel 项目设置 → Environment Variables 中添加：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `WX_APPID` | 微信小程序 AppID | `wx7e36d202da5a4bd6` |
| `WX_SECRET` | 微信小程序 AppSecret | （在微信公众平台获取）|
| `WX_ENV_ID` | 云开发环境 ID | `3giou3yzccdf6c4e` |

### 4. 重新部署
配置完环境变量后，触发一次 Redeploy

## 🔗 前端调用示例

部署完成后，Vercel 会给你一个域名，例如 `https://niannian-proxy.vercel.app`

前端请求示例：
```javascript
// 调用灵魂对话
const res = await fetch('https://niannian-proxy.vercel.app/api/soulChat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'chat',
    message: '今天心情不好'
  })
})
```

## ⚠️ 安全说明
- AppSecret **不要提交到代码**，通过 Vercel 环境变量配置
- 仓库建议设为 **Private（私有）**
