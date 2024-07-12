const API_ENDPOINT = "http://slidesharedl.dennylungu.com/api";

function hideLoading() {
  document.getElementById("loader_container").style.display = "none";
}

function showLoading() {
  document.getElementById("loader_container").style.display = "block";
}

function hideLoadingSpin() {
  document.getElementById("loader").style.display = "none";
}

function showLoadingSpin() {
  document.getElementById("loader").style.display = "block";
}

function showLoadingText(text) {
  document.getElementById("loader_text").innerText = text;
}

document.getElementById("main_container").style.display = "none";
showLoadingText("Please wait while the website is loading...");
showLoading();
fetch(API_ENDPOINT + "/ping").then(() => {
  document.getElementById("main_container").style.display = "flex";
  hideLoading();
}); // wake up mr. west

function formatTime(seconds) {
  seconds = Math.round(seconds * 1.25);

  if (seconds < 60) {
    return seconds + " seconds";
  }

  const minutes = Math.floor(seconds / 60);
  seconds1 = seconds - minutes * 60;

  return minutes + " minutes and " + seconds1 + " seconds";
}

function onClickCallback() {
  var presentation_url = document.getElementById("slideshare_url").value;

  if (!presentation_url.includes("https://www.slideshare.net")) {
    alert("Please input a valid www.slideshare.net link!");
    return;
  }

  presentation_url = encodeURIComponent(presentation_url);
  presentation_url = btoa(presentation_url);

  url = API_ENDPOINT + "/download/" + presentation_url;
  presentation_info_endpoint = API_ENDPOINT + "/info/" + presentation_url;

  document.getElementById("main_container").style.display = "none";
  showLoadingText("Downloading presentation metadata...");
  showLoading();

  var pres_title = "slideshare presentation";
  var should_attempt_download = false;

  fetch(presentation_info_endpoint)
    .then((res) => res.json())
    .then((data) => {
      pres_title = data.title; // filename
      const estimated_download_time_seconds =
        data.estimated_download_time_seconds;
      showLoadingText(
        "Downloading presentation: '" +
          pres_title +
          "'.\n Estimated download time: " +
          formatTime(estimated_download_time_seconds)
      );
      showLoading();
      showLoadingSpin();
      should_attempt_download = true;
    })
    .then(() => {
      fetch(url)
        .then((res) => res.blob())
        .then((res) => {
          document.getElementById("post_download_text").innerText =
            "'" + pres_title + "' is ready to download...";
          hideLoading();
          document.getElementById("post_download").style.display = "block";

          // All of this just to download a file
          const aElement = document.createElement("a");
          aElement.setAttribute("download", pres_title);
          const href = URL.createObjectURL(res);
          aElement.href = href;
          aElement.setAttribute("target", "_blank");
          aElement.click();
          URL.revokeObjectURL(href);
        })
        .catch((error) => {
          console.error("Error:", error);
          hideLoadingSpin();
          showLoadingText("Error downloading. Presentation might be too big?");
        });
    })
    .catch((error) => {
      console.error("Error:", error);
      hideLoadingSpin();
      showLoadingText("Error contacting the API");
      should_attempt_download = false;
    });
}
