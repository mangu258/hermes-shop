import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-12">
        <article className="prose prose-pink mx-auto max-w-2xl px-4">
          <h1>退款政策</h1>
          <p>最后更新日期：2026年8月</p>
          <h2>1. 退款申请条件</h2>
          <p>订单状态为「已支付」「已发货」或「已完成」的订单，可在收到商品后合理期限内申请退款。</p>
          <h2>2. 因商品特殊性质的限制</h2>
          <p>出于卫生和安全考虑，部分已拆封商品可能不支持退货，具体以商品详情页说明为准。</p>
          <h2>3. 退款处理时间</h2>
          <p>退款申请提交后，平台将在3个工作日内审核；审核通过后，原路退回资金到账时间视支付渠道而定。</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
