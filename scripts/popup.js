window.onload = function () {
    let p = document.querySelector('#message_p');
    // 初始化流量
    fetch('http://localhost:9801/rg-data-link/getTraffic', {
        method: 'GET',
        // mode: 'no-cors',
        // credentials: 'include',
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        data['data'] === -1 ? p.innerHTML = "Unlimited" : p.innerHTML = data['data'] + "%";
    }).catch(err => {
        console.error('There has been a problem with your fetch operation:' + err);
    });
}
