\# 英雄聯盟世界賽對局紀錄站



以靜態網站整理英雄聯盟世界賽系列賽結果，

提供年度、戰隊及賽事階段篩選。



\## 目前狀態

- 已建立網站介面、資料讀取及篩選功能。
- 已加入 2026 年世界賽淘汰賽的 7 筆系列賽待確認紀錄。
- 收錄八強 4 筆、四強 2 筆、決賽 1 筆。
- 現有紀錄依提供的搜尋摘要整理，尚未取得原始來源網址。
- 所有紀錄標示為 pending，不代表已完成事實查證。
- 網站完成部署後，再補上公開網址。



\## 技術



\- HTML

\- CSS

\- 原生 JavaScript

\- JSON 年度資料檔

\- GitHub Pages 靜態網站部署



不需要安裝 npm 套件、資料庫或後端服務。



\## 檔案結構



\- AGENTS.md：AI 開發與內容更新規則。

\- index.html：網站首頁。

\- assets/style.css：共用樣式。

\- assets/app.js：資料讀取、篩選與表格顯示。

\- data/worlds-2026.json：年度賽事資料。



\## 本機瀏覽



網站使用 fetch 讀取 JSON，

請透過本機 HTTP 伺服器開啟，不要直接雙擊 index.html。



可以使用 VS Code 的 Live Server 擴充功能。



若電腦已安裝 Python，也可以在專案根目錄執行：



python -m http.server 8000



接著開啟：



http://localhost:8000



\## 新增年度



1\. 先閱讀 AGENTS.md。

2\. 依既有格式建立 data/worlds-YYYY.json。

3\. 在 assets/app.js 的 YEAR\_FILES 加入新年度與路徑。

4\. 僅填入有來源的資料，未核對內容標示 pending。

5\. 更新本文件的收錄範圍。

6\. 測試年度、戰隊、階段篩選，以及手機版畫面。



\## 資料原則



\- 一筆紀錄代表一個系列賽，不代表單局。

\- 未知欄位使用 null，不以 0 代替。

\- 不編造戰績、日期或來源網址。

\- verified 代表已完成來源核對，不是程式自動認證。

\- 程式格式檢查不取代人工查證。



\## GitHub Pages 發布



1\. 將完整專案上傳至 GitHub 公開儲存庫。

2\. 確認 index.html 位於儲存庫根目錄。

3\. 前往 Settings → Pages。

4\. 選擇 Deploy from a branch。

5\. 選擇 main 分支及 /(root)，儲存設定。

6\. 部署完成後，開啟 GitHub 提供的網址測試。



\## 非官方聲明



本站為課程小專案，與 Riot Games 無官方關聯。

各筆賽事紀錄需標示資料來源。

