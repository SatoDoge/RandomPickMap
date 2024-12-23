async function mainSearch() {
    const neOption = document.getElementById("neOption").value;
    const meOption = document.getElementById("meOption").value;
    const chromaOption = document.getElementById("chromaOption").value;
    const amOption = document.getElementById("amOption").value;

    const minBsr = document.getElementById("minBsr")?.value || "1";
    const maxBsr = document.getElementById("maxBsr")?.value || "10";
    const minDuration = document.getElementById("minDuration")?.value || "0";
    const maxDuration = document.getElementById("maxDuration")?.value || "2362";
    const minNPS = document.getElementById("minNPS")?.value || "0.0";
    const maxNPS = document.getElementById("maxNPS")?.value || "100000.0";
    const minBPM = document.getElementById("minBPM")?.value || "0";
    const maxBPM = document.getElementById("maxBPM")?.value || "100000";
    const now = new Date();
    let toDate = now.toISOString();
    let fromDate = "2018-05-08T14:28:56Z";

    if (minBsr !== "") {
        fromDate = await changeBsrToDate(minBsr);
    }
    if (maxBsr !== "") {
        toDate = await changeBsrToDate(maxBsr);
    }
    // クエリ文字列の生成（既存のパラメータも含む）
    const queryString =
        `to=${encodeURIComponent(toDate)}` +
        `&from=${encodeURIComponent(fromDate)}` +
        `${(neOption == 3) ? "" : (neOption == 1) ? "&noodle=true" : "&noodle=false"}` +
        `&leaderboard=All` +
        `${(meOption == 3) ? "" : (meOption == 1) ? "&me=true" : "&me=false"}` +
        `${(chromaOption == 3) ? "" : (chromaOption == 1) ? "&chroma=true" : "&chroma=false"}` +
        `&sortOrder=Latest` +
        `${(amOption == 3) ? "" : (amOption == 1) ? "&automapper=true" : "&automapper=false"}` +
        `&minDuration=${encodeURIComponent(minDuration)}` +
        `&maxDuration=${encodeURIComponent(maxDuration)}` +
        `&minNPS=${encodeURIComponent(minNPS)}` +
        `&maxNPS=${encodeURIComponent(maxNPS)}` +
        `&minBPM=${encodeURIComponent(minBPM)}` +
        `&maxBPM=${encodeURIComponent(maxBPM)}`;

    const searchRequestUrl = `https://api.beatsaver.com/search/text/0?${queryString}`;
    const searchJson = await fetchJson(searchRequestUrl)
    console.log(searchRequestUrl)
    const randomizedNumber = getRandomNumber(0, searchJson.info.total - 1)
    console.log("randomized num:", randomizedNumber)
    console.log(`page:${Math.floor(randomizedNumber / 20)}\nindex:${randomizedNumber % 20}`)
    const randomizedJsonData = await fetchJson(`https://api.beatsaver.com/search/text/${Math.floor(randomizedNumber / 20)}?${queryString}`)
    console.log(randomizedJsonData)
    const randomizedMapData = randomizedJsonData.docs[randomizedNumber % 20]
    console.log(randomizedMapData)
    document.getElementById("beatsaverEmbed").src = `https://beatsaver.com/maps/${randomizedMapData.id}/embed`
}

function hexAdd(hex1, hex2) {
    const result = parseInt(hex1, 16) + parseInt(hex2, 16);
    return result.toString(16);
}

function hexSubtract(hex1, hex2) {
    const result = parseInt(hex1, 16) - parseInt(hex2, 16);
    return result.toString(16);
}

async function fetchJson(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`HTTPステータスエラー: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("データ取得中に予期しないエラーが発生しました:", error);
        return null;
    }
}

async function changeBsrToDate(bsrCode) {
    let nowBsrCode = bsrCode;

    while (true) {
        const jsonData = await fetchJson(`https://api.beatsaver.com/maps/id/${nowBsrCode}`);
        if (jsonData) {
            console.log("Fined:", jsonData.id)
            console.log("Date:", jsonData.uploaded)
            return jsonData.uploaded;
        } else {
            console.log("NotExist:", nowBsrCode)
            nowBsrCode = hexSubtract(nowBsrCode, 1);
        }
    }
}
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.onload = function () {
    document.getElementById("searchBtn").addEventListener("click", async function () {
        await mainSearch();
    });
};
