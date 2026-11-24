# Huixuan Zhang · Academic Homepage

个性化学术主页。编辑 `data.json` 可更新个人简介、研究方向、动态、教育经历和论文。头像目前使用占位图。论文条目来自 ACL Anthology，主页包含提供的 Google Scholar 链接。

## 本地预览

在终端进入本目录后运行 `python3 -m http.server 8000 --bind 127.0.0.1`，然后打开 http://127.0.0.1:8000/。按 Control+C 停止预览。

## 发布到 GitHub Pages

1. 登录 GitHub 的 `lleozhang` 账号，创建名为 **lleozhang.github.io** 的公开空仓库。保留本地 README，创建仓库时跳过添加 README、许可证和 .gitignore。
2. 在终端进入本目录，运行以下命令。若 GitHub 要求登录，按提示完成认证。

   ```sh
   git remote add origin https://github.com/lleozhang/lleozhang.github.io.git
   git push -u origin main
   ```

3. 打开仓库的 **Settings → Pages**，选择 **Deploy from a branch**，分支选 **main**，目录选 **/(root)**，然后保存。
4. 在 **Actions** 查看部署是否成功，随后从 **Settings → Pages** 打开 https://lleozhang.github.io/。

发布仓库中的内容将公开。请将未发表或匿名评审材料保留在仓库之外。

[GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
