(function () {
  const originalFetch = window.fetch;
  const originalXHR = window.XMLHttpRequest;

  // Intercept Fetch requests
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
            requestHeaders: args[1]?.headers || {},
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

  // Intercept XHR requests
  window.XMLHttpRequest = function () {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    const originalSetRequestHeader = xhr.setRequestHeader;

    xhr.open = function (method, url) {
      this._url = url;
      this._method = method;
      this._requestHeaders = {};
      return originalOpen.apply(this, arguments);
    };

    xhr.setRequestHeader = function (header, value) {
      this._requestHeaders[header] = value;
      return originalSetRequestHeader.apply(this, arguments);
    };

    xhr.send = function (body) {
      this.addEventListener("load", () => {
        const responseHeaders = {};
        this.getAllResponseHeaders()
          .split("\r\n")
          .forEach((line) => {
            if (line) {
              const [key, value] = line.split(": ");
              responseHeaders[key] = value;
            }
          });
        const requestData = {
          type: "XHR",
          method: this._method,
          url: this._url,
          requestHeaders: this._requestHeaders,
          requestBody: body,
          responseHeaders: responseHeaders,
          responseBody: this.responseText,
          status: this.status,
          statusText: this.statusText,
        };

        window.postMessage(
          {
            type: "INTERCEPTED_REQUEST",
            data: requestData,
          },
          "*"
        );
      });

      return originalSend.apply(this, arguments);
    };

    return xhr;
  };
})();
