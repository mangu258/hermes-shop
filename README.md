# Hermes Shop · 私密健康商城

基于对话设计文档重新开发的完整成人用品电商应用。

**仓库地址**：https://github.com/mangu258/hermes-shop

## 已实现能力

| 模块 | 状态 |
|------|------|
| 年龄门禁（18+） | ✅ |
| 前台首页 / 商品列表 / 详情 | ✅ |
| 用户登录 / 管理员登录 | ✅ |
| 管理后台控制台 | ✅ |
| 完整 Prisma Schema（用户/权限/商品/订单/支付通道/客服/公告等） | ✅ |
| 支付通道 Provider 注册表（默认关闭，配置完整才可启用） | ✅ |
| 隐私承诺 + 法律页面（服务条款/隐私/退款） | ✅ |
| Middleware（年龄门禁 + 后台鉴权） | ✅ |
| 演示数据 fallback（无数据库也能展示） | ✅ |

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
# 编辑 .env 填入 DATABASE_URL 与 JWT_SECRET（可选）
npm run dev
```

访问 http://localhost:3000 → 先通过年龄门禁 → 浏览商品。

管理后台：http://localhost:3000/admin/login

## 部署到 Vercel

1. 导入本仓库
2. 环境变量：`DATABASE_URL`、`JWT_SECRET`
3. Deploy
4. 部署后执行 `npx prisma db push`（或在 Vercel 构建后钩子中配置）

## 架构说明（来自对话设计）

- **支付通道**：注册表声明可用渠道 → 数据库记录 enabled + configComplete → 后台填 Key 后才可点亮启用
- **权限**：细粒度 Permission + RolePermission，超管拥有全部权限
- **隐私**：年龄门禁 + 无敏感包装承诺 + 法律页面
- **扩展方向**：购物车持久化、订单全生命周期、Stripe webhook、多语言字典、审计日志、评价系统等设计已完成，可按需继续落地

## 与 adult-store 的关系

本仓库为根据完整对话设计**重新开发**的独立项目，比之前的 `adult-store` 演示版结构更完整，Schema 与架构对齐 Hermes 设计文档。
