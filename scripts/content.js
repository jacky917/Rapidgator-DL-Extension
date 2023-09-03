function btnStyle(btn) {
    btn.style.border = 'none';
    btn.style.borderRadius = '3px';
    btn.style.boxShadow = '3px 2px 2px #D9D9D9';
}

function activeBtn(btn) {
    btnStyle(btn);
    btn.style.backgroundColor = '#66af47';
    btn.style.color = '#FFFFFF';
    btn.style.cursor = 'pointer';
}

function disableBtn(btn) {
    btnStyle(btn);
    btn.disabled = true;
    btn.style.backgroundColor = 'gray';
    btn.style.cursor = 'default';
}

function normalBtn(btn) {
    btnStyle(btn);
    btn.style.backgroundColor = '#f8f9fa';
    btn.style.color = '#000000';
    btn.style.cursor = 'pointer';
}


function closeForm() {
    let backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
        document.body.removeChild(backdrop);
    }
}

async function submitForm() {
    // let reportData = {
    //     "domain": document.getElementById("domainInput").value,
    //     "rgHref": JSON.stringify({link: window.location.href}),
    //     "message": document.getElementById("messageInput").value,
    //     "counterfeit": document.getElementById("counterfeitInput").checked
    // };
    // if(reportData.message === "") alert("Please enter a message.");
    // else {
    //     // TODO: 將報告數據發送到伺服器或進行其他處理
    //     console.log(reportData);
    //     closeForm();
    //     alert("Thanks for reporting!");
    // }

    const domain = await getFromChromeStorage('rg_dl_domain');

    const reportData = {
        domain: document.getElementById("domainInput").value,
        rgHref: JSON.stringify({link: window.location.href}),
        message: document.getElementById("messageInput").value,
        counterfeit: document.getElementById("counterfeitInput").checked
    };

    if(reportData.message === "") alert("Please enter a message.");
    else {

        try {
            const options = {
                method: 'POST',
                // mode: 'cors',
                // credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            };
            const response = await fetchData(domain + "pub/report", options);
            console.log(response);
        } catch (error) {
            console.error("Error:", error);
        }

        closeForm();
        alert("Thanks for reporting!");
    }
}


function downloadFile(url) {
    let a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.href = url;
    a.download = '';
    a.click();
    document.body.removeChild(a);
}

(async function () {
    let premium = document.querySelector('#table_header');
    if (!premium) return;
    try {
        let reliability = await checkReliability();
        updateLoginUI();
        removeUnnecessaryElements();
        renderProgressBar(reliability['data']);
        // 有資料，且高概率是假檔
        if (reliability['data'] === '-1' || reliability['data'] > 50)
            await setupDownloadButton(true);
        else
            await setupDownloadButton(false);
        renderReportButton();
    } catch (error) {
        console.error("Error:", error.message);
    }
})();

async function checkReliability() {
    const domain = await getFromChromeStorage('rg_dl_domain');
    const options = {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({link: window.location.href})
    };
    return await fetchData(domain + "pub/checkLink", options);
}

function updateLoginUI() {
    let login = document.querySelector('li.login-open1 > a');
    login.innerHTML = "Premium";
    login.href = "#";
}

function removeUnnecessaryElements() {
    let container = document.querySelector('body > div.container > div.overall > div > div.main-block.wide > div.in');

    // 2. 獲取該div的所有子元素
    let children = container.children;

    // 3. 迭代子元素，並刪除除了第一個元素之外的所有元素
    for (let i = children.length - 1; i > 0; i--) {  // 從後向前迭代，以避免由於子元素索引變化而引發的問題
        container.removeChild(children[i]);
    }
}

function renderProgressBar(reliability) {
    let container = document.querySelector('body > div.container > div.overall > div > div.main-block.wide > div.in');
    const svg_container = document.createElement('div');
    svg_container.setAttribute('id', 'cont');
    svg_container.setAttribute('data-pct', '100');
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('id', 'svg');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '200');
    const r = 50;
    const c = Math.PI * (r * 2);
    const circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle1.setAttribute('r', r);
    circle1.setAttribute('cx', '100');
    circle1.setAttribute('cy', '100');
    circle1.setAttribute('fill', 'transparent');
    circle1.setAttribute('stroke-dasharray', c);
    circle1.setAttribute('stroke-dashoffset', '0');

    const circle2 = circle1.cloneNode();
    circle2.setAttribute('id', 'bar');
    svg.appendChild(circle1);
    svg.appendChild(circle2);
    svg_container.appendChild(svg);
    container.appendChild(svg_container);

    // 確保reliability的值在0到100之間
    reliability = Math.min(100, Math.max(0, reliability));

    const offset = (100 - reliability) / 100 * c;

    document.getElementById('bar').style.strokeDashoffset = offset;

    // 更新reliability值
    reliability = reliability === 0 ? '?' : reliability + '%';
    svg_container.setAttribute('data-pct', reliability);

    // 創建一個 text 元素
    let textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    // 設定文字的內容
    textElement.textContent = 'File Reliability';
    // 使用 text-anchor 屬性來確保文字在其 x 位置水平置中
    textElement.setAttribute('text-anchor', 'middle');
    // 設定文字的 x 和 y 位置。x 應該是 SVG 寬度的一半，以確保文字水平置中。
    // y 應該是 SVG 高度減去一些像素（取決於你想要的距離）以將其放在 SVG 的底部
    textElement.setAttribute('x', 100);
    textElement.setAttribute('y', 175);
    textElement.setAttribute('font-size', '18');
    textElement.setAttribute('fill', '#808080');

    // 將 text 元素添加到 SVG 中
    svg.appendChild(textElement);
    return reliability;
}

async function setupDownloadButton(available) {
    let container = document.querySelector('body > div.container > div.overall > div > div.main-block.wide > div.in');
    let btn_area = document.createElement("div");
    let dl_btn = document.createElement("button");
    let dl_a = document.createElement("a");

    dl_btn.appendChild(dl_a);
    btn_area.appendChild(dl_btn);
    container.appendChild(btn_area);

    dl_a.style.color = '#FFFFFF';
    dl_a.style.textDecoration = 'none';

    // Add the styling here
    dl_btn.style.display = 'block';
    dl_btn.style.margin = '10px auto';
    dl_btn.style.width = '200px';
    dl_btn.style.height = '30px';
    dl_btn.style.fontWeight = 'bold';

    if (available) {

        activeBtn(dl_btn);
        dl_a.innerHTML = "Download";

        dl_btn.onclick = async function () {
            const domain = await getFromChromeStorage('rg_dl_domain');
            const url = domain + "pub/directLink";
            const options = {
                method: 'POST',
                // mode: 'cors',
                // credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({link: window.location.href})
            };

            try {
                const data = await fetchData(url, options);
                downloadFile(data['data']);
            } catch (error) {
                console.error('Fetch error:', error);
            }
        };
    } else {
        dl_a.innerHTML = "Unavailable";
        disableBtn(dl_btn);
        dl_a.style.cursor = 'default';
    }
}

function renderReportButton() {
    let container = document.querySelector('body > div.container > div.overall > div > div.main-block.wide > div.in');
    let report_btn = document.createElement("button");

    // Add the styling here
    report_btn.style.display = 'block';
    report_btn.style.margin = '10px auto';
    report_btn.style.width = '200px';
    report_btn.style.height = '30px';
    report_btn.style.boxShadow = '3px 2px 2px #D9D9D9';
    report_btn.style.borderRadius = '3px';
    report_btn.style.cursor = 'pointer';
    report_btn.innerHTML = "Report file reliability";
    report_btn.style.fontWeight = 'bold';
    normalBtn(report_btn);
    container.appendChild(report_btn);

    report_btn.addEventListener("click", function () {
        // Create the modal backdrop
        let backdrop = document.createElement('div');
        backdrop.id = "modal-backdrop";
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100vw';
        backdrop.style.height = '100vh';
        backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
        backdrop.style.zIndex = '1000';

        let isButtonPressed = false;

        backdrop.addEventListener('mousedown', function () {
            // console.log("backdrop mousedown");
            // console.log("isButtonPressed = " + isButtonPressed)
            isButtonPressed = true;
        });

        backdrop.addEventListener('mouseup', function () {
            // console.log("backdrop mouseup");
            // console.log("isButtonPressed = " + isButtonPressed)
            if (isButtonPressed) {
                closeForm();
            }
            isButtonPressed = false;  // 重置標記
        });

        backdrop.addEventListener('mouseleave', function () {
            // console.log("backdrop mouseleave");
            // console.log("isButtonPressed = " + isButtonPressed)
            isButtonPressed = false;  // 如果滑鼠離開按鈕，重置標記
        });


        // Create the main modal container div
        let modalDiv = document.createElement('div');
        modalDiv.id = 'modal-content';  // 用於過渡效果

        modalDiv.style.position = 'absolute';
        modalDiv.style.top = '50%';
        modalDiv.style.left = '50%';
        modalDiv.style.transform = 'translate(-50%, -50%)';
        modalDiv.style.background = "#FFFFFF";
        modalDiv.style.padding = "20px";
        modalDiv.style.borderRadius = "10px";
        modalDiv.style.width = "300px";

        modalDiv.addEventListener('mousedown', function (event) {
            // console.log("modalDiv mousedown");
            // console.log("isButtonPressed = " + isButtonPressed)
            event.stopPropagation();
        });

        modalDiv.addEventListener('mouseup', function (event) {
            // console.log("modalDiv mouseup");
            // console.log("isButtonPressed = " + isButtonPressed)
            event.stopPropagation();
        });

        modalDiv.addEventListener('mouseenter', function (event) {
            // console.log("modalDiv mouseenter");
            // console.log("isButtonPressed = " + isButtonPressed)
            isButtonPressed = false;  // 如果滑鼠離開按鈕，重置標記
        });

        // Create form elements
        const elements = [
            {
                tag: 'label',
                text: 'Source website domain',
                input: {type: 'text', id: 'domainInput', placeholder: 'example.com'}
            },
            {tag: 'label', text: 'Message', input: {type: 'textarea', id: 'messageInput', value: ''}},
            {tag: 'label', text: 'Counterfeit', input: {type: 'checkbox', id: 'counterfeitInput', value: '1'}}
        ];

        const element = document.createElement("h2");
        element.textContent = "Report file reliability";
        element.style.marginBottom = '20px';
        modalDiv.appendChild(element);
        modalDiv.style.alignItems = 'center';
        modalDiv.style.textAlign = 'center';
        for (const el of elements) {
            const containerDiv = document.createElement('div'); // 創建容器div
            containerDiv.style.display = 'flex';               // 設置為flex布局
            containerDiv.style.justifyContent = 'space-between'; // 使内容在容器內分散對齊
            containerDiv.style.marginBottom = '10px';           // 為了使元素間有間距

            const element = document.createElement(el.tag);
            element.textContent = el.text;
            element.style.lineHeight = '28px';
            containerDiv.appendChild(element);                 // 添加到容器div內

            if (el.input) {
                const inputElement = el.input.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
                inputElement.style.overflow = 'hidden';
                inputElement.style.margin = '0px';
                inputElement.style.border = 'solid 1px';
                inputElement.style.padding = '5px';
                inputElement.style.borderRadius = '2px';
                inputElement.style.width = '150px';
                inputElement.style.resize = 'none';
                for (const attr in el.input) {
                    inputElement[attr] = el.input[attr];
                }
                containerDiv.appendChild(inputElement);         // 添加到容器div內
            }

            modalDiv.appendChild(containerDiv);                // 添加容器div到模態窗口
            modalDiv.appendChild(document.createElement('hr'));
        }

        let btnDiv = document.createElement('div');
        btnDiv.style.display = 'flex';               // 設置為flex布局
        btnDiv.style.justifyContent = 'space-evenly'; // 使内容在容器內分散對齊
        btnDiv.style.marginBottom = '10px';           // 為了使元素間有間距

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Submit';
        submitBtn.onclick = submitForm;  // You should define the submitForm() function somewhere
        submitBtn.style.width = '100px';
        submitBtn.style.height = '30px';
        activeBtn(submitBtn);
        btnDiv.appendChild(submitBtn);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Exit';
        closeBtn.onclick = closeForm;
        closeBtn.style.width = '50px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.width = '100px';
        closeBtn.style.height = '30px';
        normalBtn(closeBtn);
        btnDiv.appendChild(closeBtn);

        modalDiv.appendChild(btnDiv);

        // Append the modal div to the backdrop
        backdrop.appendChild(modalDiv);

        // 立即將backdrop添加到body，但初始透明度為0，且模態框縮小
        backdrop.style.opacity = '0';
        // modalDiv.style.opacity = '0';
        modalDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';  // 初始狀態稍微縮小
        document.body.appendChild(backdrop);

        // 稍微延遲以允許瀏覽器渲染初始狀態，然後啟動動畫效果
        setTimeout(() => {
            backdrop.style.opacity = '1';
            modalDiv.style.transform = 'translate(-50%, -50%) scale(1)';  // 終止狀態恢復原始大小
        }, 100);
    });
}
