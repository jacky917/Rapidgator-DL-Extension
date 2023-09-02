chrome.storage.local.set({ rg_dl_domain: "http://localhost:9801/" });


async function getFromChromeStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                resolve(result[key]);
            }
        });
    });
}

async function fetchData(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

// const API_URL = 'http://localhost:9801/pub/blockedWebsite';
//
// // 每10分鐘向後端請求一次屏蔽的網站列表
// setInterval(fetchBlockedDomains, 10 * 60 * 1000);

// async function fetchBlockedDomains() {
//     try {
//         const domain = await getFromChromeStorage('rg_dl_domain');
//         const data = await fetchData(domain + "pub/blockedWebsite", {method: 'GET'});
//         console.log("!!!!!!!!!!!!!!!!!!!!!");
//         console.log(data);
//         updateBlockingRules(data.data);
//         console.log("!!!!!!!!!!!!!!!!!!!!!");
//     } catch (err) {
//         console.error('There has been a problem:', err.message);
//     }
// }

// function updateBlockingRules(domains) {
//     const rules = domains.map((domain, index) => {
//         return {
//             id: index + 1,
//             action: {
//                 type: 'block'
//             },
//             condition: {
//                 urlFilter: domain,
//                 resourceTypes: ["main_frame"]
//             }
//         };
//     });
//
//     chrome.declarativeNetRequest.updateDynamicRules({ rules: rules }, () => {
//         if (chrome.runtime.lastError) {
//             console.error(chrome.runtime.lastError);
//         } else {
//             console.log("Blocking rules updated successfully!");
//         }
//     });
// }
//
// // 在插件啟動時立即調用一次
// fetchBlockedDomains();
