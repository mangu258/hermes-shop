import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12">
        <article className="prose prose-pink mx-auto max-w-2xl px-4">
          <h1>服务条款</h1>
          <p>最后更新日期：2026年8月</p>
          <h2>1. 平台性质</h2>
          <p>本平台面向年满18周岁的成年用户提供商品销售服务。使用本平台即表示您确认已满18周岁，并具备完全民事行为能力。</p>
          <h2>2. 账户责任</h2>
          <p>您有责任妥善保管账户密码，因账户信息泄露导致的损失由用户自行承担。</p>
          <h2>3. 商品与交易</h2>
          <p>平台展示的商品信息以实际发货为准，价格如有调整以下单时页面显示为准。</p>
          <h2>4. 隐私保护</h2>
          <p>我们如何处理您的个人信息，请参见《隐私政策》。</p>
          <h2>5. 禁止行为</h2>
          <p>禁止将平台商品用于非法用途，禁止未经授权转售、禁止利用平台从事欺诈行为。</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
