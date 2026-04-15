// ==UserScript==
// @name         Minesweeper Tile Counter
// @match        https://minesweeper.online/*
// @match        https://classic.minesweeper.online/*
// @version      1.01.02
// @grant        GM_getValue
// @grant        GM_setValue
// @icon         https://github.com/Tokwo/Minesweeper-Tile-Counter/blob/main/ms_8.png?raw=true
// @description  Automatically keeps track of the amount of tiles in a completed minesweeper game on minesweeper.online
// @updateURL    https://raw.githubusercontent.com/Tokwo/Minesweeper-Tile-Counter/main/WOMTileCounter.user.js
// @downloadURL  https://raw.githubusercontent.com/Tokwo/Minesweeper-Tile-Counter/main/WOMTileCounter.user.js
// ==/UserScript==

(function() {

    //--storage--//

    //im loading it oh yeah
    function loadDataset() {
        const data = GM_getValue("dataset", null);
        if (!data) return {};
        try { return JSON.parse(data); }
        catch { return {}; }
    }

    //oh baby im saving it
    function saveDataset(obj) {
        GM_setValue("dataset", JSON.stringify(obj));
    }

    let dataset = loadDataset();

    //--helpers--//

    //get url
    function getCurrentURL() {
        return window.location.href.split("?")[0];
    }

    //checks and returns diff
    function detectGameType() {
        const active = document.querySelector(".level-select-link.active");
        if (!active) return null;

        const id = active.id;
        // Standard: 1-beginner, 2-intermediate, 3-expert, 4-custom
        // Noguessing: 11-easy, 12-medium, 13-hard, 14-evil, 15-custom
        const idNum = parseInt(id.replace("level_select_", ""));
        if (1 === idNum){
            return "Beginner";
        }else if (2 === idNum){
            return "Intermediate";
        }else if (3 === idNum){
            return "Expert";
        }else if (11 === idNum){
            return "Easy";
        }else if (12 === idNum){
            return "Medium";
        }else if (13 === idNum){
            return "Hard";
        }else if (14 === idNum){
            return "Evil";
        }
        return null;
    }

    //check if logged
    function gameAlreadyLogged(url) {
        return dataset.hasOwnProperty(url);
    }

    //log
    function logGame() {
        const url = getCurrentURL();
        const type = detectGameType();

        if (!type) return false;
        if (gameAlreadyLogged(url)) return false;

        const counts = getTileCounts();

        dataset[url] = {
            type: type,
            counts: counts
        };

        saveDataset(dataset);
        updateGUI();
        return true;
    }

    //check if finished
    function isGameFinished() {
        const face = document.querySelector(".top-area-face");
        if (!face) return false;
        return (face.classList.contains("hd_top-area-face-win") || face.classList.contains("hdd_top-area-face-win") || face.classList.contains("hdn_top-area-face-win")
                || face.classList.contains("xp_top-area-face-win") || face.classList.contains("xpd_top-area-face-win") || face.classList.contains("nnhdd_top-area-face-win")
                || face.classList.contains("rcd_top-area-face-win") || face.classList.contains("ald_top-area-face-win") || face.classList.contains("alrd_top-area-face-win"));
    }

    //check if lost
    function isGameLost() {
        const face = document.querySelector(".top-area-face");
        if (!face) return false;
        return face.classList.contains("hd_top-area-face-lose");
    }

    //checks if a difficulty is selected
    function detectDifficulty() {
        const active = document.querySelector(".level-select-link.active span");
        if (!active) return null;
        return active.textContent.trim();
    }

    //count tiles
    function getTileCounts() {
        const out = [];
        const cellTypeClassName = getSkin();
        console.log(cellTypeClassName, "cell type class name :3")
        for (let i = 0; i <= 8; i++) {
            out.push(document.getElementsByClassName(cellTypeClassName + i).length);
        }
        return out;
    }

    //get skin
    function getSkin() {
        const skin = document.querySelector("#game");
        //console.log(skin)
        //clasic skin
        if (skin.classList.contains("skin_hd")) {
            return "hd_type";
        }
        //clasic skin dark mode
        else if (skin.classList.contains("skin_hdd")) {
            return "hdd_type";
        }
        //low resolution
        else if (skin.classList.contains("skin_xpd")) {
            return "xpd_type"
        }
        //clasic night shift
        else if (skin.classList.contains("skin_hdn")) {
            return "hdn_type"
        }
    }
    //--csv export--//

    function exportCSV() {
        const rows = [["url","game_difficulty","0_count","1_count","2_count","3_count","4_count","5_count","6_count","7_count","8_count"]];

        for (const url of Object.keys(dataset)) {
            const entry = dataset[url];
            rows.push([
                url,
                entry.type,
                ...entry.counts
            ]);
        }

        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], {type: "text/csv"});

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "games.csv";
        a.click();
    }

    //--gui--//

    //creates gui
    const gui = document.createElement("div");
    gui.style.position = "fixed";
    gui.style.top = "10px";
    gui.style.right = "10px";
    gui.style.width = "333px";
    gui.style.background = "#1C2426";
    gui.style.border = "2px solid black";
    gui.style.padding = "8px";
    gui.style.zIndex = "99999";
    gui.style.fontFamily = "Arial";
    gui.style.fontSize = "14px";
    gui.style.color = "white";

    //initially expanded
    let expanded = true;

    //collapse/show button
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "Collapse";
    toggleButton.style.float = "right";
    toggleButton.onclick = () => {
        expanded = !expanded;
        bodyDiv.style.display = expanded ? "block" : "none";
        toggleButton.textContent = expanded ? "Collapse" : "Show";
    };

    //header
    const header = document.createElement("div");
    header.textContent = "Game Logger";
    header.style.fontWeight = "bold";
    header.style.marginBottom = "6px";
    header.style.backgroundColor = "#171717";
    header.style.padding = "4px";
    header.style.borderRadius = "3px";
    header.style.width = "calc(100% - 75px)";

    //changes color when hover
    header.addEventListener("mouseenter", () => {
        header.style.backgroundColor = "#2a2a2a";
    });
    header.addEventListener("mouseleave", () => {
        header.style.backgroundColor = "#171717";
    });

    const bodyDiv = document.createElement("div");

    //total logged games goes here but its somewhere else. go find it.
    const statsDiv = document.createElement("div");
    statsDiv.style.marginBottom = "6px";

    //current game log state
    const currentDiv = document.createElement("div");
    currentDiv.style.marginBottom = "6px";
    currentDiv.innerHTML = `Current game logged: <span id="loggedIndicator"></span>`;

    //game finished or not
    const finishedDiv = document.createElement("div");
    finishedDiv.style.marginBottom = "6px";
    finishedDiv.innerHTML = `Game finished detected: <span id="finishedIndicator"></span>`;

    //shows the diff
    const difficultyDiv = document.createElement("div");
    difficultyDiv.style.marginBottom = "8px";
    difficultyDiv.innerHTML = `Difficulty: <span id="difficultyText" style="color:white">unknown</span>`;

    //show tile counts
    const tileCountsDiv = document.createElement("div");
    tileCountsDiv.style.marginBottom = "6px";
    tileCountsDiv.innerHTML = `<span id="tileCountsText" style="color:white">-</span>`;
    bodyDiv.appendChild(tileCountsDiv);

    //export csv button
    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export CSV";
    exportBtn.style.marginTop = "4px";
    exportBtn.onclick = exportCSV;

    //clear csv button
    const clearCsvBtn = document.createElement("button");
    clearCsvBtn.textContent = "Clear CSV";
    clearCsvBtn.style.cursor = "pointer";
    clearCsvBtn.style.position = "absolute";
    clearCsvBtn.style.right = "8px";
    clearCsvBtn.style.bottom = "8px";

    bodyDiv.appendChild(clearCsvBtn);

    //confimation panel because i love you
    const confirmPanel = document.createElement("div");
    confirmPanel.style.display = "none";
    confirmPanel.style.marginTop = "10px";
    confirmPanel.style.padding = "10px";
    confirmPanel.style.background = "rgba(0,0,0,0.65)";
    confirmPanel.style.border = "1px solid #555";
    confirmPanel.style.borderRadius = "6px";
    confirmPanel.style.width = "100%";
    confirmPanel.style.boxSizing = "border-box";

    //text
    const confirmText = document.createElement("div");
    confirmText.textContent = "Clear all logged games?";
    confirmText.style.color = "white";
    confirmText.style.marginBottom = "8px";
    confirmPanel.appendChild(confirmText);

    const confirmButtons = document.createElement("div");
    confirmButtons.style.display = "flex";
    confirmButtons.style.gap = "8px";

    //click to cancel
    const cancelClearBtn = document.createElement("button");
    cancelClearBtn.textContent = "Cancel";
    cancelClearBtn.style.padding = "6px 10px";
    cancelClearBtn.style.cursor = "pointer";
    cancelClearBtn.style.color = "white";

    //click to delete all our memories we shared together
    const confirmClearBtn = document.createElement("button");
    confirmClearBtn.textContent = "Delete CSV";
    confirmClearBtn.style.padding = "6px 10px";
    confirmClearBtn.style.cursor = "pointer";
    confirmClearBtn.style.background = "#a00000";
    confirmClearBtn.style.color = "white";

    confirmButtons.appendChild(cancelClearBtn);
    confirmButtons.appendChild(confirmClearBtn);
    confirmPanel.appendChild(confirmButtons);

    gui.appendChild(confirmPanel);

    clearCsvBtn.onclick = () => {
        confirmPanel.style.display = "block";
    };

    cancelClearBtn.onclick = () => {
        confirmPanel.style.display = "none";
    };

    //why u do dis :(
    confirmClearBtn.onclick = () => {
        try {
            saveDataset({});
            dataset = {};

            try { localStorage.removeItem("minesweeper_csv"); } catch(e) {}

            const url = getCurrentURL();
            const currentType = detectGameType();
            if (!gameAlreadyLogged(url) && currentType && !isGameLost() && isGameFinished()) {
                logGame();
            } else {
                updateGUI();
            }
        } catch (err) {//ruh roh
            console.error("Error clearing dataset:", err);
        } finally {
            confirmPanel.style.display = "none";
        }
    };

    //add da shit
    bodyDiv.appendChild(statsDiv);
    bodyDiv.appendChild(currentDiv);
    bodyDiv.appendChild(finishedDiv);
    bodyDiv.appendChild(difficultyDiv);
    bodyDiv.appendChild(tileCountsDiv);
    bodyDiv.appendChild(exportBtn);

    //add more shit
    gui.appendChild(toggleButton);
    gui.appendChild(header);
    gui.appendChild(bodyDiv);
    document.body.appendChild(gui);

    //i love moving things
    (function makeGuiDraggable(gui, handle) {
        let offsetX = 0, offsetY = 0, isDragging = false;

        handle.style.cursor = "move";

        handle.addEventListener("mousedown", e => {
            isDragging = true;
            offsetX = e.clientX - gui.offsetLeft;
            offsetY = e.clientY - gui.offsetTop;
            document.body.style.userSelect = "none";
        });

        document.addEventListener("mousemove", e => {
            if (!isDragging) return;
            gui.style.left = (e.clientX - offsetX) + "px";
            gui.style.top = (e.clientY - offsetY) + "px";
            gui.style.right = "auto";
            gui.style.bottom = "auto";
        });

        document.addEventListener("mouseup", () => {
            if (!isDragging) return;
            isDragging = false;
            document.body.style.userSelect = "";
        });
    })(gui, header);

    //true/false colors
    function setIndicatorColor(element, value) {
        if (value) {
            element.style.color = "#1065AB";
            element.textContent = "true";
        } else {
            element.style.color = "#B31529";
            element.textContent = "false";
        }
    }

    //updoot
    function updateGUI() {
        const url = getCurrentURL();
        const logged = gameAlreadyLogged(url);
        const finished = isGameFinished();
        const lost = isGameLost();
        const difficulty = detectDifficulty();

        statsDiv.style.color = "white";
        statsDiv.textContent = "Total logged games: " + Object.keys(dataset).length;

        const logIndicator = document.getElementById("loggedIndicator");
        setIndicatorColor(logIndicator, logged);

        const finishIndicator = document.getElementById("finishedIndicator");
        setIndicatorColor(finishIndicator, finished);

        const diffText = document.getElementById("difficultyText");
        diffText.textContent = difficulty || "unknown";

        const tileCountsText = document.getElementById("tileCountsText");
        if (logged) {
            const counts = dataset[url].counts;
            let text = "";
            for (let i = 0; i <= 7; i++) {
                text += `${i}:${counts[i]}, `;
            }
            text += `${8}:${counts[8]} `;
            tileCountsText.textContent = text.trim();
        } else {
            tileCountsText.textContent = "-";
        }

        if (!finished && !lost) {
            setIndicatorColor(logIndicator, false);
            setIndicatorColor(finishIndicator, false);
            tileCountsText.textContent = "-";
        }
    }

    //--auto game logging + refresh--//

    //try automatically logging
    function tryAutoLog() {
        const url = getCurrentURL();
        if (gameAlreadyLogged(url)) return;
        if (isGameLost()) return;
        if (!isGameFinished()) return;
        const face = document.querySelector(".top-area-face");
        const activeDifficulty = document.querySelector(".level-select-link.active span");
        if (!face || !activeDifficulty) return;
        logGame();
    }
    const pollInterval = 200;
    const autoPoller = setInterval(() => {
        updateGUI();
        tryAutoLog();
    }, pollInterval);
})();
