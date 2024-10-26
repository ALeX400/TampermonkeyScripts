// ==UserScript==
// @name         17Buddies Quick Downloader
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Instant map download for 17Buddies, applies to individual maps and map list
// @author       @LeX
// @match        https://www.17buddies.rocks/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Function to initiate the download process for a specific map using its ID and name
    function startDownloadFromUrl(nId, zipName) {
        const GlblUrl = "https://www.17buddies.rocks/17b2/";
        const sTyp = "Map";
        const bHlbox = 1;
        const sCph = "x";
        const szUrl = `${GlblUrl}Push/PreDown/${sTyp}/${nId}/${sCph}/${bHlbox}/index.html`;

        async function startDownload() {
            const loadingDiv = document.getElementById('Loading');
            if (loadingDiv) loadingDiv.style.display = 'block';
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

        // Requests and validates the zip file; retries if initial request fails
        async function requestZipData(FileName) {
            try {
                let response = await fetch(`${GlblUrl}Get/${FileName}.zip`);
                if (!response.ok) return false;

                let arrayBuffer = await response.arrayBuffer();
                let blob = new Blob([arrayBuffer], { type: response.headers.get('content-type') || 'application/octet-stream' });
                let text = await new Response(blob).text();

                if (!text.includes(FileName)) {
                    saveZipFile(new Blob([arrayBuffer], { type: 'application/zip' }), `${zipName.toLowerCase()}.zip`);
                }

                return !text.includes(FileName);
            } catch {
                return false;
            }
        }

        // Saves the downloaded file to the user's device
        function saveZipFile(blob, fileName) {
            let link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        startDownload();
    }

    // Overrides default download button behavior on individual map pages
    function overrideDownloadButton(button) {
        const nId = window.location.href.match(/\/Map\/(\d+)\//)[1];
        const zipName = window.location.href.match(/\/([^\/]+)\.html$/)[1];
        button.removeAttribute('onclick');
        button.addEventListener('click', function(event) {
            event.preventDefault();
            startDownloadFromUrl(nId, zipName);
        });
    }

    // Overrides download links in the map list to initiate quick download
    function overrideListDownloadLink(link, nId, zipName) {
        link.removeAttribute('onclick');
        link.addEventListener('click', function(event) {
            event.preventDefault();
            startDownloadFromUrl(nId, zipName);
        });
    }

    // Observes DOM changes for individual map page buttons and applies override
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

    // Observes DOM changes for download links in map lists and applies override
    new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1 && node.matches('.MapActions a[onclick^="GoDown"]')) {
                    const parentDiv = node.closest('div[id^="usrl_"]');
                    if (parentDiv) {
                        const nId = parentDiv.id.split('_')[1];
                        const zipName = parentDiv.querySelector('.ObjectName span[itemprop="itemListElement"]').textContent;
                        overrideListDownloadLink(node, nId, zipName.toLowerCase());
                    }
                }
            }
        }
    }).observe(document, { childList: true, subtree: true });
})();
