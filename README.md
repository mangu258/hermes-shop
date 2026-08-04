# Hermes Shop · 私密健康商城

**仓库**：https://github.com/mangu258/hermes-shop

最小上线闭环：浏览 → 加购 → 登录下单（预扣库存）→ Stripe Checkout 或人工确认收款 → Webhook/后台改状态；超时待支付由 Cron 取消并归还库存。

## 演示账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@hermes-shop.local | admin123 |
| 用户 | user@store.com | user123 |

## 本地

```bash
git clone https://github.com/mangu258/hermes-shop.git
cd hermes-shop
npm install
cp .env.example .env
npm run dev
```

有 Postgres 时：`npx prisma db push`

## 关键路径

| 路径 | 说明 |
|------|------|
| `/` `/products` | 前台（演示商品） |
| `/cart` | 购物车 → 下单 / Stripe |
| `/orders` | 我的订单 |
| `/admin` | 控制台 |
| `/admin/orders` | 订单 + 确认收款 |
| `/admin/payments` | 支付通道配置（加密） |
| `/api/cron/cancel-expired-orders` | 取消超时 PENDING（需 CRON_SECRET） |
| `/api/payments/webhook/stripe` | Stripe Webhook |
| `/api/payments/create-checkout` | 创建 Checkout Session |

## 环境变量

见 `.env.example`。Vercel 需配置 Cron（已有 `vercel.json`，每 15 分钟）与 `CRON_SECRET`。

## 业务假设（简）

- 创建订单时预扣库存；仅 PENDING 可取消/超时归还；支付成功只改状态。
- Stripe 用 Checkout Session REST，不强制安装 stripe SDK。
- 无 DB 时前台仍可浏览；下单返回演示单。
- 多语言：Cookie `locale` + 导航/年龄门禁字典，非全站重构。
