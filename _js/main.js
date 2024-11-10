let url = './kohon_from_Lib.xml';

// 設定載入 xml 資料用的變數
let bookList;
let bookNameList;
let authorList;
let publishYearList;
let urlList;

let promise = new Promise(function (achieve, wrong) {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
        // 確認有取得 xml 檔案
        if (this.responseText != '') {
            achieve(this.responseText);

        }
        else {
            wrong('error');
        }
    });
    xhr.open('GET', url);
    xhr.send();
})

promise.then(
    function (success) {
        // 載入資料到畫面上
        let parse = new DOMParser();
        let XMLDoc = parse.parseFromString(success, "text/xml");

        bookList = XMLDoc.getElementsByTagName('book');
        XMLDoc = missingData(XMLDoc, 'auc');
        XMLDoc = missingData(XMLDoc, 'pubdate');
        XMLDoc = missingData(XMLDoc, 'uri');

        bookNameList = XMLDoc.getElementsByTagName('tic');
        authorList = XMLDoc.getElementsByTagName('auc');
        publishYearList = XMLDoc.getElementsByTagName('pubdate');
        urlList = XMLDoc.getElementsByTagName('uri');

        setData();

    }, function (fail) {
        alert(fail);
    }
)

// 先取得所有的 div .col-3，只顯示前 20 筆
promise.then(function () {
    let dataItems = document.querySelectorAll('.col-3');

    for (let i = 0; i <= dataItems.length; i++) {
        if (i >= 20) {
            (dataItems[i]) ? dataItems[i].style.display = 'none' : "";
        }
    }

    scrollEvent();
})

// 搜尋功能
promise.then(function () {

    $('#searchBtn').on('click', function () {
        // 取得 input 的 value
        let value = $('#search_bar').val();   

        $('.col-3').filter(function () {
            // 判斷 .col-3 中的文字有沒有包含 value，有會回傳 0
            let temp = $(this).text().indexOf(value) == 0;

            if (temp) {
                // 轉換成陣列，資料是 標籤 + 內容
                var arr = Array.from($(this));

                // 顯示到畫面
                arr.forEach( e => {
                    // 把原本的資料隱藏顯示
                    $('#divResult').empty();

                    // 把篩選結果顯示到畫面上
                    $(e).css('display', 'block');
                    $('#test').append(e);
                } );
            }

        })
    })

    // 當 input 的 value 是空字串時，重新載入頁面
    $('#search_bar').on('keyup', function(){
        if( $(this).val() == "") {
            window.location.reload();
        }
    })
});


// 對漏缺的資料預處理
let missingData = function (xmlString, col) {
    let books = xmlString.getElementsByTagName('book');

    for (i = 0; i < books.length; i++) {
        // 1. 儲存第 i 筆書的所有資料 
        let book = books[i];
        // 2. 找第一筆元素（[0]）有沒有 auc/pubdate/uri 欄位
        let missingdata = book.getElementsByTagName(col)[0];

        // 3. 如果 找不到|空值，就新增 auc/pubdate/uri 元素給第 i 筆書
        if (!missingdata || missingdata.innerHTML.trim() == '') {
            let newEle = xmlString.createElement(col);
            let newText = xmlString.createTextNode("  ");
            newEle.appendChild(newText);
            book.appendChild(newEle);
        }
    }
    return xmlString;

}

// 載入資料
let setData = function () {
    for (let i = 0; i <= bookList.length; i++) {
        let elem = $('<div>');
        elem.addClass('col-3');

        bookNameList[i] ? elem.append(`<h4>${bookNameList[i].innerHTML}</h4>`) : elem.append(`<h4></h4>`);
        elem.append(`<p>作者：${authorList[i].innerHTML}</p>`);
        publishYearList[i] ? elem.append(`<p>出版年份：${publishYearList[i].innerHTML}</p>`) : elem.append(`<p>出版年份：</p>`);
        urlList[i] ? elem.append(`<span>閱覽網址：</span><a href="${urlList[i].innerHTML}" target="_blank">★</a>`) : elem.append(`<span>閱覽網址：</span>`);


        $('#divResult').append(elem);
    }

}

// 捲軸往下捲 100px 時，增加一行 4 個資料
let scrollEvent = function () {
    let dataContainer = document.getElementById('divResult');
    let dataDiv = document.querySelectorAll('.col-3');
    let loadedItems = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop;          // scrollTop: 用來獲取元素的滾動位置
        const clientHeight = document.documentElement.clientHeight;    // clientHeight: 用來獲取元素的可視區域高度    
        const scrollHeight = dataContainer.scrollHeight;               // scrollHeight: 用來獲取元素內容的總高度

        // 觸發載入條件
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadedItems += 4;
            for (let i = loadedItems; i < loadedItems + 4; i++) {
                dataDiv[i].style.display = 'block';
            }

        }
    })
}