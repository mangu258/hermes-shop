# Hermes Shop · 私密健康商城

根据对话设计文档重新开发的完整成人用品电商应用。

**仓库**：https://github.com/mangu258/hermes-shop

## 功能清单

| 模块 | 状态 |
|------|------|
| 年龄门禁（18+） | ✅ |
| 前台首页 / 商品列表 / 详情 | ✅ |
| 用户登录 / 管理员登录 | ✅ |
| 管理后台控制台 | ✅ |
| **真实订单创建 + 库存预扣** | ✅ |
| **订单取消并归还库存** | ✅ |
| **购物车服务端 API + 本地 zustand 持久化** | ✅ |
| **支付通道后台配置页 + AES 加密存储** | ✅ |
| **Stripe Webhook 骨架** | ✅ |
| **多语言字典（zh / en）** | ✅ |
| **商品评价 API + 展示组件** | ✅ |
| **审计日志 API + 后台页面** | ✅ |
| 完整 Prisma Schema | ✅ |
| 法律页面 | ✅ |

## 演示账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 超级管理员 | admin@hermes-shop.local | admin123 |
| 普通用户 | user@store.com | user123 |

## 快速开始

```bash
git clone https://github.com/mangu258/hermes-shop.git
cd hermes-shop
npm install
cp .env.example .env
# 填 DATABASE_URL、JWT_SECRET、CONFIG_ENCRYPTION_KEY（可选）
npm run dev
```

- 前台：http://localhost:3000（先过年龄门禁）
- 后台：http://localhost:3000/admin/login
- 支付通道：http://localhost:3000/admin/payments
- 审计日志：http://localhost:3000/admin/audit-logs

## 关键 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/orders` | 创建订单并预扣库存 |
| POST | `/api/orders/[id]/cancel` | 取消待支付订单并归还库存 |
| GET/POST/DELETE | `/api/cart` | 服务端购物车 |
| POST | `/api/cart/merge` | 登录后合并本地购物车 |
| GET/PATCH | `/api/admin/payments/channels` | 支付通道列表与配置 |
| POST | `/api/payments/webhook/stripe` | Stripe 回调 |
| GET/POST | `/api/products/[id]/reviews` | 商品评价 |
| GET | `/api/admin/audit-logs` | 审计日志 |

## 环境变量

见 `.env.example`：`DATABASE_URL`、`JWT_SECRET`、`CONFIG_ENCRYPTION_KEY`、`STRIPE_*`、`CRON_SECRET` 等。

无数据库时前台商品与多数页面仍可用演示数据；订单/购物车/支付配置在连接数据库后生效完整能力。

## 架构要点（对齐对话设计）

- **支付通道**：注册表声明 → DB 存 enabled + configComplete → 后台填 Key 加密保存 → 配置完整才可启用
- **订单**：服务端重算价格、事务内预扣库存，取消时归还
- **购物车**：游客 localStorage（zustand），登录用户可同步服务端
- **Webhook**：`/api/payments/webhook/stripe`，支付成功更新订单状态
