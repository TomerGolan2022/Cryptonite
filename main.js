"use strict";

// When the user scrolls down 20px from the top of the document, slide down the navbar
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    document.getElementById("navbar").style.top = "0";
  } else {
    document.getElementById("navbar").style.top = "-50px";
  }
}

// -----------------------------------------------------------------------

$(function () {

  let allCoins = []

  // Document Ready
  $.ajax({
    url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
    success: (coins) => displayCoins(coins, allCoins),
    error: (err) => console.error(err),
  });

  // showing loading
  function displayLoading() {
    $(`#loadingDiv`).append(`<div id="loading" class="loader">Loading...</div>`);
  }
  // hiding loading
  function hideLoading() {
    $(`#loadingDiv`).empty();
  }

  // ------------------------------------------------------------------

  function displayCoins(coins, allCoins) {
    hideLoading();
    displayLoading();
    $("#home").addClass("active");
    $("#charts").removeClass("active");
    $("#about").removeClass("active");
    $("#chartsDiv").hide();
    $("#aboutDiv").hide();
    $("#homeDiv").show();

    setTimeout(() => {
      hideLoading();
      $("#homeDiv").append(
        `<div class="container">
          <main id="coinsContainer" class="container"></main>
        </div>
        `);

      for (let index = 0; index < coins.length; index++) {
        $("#coinsContainer").append(
          `<div class="col-sm" id="${index}">
            <div class="coin-card">
              <div class="card-body" id="cardBody${index}">
               <div class="form-check form-switch position-relative end-0" style="transform: translateX(90%);">
                  <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="${coins[index].symbol}_input"
                      style="border:black;"
                    />
                  <label
                      class="form-check-label"
                      for="flexSwitchCheckChecked" >
                  </label>
                </div>
                     <h1>${coins[index].symbol}</h1>
                     <img src="${coins[index].image}" class="coin-img"/>
                     <p>${coins[index].name}</p>
                     <p>
                      <a class="btn" data-bs-toggle="collapse" href="#collapse${index}" role="button" aria-expanded="false"
                         aria-controls="collapse${index}" style="background-color: white; color: #282E34;">
                       <strong>More info</strong>
                      </a>
                     </p>  
                     <div id="collapseDiv${index}">
                       <div class="collapse" id="collapse${index}">
                         <div class="card card-body data">
                           <span>
                           <strong>Current Price</strong></br>
                            ${coins[index].current_price} $ 
                           </span>
                         </div>
                       </div>
                     </div> 
                </div>
              </div>
            </div>
            `);
        allCoins.push(coins[index])
      }

      addSearchInput();
      searchFilter(coins);
      addToModal(allCoins);

    }, 3000);
  }

  // -----------------------------------------------------------------------

  function displayDetails(coins) {
    for (let index = 0; index < coins.length; index++) {
      $(`#collapseDiv${index}`).empty();
      $(`#collapseDiv${index}`).append(
        `<div class="collapse" id="collapse${index}">
           <div class="card card-body data">
             <span>
             ${coins[index].current_price} $ </br>
             </span>
           </div>
        </div>
        `);
    }
  }

  function updateCollapse() {
    $.ajax({
      url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
      success: (coins) => displayDetails(coins),
      error: (err) => console.error(err),
    });
  }

  setInterval(() => {
    updateCollapse();
    console.log("Collapse updated")
  }, 120000);

  // -----------------------------------------------------------------------

  // modal

  function addToModal(allCoins) {

    let coinsBox = [];

    for (let index = 0; index < allCoins.length; index++) {
      let coin = allCoins[index]

      $(`#${coin.symbol}_input`).on('change', function () {

        if ($(`#${coin.symbol}_input`).is(':checked') && coinsBox.length <= 4 && !coinsBox.includes(coin.symbol)) {
          coinsBox.push(coin.symbol)
          localStorage.removeItem("reports");
          localStorage.setItem("reports", JSON.stringify(coinsBox));
        }
        else {
          if (coinsBox.includes(coin.symbol)) {
            let index = coinsBox.indexOf(coin.symbol);
            if (index !== -1) {
              coinsBox.splice(index, 1);
              localStorage.removeItem("reports");
          localStorage.setItem("reports", JSON.stringify(coinsBox));
            }
          }
          else {
            $(`#${coin.symbol}_input`).prop("checked", false);
            localStorage.removeItem("reports");
          localStorage.setItem("reports", JSON.stringify(coinsBox));
            modalList(coinsBox, coin.symbol, allCoins);
            updateModal(coinsBox, allCoins)
            new bootstrap.Modal($('#coinsBoxModal')).show();
          }
        }

      });
    }
  }

  // -----------------------------------------------------------------------

  let modalList = (coinsBox, extraCoin) => {
    $("#coinsBoxDiv").empty();
    $("#coinsBoxDiv").append(`
       <h5>You can choose only 5 currencies!</h5>
       <hr>
       <div style="width: 100%; text-align: left; padding-left: 40%; text-transform: uppercase;">
       <input id="${extraCoin}_input_modal" type="checkbox" class="custom-control-input" id="${extraCoin}_modal">  ${extraCoin}  
       </div> 
    `);
    for (let i = 0; i < coinsBox.length; i++) {
      $("#coinsBoxDiv").append(
        `<div style="width: 100%; text-align: left; padding-left: 40%; text-transform: uppercase;">
         <input id="${coinsBox[i]}_input_modal" type="checkbox" class="custom-control-input" id="${coinsBox[i]}_modal" checked>  ${coinsBox[i]}
         </div>
         `)
    }
  }

  // ----------------------------------------------------------------------

  function updateModal(coinsBox, allCoins) {

    let modalBox = coinsBox;

    for (let index = 0; index < allCoins.length; index++) {

      let coin = allCoins[index]

      $(`#${coin.symbol}_input_modal`).on('change', function () {
        if ($(`#${coin.symbol}_input_modal`).is(':checked') && modalBox.length < 5 && !modalBox.includes(coin.symbol)) {
          modalBox.push(coin.symbol)
          $(`#${coin.symbol}_input`).prop("checked", true);
          localStorage.removeItem("reports");
          localStorage.setItem("reports", JSON.stringify(modalBox));
        }
        else {
          if (modalBox.includes(coin.symbol)) {
            let index = modalBox.indexOf(coin.symbol);
            if (index !== -1) {
              modalBox.splice(index, 1);
              $(`#${coin.symbol}_input`).prop("checked", false);
              localStorage.removeItem("reports");
          localStorage.setItem("reports", JSON.stringify(modalBox));
            }
          }
          else {
            $(`#${coin.symbol}_input_modal`).prop("checked", false);
            localStorage.removeItem("reports");
          localStorage.setItem("reports", JSON.stringify(modalBox));
          }
        }
      });
     
    }
  }

  // -----------------------------------------------------------------------

  // search

  function addSearchInput() {
    $("#searchDiv").empty();
    $("#searchDiv").append(
      `<form class="d-flex">
                      <input id="searchCoins" class="form-control me-2" type="search"
                      style="text-align: center;" placeholder="Search" aria-label="Search">
                    </form>`
    );
  }

  // --------------------------------------------------------

  function searchFilter(array) {
    $("#searchCoins").on("input", e => {
      const value = e.target.value
      for (let i = 0; i < array.length; i++) {
        let coinName = array[i].name
        let coinSymbol = array[i].symbol
        const include = coinName.toLowerCase().includes(value) || coinSymbol.toLowerCase().includes(value);
        $(`#${i}`).toggleClass("hide", !include)
      }
    })
  }

  // --------------------------------------------------------------------

  // Home Link

  $("#home").click(() => {
    hideLoading();
    $("#home").addClass("active");
    $("#charts").removeClass("active");
    $("#about").removeClass("active");
    $("#homeDiv").hide();
    $("#chartsDiv").hide();
    $("#aboutDiv").hide();
    displayLoading();
    setTimeout(() => {
      hideLoading();
      $("#homeDiv").show();
      addSearchInput();
      // searchFilter(coins);
    }, 3000);
  });

  // Charts Link
  $("#charts").click(() => {
    hideLoading();
    $("#home").removeClass("active");
    $("#charts").addClass("active");
    $("#about").removeClass("active");
    $("#searchDiv").empty();
    $("#homeDiv").hide();
    $("#chartsDiv").hide();
    $("#aboutDiv").hide();
    displayLoading();
    setTimeout(() => {
      hideLoading();
      $("#chartsDiv").show();
      canvasData();
    }, 2000);
  });

  // About Link
  $("#about").click(function () {
    hideLoading();
    $("#home").removeClass("active");
    $("#charts").removeClass("active");
    $("#about").addClass("active");
    $("#searchDiv").empty();
    $("#homeDiv").hide();
    $("#chartsDiv").hide();
    $("#aboutDiv").hide();
    displayLoading();
    setTimeout(() => {
      hideLoading();
      $("#aboutDiv").show();
    }, 1000);
  });

  $("#saveModal").click(() => onModalSave());

});