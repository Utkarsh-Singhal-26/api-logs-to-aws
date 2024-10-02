(function () {
  const allowedDomains = ["jsonplaceholder.typicode.com"];

  function isValidDomain(url) {
    return allowedDomains.some((domain) => url.includes(domain));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectScript);
  } else {
    injectScript();
  }

  function injectScript() {
    const currentDomain = window.location.hostname;

    if (isValidDomain(currentDomain)) {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("intercept.js");
      document.head.appendChild(script);
    }
  }
})();

window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INTERCEPTED_REQUEST") {
    chrome.runtime.sendMessage({
      type: "FORWARD_TO_SERVER",
      data: event.data.data,
    });
  }
});
