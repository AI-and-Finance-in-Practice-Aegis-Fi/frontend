function parseAiSections(report: string): { title: string; content: string }[] {
  return report
    .split(/(?=■ )/)
    .filter((s) => s.trim().startsWith("■"))
    .map((s) => {
      const nl = s.indexOf("\n");
      return {
        title: (nl === -1 ? s : s.slice(0, nl)).replace("■ ", "").trim(),
        content: nl === -1 ? "" : s.slice(nl + 1).trim(),
      };
    });
}

export function downloadReportAsPdf(title: string, report: string, subtitle?: string): void {
  const sections = parseAiSections(report);
  const date = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const escapedSections = sections.map((s) => ({
    title: s.title.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
    content: s.content.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
  }));

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'NanumGothic', sans-serif;
    padding: 48px 56px;
    color: #111;
    line-height: 1.7;
    background: #fff;
  }
  header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 2px solid #1a1a2e;
    padding-bottom: 20px;
    margin-bottom: 32px;
  }
  .brand { font-size: 11px; font-weight: 700; color: #7a8099; letter-spacing: 0.08em; text-transform: uppercase; }
  h1 { font-size: 22px; font-weight: 900; color: #1a1a2e; margin: 6px 0 4px; }
  .subtitle { font-size: 13px; color: #555; }
  .meta { font-size: 11px; color: #888; text-align: right; }
  .section {
    margin-bottom: 18px;
    padding: 18px 20px;
    border: 1px solid #dde3ef;
    border-left: 4px solid #2c3e6b;
    border-radius: 0 8px 8px 0;
    page-break-inside: avoid;
    background: #f8f9fd;
  }
  .section-title { font-size: 13px; font-weight: 800; color: #2c3e6b; margin-bottom: 10px; }
  .section-content { font-size: 12.5px; line-height: 1.95; color: #444; white-space: pre-wrap; }
  footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #e0e0e0;
    font-size: 10.5px;
    color: #aaa;
    display: flex;
    justify-content: space-between;
  }
  @media print {
    body { padding: 16px 20px; }
    @page { margin: 1.2cm 1.5cm; size: A4; }
  }
</style>
</head>
<body>
  <header>
    <div>
      <div class="brand">Aegis-Fi AI CFO Platform</div>
      <h1>${title}</h1>
      ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ""}
    </div>
    <div class="meta">생성일: ${date}</div>
  </header>
  ${escapedSections.map((s) => `
  <div class="section">
    <div class="section-title">■ ${s.title}</div>
    <div class="section-content">${s.content}</div>
  </div>`).join("")}
  <footer>
    <span>Aegis-Fi AI CFO — AI가 생성한 참고용 분석 자료입니다.</span>
    <span>${date}</span>
  </footer>
</body>
</html>`;

  const win = window.open("", "_blank", "width=960,height=760");
  if (!win) {
    alert("팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해주세요.");
    return;
  }
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    win.focus();
    win.print();
  }, 400);
}
