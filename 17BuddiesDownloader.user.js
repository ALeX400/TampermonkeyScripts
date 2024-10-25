// ==UserScript==
// @name         17Buddies Quick Downloader
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Instant map download for 17Buddies
// @author       @LeX
// @match        https://www.17buddies.rocks/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    function overrideDownloadButton(button) {
        button.removeAttribute('onclick');
        button.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();

            const loadingDiv = document.getElementById('Loading');
            if (loadingDiv) loadingDiv.style.display = 'block';

            (function() {
                const GlblUrl = "https://www.17buddies.rocks/17b2/";
                const sTyp = "Map";
                const nId = window.location.href.match(/\/Map\/(\d+)\//)[1];
                const bHlbox = 1;
                const sCph = "x";
                const szUrl = GlblUrl + "Push/PreDown/" + sTyp + "/" + nId + "/" + sCph + "/" + bHlbox + "/index.html";
                const zipName = window.location.href.match(/\/([^\/]+)\.html$/)[1];

                async function startDownload() {
                    try {
                        let response = await fetch(szUrl);
                        if (!response.ok) return;

                        let sResult = await response.text();
                        let FileDatas = sResult.split('|');
                        let FileName = FileDatas[2];

                        while (true) {
                            if (await requestZipData(FileName)) return;
                        }
                    } finally {
                        if (loadingDiv) loadingDiv.style.display = 'none';
                    }
                }

                async function requestZipData(FileName) {
                    try {
                        let response = await fetch(GlblUrl + "Get/" + FileName + ".zip");
                        if (!response.ok) return false;

                        let arrayBuffer = await response.arrayBuffer();
                        let blob = new Blob([arrayBuffer], { type: response.headers.get('content-type') || 'application/octet-stream' });
                        let text = await new Response(blob).text();

                        if (!text.includes(FileName)) {
                            saveZipFile(new Blob([arrayBuffer], { type: 'application/zip' }), zipName + ".zip");
                        }

                        return !text.includes(FileName);
                    } catch {
                        return false;
                    }
                }

                function saveZipFile(blob, fileName) {
                    let link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

                startDownload();
            })();
        });
    }

    new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1 && node.matches('.MapBtn.MapDown')) {
                    overrideDownloadButton(node);
                    observer.disconnect();
                }
            }
        }
    }).observe(document, { childList: true, subtree: true });
})();
