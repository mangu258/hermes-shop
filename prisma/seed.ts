import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const products = [
  {
    title: '医用级硅胶入门震动棒 · 静音防水',
    description:
      '亲肤医用级硅胶，低噪音设计（<40dB），IPX7防水，多频震动模式，适合初次体验者。附带专用收纳袋与清洁刷。所有包装均无敏感标识。',
    price: 129,
    stock: 50,
    imageUrl: 'https://placehold.co/600x600/fce7f3/be185d?text=Silicone+Vibe',
  },
  {
    title: '双人共享跳蛋套装 · 远程控制',
    description:
      '情侣互动神器，支持手机APP远程控制，长续航，静音马达。可同时佩戴使用。材质安全可水洗。',
    price: 199,
    stock: 30,
    imageUrl: 'https://placehold.co/600x600/fbcfe8/9d174d?text=Couple+Set',
  },
  {
    title: '高品质润滑液 · 水溶性无刺激',
    description:
      '天然植物成分，水溶性配方，与硅胶玩具完美兼容，无刺激无异味，易清洗。200ml大容量装。',
    price: 49,
    stock: 100,
    imageUrl: 'https://placehold.co/600x600/f9a8d4/831843?text=Lube',
  },
  {
    title: '智能加热飞机杯 · APP联动',
    description:
      '内置加热与收缩功能，APP可调节模式与强度，仿真通道设计，USB充电。附带专用清洁液与润滑。',
    price: 359,
    stock: 20,
    imageUrl: 'https://placehold.co/600x600/f472b6/9d174d?text=Smart+Cup',
  },
  {
    title: '玻璃水晶棒 · 温度感知',
    description:
      '硼硅酸盐玻璃材质，可加热/冰镇使用，平滑无气孔，易清洁消毒。多尺寸可选。',
    price: 89,
    stock: 40,
    imageUrl: 'https://placehold.co/600x600/fdf2f8/db2777?text=Glass',
  },
  {
    title: '情趣内衣套装 · 蕾丝透明',
    description: '高弹力蕾丝面料，多色可选，包臀设计。独立密封包装。',
    price: 79,
    stock: 60,
    imageUrl: 'https://placehold.co/600x600/fce7f3/be185d?text=Lingerie',
  },
];

async function main() {
  const userHash = await hash('user123', 12);
  const adminHash = await hash('admin123', 12);

  await prisma.user.upsert({
    where: { email: 'user@store.com' },
    update: {},
    create: {
      email: 'user@store.com',
      passwordHash: userHash,
      name: '演示用户',
      role: 'USER',
      ageVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@hermes-shop.local' },
    update: {},
    create: {
      email: 'admin@hermes-shop.local',
      passwordHash: adminHash,
      name: '超级管理员',
      role: 'ADMIN',
      adminRole: 'super_admin',
      ageVerified: true,
    },
  });

  const count = await prisma.product.count();
  if (count === 0) {
    for (const p of products) {
      await prisma.product.create({
        data: {
          title: p.title,
          description: p.description,
          price: p.price,
          stock: p.stock,
          imageUrl: p.imageUrl,
          published: true,
          visibility: 'public',
        },
      });
    }
    console.log(`Seeded ${products.length} products`);
  } else {
    console.log(`Products exist (${count}), skip product seed`);
  }

  console.log('Seed done');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
