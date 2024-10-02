(function () {
  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    const url = typeof args[0] === "string" ? args[0] : args[0].url;

    return originalFetch.apply(this, args).then((response) => {
      response
        .clone()
        .text()
        .then((responseBody) => {
          const requestData = {
            type: "Fetch",
            method: args[1]?.method || "GET",
            url,
            requestHeaders: args[1]?.headers
              ? Object.fromEntries(args[1].headers)
              : {},
            requestBody: args[1]?.body || "",
            responseBody,
            status: response.status,
            statusText: response.statusText,
          };

          window.postMessage(
            {
              type: "INTERCEPTED_REQUEST",
              data: requestData,
            },
            "*"
          );
        });
      return response;
    });
  };
})();
