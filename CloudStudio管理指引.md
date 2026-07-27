# CloudStudio 控制台入口与管理指引

> 适用对象：Merge Dream Hotel 横屏 Demo（晨光酒店·合成翻修）的发布与日常管理

## 一、控制台入口

- 官网 / 控制台：**https://cloudstudio.net/**
- 登录方式：微信 / GitHub / CODING（任选其一）
- 文档中心：https://cloudstudio.net/docs/

## 二、当前 Demo 的公网分享链接（同事直接用，无需登录）

```
https://3000-d46a4e4ce01f4c21a0f89fb20e50e6ef.e2b.ap-beijing.sandbox.cloudstudio.club/
```

该链接由 WorkBuddy 部署工具创建，公网可访问，同事打开即玩（横屏：左=翻修进度，中=合成板，右=订单/商店）。

## 三、关于"我在控制台里找不到这个工作区"

重要说明：通过 WorkBuddy 部署工具创建的工作区（sandboxId: `d46a4e4ce01f4c21a0f89fb20e50e6ef`）运行在**部署工具所在的 CloudStudio 空间**下，**不一定会出现在你个人 cloudstudio.net 账号的工作区列表里**。

因此权限边界是：

| 你能做的 | 你可能无法直接做的 |
|---|---|
| 直接打开上面的分享链接，发给同事使用（公网可访问） | 在你个人控制台里删除 / 升级 / 重启该工作区（取决于账号归属） |

如果你只是临时给同事演示，分享链接够用；若要长期、在自己名下完全掌控，请走第四节的"导入仓库"方案。

## 四、在自己账号下部署并管理（推荐长期方案）

1. 给我一个 **git 远程仓库地址**（gongfeng / github 均可），我把代码 push 上去；
2. 打开 **https://cloudstudio.net/** → 登录；
3. 左下角「**新建工作空间**」→ 代码来源选「**导入仓库**」→ 选你的仓库与分支；
4. 工作区终端里执行：
   ```bash
   npm install
   npm run build
   ```
5. 启动静态服务（任选其一）：
   ```bash
   npm run preview -- --port 3000 --host
   # 或
   python -m http.server 3000
   ```
6. 点击 CloudStudio 的「**分享 / 预览**」拿到**你自己名下的公网链接**。

之后更新内容：本地 push 新代码 → 控制台重新部署 → 同事拿到最新版，无需再找我。

## 五、管理动作对照

| 动作 | 在哪里做 |
|---|---|
| 启动 / 停止 / 重启 | CloudStudio 控制台 → 对应工作区 |
| 删除工作区 | 控制台 → 工作区「删除」 |
| 升级为常驻（避免休眠） | 控制台 → 升级 / 购买机时（新版本以机时计费为主） |
| 更新内容 | 重新部署（可让我执行，或你自己控制台重部署） |
| 查看分享链接 | 控制台 → 工作区「分享 / 预览」 |

## 六、当前部署相关信息（备查）

- 沙箱 ID：`d46a4e4ce01f4c21a0f89fb20e50e6ef`
- 部署目录：`dist/`（Vite 构建产物，纯静态，无后端）
- 本地源码：`deliverables/20260727_MergeHotel_Demo/`
- 本地 git：已 `git init` 并提交（commit `8afa7fe`），尚未配置远程仓库
- 离线兜底：若同事网络够不到 CloudStudio，可发 `dist-single/index.html` 单文件，双击即玩
