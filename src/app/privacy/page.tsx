import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12">
        <article className="prose prose-pink mx-auto max-w-2xl px-4">
          <h1>隐私政策</h1>
          <p>最后更新日期：2026年8月</p>
          <h2>1. 我们收集哪些信息</h2>
          <p>注册信息（邮箱、出生日期）、订单信息（收货地址、购买记录）、支付相关信息（不含完整银行卡号）。</p>
          <h2>2. 信息如何被使用</h2>
          <p>用于订单处理、客户服务、防欺诈、合规年龄验证。我们不会将您的个人信息出售给第三方。</p>
          <h2>3. 信息存储与安全</h2>
          <p>敏感配置信息经加密存储，密码采用不可逆哈希算法处理。</p>
          <h2>4. 您的权利</h2>
          <p>您可以在账户设置中查看、修改个人信息，或联系客服申请删除账户及相关数据。</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
