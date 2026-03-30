import { eventSource, event_types } from "../../../script.js";

let observerStarted = false;

function createTag() {
    const tag = document.createElement('span');
    tag.id = 'st-balance';

    tag.style.marginLeft = '10px';
    tag.style.padding = '3px 10px';
    tag.style.borderRadius = '6px';
    tag.style.background = '#1e8e3e';
    tag.style.color = '#fff';
    tag.style.cursor = 'pointer';
    tag.style.fontSize = '12px';

    tag.innerText = '余额: --';

    return tag;
}

function findAndInject() {
    const input = document.querySelector('input[type="password"]');
    if (!input) return;

    if (document.getElementById('st-balance')) return;

    const tag = createTag();
    input.parentNode.appendChild(tag);

    async function fetchBalance() {
        const apiKey = input.value.trim();
        if (!apiKey) {
            tag.innerText = '余额: 未填Key';
            return;
        }

        let baseInput = document.querySelector('input[placeholder*="http"]');
        let base = baseInput?.value?.trim();

        if (!base) {
            tag.innerText = '余额: 未填地址';
            return;
        }

        if (!base.endsWith('/v1')) base += '/v1';

        const url = base + '/dashboard/billing/credit_grants';

        tag.innerText = '余额: 查询中...';

        try {
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${apiKey}`
                }
            });

            const data = await res.json();

            if (!data.total_available) {
                tag.innerText = '余额: 不支持';
                return;
            }

            tag.innerText = `余额: ${data.total_available.toFixed(2)}`;
        } catch (e) {
            tag.innerText = '余额: 错误';
        }
    }

    tag.onclick = fetchBalance;

    setInterval(fetchBalance, 30000);

    fetchBalance();
}

function init() {
    if (observerStarted) return;
    observerStarted = true;

    const observer = new MutationObserver(() => {
        findAndInject();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    findAndInject();
}

eventSource.on(event_types.APP_READY, init);
