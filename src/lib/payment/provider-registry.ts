export interface ProviderFieldDef {
  key: string;
  label: string;
  type: 'text' | 'password' | 'textarea';
  required: boolean;
}

export interface ProviderDef {
  key: string;
  displayName: string;
  type: 'api' | 'qrcode' | 'manual';
  fields: ProviderFieldDef[];
}

export const AVAILABLE_PROVIDERS: ProviderDef[] = [
  {
    key: 'stripe',
    displayName: 'Stripe（信用卡）',
    type: 'api',
    fields: [
      { key: 'apiKey', label: 'Secret Key', type: 'password', required: true },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: true },
    ],
  },
  {
    key: 'usdt_trc20',
    displayName: 'USDT (TRC20)',
    type: 'api',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'walletAddress', label: '收款地址', type: 'text', required: true },
    ],
  },
  {
    key: 'alipay',
    displayName: '支付宝',
    type: 'api',
    fields: [
      { key: 'appId', label: 'App ID', type: 'text', required: true },
      { key: 'privateKey', label: '商户私钥', type: 'textarea', required: true },
    ],
  },
  {
    key: 'wechat_qr',
    displayName: '微信收款码',
    type: 'qrcode',
    fields: [],
  },
  {
    key: 'manual_transfer',
    displayName: '线下转账',
    type: 'manual',
    fields: [
      { key: 'instructions', label: '转账说明文字', type: 'textarea', required: true },
    ],
  },
];

export function getProviderDef(key: string): ProviderDef | undefined {
  return AVAILABLE_PROVIDERS.find((p) => p.key === key);
}

export function isConfigComplete(
  providerKey: string,
  config: Record<string, any> | null
): boolean {
  const def = getProviderDef(providerKey);
  if (!def) return false;
  const requiredFields = def.fields.filter((f) => f.required);
  if (requiredFields.length === 0) return true;
  return requiredFields.every((f) => !!config?.[f.key]);
}
