(function () {
  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    const [resource, config] = args;
    const method = (config && config.method) || "GET";
    const requestBody = (config && config.body) || null;

    return originalFetch.apply(this, args).then((response) => {
      response
        .clone()
        .text()
        .then((responseBody) => {
          const requestData = {
            type: "Fetch",
            method,
            url: resource,
            requestBody,
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
