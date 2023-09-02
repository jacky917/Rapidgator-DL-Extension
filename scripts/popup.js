document.addEventListener('DOMContentLoaded', async function() {
    let p = document.querySelector('#message_p');

    try {
        const domain = await getFromChromeStorage('rg_dl_domain');
        const data = await fetchData(domain + "pub/traffic", { method: 'GET' });

        p.innerHTML = data['data'] === -1 ? "Unlimited" : data['data'] + "%";
    } catch (err) {
        console.error('There has been a problem:', err.message);
    }
});
