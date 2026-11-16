"use strict";

// 新增年度時，在此加入對應的資料檔。
const YEAR_FILES = {
  "2026": "./data/worlds-2026.json"
};

const yearFilter = document.querySelector("#year-filter");
const teamFilter = document.querySelector("#team-filter");
const stageFilter = document.querySelector("#stage-filter");
const resetButton = document.querySelector("#reset-button");
const scopeText = document.querySelector("#scope-text");
const updatedText = document.querySelector("#updated-text");
const statusMessage = document.querySelector("#status-message");
const tableRegion = document.querySelector("#table-region");
const matchesBody = document.querySelector("#matches-body");

let matches = [];
let loadVersion = 0;
let loaded = false;

function addOption(select, value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.append(option);
}

function initializeYears() {
  const years = Object.keys(YEAR_FILES).sort(
    (a, b) => Number(b) - Number(a)
  );

  for (const year of years) {
    addOption(yearFilter, year, `${year} 年`);
  }
}

function rebuildTeamOptions() {
  teamFilter.replaceChildren();
  addOption(teamFilter, "", "全部戰隊");

  const teams = [...new Set(
    matches.flatMap((match) => [match.teamA, match.teamB])
  )]
    .filter((team) => typeof team === "string" && team.trim())
    .sort((a, b) => a.localeCompare(b));

  for (const team of teams) {
    addOption(teamFilter, team, team);
  }
}

function validateDataset(data, expectedYear) {
  if (
    !data ||
    data.year !== Number(expectedYear) ||
    typeof data.scope !== "string" ||
    typeof data.updatedAt !== "string" ||
    !Array.isArray(data.matches)
  ) {
    throw new Error("年度資料格式不符合規則。");
  }

  const ids = new Set();

  for (const match of data.matches) {
    if (
      !match ||
      typeof match.id !== "string" ||
      !match.id.trim() ||
      ids.has(match.id)
    ) {
      throw new Error("紀錄識別碼缺漏或重複。");
    }

    ids.add(match.id);

    if (
      !["八強", "四強", "決賽"].includes(match.stage) ||
      typeof match.teamA !== "string" ||
      !match.teamA.trim() ||
      typeof match.teamB !== "string" ||
      !match.teamB.trim() ||
      match.teamA === match.teamB ||
      !["verified", "pending"].includes(match.verificationStatus)
    ) {
      throw new Error("紀錄的階段、戰隊或確認狀態有誤。");
    }

    for (const score of [match.scoreA, match.scoreB]) {
      if (
        score !== null &&
        (!Number.isInteger(score) || score < 0)
      ) {
        throw new Error("比分必須是非負整數或 null。");
      }
    }

    if (
      match.winner !== null &&
      ![match.teamA, match.teamB].includes(match.winner)
    ) {
      throw new Error("勝方名稱與參賽戰隊不一致。");
    }

    if (match.scoreA !== null && match.scoreB !== null) {
      if (match.scoreA === match.scoreB) {
        throw new Error("已結束的系列賽不可為平手。");
      }

      const expectedWinner =
        match.scoreA > match.scoreB ? match.teamA : match.teamB;

      if (match.winner !== expectedWinner) {
        throw new Error("比分與勝方不一致。");
      }
    }

    if (match.verificationStatus === "verified") {
      if (
        !match.date ||
        match.scoreA === null ||
        match.scoreB === null ||
        !match.winner ||
        !match.sourceName ||
        !safeSourceUrl(match.sourceUrl)
      ) {
        throw new Error("已核對紀錄缺少必要資料或有效來源網址。");
      }
    }
  }
}

function safeSourceUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function addCell(row, value, className = "") {
  const cell = document.createElement("td");
  cell.textContent =
    value === null || value === undefined || value === ""
      ? "暫無資料"
      : String(value);

  if (className) {
    cell.className = className;
  }

  row.append(cell);
  return cell;
}

function renderMatches() {
  if (!loaded) return;

  const selectedTeam = teamFilter.value;
  const selectedStage = stageFilter.value;

  const filtered = matches.filter((match) => {
    const teamMatches =
      !selectedTeam ||
      match.teamA === selectedTeam ||
      match.teamB === selectedTeam;

    const stageMatches =
      !selectedStage || match.stage === selectedStage;

    return teamMatches && stageMatches;
  });

  filtered.sort((a, b) =>
    (a.date || "9999").localeCompare(b.date || "9999")
  );

  matchesBody.replaceChildren();
  tableRegion.hidden = filtered.length === 0;

  if (matches.length === 0) {
    statusMessage.textContent =
      "尚未加入賽事資料。完成來源核對後，即可更新年度資料檔。";
    return;
  }

  if (filtered.length === 0) {
    statusMessage.textContent = "查無符合條件的紀錄。";
    return;
  }

  statusMessage.textContent =
    `共顯示 ${filtered.length} 筆系列賽紀錄。`;

  for (const match of filtered) {
    const row = document.createElement("tr");

    addCell(row, match.date);
    addCell(row, match.stage);
    addCell(row, match.teamA);

    const score =
      match.scoreA !== null && match.scoreB !== null
        ? `${match.scoreA}：${match.scoreB}`
        : null;

    addCell(row, score, "score");
    addCell(row, match.teamB);
    addCell(row, match.winner);

    addCell(
      row,
      match.verificationStatus === "verified"
        ? "已核對"
        : "待確認"
    );

    const sourceCell = document.createElement("td");
    const sourceUrl = safeSourceUrl(match.sourceUrl);

    if (sourceUrl) {
      const link = document.createElement("a");
      link.href = sourceUrl;
      link.textContent = match.sourceName || "查看來源";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      sourceCell.append(link);
    } else {
      sourceCell.textContent = match.sourceName
        ? `${match.sourceName}（連結待補）`
        : "暫無資料";
    }

    row.append(sourceCell);
    matchesBody.append(row);
  }
}

async function loadYear() {
  const currentVersion = ++loadVersion;
  const selectedYear = yearFilter.value;

  loaded = false;
  matches = [];
  rebuildTeamOptions();
  stageFilter.value = "";
  matchesBody.replaceChildren();
  tableRegion.hidden = true;
  scopeText.textContent = "讀取中";
  updatedText.textContent = "—";
  statusMessage.textContent = "正在讀取賽事資料……";

  try {
    const response = await fetch(YEAR_FILES[selectedYear]);

    if (!response.ok) {
      throw new Error(`無法讀取資料檔：HTTP ${response.status}`);
    }

    const data = await response.json();

    // 使用者快速切換年度時，忽略較早的讀取結果。
    if (currentVersion !== loadVersion) return;

    validateDataset(data, selectedYear);

    matches = data.matches;
    loaded = true;
    scopeText.textContent = data.scope;
    updatedText.textContent = data.updatedAt;

    rebuildTeamOptions();
    renderMatches();
  } catch (error) {
    if (currentVersion !== loadVersion) return;

    scopeText.textContent = "資料讀取失敗";
    statusMessage.textContent =
      "無法載入賽事資料。請確認 JSON 格式、檔案路徑，" +
      "並透過本機伺服器或 GitHub Pages 開啟網站。";

    console.error(error);
  }
}

yearFilter.addEventListener("change", loadYear);
teamFilter.addEventListener("change", renderMatches);
stageFilter.addEventListener("change", renderMatches);

resetButton.addEventListener("click", () => {
  teamFilter.value = "";
  stageFilter.value = "";
  renderMatches();
});

initializeYears();
loadYear();