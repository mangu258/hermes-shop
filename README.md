# Hermes Shop · 私密健康商城

**仓库**：https://github.com/mangu258/hermes-shop

## 快速开始

```bash
git clone https://github.com/mangu258/hermes-shop.git
cd hermes-shop
npm install
cp .env.example .env
# 填 DATABASE_URL、JWT_SECRET、STRIPE_*、CRON_SECRET
npx prisma db push
npm run db:seed   # 用户 + 6 个商品
npm run dev
```

无数据库时前台仍用演示商品；有库且 seed 后列表/详情/下单走真实库存。

## 账号

| 角色 | 邮箱 | 密码 | 入口 |
|------|------|------|------|
| 用户 | user@store.com | user123 | `/login` |
| 管理员 | admin@hermes-shop.local | admin123 | `/admin/login` |

前台与后台登录入口、API、角色校验分离；管理员不能走前台登录，反之亦然。

## Stripe Webhook

- URL：`/api/payments/webhook/stripe`
- 配置 `STRIPE_WEBHOOK_SECRET` 后校验 `Stripe-Signature`（HMAC SHA256 + 5 分钟时间窗）
- 生产环境未配置 secret 会直接拒绝
- 本地无 secret 时允许无签名 JSON 便于调试

## 其它

- Cron：`/api/cron/cancel-expired-orders`（`vercel.json` 每 15 分钟）
- 交互预览：打开仓库根目录 `preview.html`
