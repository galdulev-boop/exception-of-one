/* Shared talk parser + renderer. Used by index.html (live) and edit.html (preview).
   Markup, one item per line:
     Title|section     -> a section / beat heading
     note|stage        -> stage direction (italic, dimmable)
     ⏸ caption|pause   -> a beat / held pause
     line|punch        -> a centered "screenshot" line
     anything else      -> a spoken line
     ===                -> separator (ignored)
*/
(function (global) {
  function parseTalk(raw) {
    const sections = [];
    let cur = null;
    String(raw).split("\n").forEach(function (rawln) {
      const line = rawln.replace(/\r$/, "");
      const t = line.trim();
      if (!t || t === "===") return;
      if (line.endsWith("|section")) {
        cur = { title: line.slice(0, -8).trim(), items: [] };
        sections.push(cur);
      } else if (!cur) {
        // text before the first section: start an untitled one so nothing is lost
        cur = { title: "", items: [] };
        sections.push(cur);
        cur.items.push({ type: "line", text: t });
      } else if (line.endsWith("|stage")) {
        cur.items.push({ type: "stage", text: line.slice(0, -6).trim() });
      } else if (line.endsWith("|pause")) {
        cur.items.push({ type: "pause", text: line.slice(0, -6).replace(/^⏸/, "").trim() });
      } else if (line.endsWith("|punch")) {
        cur.items.push({ type: "punch", text: line.slice(0, -6).trim() });
      } else {
        cur.items.push({ type: "line", text: t });
      }
    });
    return sections;
  }

  function renderTalk(sections, scriptEl, opts) {
    opts = opts || {};
    const tocList = opts.tocList || null;
    const pageTitle = opts.pageTitle || "";
    scriptEl.innerHTML = "";
    if (tocList) tocList.innerHTML = "";

    sections.forEach(function (sec, i) {
      const sectionEl = document.createElement("section");
      sectionEl.className = "bit";
      sectionEl.id = "sec-" + i;

      const isOpening = (i === 0 && sec.title === pageTitle);
      const name = isOpening ? "Opening" : (sec.title || "—");

      const head = document.createElement("div");
      head.className = "sechead";
      const n = document.createElement("span");
      n.className = "n";
      n.textContent = String(i + 1).padStart(2, "0");
      const h2 = document.createElement("h2");
      h2.textContent = name;
      head.append(n, h2);
      sectionEl.append(head);

      sec.items.forEach(function (it) {
        if (it.type === "line" || it.type === "punch") {
          const p = document.createElement("p");
          p.className = it.type === "punch" ? "line punch serif" : "line serif";
          p.textContent = it.text;
          sectionEl.append(p);
        } else if (it.type === "stage") {
          const d = document.createElement("p");
          d.className = "stage";
          d.textContent = it.text;
          sectionEl.append(d);
        } else if (it.type === "pause") {
          const d = document.createElement("div");
          d.className = "pause";
          const ic = document.createElement("span");
          ic.className = "ic";
          ic.textContent = "⏸";
          const tx = document.createElement("span");
          tx.className = "txt";
          tx.textContent = it.text;
          d.append(ic, tx);
          sectionEl.append(d);
        }
      });

      scriptEl.append(sectionEl);

      if (tocList) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#sec-" + i;
        a.innerHTML = '<span class="n">' + String(i + 1).padStart(2, "0") + "</span>";
        const label = document.createElement("span");
        label.textContent = name;
        a.append(label);
        if (opts.onTocClick) a.addEventListener("click", opts.onTocClick);
        li.append(a);
        tocList.append(li);
      }
    });
  }

  global.parseTalk = parseTalk;
  global.renderTalk = renderTalk;
})(window);
