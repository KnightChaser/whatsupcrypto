// 기본 중의 기본 함수 : 마켓 코드 가져오기
function getFullMarketCode() {


    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    };

    const response = fetch('https://api.upbit.com/v1/market/all?isDetails=false', options);
    return response.then(res => res.json());

}

// KRW Market 코드만 필터링하기. 기본 마켓 코드 데이터가 필요함.
function filterKRWMarketCode(response) {

    let KRWMarketKoreanName = {};

    for (var _sequence in response) {
        if (response[_sequence]["market"].includes("KRW-")) {
            KRWMarketKoreanName[response[_sequence]["market"]] = response[_sequence]["korean_name"];
        }
    }

    return KRWMarketKoreanName;

}

// KRW Market 코드 데이터 조회를 위한 URL 생성하기. KRW Market 코드가 필요함.
function generateAPIQueryURL(KRWMarketData) {

    let APIQueryURL = "https://api.upbit.com/v1/ticker?markets=";

    // KRW 마켓을 지원하는 암호화폐만 가져오기
    for (var marketCode in KRWMarketData) {
        APIQueryURL = APIQueryURL + marketCode + ",";
    }

    // 생성된 APIQueryURL의 마지막의 불필요한 쉼표 제거하기.
    APIQueryURL = APIQueryURL.replace(/,$/, '');

    return APIQueryURL;

}

// UPBIT API에 정보 물어보기. API Query URL이 필요함.
function getCryptocurrencyTickerInfo(APIQueryURL) {

    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    };

    const response = fetch(APIQueryURL, options);
    return response.then(res => res.json());

}


// 이 웹 어플리케이션에서 기본으로 사용할 Ticker 정보를 Dictionary 형태로 재구성해 최종 가공한다.
// 한글 이름을 위한 KRW 마켓 코드 리스트와 API로부터 온 raw crypto data가 필요하다.
function processCryptocurrencyTickerInfo(rawCryptoInfo, KRWMarketCodeList) {


    var cryptoTickerInfo = new Object;

    for (var _sequence in rawCryptoInfo) {
        // console.log(data[_sequence]);
        cryptoTickerInfo[rawCryptoInfo[_sequence]["market"]] = {
            "symbol": rawCryptoInfo[_sequence]["market"].replace("KRW-", ""),
            "krw_name": KRWMarketCodeList[rawCryptoInfo[_sequence]["market"]],
            "trade_price": rawCryptoInfo[_sequence]["trade_price"],
            "signed_change_price": rawCryptoInfo[_sequence]["signed_change_price"],
            "signed_change_rate": rawCryptoInfo[_sequence]["signed_change_rate"],
            "high_price": rawCryptoInfo[_sequence]["high_price"],
            "low_price": rawCryptoInfo[_sequence]["low_price"],
            "acc_trade_price_24h": rawCryptoInfo[_sequence]["acc_trade_price_24h"],
            "acc_trade_volume_24h": rawCryptoInfo[_sequence]["acc_trade_volume_24h"]
        };
    }

    return cryptoTickerInfo;

}

async function getOrderbookInformation(marketCode) {

    let APIQueryURL = "https://api.upbit.com/v1/orderbook?markets=" + marketCode;

    const options = {
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    };

    const response = fetch(APIQueryURL, options);
    return response.then(res => res.json());

}

// 화면에 주로 표시할 몇몇 메이저 코인에 대해서는 시가총액, supply 등의 추가 디테일 정보가 필요하다.
// 이를 coinpaprika API로 가져온다!
async function getDetailedInformationForMajors(marketCode) {

    // UPBIT 코드를 파프리카API 코드로~~ 젠장! ^^
    let queryCodeTraslation = {
        "KRW-BTC": "btc-bitcoin",
        "KRW-ETH": "eth-ethereum",
        "KRW-XRP": "xrp-xrp",
        "KRW-ADA": "ada-cardano",
        "KRW-LINK": "link-chainlink",
        "KRW-TRX": "trx-tron",
        "KRW-EOS": "eos-eos",
        "KRW-XLM": "xlm-stellar",
        "KRW-BCH": "bch-bitcoin-cash",
        "KRW-LTC": "ltc-litecoin",
        "KRW-ATOM": "atom-cosmos",
        "KRW-SOL": "sol-solana",
        "KRW-DOGE": "doge-dogecoin",
        "KRW-BTT": "btt-bittorrent",
        "KRW-XEC": "xec-ecash",
        "KRW-NEAR": "near-near-protocol",
        "KRW-ELF": "elf-aelf",
        "KRW-DOT": "dot-polkadot",
        "KRW-MATIC": "matic-polygon",
        "KRW-BORA": "bora-bora",
        "KRW-SAND": "sand-the-sandbox",
        "KRW-PLA": "pla-playdapp",
        "KRW-VET": "vet-vechain",
        "KRW-KNC": "knc-kyber-network",
        "KRW-ZRX": "zrx-0x",
        "KRW-IOTA": "miota-iota",
        "KRW-ETC": "etc-ethereum-classic",
        "KRW-AXS": "axs-axie-infinity",
        "KRW-ONG": "ong-ong",
        "KRW-BAT": "bat-basic-attention-token",
        "KRW-ALGO": "algo-algorand",
        "KRW-THETA": "theta-theta-token",
        "KRW-QUTM": "qtum-qtum",
        "KRW-BTG": "btg-bitcoin-gold",
        "KRW-BSV": "bsv-bitcoin-sv",
        "KRW-XEM": "xem-nem",
        "KRW-1INCH": "1inch-1inch",
        "KRW-STEEM": "steem-steem",
        "KRW-WAVES": "waves-waves",
        "KRW-WEMIX": "wemix-wemix-token",
        "KRW-POWR": "powr-power-ledger",
        "KRW-MANA": "mana-decentraland"
    }

    let APIQueryURL = "https://api.coinpaprika.com/v1/tickers/" + queryCodeTraslation[marketCode] + "?quotes=KRW";

    let response = await fetch(APIQueryURL)
        .then(res => res.json())
        .then(res => {
            return res;
        });

    return response;

}


function generateMarqueeText(cryptoTickerInfo) {

    var marquee_message = '';

    for (var _sequence in cryptoTickerInfo) {
        marquee_message += "<strong>" + cryptoTickerInfo[_sequence]["krw_name"] + "</strong>" +
            "<span style='color:gray'>" + cryptoTickerInfo[_sequence]["symbol"] + "</span>" + " : " +
            cryptoTickerInfo[_sequence]["trade_price"].toLocaleString('ko-KR') + " KRW ";

        if (cryptoTickerInfo[_sequence]["signed_change_rate"] > 0) {
            // prices goes up
            marquee_message += "( " + "<span style='color:MediumSeaGreen'>" + (cryptoTickerInfo[_sequence]["signed_change_rate"] * 100).toFixed(2) + "% ▲ " + "</span>)";
        } else if (cryptoTickerInfo[_sequence]["signed_change_rate"] === 0) {
            // prices doesn't goes (doesn't changes)
            marquee_message += "(" + cryptoTickerInfo[_sequence]["signed_change_rate"] + "% - )";
        } else {
            // prices goes down
            marquee_message += "( " + "<span style='color:MediumBlue'>" + (cryptoTickerInfo[_sequence]["signed_change_rate"] * 100).toFixed(2) + "% ▼ " + "</span>)";
        }

        marquee_message += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    }


    return marquee_message;

}

function setMarquee(textSource) {
    document.querySelector("#crypto-marquee").innerHTML = textSource;
    return textSource;
}

function orderCryptoByTradingPrice(cryptoTickerInfo) {

    let sortable = [];
    for (let data in cryptoTickerInfo) {
        // JS는 왜 이모양인지 모르겠는데, 딕셔너리 value 정렬이 안된다. 쩝...
        // 암호화폐 종류와 거래량(KRW) 정보가 따로 때서 리스트 형태로 넣고 그걸 정렬한다. 어차피 순서대로 정렬된 종목 코드 정도만 있어도 된다.
        sortable.push([data, cryptoTickerInfo[data]["acc_trade_price_24h"]]);
    }

    // 오름차순
    sortable.sort(function (a, b) {
        return b[1] - a[1];
    });

    // 내림차순
    // sortable.sort(function(a, b){
    //     return a[1] - b[1];
    // });

    return sortable;

}

let previousCRYPTOKRWPrice = {};

function updateCryptoInfoContainer(userSelectedMarketCode, cryptoTickerInfo, cryptoExtraInfo, cryptoOrderbookInfo, cryptoRankInfo) {

    // ----------------------------- GENERAL INFO from upbit ----------------------------------------

    let CRYPTOKRWPrice = cryptoTickerInfo[userSelectedMarketCode]["trade_price"];
    // let CRYPTOKRWChangePrice = cryptoTickerInfo[userSelectedMarketCode]["signed_change_price"];
    let CRYPTOKRWChangeRate = cryptoTickerInfo[userSelectedMarketCode]["signed_change_rate"];
    let KRWBTCPrice = cryptoTickerInfo["KRW-BTC"]["trade_price"];
    let KRWETHPrice = cryptoTickerInfo["KRW-ETH"]["trade_price"];
    let KRWXRPPrice = cryptoTickerInfo["KRW-XRP"]["trade_price"];


    let CRYPTOasBTC = CRYPTOKRWPrice / KRWBTCPrice;
    let CRYPTOasETH = CRYPTOKRWPrice / KRWETHPrice;
    let CRYPTOasXRP = CRYPTOKRWPrice / KRWXRPPrice;

    let CRYPTOLogoImage = new Image();
    CRYPTOLogoImage.src = "./images/logo-svg-icons/" + userSelectedMarketCode.replace("KRW-", "") + ".svg";

    // 늘 svg 형태의 이미지만 있는 건 아니다.
    // 이미지가 없으면 해당 이미지의 width attribute가 0임을 이용한다.
    // https://gist.github.com/pabloleonalcaide/1e8ece835ea689894dd37a44f0ce7134
    if (CRYPTOLogoImage.width === 0) {
        document.querySelector("#crypto-logo").src = "./images/logo-png-icons-alternate/" + userSelectedMarketCode.replace("KRW-", "") + ".png";
    } else {
        document.querySelector("#crypto-logo").src = "./images/logo-svg-icons/" + userSelectedMarketCode.replace("KRW-", "") + ".svg";
    }


    document.querySelector("#crypto-name-korean").innerHTML = cryptoTickerInfo[userSelectedMarketCode]["krw_name"];
    document.querySelector("#crypto-name-symbol").innerHTML = cryptoTickerInfo[userSelectedMarketCode]["symbol"];

    // let KRWPriceMessage = CRYPTOKRWPrice.toLocaleString('ko-KR', { minimumFractionDigits: 4 }) + "<span style='font-size:22px;'>" + " KRW" + "</span>";
    let KRWPriceMessage = addComma(CRYPTOKRWPrice) + '<span style="font-size:22px;">' + " KRW" + "</span>";

    // 가격이 상승/하락함에 따라 색깔이 들어간 깜빡임 효과를 넣기 위해 이전 값을 가져온다.
    previousCRYPTOKRWPrice[userSelectedMarketCode] = deleteCommandAndReturnFloat(document.querySelector("#crypto-price-krw").innerHTML.replace('<span style="font-size:22px;"> KRW</span>', ''));

    document.querySelector("#crypto-price-krw").innerHTML = KRWPriceMessage;

    // animateValue("crypto-price-krw", previousCRYPTOKRWPrice, CRYPTOKRWPrice, 250);

    // console.log(CRYPTOKRWPrice + " " + previousCRYPTOKRWPrice)

    if (CRYPTOKRWPrice > previousCRYPTOKRWPrice[userSelectedMarketCode]) {
        CSSanimationTriggerByID(".crypto-price-krw", "UP", "START");
        setTimeout(function () {
            CSSanimationTriggerByID(".crypto-price-krw", "UP", "END");
        }, 1000);
    } else if (CRYPTOKRWPrice < previousCRYPTOKRWPrice[userSelectedMarketCode]) {
        CSSanimationTriggerByID(".crypto-price-krw", "DOWN", "START");
        setTimeout(function () {
            CSSanimationTriggerByID(".crypto-price-krw", "DOWN", "END");
        }, 1000);
    }

    let cryptoChangeMessage = "";
    if (CRYPTOKRWChangeRate > 0)
        cryptoChangeMessage += "<span style='color: white; background-color: #16c784; padding: 8px; border-radius: 10px;'>" +
        (CRYPTOKRWChangeRate * 100).toFixed(2).toLocaleString('ko-KR') + "% ▲ " + "</span>";
    else if (CRYPTOKRWChangeRate < 0)
        cryptoChangeMessage += "<span style='color: white; background-color: #ea3943; padding: 8px; border-radius: 10px;'>" +
        (CRYPTOKRWChangeRate * 100 * -1).toFixed(2).toLocaleString('ko-KR') + "% ▼ " + "</span>";
    else
        cryptoChangeMessage += "<span style='color: white; background-color: black; padding: 8px; border-radius: 10px;'>" +
        (CRYPTOKRWChangeRate * 100 * -1).toFixed(2).toLocaleString('ko-KR') + "%" + "</span>";

    document.querySelector("#crypto-price-change").innerHTML = cryptoChangeMessage;

    let CryptoPriceMessage = CRYPTOasBTC.toFixed(8) + " BTC" + "&nbsp;&nbsp;&nbsp;&nbsp&nbsp;&nbsp;" +
        CRYPTOasETH.toFixed(6).toLocaleString('ko-KR') + " ETH" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
        parseFloat(CRYPTOasXRP.toFixed(4)).toLocaleString('ko-KR') + " XRP";

    document.querySelector("#crypto-price-crypto").innerHTML = CryptoPriceMessage;

    let CRYPTOHighPrice = cryptoTickerInfo[userSelectedMarketCode]["high_price"];
    let CRYPTOLowPrice = cryptoTickerInfo[userSelectedMarketCode]["low_price"];
    document.querySelector("#crypto-price-high-24hr").innerHTML = addComma(CRYPTOHighPrice);
    document.querySelector("#crypto-price-low-24hr").innerHTML = addComma(CRYPTOLowPrice);

    // 저가 ~ 고가를 시각적으로 보여주는 bar의 길이를 유동적으로 조정한다.
    let HighpriceLowpriceBarWidth = ((CRYPTOKRWPrice - CRYPTOLowPrice) * 100 / (CRYPTOHighPrice - CRYPTOLowPrice)) + "%"; // 퍼센트 기호 붙여주기.
    let HighpriceLowpriceIndicatorWidth = ((CRYPTOKRWPrice - CRYPTOLowPrice) * 100 / (CRYPTOHighPrice - CRYPTOLowPrice)) * 2 + "%"; // indicator는 측정해보니 좌표가 2배 길다.
    document.querySelector("#low-high-visualbar-sub").style.width = HighpriceLowpriceBarWidth;
    document.querySelector("#low-high-visualbar-sub-indicator").style.width = HighpriceLowpriceIndicatorWidth;


    document.querySelector("#crypto-trade-volume-24h").innerHTML = cryptoTickerInfo[userSelectedMarketCode]["acc_trade_volume_24h"].toLocaleString('ko-kR') +
        "<span style='color:gray'>" + " " + userSelectedMarketCode.replace("KRW-", "") + "/24hr" + "</span>" + "<br>" +
        parseFloat((cryptoExtraInfo["quotes"]["KRW"]["volume_24h"] / cryptoExtraInfo["quotes"]["KRW"]["price"]).toFixed(3)).toLocaleString('ko-kR') +
        "<span style='color:gray'>" + " " + userSelectedMarketCode.replace("KRW-", "") + "/24hr" + "</span>";

    document.querySelector("#crypto-trade-price-24h").innerHTML = parseInt(Math.floor(cryptoTickerInfo[userSelectedMarketCode]["acc_trade_price_24h"])).toLocaleString('ko-kR') +
        "<span style='color:gray'>" + " KRW/24hr" + "</span>" + "<br>" + Math.round(cryptoExtraInfo["quotes"]["KRW"]["volume_24h"]).toLocaleString('ko-kR') +
        "<span style='color:gray'>" + " KRW/24hr" + "</span>";;


    // ------------------------- EXTRA INFO from coinpaprika ------------------------------


    document.querySelector("#crypto-market-cap-ranking").innerHTML = cryptoExtraInfo["rank"] + "<span style='color:gray'>" + " 위" + "</span>";
    if (cryptoExtraInfo["quotes"]["KRW"]["market_cap"] === 0 || cryptoExtraInfo["quotes"]["KRW"]["market_cap"] === null)
        document.querySelector("#crypto-market-cap").innerHTML = "<span style='color:gray'>" + "미제공(정보 없음)" + "</span>";
    else
        document.querySelector("#crypto-market-cap").innerHTML = parseInt(cryptoExtraInfo["quotes"]["KRW"]["market_cap"]).toLocaleString('ko-KR') +
        "<span style='color:gray'>" + " KRW" + "</span>";

    // 암호화폐 중에는 발행량에 제한이 없는 등의 예외적인 경우도 있다.
    if (cryptoExtraInfo["total_supply"] === null)
        document.querySelector("#crypto-current-supply").innerHTML = "<span style='color:gray'>" + "해당없음" + "</span>";
    else
        document.querySelector("#crypto-current-supply").innerHTML = cryptoExtraInfo["circulating_supply"].toLocaleString('ko-KR') +
        "<span style='color:gray'>" + " " + userSelectedMarketCode.replace("KRW-", "") + "</span>";

    if (cryptoExtraInfo["max_supply"] === null || cryptoExtraInfo["max_supply"] === 0)
        document.querySelector("#crypto-max-supply").innerHTML = "<span style='color:gray'>" + "∞" + "<span style='color:gray'>" + " " + userSelectedMarketCode.replace("KRW-", "") + "</span>";
    else
        document.querySelector("#crypto-max-supply").innerHTML = cryptoExtraInfo["max_supply"].toLocaleString('ko-KR') +
        "<span style='color:gray'>" + " " + userSelectedMarketCode.replace("KRW-", "") + "</span>";


    // ---------------------------- GENERAL INFO, ORDERBOOK from upbit -----------------------------------

    // 매수세
    let totalBidVolume = parseFloat(cryptoOrderbookInfo[0]["total_bid_size"].toFixed(3));
    let totalBidPrice = Math.round(totalBidVolume * CRYPTOKRWPrice);
    document.querySelector("#crypto-bid").innerHTML = totalBidVolume.toLocaleString("ko-KR") + " " + userSelectedMarketCode.replace("KRW-", "") + "<br>" + "~ " + totalBidPrice.toLocaleString('ko-KR') + " KRW";

    // 매도세
    let totalAskVolume = parseFloat(cryptoOrderbookInfo[0]["total_ask_size"].toFixed(3));
    let totalAskPrice = Math.round(totalAskVolume * CRYPTOKRWPrice);
    document.querySelector("#crypto-ask").innerHTML = totalAskVolume.toLocaleString("ko-KR") + " " + userSelectedMarketCode.replace("KRW-", "") + "<br>" + "~ " + totalAskPrice.toLocaleString('ko-KR') + " KRW";

    // 매수세 vs 매도세 바 
    let BidAskBarWidth = (cryptoOrderbookInfo[0]["total_bid_size"] * 100 / (cryptoOrderbookInfo[0]["total_bid_size"] + cryptoOrderbookInfo[0]["total_ask_size"])) + "%";
    document.querySelector("#bid-ask-visualbar-sub").style.width = BidAskBarWidth;

    // ---------------------------- GENERAL INFO, Crypto list ordered by 24hr trading volume from upbit -----------------------

    //            SYMBOL                             KRW NAME                                RANK INFO(price)
    // console.log(cryptoRankInfo[0][0], cryptoTickerInfo[cryptoRankInfo[0][0]]["krw_name"], );

    // 표에다가 1등, 2등, 3등... 순서대로 넣는거니까 반복적으로 적용한다.
    for (let rank = 0; rank < 10; rank++) {
        let cryptoRankSymbol = cryptoRankInfo[rank][0];
        let cryptoRankKRWName = cryptoTickerInfo[cryptoRankSymbol]["krw_name"];
        let cryptoRankTradePrice = cryptoRankInfo[rank][1];

        let targetQueryselectorName = {
            // 원래 딕셔너리는 index가 0부터 시작하는데, 보여줄때는 1등부터 보여줘야 하니까...
            "rank": "#crypto-ranking-rank-column-" + (rank + 1),
            "name": "#crypto-ranking-" + (rank + 1) + "-name",
            "tradeprice": "#crypto-ranking-" + (rank + 1) + "-tradeprice"
        };

        // 거래량 정보. 그냥 값이 갱신되면 배경화면이 깜빡거리게 하자.
        previousTradePriceMessage = document.querySelector(targetQueryselectorName["tradeprice"]).innerHTML;

        document.querySelector(targetQueryselectorName["name"]).innerHTML = cryptoRankKRWName + "<br>" +
            "<span style='color:gray'>" + cryptoRankSymbol.replace("KRW-", "") + "</span>";

        document.querySelector(targetQueryselectorName["tradeprice"]).innerHTML = Math.round(cryptoRankTradePrice).toLocaleString('ko-KR') +
            "<span style='color:gray'>" + " KRW" + "</span>" + "<br>" + "<span style='font-size: 13px'>" +
            cryptoTickerInfo[cryptoRankSymbol]["acc_trade_volume_24h"].toLocaleString('ko-KR') + " " +
            "<span style='color:gray'>" + cryptoRankSymbol.replace("KRW-", "") + "</span>" + "</span>";

        if (previousTradePriceMessage != document.querySelector(targetQueryselectorName["tradeprice"]).innerHTML) {
            CSSanimationTriggerByID(targetQueryselectorName["rank"], "CHANGE", "START");
            CSSanimationTriggerByID(targetQueryselectorName["name"], "CHANGE", "START");
            CSSanimationTriggerByID(targetQueryselectorName["tradeprice"], "CHANGE", "START");
            setTimeout(function () {
                CSSanimationTriggerByID(targetQueryselectorName["rank"], "CHANGE", "END");
                CSSanimationTriggerByID(targetQueryselectorName["name"], "CHANGE", "END");
                CSSanimationTriggerByID(targetQueryselectorName["tradeprice"], "CHANGE", "END");
            }, 250);
        }

    }

    // ------------------------------ GENERAL INFO, Upbit 24hr krw market total tradeprice ------------------------------------
    let totalUPBIT24hrTradeVolume = 0;
    for (_sequence in cryptoTickerInfo) {
        totalUPBIT24hrTradeVolume += Math.round(cryptoTickerInfo[_sequence]["acc_trade_price_24h"]);
    }

    let previoustotalUPBIT24hrTradeVolume = deleteCommandAndReturnFloat(document.querySelector("#upbit-24hr-krw-market-total-tradeprice").innerHTML.replace('<span style="color:gray"> KRW/24hr</span>', ''));


    document.querySelector("#upbit-24hr-krw-market-total-tradeprice").innerHTML = totalUPBIT24hrTradeVolume.toLocaleString('ko-KR') +
        "<span style='color:gray'>" + " KRW/24hr" + "</span>";

    if (totalUPBIT24hrTradeVolume > previoustotalUPBIT24hrTradeVolume) {
        CSSanimationTriggerByID("#upbit-24hr-krw-market-total-tradeprice", "UP", "START");
        setTimeout(function () {
            CSSanimationTriggerByID("#upbit-24hr-krw-market-total-tradeprice", "UP", "END");
        }, 250);
    } else if (totalUPBIT24hrTradeVolume < previoustotalUPBIT24hrTradeVolume) {
        CSSanimationTriggerByID("#upbit-24hr-krw-market-total-tradeprice", "DOWN", "START");
        setTimeout(function () {
            CSSanimationTriggerByID("#upbit-24hr-krw-market-total-tradeprice", "DOWN", "END");
        }, 250);
    }

}

function CSSanimationTriggerByID(targetID, animationType, action) {

    // 사용하는 CSS keyframe 애니메이션 종류는 3가지
    let animationTable = {
        "UP": "trigger-animation-valueChanges-GO-UP", // 값 상승. green-color-blink
        "DOWN": "trigger-animation-valueChanges-GO-DOWN", // 값 하락. red-color-blink
        "CHANGE": "trigger-animation-valueChaneges-for-tradepriceview" // 값 변동. (상승/하락 무관). slight-gray-background-color-blink
    };

    switch (action) {
        case "START":
            document.querySelector(targetID).classList.add(animationTable[animationType]);
            break;
        case "END":
            document.querySelector(targetID).classList.remove(animationTable[animationType]);
            break;
        default:
            console.log("You've entered wrong parameter in command, CSSanimationTriggerByID()!!!");
    }

}

function changeCryptoInfoContainer() {

    let selection = document.querySelector("#crypto-panel-type");

    if (selection === null)
        result = "KRW-BTC";
    else
        result = selection.value;

    return result;

}

// === EXTERNAL ===
function animateValue(id, start, end, duration) {
    // assumes integer values for start and end

    var obj = document.getElementById(id);
    var range = end - start;
    // no timer shorter than 50ms (not really visible any way)
    var minTimer = 50;
    // calc step time to show all interediate values
    var stepTime = Math.abs(Math.floor(duration / range));

    // never go below minTimer
    stepTime = Math.max(stepTime, minTimer);

    // get current time and calculate desired end time
    var startTime = new Date().getTime();
    var endTime = startTime + duration;
    var timer;

    function run() {
        var now = new Date().getTime();
        var remaining = Math.max((endTime - now) / duration, 0);
        var value = Math.round(end - (remaining * range));
        obj.innerHTML = value;
        if (value == end) {
            clearInterval(timer);
        }
    }

    timer = setInterval(run, stepTime);
    run();
}



// 선택지에 따라 트레이딩뷰 그래프를 바꾼다.
// 이건 1초에 몇 번씩 요청을 보내는 무식한 방법으로 요청하는데 한계가 있기 때문에
// 선택 요청이 들어오면 그때에만 차트를 바꾸도록 한다.
function changeTradingViewChart(selection) {

    let chartTypeSymbol = "UPBIT:" + selection.value.replace("KRW-", "") + "KRW";

    new TradingView.widget({
        "width": 650,
        "height": 500,
        "symbol": chartTypeSymbol,
        "interval": "15",
        "timezone": "Asia/Seoul",
        "theme": "light",
        "style": "1",
        "locale": "kr",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "container_id": "tradingview-graph"
    });

}

function showCurrentTime() {

    let today = new Date();

    let hours = today.getHours().toString().padStart(2, '0');
    let minutes = today.getMinutes().toString().padStart(2, '0');
    let seconds = today.getSeconds().toString().padStart(2, '0');
    let timeMessage = hours + ':' + minutes + ':' + seconds + " KST";

    document.querySelector("#live-timer-clock").innerHTML = timeMessage;

}

async function getInfo() {

    showCurrentTime();

    let fullMarketCode = await getFullMarketCode();

    let KRWMarketCodeList = await filterKRWMarketCode(fullMarketCode);

    let APIQueryURL = await generateAPIQueryURL(KRWMarketCodeList);

    let rawCryptoInfo = await getCryptocurrencyTickerInfo(APIQueryURL);
    // console.log(rawCryptoInfo);

    let cryptoTickerInfo = await processCryptocurrencyTickerInfo(rawCryptoInfo, KRWMarketCodeList);
    // console.log(cryptoTickerInfo);

    let marqueeText = await generateMarqueeText(cryptoTickerInfo);

    setMarquee(marqueeText);

    let cryptoRankInfo = await orderCryptoByTradingPrice(cryptoTickerInfo);

    let userSelectedMarketCode = changeCryptoInfoContainer();

    let cryptoExtraInfo = await getDetailedInformationForMajors(userSelectedMarketCode);

    let cryptoOrderbookInfo = await getOrderbookInformation(userSelectedMarketCode);

    updateCryptoInfoContainer(userSelectedMarketCode, cryptoTickerInfo, cryptoExtraInfo, cryptoOrderbookInfo, cryptoRankInfo);


}

// toLocalString은 소수점 셋째자리에서 무조건 반올림한다. 짜증나게... 그래서 필요한 경우 아래 함수를 쓰도록 한다.
// (자릿수를 고정할수도 있는데 그러면 1,220.0000 처럼 불필요한 0이 붙는 경우가 많아 골치아프다.)
function addComma(number) {
    return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// 콤마 숫자 다 떼고 숫자형으로 변환시키기
function deleteCommandAndReturnFloat(stringFormattedNumber) {
    return parseFloat(stringFormattedNumber.replace(/,/g, ""));
}

window.onload = function () {
    let welcomeMessage = ' lumes의 암호화폐 현황판에 오신 것을 환영합니다! \n혹시 사이트의 레이아웃이 너무 떨어지는 것과 같이 이상하게 보인다면 사이트의 확대 배율([Ctrl] + [마우스 스크롤])을 조정하셔서 여러분들의 화면 크기에 맞추어 보기 좋게 변경하신 다음 이용해주세요. 감사합니다.\n■PC/노트북과 같은 기기로 보시는 것을 권장합니다.■';
    alert(welcomeMessage)
    setInterval(() => {
        getInfo();
    }, 350);

    // for select bar
    $(document).ready(function () {
        //change selectboxes to selectize mode to be searchable
        $("select").select2();
    });
}