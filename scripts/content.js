window.onload = function() {
    let premium = document.querySelector('#table_header');
    function downloadFile(url) {
        // 創建一個隱藏的a標籤用於觸發下載
        let a = document.createElement('a');
        a.style.display = 'none';
        document.body.appendChild(a);
        // 設置a標籤的href為當前頁面URL，並觸發點擊事件開始下載
        a.href = url;
        a.download = '';
        a.click();
        // 下載完成後，刪除a標籤
        document.body.removeChild(a);
    }

    if (premium) {
        premium.innerHTML = "Your download link is ready."

        // 獲取tbody元素
        let tbody = document.querySelector('div.text-block.download-prepare > div > div > table > tbody');

        let login = document.querySelector('li.login-open1 > a');
        login.innerHTML = "Premium";
        login.href = "#";

        // 如果tbody存在且包含至少兩行
        if (tbody && tbody.rows.length > 1) {
            // 從最後一行開始，循環刪除每一行，直到只剩下一行
            while (tbody.rows.length > 1) {
                tbody.deleteRow(-1);
            }
        }
        // 慢速下載
        let slow = document.querySelector('div.text-block.download-prepare > div > div > table > tbody > tr > th:nth-child(2) > a');
        slow.style.cursor = 'default';
        slow.style.color = 'gray';
        slow.baseURL = '#';
        // 高速下載
        document.querySelector('div.text-block.download-prepare > div > div > table > tbody > tr > th:nth-child(3) > a').remove();
        let high_container = document.querySelector('div.text-block.download-prepare > div > div > table > tbody > tr > th:nth-child(3)');

        let my_high = document.createElement("a");
        my_high.classList.add("btn-premium", "link", "active");
        my_high.innerHTML = "HIGH SPEED DOWNLOAD";
        my_high.style.cursor = 'pointer';
        my_high.onclick = function () {
            fetch('http://localhost:9801/rg-data-link/getDirectLink', {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({link: window.location.href})
            }).then(response => {
                if (!response.ok) {
                    console.error('Network response was not ok');
                    // throw new Error('Network response was not ok');
                }
                return response.json();
            }).then(data => {
                // 下載
                downloadFile(data['data']);
            }).catch(err => {
                console.error('There has been a problem with your fetch operation:' + err);
                // throw new Error('There has been a problem with your fetch operation');
            });
        };
        high_container.appendChild(my_high);
    }
};
