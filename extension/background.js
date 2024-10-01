const customerId = "utkarsh_cus_123";
const dataSourceId = "utkarsh_ds_123";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FORWARD_TO_SERVER") {
    const data = message.data;

    fetch(`http://localhost:5000/api/traffic/${customerId}/${dataSourceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => console.log("Data sent to server:", data))
      .catch((error) => console.error("Error sending data to server:", error));
  }
});
