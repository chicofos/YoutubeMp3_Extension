var serverUrl = "http://192.168.1.65:3000/Datos";

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;

    console.assert(typeof url === 'string', 'tab.url should be a string');
    callback(url);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url){
      if(url.indexOf("www.youtube.com") === -1){
        alert('This is not youtube genius.');
        window.close();
      }

      var xhr = createCORSRequest('POST', serverUrl);
      xhr.responseType = 'blob';
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send("id="+url);

      // Response handlers.
      xhr.onload = function() {
            
        if(xhr.status !== 200){
          alert('Error status: ' + xhr.status);
          window.close();
        }

        var anchor = document.createElement("a");
        document.body.appendChild(anchor);
        anchor.style = "display: none";

        saveData(anchor, xhr.response);
      };

      xhr.onerror = function() {
        alert('Woops, there was an error making the request.');
      };
  });
});


var saveData = function (anchor, data) {
  
  var blob = new Blob([data], {type: "audio/mpeg"}),
  url = window.URL.createObjectURL(blob);

  var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
  
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);

  document.getElementById("msg").innerHTML = "Done!";
  document.getElementById("done").removeAttribute("hidden");
  document.getElementById("loader").setAttribute("hidden", true);
};

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();

  if ("withCredentials" in xhr) {
    xhr.open(method, url, true);
  } 
  else if (typeof XDomainRequest !== "undefined") {
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } 
  else {
    xhr = null;
  }
  return xhr;
}

