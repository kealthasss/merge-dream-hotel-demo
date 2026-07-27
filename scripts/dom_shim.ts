// 最小 DOM + localStorage 桩，供无头冒烟测试在 Node 中运行 UI 层
const appStub: any = { innerHTML: '', addEventListener() {} };
const store: Record<string, string> = {};
(globalThis as any).document = {
  getElementById: (id: string) => (id === 'app' ? appStub : null),
  addEventListener() {},
  body: { appendChild() {} },
  elementFromPoint: () => null
};
(globalThis as any).localStorage = {
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => {
    store[k] = v;
  },
  removeItem: (k: string) => {
    delete store[k];
  }
};
(globalThis as any).appStub = appStub;
