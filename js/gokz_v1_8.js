let maplist = [];
let xhr;
let xhr2;

// Main Page
let mostRecentTimes = [];
let mostRecentTopTimes = [];

// Map Page
let mapRecentTimes = [];
let mapProTimes = [];

let usedTopTimes = [];
let mostRecentTopTimesFiltered = [];
let usedTimes = [];
let postTimes = [];
let globalTimes = [];

const kz_simpleRecords =      "https://kztimerglobal.com/api/v1.0/records/top/recent?stage=0&tickrate=128&modes_list_string=kz_simple&limit=30";
const kz_timerRecords =       "https://kztimerglobal.com/api/v1.0/records/top/recent?stage=0&tickrate=128&modes_list_string=kz_timer&limit=30";
const kz_vanillaRecords =     "https://kztimerglobal.com/api/v1.0/records/top/recent?stage=0&tickrate=128&modes_list_string=kz_vanilla&limit=30";
const kz_simpleTopRecords =   "https://kztimerglobal.com/api/v1.0/records/top/recent?modes_list_string=kz_simple&place_top_at_least=1&has_teleports=false&stage=0&limit=100&tickrate=128";
const kz_timerTopRecords =    "https://kztimerglobal.com/api/v1.0/records/top/recent?modes_list_string=kz_timer&place_top_at_least=1&has_teleports=false&stage=0&limit=100&tickrate=128";
const kz_vanillaTopRecords =  "https://kztimerglobal.com/api/v1.0/records/top/recent?modes_list_string=kz_vanilla&place_top_at_least=1&has_teleports=false&stage=0&limit=100&tickrate=128";
const kz_simpleLoadMap =      "https://kztimerglobal.com/api/v1.0/records/top?modes_list_string=kz_simple";
const kz_timerLoadMap =       "https://kztimerglobal.com/api/v1.0/records/top?modes_list_string=kz_timer";
const kz_vanillaLoadMap =     "https://kztimerglobal.com/api/v1.0/records/top?modes_list_string=kz_vanilla";

const Leaderboard_points_simplekz =   "https://kztimerglobal.com/api/v1.0/player_ranks?finishes_greater_than=0&mode_ids=201&stages=0&tickrates=128&has_teleports=false&limit=20";
let leaderboardmode_points = Leaderboard_points_simplekz;
const Leaderboard_points_vanilla =    "https://kztimerglobal.com/api/v1.0/player_ranks?finishes_greater_than=0&mode_ids=202&stages=0&tickrates=128&has_teleports=false&limit=20";
const Leaderboard_points_kztimer =    "https://kztimerglobal.com/api/v1.0/player_ranks?finishes_greater_than=10&mode_ids=200&stages=0&tickrates=128&has_teleports=false&limit=20";
const Leaderboard_records_simplekz =  "https://kztimerglobal.com/api/v1.0/records/top/world_records?stages=0&mode_ids=201&tickrates=128&has_teleports=false&limit=20";
let leaderboardmode_records = Leaderboard_records_simplekz;
const Leaderboard_records_vanilla =   "https://kztimerglobal.com/api/v1.0/records/top/world_records?stages=0&mode_ids=202&tickrates=128&has_teleports=false&limit=20";
const Leaderboard_records_kztimer =   "https://kztimerglobal.com/api/v1.0/records/top/world_records?stages=0&mode_ids=200&tickrates=128&has_teleports=false&limit=20";

let page;
let name;
let map;

let kz_loadmap;
let recordsUrl;
let recordsTopUrl;
let current_has_teleports = "false";
let currentpage = 0;
let currentmode;
let currentmap;
let currenttype;
let uniquemaplist;


let state = {
  buttonText: "Initial text"
};

window.addEventListener('popstate', function(event) {
  window.location.reload();
});


// Gets list of global maps
fetch("https://kztimerglobal.com/api/v1.0/maps?is_validated=true&limit=1000")
.then(function(response) {
  return response.json();
})
.then(function(maps) {
  for (i=0;i<maps.length;i++) {
    maplist.push(maps[i]);
  }
});

function sortArray(array) {
  array.sort(function(a,b){
    return Date.parse(b.updated_on) - Date.parse(a.updated_on)
  });
  return array;
}

function getmode_id(mode) {
  if (mode === "kz_timer") {
    return 200;
  }
  else if (mode === "kz_simple") {
    return 201;
  }
  else if (mode === "kz_vanilla") {
    return 202;
  }
}

function getmode_name(mode) {
  if (mode === "kz_timer" || mode === "200") {
    return "KZTimer";
  }
  else if (mode === "kz_simple" || mode === "201") {
    return "SimpleKZ";
  }
  else if (mode === "kz_vanilla" || mode === "202") {
    return "Vanilla";
  }

}

//https://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
function disableScrolling(){
  let x=window.scrollX;
  let y=window.scrollY;
  window.onscroll=function(){window.scrollTo(x, y);};
}

function enableScrolling(){
  window.onscroll=function(){};
}

/* https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds */
function str_pad_left(string,pad,length) {
  return (new Array(length+1).join(pad)+string).slice(-length);
}

/* https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript */
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function timeConvert(time) {
  ms = time.toString().split(".");
  // API sends a time that ends with ".000" as just a whole number (Discovery: 12.000 is sent as 12). This fixes that.
  if (!ms[1]) {
    ms[1] = "000";
  }
  if (ms[1].length === 1) {
    ms[1] += "0";
  }
  if (time >= 3600.00) {
    hours = Math.floor(time / 3600.00);
    minutes = Math.floor(time % 3600.00 /60.00);
    seconds = Math.floor(time % 60.00);
    return str_pad_left(hours,'',2)+':'+str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2) +'.'+ ms[1].substr(0,2);
  }
  else if (time === "NA") {
    return "NA";
  }
  else if (time < 60) {
    seconds = Math.floor(time % 60.00);
    return str_pad_left(seconds,' ',2)+"."+ms[1].substr(0,2);
  }
  else {
    minutes = Math.floor(time % 3600.00 /60.00);
    seconds = Math.floor(time % 60.00);
    return str_pad_left(minutes,'',2)+':'+str_pad_left(seconds,'0',2)+'.'+ ms[1].substr(0,2); // "time" is milliseconds
  }
}

function sortWorldRecords(array) {
  array.sort(function(a,b){
    return (b.world_records) - (a.world_records)
  });
  return array;
}

function dateConvert(time) {
  time = new Date(time);
  time = new Date(time - time.getTimezoneOffset()*60000);
  let day = time.getDate();
  let month = time.getMonth() + 1;
  let year = time.getFullYear();
  let hour = time.getHours();
  let minutes = time.getMinutes();

  if (parseInt(hour) > 12) {
    hour = parseInt(hour) - 12;
    time = month + "." + day + "." + year + "  " + hour + ":" + (parseInt(minutes) < 10 ? "0" + minutes : minutes) + "pm";
  }
  else if (hour === 0) {
    time = month + "." + day + "." + year + "  " + 12 + ":" + (parseInt(minutes) < 10 ? "0" + minutes : minutes) + "am";
  }
  else if (hour == 12) {
    time = month + "." + day + "." + year + "  " + 12 + ":" + (parseInt(minutes) < 10 ? "0" + minutes : minutes) + "pm";
  }
  else {
    time = month + "." + day + "." + year + "  " +  hour + ":" + (parseInt(minutes) < 10 ? "0" + minutes : minutes) + "am";
  }
  return time;
}

function checkLength(name) {
  if (name.player_name === null) {
    playerName = "null";
    return;
  }
  playerName = name.player_name;
  return;
}

function resetModeColor() {
  document.getElementById("mode-kz_vanilla-desktop").style.color = "#E45051";
  document.getElementById("mode-kz_simple-desktop").style.color = "#E45051";
  document.getElementById("mode-kz_timer-desktop").style.color = "#E45051";
}

function resetMapTags() {
  document.getElementById("LeaderBoardOptions_tech").style.color = "#E45051";
  document.getElementById("LeaderBoardOptions_bhop").style.color = "#E45051";
  document.getElementById("LeaderBoardOptions_climb").style.color = "#E45051";
  document.getElementById("LeaderBoardOptions_combo").style.color = "#E45051";
  document.getElementById("LeaderBoardOptions_overall").style.color = '#E45051';
}

function resetAll() {
  document.getElementById("displayMapData").style.display = "none";
  document.getElementById("displayMapTimes").style.display = "none";
  document.getElementById("displayPlayerProfile").style.display = "none";
  document.getElementById("maps").style.display = "none";
  document.getElementById("playerLeaderboards").style.display = "none";
  document.getElementById("playerBans").style.display = "none";
  document.getElementById("button_container").style.display = "none";
  document.getElementById("graph_container").style.display = "none";
  document.getElementById("displayMapData").style.display = "none";
  document.getElementById("wr_progression_button").style.display = "none";
  document.getElementById("map_graph").style.display = "none";
  document.getElementById("displayTimes").style.display = "none";
  document.getElementById("pagination").style.display = "none";
  document.getElementById("searchMap").value = "";
  document.getElementById("searchPlayerInfo_input").value = "";
}

function getDifficulty(difficulty) {
  if (difficulty === 1) {
    return "Very Easy";
  }
  else if (difficulty === 2) {
    return "Easy";
  }
  else if (difficulty === 3) {
    return "Medium";
  }
  else if (difficulty === 4) {
    return "Hard";
  }
  else if (difficulty === 5) {
    return "Very Hard";
  }
  else if (difficulty === 6) {
    return "Death";
  }
  else {
    return "NA";
  }
}

// https://stackoverflow.com/questions/10015027/javascript-tofixed-not-rounding
function toFixed(num, precision) {
  return (+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
}

function getTimeDifference(time) {
  timeAchieved = new Date(time);
  timeAchieved = timeAchieved - timeAchieved.getTimezoneOffset()*60000;
  timeNow = new Date().toUTCString();
  let timeDifference = (Date.parse(timeNow) - timeAchieved) / (1000 * 60 * 60);

  if (timeDifference < 1) {
    return Math.ceil(timeDifference*60) + " minutes ago";
  }
  if (timeDifference < 24) {
    return Math.ceil(timeDifference) + " hours ago";
  }
  else if (timeDifference >= 24) {
    return Math.ceil((timeDifference / 24)) + " days ago";
  }
}

function getsMapsSearch(search) {
  delete_maps_from_map_list();
  mapArrayByID = [];
  countmaps = 0;
  for (i=0;i<maplist.length;i++) {
    for (j=0;j<maplist.length;j++) {
      if (maplist[j].name.includes(search[i])) {
        mapArrayByID.push([maplist[j].id,maplist[j].name,maplist[j].difficulty]);
      }
    }
  }

  for (i=0;i<mapArrayByID.length;i++) {
    if (countmaps >= 18) {
      break;
    }
    const $map_div = $("<div>", {id: mapArrayByID[i][1], "class": "maps_page_list"});
    $map_div.append("<img style='width: 150px; height: 84px;' src=" + "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + mapArrayByID[i][1] + ".jpg>" + "<span style='color: white; padding-left: 15px;'>" + mapArrayByID[i][1] + "<br>" + "<div>" + getDifficulty(mapArrayByID[i][2]) + "</div>" + "</span>");
    $("#list_of_maps").append($map_div);
    $map_div.click(function(event){
      if (event.target.parentNode.id.includes("_")) {
        document.getElementById("searchMap").value = event.target.parentNode.id;
        loadMap(document.getElementById("searchMap").value);
      }
    });
    countmaps++;
  }

  document.getElementById("TitleMaps").innerHTML = "Maps that include: " + document.getElementById("searchMap").value;
  document.getElementById("searchMap").value = "";
  document.getElementById("displayTimes").style.display = "none";
  document.getElementById("displayMapTimes").style.display = "none";
  document.getElementById("pagination").style.display = "none";
  document.getElementById("pagination").style.opacity = 1;
  document.getElementById("displayPlayerProfile").style.display = "none";
  document.getElementById("maps").style.display = "flex";
  document.getElementById("playerLeaderboards").style.display = "none";
  document.getElementById("graph_container").style.display = "none";
  document.getElementById("button_container").style.display = "none";
  document.getElementById("wr_progression_button").style.display = "none";
  document.getElementById("map_graph").style.display = "none";
}

function getMaps(offset) {
  resetAll()
  delete_maps_from_map_list();
  document.getElementById("TitleMaps").innerHTML = "Maps";
  document.getElementById("loading").style.opacity = 1;
  document.getElementById("loading").style.zIndex = 1;
  let countmaps = 0;
  for (i=offset;i<maplist.length;i++) {
    if (countmaps >= 18) {
      break;
    }
    const $map_div = $("<div>", {id: maplist[i].name, "class": "maps_page_list"});
    $map_div.append("<img style='width: 150px; height: 84px;' src=" + "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + maplist[i].name + ".jpg>" + "<span style='color: white; padding-left: 15px;'>" + maplist[i].name + "<br>" + "<div>" + getDifficulty(maplist[i].difficulty) + "</div>" + "</span>");
    $("#list_of_maps").append($map_div);
    $map_div.click(function(event){
      if (event.target.parentNode.id.includes("_")) {
        if (event.target.parentNode.id.includes("list_of_maps")) {
          return;
        }
        document.getElementById("searchMap").value = event.target.parentNode.id;
        loadMap(document.getElementById("searchMap").value);
      }
    });
    countmaps++;
  }
  document.getElementById("pagination").style.display = "flex";
  document.getElementById("pagination").style.opacity = "1";
  document.getElementById("maps").style.display = "flex";
  document.getElementById("loading").style.opacity = 0;
  document.getElementById("loading").style.zIndex = -1;
}

function getPlayerBanInfo(url) {
  $("#playerBanInfo td").remove();
  document.getElementById("TablesBans").style.display = "none";
  document.getElementById("playerBanInfo").style.display = "flex";
  fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(playerban) {
    if (playerban.length === 0) {
      document.getElementById("gokz_api_player_ban_title").innerHTML = "This Steam ID is not banned";
      return;
    }
    document.getElementById("gokz_api_player_ban_title").innerHTML = playerban[0].steam_id;
    let row = document.getElementById("gokz_api_player_ban").insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);

    row.id = "TableTitle";
    cell1.innerHTML = "Steam ID";
    cell2.innerHTML = "Ban Type";
    cell3.innerHTML = "Stats";
    cell4.innerHTML = "Expires on";

    row = document.getElementById("gokz_api_player_ban").insertRow(-1);
    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);
    cell3 = row.insertCell(2);
    cell4 = row.insertCell(3);
    cell5 = row.insertCell(4);

    row.id = playerban[0].steam_id;
    cell1.innerHTML = playerban[0].steam_id;
    cell2.innerHTML = playerban[0].ban_type;
    cell3.innerHTML = playerban[0].stats;
    cell4.innerHTML = dateConvert(playerban[0].expires_on);
  });
}

function getBans(offset) {
  resetAll()
  disableScrolling();
  document.getElementById("loading").style.opacity = 1;
  document.getElementById("loading").style.zIndex = 1;
  $("#TablesBans td").remove();
  document.getElementById("playerBans").style.display = "flex";
  document.getElementById("TablesBans").style.display = "flex";
  document.getElementById("playerBanInfo").style.display = "none";
  fetch('https://kztimerglobal.com/api/v1.0/bans?offset=' + offset + '&limit=20')
  .then(function(response) {
    return response.json();
  })
  .then(function(bans) {
    window.history.pushState('page', 'Page', '/?page=bans');
    let row = document.getElementById('gokz_api_bans').insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);

    row.id = "TableTitle";
    cell1.innerHTML = "Steam ID";
    cell2.innerHTML = "Ban Type";
    cell3.innerHTML = "Stats";
    cell4.innerHTML = "Expires on";

    for (i=0;i<20;i++) {
      let row = document.getElementById("gokz_api_bans").insertRow(-1);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);
      let cell4 = row.insertCell(3);
      let cell5 = row.insertCell(4);

      row.id = bans[i].steam_id;

      steamid = (bans[i].steam_id).split(":");
      steam64 = BigInteger(steamid[2]);
      steam64 = BigInteger(steam64.multiply(2).toString());
      if (steamid[1] === "1") {
        steamBigInt = BigInteger('76561197960265729');
      } else {
        steamBigInt = BigInteger('76561197960265728');
      }
      let profileUrl = "http://steamcommunity.com/profiles/" + steam64.add(steamBigInt).toString();

      cell1.innerHTML = "<a style='color:white; text-decoration:none' target='_blank' href=" + profileUrl + ">" + bans[i].steam_id + "</a>";
      cell2.innerHTML = bans[i].ban_type;
      cell3.innerHTML = bans[i].stats;
      cell4.innerHTML = dateConvert(bans[i].expires_on);
    }
    document.getElementById("loading").style.opacity = 0;
    document.getElementById("loading").style.zIndex = -1;
    enableScrolling();
  });
}

function getRank(points, currentmode) {

  // Point adjustment for different modes, as # of maps beatable on vanills is unknown as of 4-10-2020
  let modePointAdjust;
  let maxGlobalPoints;
  if (currentmode === "kz_vanilla") {
    modePointAdjust = 0.5;
    maxGlobalPoints = 1000*uniquemaplist;
  }
  else if (currentmode === "kz_simple") {
    modePointAdjust = 1.0;
    maxGlobalPoints = 1000*uniquemaplist;
  }
  else if (currentmode === "kz_timer") {
    modePointAdjust = 1.0;
    maxGlobalPoints = 1000*uniquemaplist;
  }

  // Title Calculator for Player Profile
  if (points < maxGlobalPoints*modePointAdjust*0.02) {
    return "New";
  }
  else if (points < maxGlobalPoints*modePointAdjust*0.05) {
    return "Trainee";
  }
  else if (points < maxGlobalPoints*modePointAdjust*0.15) {
    return "Casual";
  }
  else if (points < maxGlobalPoints*modePointAdjust*0.25) {
    return "Regular";
  }
  else if (points < maxGlobalPoints*modePointAdjust*0.40) {
    return "Skilled";
  }
  else if (points < maxGlobalPoints*modePointAdjust*0.65) {
    return "Expert";
  }
  else if (points < maxGlobalPoints*modePointAdjust*0.85) {
    return "Semi-Pro";
  }
  else if (points < maxGlobalPoints*modePointAdjust*1.00) {
    return "Pro";
  }
}

function getPlayerPointsAndRanks(url) {
  let player_points = 0;
  fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function(player) {
    if (player.length === 0) {
      player_points = 0;
    }
    else {
      player_points = player[0].points;
    }
    document.getElementById("playerRanks").innerHTML = getRank(player_points, currentmode);
    document.getElementById("playerPoints").innerHTML = numberWithCommas(player_points) + " Points";
    enableScrolling();
    if (document.getElementById("playerPoints").style.display === "none") {
      document.getElementById("playerPoints").style.display = "block";
    }
  })
}

function getPlayerInfo_table_globals_only(postTimes) {
  $("#TableTimes tr").remove();
  let row = document.getElementById("TableTimes").insertRow(-1);
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  let cell3 = row.insertCell(2);
  let cell4 = row.insertCell(3);
  let cell5 = row.insertCell(4);
  let cell6 = row.insertCell(5);
  row.id = "TableTitle";
  cell1.innerHTML = "Map Name";
  cell2.innerHTML = "Time";
  if (document.getElementById("showTimes").innerHTML === "Show Pro Times") {
    cell3.innerHTML = "TPs";
  }
  else {
    cell3.innerHTML = "";
  }
  cell4.innerHTML = "Points";
  cell5.innerHTML = "Server";
  cell6.innerHTML = "Date";
  count = 0;
  document.getElementById("showGlobalTimes").innerHTML = "Show All Times";
  for (i=0;i<postTimes.length;i++) {
    if (postTimes[i].map_id === -1) {
      continue;
    }
    if (count === 20) {
      count = 0;
      break;
    }
    let row = document.getElementById("TableTimes").insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);
    let cell6 = row.insertCell(5);

    cell1.parentNode.id = postTimes[i].map_name;
    cell1.innerHTML = "🏆 " + postTimes[i].map_name;
    cell2.innerHTML = timeConvert(postTimes[i].time);
    if (document.getElementById("showTimes").innerHTML === "Show Pro Times") {
      cell3.innerHTML = (postTimes[i].teleports > 1 ? postTimes[i].teleports + " TPs" : postTimes[i].teleports + " TP");
    }
    else {
      cell3.innerHTML = "";
    }
    cell4.innerHTML = postTimes[i].points;
    if (postTimes[i].server_name === null) {
      cell5.innerHTML = "NA";
    }
    else if (postTimes[i].server_name.length > 18) {
      cell5.innerHTML = postTimes[i].server_name.substr(0,15) + "...";
    } else {
      cell5.innerHTML = postTimes[i].server_name;
    }
    cell5.style.color = "#E45051";
    cell6.innerHTML = dateConvert(postTimes[i].created_on);
    count++;
  }
  enableScrolling();
  document.getElementById("pagination").style.display = "flex";
  $('td').click(function(event){
    if (event.target.parentNode.id === "TableTitle") {
      return;
    }
    document.getElementById("searchMap").value = event.target.parentNode.id;
    loadMap(document.getElementById("searchMap").value);
  });
}

function getPlayerInfo_table(postTimes) {
  $("#TableTimes tr").remove();
  let row = document.getElementById("TableTimes").insertRow(-1);
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);

  if (postTimes[0].teleports > 0) {
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);
    let cell6 = row.insertCell(5);
    row.id = "TableTitle";
    cell1.innerHTML = "Map Name";
    cell2.innerHTML = "Time";
    cell3.innerHTML = "TPs";
    cell4.innerHTML = "Points";
    cell5.innerHTML = "Server";
    cell6.innerHTML = "Date";
  } else {
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);
    let cell6 = row.insertCell(5);
    row.id = "TableTitle";
    cell1.innerHTML = "Map Name";
    cell2.innerHTML = "Time";
    cell3.innerHTML = "";
    cell4.innerHTML = "Points";
    cell5.innerHTML = "Server";
    cell6.innerHTML = "Date";
  }
  let count = 0;
  document.getElementById("showGlobalTimes").innerHTML = "Show Global Times";
  for (i=0;i<postTimes.length;i++) {
    if (postTimes[i].map_id === -1) {
      continue;
    }
    if (count === 20) {
      count = 0;
      break;
    }
    let row = document.getElementById("TableTimes").insertRow(-1);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);

    if (postTimes[0].teleports > 0) {
      let cell3 = row.insertCell(2);
      let cell4 = row.insertCell(3);
      let cell5 = row.insertCell(4);
      let cell6 = row.insertCell(5);

      cell1.parentNode.id = postTimes[i].map_name;
      if (postTimes[i].points === 1000) {
        cell1.innerHTML = "🏆 " + postTimes[i].map_name;
      }
      else {
        cell1.innerHTML = postTimes[i].map_name;
      }
      cell2.innerHTML = timeConvert(postTimes[i].time);
      cell3.innerHTML = (postTimes[i].teleports > 1 ? postTimes[i].teleports + " TPs" : postTimes[i].teleports + " TP");
      cell4.innerHTML = postTimes[i].points;


      if(postTimes[i].server_name === null) {
        cell5.innerHTML = "null";
      }
      else if (postTimes[i].server_name.length > 18) {
        cell5.innerHTML = postTimes[i].server_name.substr(0,15) + "...";
      } else {
        cell5.innerHTML = postTimes[i].server_name;
      }
      cell5.style.color = "#E45051"
      cell6.innerHTML = dateConvert(postTimes[i].created_on);
    }
    else {
      let cell3 = row.insertCell(2);
      let cell4 = row.insertCell(3);
      let cell5 = row.insertCell(4);
      let cell6 = row.insertCell(5);
      cell1.parentNode.id = postTimes[i].map_name;
      if (postTimes[i].points === 1000) {
        cell1.innerHTML = "🏆 " + postTimes[i].map_name;
      }
      else {
        cell1.innerHTML = postTimes[i].map_name;
      }
      cell2.innerHTML = timeConvert(postTimes[i].time);
      if (postTimes[i].points === 0) {
        cell4.innerHTML = "-";
      }
      else {
        cell4.innerHTML = postTimes[i].points;
      }
      if(postTimes[i].server_name === null) {
        cell5.innerHTML = "null";
      }
      else if (postTimes[i].server_name.length > 18) {
        cell5.innerHTML = postTimes[i].server_name.substr(0,15) + "...";
      } else {
        cell5.innerHTML = postTimes[i].server_name;
      }
      cell5.style.color = "#E45051"
      cell6.innerHTML = dateConvert(postTimes[i].created_on);
    }
    count++;
  }
  enableScrolling();
  document.getElementById("pagination").style.display = "flex";
  $('td').click(function(event){
    if (event.target.parentNode.id === "TableTitle") {
      return;
    }
    document.getElementById("searchMap").value = event.target.parentNode.id;
    loadMap(document.getElementById("searchMap").value);
  });
}

// Sort Player Info. Gets a specific map on a player's profile.
function sortPlayerInfo(map) {
  $("#TableTimes tr").remove();

  let row = document.getElementById("TableTimes").insertRow(-1);
  let cell1 = row.insertCell(0);
  let cell2 = row.insertCell(1);
  let cell3 = row.insertCell(2);
  let cell4 = row.insertCell(3);
  let cell5 = row.insertCell(4);
  let cell6 = row.insertCell(5);
  row.id = "TableTitle";
  cell1.innerHTML = "Map Name";
  cell2.innerHTML = "Time";
  if (document.getElementById("showTimes").innerHTML === "Show Pro Times") {
    cell3.innerHTML = "TPs";
  }
  else {
    cell3.innerHTML = "";
  }
  cell4.innerHTML = "Points";
  cell5.innerHTML = "Server";
  cell6.innerHTML = "Date";

  let tempcount = 0;

  for (i=0;i<postTimes.length;i++) {
    if (postTimes[i].map_name === null) {
      continue;
    }
    else if (postTimes[i].map_name.includes(map)) {

      let row = document.getElementById("TableTimes").insertRow(-1);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);
      let cell4 = row.insertCell(3);
      let cell5 = row.insertCell(4);
      let cell6 = row.insertCell(5);

      row.id = postTimes[i].map_name;
      if (postTimes[i].points === 1000) {
        cell1.innerHTML = "🏆 " + postTimes[i].map_name;
      }
      else {
        cell1.innerHTML = postTimes[i].map_name;
      }
      cell2.innerHTML = timeConvert(postTimes[i].time);
      if (document.getElementById("showTimes").innerHTML === "Show Pro Times") {
        cell3.innerHTML = (postTimes[i].teleports > 1 ? postTimes[i].teleports + " TPs" : postTimes[i].teleports + " TP");
      }
      else {
        cell3.innerHTML = "";
      }
      cell4.innerHTML = postTimes[i].points;
      cell5.innerHTML = (postTimes[i].server_name === null ? "null" : postTimes[i].server_name);
      cell5.style.color = "#E45051";
      cell6.innerHTML = dateConvert(postTimes[i].created_on);
      tempcount++;
      if (tempcount === 20) {
        break;
      }
    }
  }
  $('td').click(function(event){
    if (event.target.parentNode.id === "TableTitle") {
      return;
    }
    document.getElementById("searchMap").value = event.target.parentNode.id;
    loadMap(document.getElementById("searchMap").value);
  });
}

let link = "";

// Player Profile Function. Gets all the information for the player profile page.
function getPlayerInfo(url) {
  resetAll();
  disableScrolling();
  currentpage = 0;
  current_has_teleports = "false";
  document.getElementById("playerAvatar").innerHTML = "";
  document.getElementById("playerName").innerHTML = "";
  document.getElementById("playerPoints").style.display = "none";
  document.getElementById("displayTimes").style.display = "none";
  document.getElementById("displayMapTimes").style.display = "none";
  document.getElementById("searchPlayerInfo").style.display = "None";
  document.getElementById("NoPlayer").style.display = "none";
  document.getElementById("loading").style.opacity = 1;
  document.getElementById("loading").style.zIndex = 1;
  usedTimes = [];
  postTimes = [];

  $("#TableTimes tr").remove();
  $("#playerName a").remove();

  if (mode === "kz_simple") {
    document.getElementById("TitleLeaderboards").innerHTML = "Top 20 Players for SimpleKZ";
    resetModeColor();
    document.getElementById("mode-kz_simple-desktop").style.color = "orange";

  }
  else if (mode === "kz_timer") {
    document.getElementById("TitleLeaderboards").innerHTML = "Top 20 Players for KZTimer";
    resetModeColor();
    document.getElementById("mode-kz_timer-desktop").style.color = "orange";
  }
  else if (mode === "kz_vanilla") {
    document.getElementById("TitleLeaderboards").innerHTML = "Top 20 Players for Vanilla";
    resetModeColor();
    document.getElementById("mode-kz_vanilla-desktop").style.color = "orange";
  }

  $.ajax({
    url: url,
    success: function(playerInfo) {

      link = url;
      document.getElementById("loading").style.opacity = 0;
      document.getElementById("loading").style.zIndex = -1;

      if (url.includes("player_name") && !url.toLowerCase().includes(playerInfo[0].player_name.toLowerCase())) {
        document.getElementById("displayPlayerTimes").style.display = "none";
        document.getElementById("NoPlayer").style.display = "flex";
        return;
      }

      if (playerInfo.length === 0) {
        $("#TableTimes tr").remove();
        let row = document.getElementById("TableTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = "No Records Found";
        document.getElementById("playerName").innerHTML = "No Player Found";
        document.getElementById("playerProTimes").innerHTML = "No Times";
        return;
      }
      window.history.pushState('map', 'Map', '/?name=' + playerInfo[0].steam_id + '&mode=' + currentmode);
      document.getElementById("searchMap").value = playerInfo[0].steam_id;

      // Filters already seen maps
      for (i=0;i<playerInfo.length;i++) {
        if (playerInfo[i].steam_id !== playerInfo[0].steam_id) {
          continue;
        }
        if (usedTimes.includes(playerInfo[i].map_id)) {
          continue;
        }
        usedTimes.push(playerInfo[i].map_id);
        postTimes.push(playerInfo[i]);
      }
      checkLength(playerInfo[0]);
      document.getElementById("playerName").innerHTML = playerName;
      // Steam64. 64 bit JS magic. Takes from getPlayerStats.js
      steamid = (playerInfo[0].steam_id).split(":");
      steam64 = BigInteger(steamid[2]);
      steam64 = BigInteger(steam64.multiply(2).toString());
      if (steamid[1] === "1") {
        steamBigInt = BigInteger('76561197960265729');
      } else {
        steamBigInt = BigInteger('76561197960265728');
      }

      // Cloudflare Worker as a CORS proxy. Using until a functional backend is in place.
      fetch("https://gokzstats.jacobwbarrett.workers.dev/?http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=A4EA5418B4405A51E6A97415C408D3BE&steamids=" + steam64.add(steamBigInt).toString())
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        document.getElementById("playerAvatar").innerHTML = "<img src=" + data.response.players[0].avatarfull + "></img>";
      });

      document.getElementById("playerName").setAttribute("href", "https://steamcommunity.com/profiles/" + steam64.add(steamBigInt).toString());
      document.getElementById("playerName").setAttribute("target", "_blank");
      if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
        $('br').remove();
      }
      let fatarray = [];
      if (url.includes("teleports=true")) {
        uniquemaplist = 0;
        for (i=0;i<maplist.length;i++) {
          if (maplist[i].name.includes("kzpro")) {
            continue;
          }
          if (maplist[i].name.includes("skz_") && currentmode !== "kz_simple") {
            continue;
          }
          if (maplist[i].name.includes("vnl_") && currentmode !== "kz_vanilla") {
            continue;
          }
          fatarray.push(maplist[i].name);
          uniquemaplist++;
        }
        document.getElementById("playerProTimes").innerHTML = postTimes.length + " / " + uniquemaplist + " TP Times";
        document.getElementById("showTimes").innerHTML = "Show Pro Times";
      }
      else {
        uniquemaplist = 0;
        for (i=0;i<maplist.length;i++) {
          if (maplist[i].name.includes("skz_") && currentmode !== "kz_simple") {
            continue;
          }
          if (maplist[i].name.includes("vnl_") && currentmode !== "kz_vanilla") {
            continue;
          }
          uniquemaplist++;
        }
        document.getElementById("playerProTimes").innerHTML = postTimes.length + " / " + uniquemaplist + " Pro Times";
        document.getElementById("showTimes").innerHTML = "Show TP Times";
      }
      postTimes = sortArray(postTimes);
      getPlayerInfo_table(postTimes);

      steamid = (playerInfo[0].steam_id).split(":");
      steam64 = BigInteger(steamid[2]);
      steam64 = BigInteger(steam64.multiply(2).toString());
      if (steamid[1] === "1") {
        steamBigInt = BigInteger('76561197960265729');
      } else {
        steamBigInt = BigInteger('76561197960265728');
      }
      if (currentmode === "kz_timer") {
        map_mode = 200;
      }
      else if (currentmode === "kz_simple") {
        map_mode = 201;
      }
      else if (currentmode === "kz_vanilla") {
        map_mode = 202;
      }
      getPlayerPointsAndRanks("https://kztimerglobal.com/api/v1.0/player_ranks?steamid64s=" + steam64.add(steamBigInt).toString() + "&stages=0&mode_ids=" + map_mode + "&has_teleports=" + current_has_teleports + "&finishes_greater_than=0");

    },
    timeout: 8000,
    error: function(jqXHR, textStatus, errorThrown) {
      if(textStatus==="timeout") {
        console.log("Request has timed out.");
        getPlayerInfo(url); //Handle the timeout
      } else {
        console.log(errorThrown); //Handle other error type
        document.getElementById("errorloading").style.display = "flex";
      }
    }
  });
  document.getElementById("playerName").style.display = "flex";
  document.getElementById("displayTimes").style.display = "none";
  document.getElementById("displayMapTimes").style.display = "none";
  document.getElementById("pagination").style.display = "flex";
  document.getElementById("pagination").style.opacity = 1;
  document.getElementById("displayPlayerProfile").style.display = "flex";
  document.getElementById("displayPlayerTimes").style.display = "flex";
  document.getElementById("searchPlayerInfo").style.display = "block";
  document.getElementById("maps").style.display = "none";
  document.getElementById("playerLeaderboards").style.display = "none";
  document.getElementById("graph_container").style.display = "none";
  document.getElementById("button_container").style.display = "none";
  document.getElementById("wr_progression_button").style.display = "none";
  document.getElementById("map_graph").style.display = "none";
}

document.getElementById("showTimes").addEventListener("click", function() {
  // If on pro, swap to TP. Else go to pro.
  if(link.includes("teleports=false")) {
    getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=true&limit=1200&modes_list_string=" + currentmode);
    current_has_teleports = "true";
  }
  else {
    getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&&modes_list_string=" + currentmode);
    current_has_teleports = "false";
  }
});

document.getElementById("showGlobalTimes").addEventListener("click", function() {
  if (document.getElementById("showGlobalTimes").innerHTML === "Show All Times") {
    getPlayerInfo_table(postTimes);
  }
  else {
    globalTimes = [];
    for (i=0;i<postTimes.length;i++) {
      if (postTimes[i].points !== 1000) {
        continue;
      }
      globalTimes.push(postTimes[i]);
    }
    getPlayerInfo_table_globals_only(globalTimes);
  }
});

/* Leaderboard requires 4 parameters:
*  Mode: KZTimer, SimpleKZ, Vanilla are the current supported modes in the API
*  Type: Bhop, Combo, Tech, etc... are map types.
*  Has_Teleports: Either True of False. Decides if you want Pro or TP leaderboards.
*  Length: # of results to return.
*/
function Leaderboard(mode, type, has_teleports, length) {
  resetAll();
  disableScrolling();
  document.getElementById("loading").style.opacity = 1;
  document.getElementById("loading").style.zIndex = 1;
  document.getElementById("playerLeaderboards").style.display = "flex";

  if (length === 20) {
    document.getElementById("button_container_leaderboards").style.display = "flex";
    document.getElementById("show_more_leaderboards_button").style.display = "flex";
  }
  else {
    document.getElementById("button_container_leaderboards").style.display = "none";
    document.getElementById("show_more_leaderboards_button").style.display = "none";
  }


  $("tbody tr").remove();

  leaderboardmode_points = "https://kztimerglobal.com/api/v1.0/player_ranks?finishes_greater_than=0&stages=0&mode_ids=" + getmode_id(mode) + "&has_teleports=" + has_teleports + "&limit=" + length + "&mapTag=" + type;
  leaderboardmode_records = "https://kztimerglobal.com/api/v1.0/records/top/world_records?stages=0&mode_ids=" + getmode_id(mode) + "&tickrates=128&has_teleports=" + has_teleports + "&limit=" + length + "&mapTag=" + type;

  if (mode === "kz_simple") {
    document.getElementById("TitleLeaderboards").innerHTML = "Top 20 Players for SimpleKZ | ";
    document.getElementById("mode-kz_simple-desktop").style.color = "orange";
    document.getElementById("mode-kz_timer-desktop").style.color = "#E45051";
    document.getElementById("mode-kz_vanilla-desktop").style.color = "#E45051";

  }
  else if (mode === "kz_timer") {
    document.getElementById("TitleLeaderboards").innerHTML = "Top 20 Players for KZTimer | ";
    document.getElementById("mode-kz_simple-desktop").style.color = "#E45051";
    document.getElementById("mode-kz_timer-desktop").style.color = "orange";
    document.getElementById("mode-kz_vanilla-desktop").style.color = "#E45051";
  }
  else if (mode === "kz_vanilla") {
    document.getElementById("TitleLeaderboards").innerHTML = "Top 20 Players for Vanilla | ";
    document.getElementById("mode-kz_simple-desktop").style.color = "#E45051";
    document.getElementById("mode-kz_timer-desktop").style.color = "#E45051";
    document.getElementById("mode-kz_vanilla-desktop").style.color = "orange";
  }

  window.history.pushState('page', 'Page', '/?page=leaderboards' + '&mode=' + mode + '&type=' + type);

  $.ajax({
    url: leaderboardmode_points,
    success: function(recordsTop) {

      let row = document.getElementById("LeaderboardTables_points").insertRow(-1);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      let cell3 = row.insertCell(2);
      let cell4 = row.insertCell(3);

      row.id = "TableTitle";
      cell1.innerHTML = "#";
      cell2.innerHTML = "Player Name";
      cell3.innerHTML = "Average";
      cell4.innerHTML = "Points";

      let for_loop_length = (recordsTop.length > length ? length : recordsTop.length);

      for (i=0;i<for_loop_length;i++) {
        let row = document.getElementById("LeaderboardTables_points").insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);

        row.id = recordsTop[i].steamid;
        cell1.innerHTML = (i+1);
        cell2.id = recordsTop[i].steamid;
        checkLength(recordsTop[i]);
        cell2.innerHTML = playerName;
        cell3.innerHTML = toFixed(recordsTop[i].average,1);
        cell4.innerHTML = numberWithCommas(recordsTop[i].points);
      }

      $.ajax({
        url: leaderboardmode_records,
        success: function(recordsTop) {

          let row = document.getElementById("LeaderboardTables_records").insertRow(-1);
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          let cell3 = row.insertCell(2);

          row.id = "TableTitle";
          cell1.innerHTML = "#";
          cell2.innerHTML = "Player Name"
          cell3.innerHTML = "Records";

          let for_loop_length = (recordsTop.length > length ? length : recordsTop.length);

          for (i=0;i<for_loop_length;i++) {
            let row = document.getElementById("LeaderboardTables_records").insertRow(-1);
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let cell3 = row.insertCell(2);

            row.id = recordsTop[i].steam_id;
            cell1.innerHTML = (i+1);
            cell2.id = recordsTop[i].steam_id;
            checkLength(recordsTop[i]);
            cell2.innerHTML = playerName;
            cell3.innerHTML = recordsTop[i].count;
          }
          enableScrolling();
          document.getElementById("loading").style.opacity = 0;
          document.getElementById("loading").style.zIndex = -1;
          $('td').click(function(event){
            if (event.target.parentNode.id.includes("STEAM_")) {
              document.getElementById("searchMap").value = event.target.parentNode.id;
              getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + event.target.parentNode.id + "&tickrate=128&stage=0&has_teleports=false&limit=1200&&place_top_at_least=20&modes_list_string=" + currentmode);
            }
          });
        }
      });
    }
  });
}

// Map Times
function loadMap(map) {
  resetAll();
  let nocompleteTP;
  let nocompletePro;
  disableScrolling();
  $("#TableProTimes tr").remove();
  $("#TableOverallTimes tr").remove();
  currentpage = 0;
  currentmap = map;
  document.getElementById("maps").style.display = "none";
  document.getElementById("loading").style.opacity = 1;
  document.getElementById("loading").style.zIndex = 1;
  document.getElementById("previous").style.background = "#E45051";
  document.getElementById("next").style.background = "#212121";
  document.getElementById("maps").style.display = "none";
  document.getElementById("displayPlayerProfile").style.display = "none";
  document.getElementById("playerLeaderboards").style.display = "none";
  document.getElementById("graph_container").style.display = "flex";
  document.getElementById("button_container").style.display = "flex";
  document.getElementById("displayMapData").style.display = "flex";

  document.getElementById("MapData-Image").src = "";
  document.getElementById("MapData-Name").innerHTML = "NA";
  document.getElementById("MapData-ProWR").innerHTML = "<span style='display: inline-block; width:35px;'>" + "Pro " + "</span>" + "NA";
  document.getElementById("MapData-TPWR").innerHTML = "<span style='display: inline-block; width:35px;'>" + "TP " + "</span>" + "NA";


  if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))) {
    document.getElementById("wr_progression_button").style.display = "flex";
    document.getElementById("MapData-Text").style.display = "flex";
  }
  else {
    document.getElementById("MapData-Text").style.display = "none";
  }
  searchMapName = map.toLowerCase();
  document.getElementById("searchMap").value = searchMapName;

  let searchUrlPro;
  let searchUrlTP;

  if (document.getElementById("searchMap").value.length > 0) {
    for (i=0;i<maplist.length;i++) {
      if (maplist[i].name.includes(searchMapName)) {
        searchMapName = maplist[i].name;
        document.getElementById("searchMap").value = maplist[i].name;
        searchUrlPro = kz_loadmap + "&map_id=" + maplist[i].id + "&stage=0&has_teleports=false&limit=100&tickrate=128";
        searchUrlTP = kz_loadmap + "&map_id=" + maplist[i].id + "&stage=0&has_teleports=true&limit=100&tickrate=128";
        break;
      }
    }
    window.history.pushState('map', 'Map', '/?map=' + searchMapName + '&mode=' + currentmode);

    if (mode === "kz_simple") {
      resetModeColor();
      document.getElementById("mode-kz_simple-desktop").style.color = "orange";

    }
    else if (mode === "kz_timer") {
      resetModeColor();
      document.getElementById("mode-kz_timer-desktop").style.color = "orange";
    }
    else if (mode === "kz_vanilla") {
      resetModeColor();
      document.getElementById("mode-kz_vanilla-desktop").style.color = "orange";
    }

    $.ajax({
      url: searchUrlTP,
      success: function(mapTP) {
        mapRecentTimes = mapTP.slice();
        let position = 0;

        if (mapTP.length === 0) {
          let row = document.getElementById("TableOverallTimes").insertRow(-1);
          let cell1 = row.insertCell(0);
          cell1.id = "DisableRight";
          cell1.innerHTML = "No Records Found";
          document.getElementById("displayTimes").style.display = "none";
          document.getElementById("displayMapTimes").style.display = "flex";
          document.getElementById("MapData-Name").innerHTML = searchMapName;
          document.getElementById("MapData-Image").src = "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + searchMapName + ".jpg";
          document.getElementById("loading").style.zIndex = -1;
          document.getElementById("loading").style.opacity = 0;
          return;
        }
        let numberOfTPTimes = (mapTP.length < 20 ? mapTP.length : 20)

        let row = document.getElementById("TableOverallTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);
        let cell7 = row.insertCell(6);
        row.id = "TableTitle";
        cell1.innerHTML = "#";
        cell2.innerHTML = "Player";
        cell3.innerHTML = "Time";
        cell4.innerHTML = "Teleports";
        cell5.innerHTML = "Points";
        cell6.innerHTML = "Server";
        cell7.innerHTML = "Date";

        document.getElementById("MapData-TPWR").innerHTML = "<span style='display: inline-block; width:35px;'>" + "TP " + "</span>" + "<span style='color:#E45051'>" + timeConvert(mapTP[0].time) + "</span>" + " by " + "<span style='color:#E45051'>" + mapTP[0].player_name + "</span>";
        document.getElementById("MapData-Name").innerHTML = mapTP[0].map_name;
        document.getElementById("MapData-Image").src = "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + mapTP[0].map_name + ".jpg";

        for (i=0;i<numberOfTPTimes;i++) {
          if (mapTP[i].map_name !== searchMapName) {
            let row = document.getElementById("TableOverallTimes").insertRow(-1);
            let cell1 = row.insertCell(0);
            cell1.innerHTML = "Invalid Map Name";
            document.getElementById("displayTimes").style.display = "none";
            document.getElementById("displayMapData").style.display = "flex";
            document.getElementById("displayMapTimes").style.display = "flex";
            break;
          }
          position++;
          checkLength(mapTP[i]);
          let row = document.getElementById("TableOverallTimes").insertRow(-1);
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          let cell3 = row.insertCell(2);
          let cell4 = row.insertCell(3);
          let cell5 = row.insertCell(4);
          let cell6 = row.insertCell(5);
          let cell7 = row.insertCell(6);

          row.id = mapTP[i].steam_id;
          cell2.id = "name";
          cell2.innerHTML = playerName;
          cell3.innerHTML = timeConvert(mapTP[i].time);

          if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))) {
            cell1.innerHTML = position;
            cell4.innerHTML = mapTP[i].teleports + " TPs";
            cell5.innerHTML = mapTP[i].points;
            if (mapTP[i].server_name === null) {
              cell6.innerHTML = "null";
            }
            else if (mapTP[i].server_name.length > 18) {
              cell6.innerHTML = mapTP[i].server_name.substr(0,15) + "...";
            } else {
              cell6.innerHTML = mapTP[i].server_name;
            }
            cell7.innerHTML = dateConvert(mapTP[i].created_on);
          } else {
            cell4.innerHTML = mapTP[i].teleports;
          }
          document.getElementById("displayTimes").style.display = "none";
          document.getElementById("displayMapData").style.display = "flex";
          document.getElementById("displayMapTimes").style.display = "flex";

        }
        enableScrolling();
        document.getElementById("pagination").style.display = "flex";
        setTimeout(function(){
          document.getElementById("loading").style.zIndex = -1;
          document.getElementById("loading").style.opacity = 0;
        }, 500);
        $('td').click(function(event){
          if (event.target.parentNode.id.includes("STEAM_") && event.target.parentNode.parentNode.parentNode.id === "TableOverallTimes") {
            document.getElementById("searchMap").value = event.target.parentNode.id;
            getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + event.target.parentNode.id + "&tickrate=128&stage=0&has_teleports=false&limit=1200&place_top_at_least=20&modes_list_string=" + currentmode);
          }
        });
      }
    });
    $.ajax({
      url: searchUrlPro,
      success: function(mapPro) {
        mapProTimes = mapPro.slice();
        let position = 0;

        if (mapPro.length === 0) {
          let row = document.getElementById("TableProTimes").insertRow(-1);
          let cell1 = row.insertCell(0);
          cell1.id = "DisableRight";
          cell1.innerHTML = "No Records Found";
          document.getElementById("displayTimes").style.display = "none";
          document.getElementById("displayMapTimes").style.display = "flex";
          document.getElementById("loading").style.zIndex = -1;
          document.getElementById("loading").style.opacity = 0;
          return;
        }
        let numberOfProTimes = (mapPro.length < 20 ? mapPro.length : 20);

        let row = document.getElementById("TableProTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);
        row.id = "TableTitle";
        cell1.innerHTML = "#";
        cell2.innerHTML = "Player";
        cell3.innerHTML = "Time";
        cell4.innerHTML = "Points";
        cell5.innerHTML = "Server";
        cell6.innerHTML = "Date";

        document.getElementById("MapData-ProWR").innerHTML = "<span style='display: inline-block; width:35px;'>" + "Pro " + "</span>" + "<span style='color:#E45051'>" + timeConvert(mapPro[0].time) + "</span>" + " by " + "<span style='color:#E45051'>" + mapPro[0].player_name + "</span>";
        document.getElementById("MapData-Name").innerHTML = mapPro[0].map_name;
        document.getElementById("MapData-Image").src = "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + mapPro[0].map_name + ".jpg";

        if (mapPro[0].server_name === "KZTimer Legacy DB") {
          document.getElementById("wr_progression_button").style.display = "none";
        }

        for (i=0;i<numberOfProTimes;i++) {
          if (mapPro[i].map_name !== searchMapName) {
            let row = document.getElementById("TableProTimes").insertRow(-1);
            let cell1 = row.insertCell(0);
            cell1.innerHTML = "Invalid Map Name";
            document.getElementById("displayTimes").style.display = "none";
            document.getElementById("displayMapTimes").style.display = "flex";
            break;
          }
          position++;
          checkLength(mapPro[i]);
          let row = document.getElementById("TableProTimes").insertRow(-1);
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          let cell3 = row.insertCell(2);
          let cell4 = row.insertCell(3);
          let cell5 = row.insertCell(4);
          row.id = mapPro[i].steam_id;
          cell1.innerHTML = position;
          cell2.id = "name";
          cell2.innerHTML = playerName;
          cell3.innerHTML = timeConvert(mapPro[i].time);
          if (mapPro[i].points === 0) {
            cell4.innerHTML = "-";
          }
          else {
            cell4.innerHTML = mapPro[i].points;
          }
          if (mapPro[i].server_name === null) {
            cell5.innerHTML = "null";
          }
          else if (mapPro[i].server_name.length > 18) {
            cell5.innerHTML = mapPro[i].server_name.substr(0,15) + "...";
          } else {
            cell5.innerHTML = mapPro[i].server_name;
          }
          let cell6 = row.insertCell(5);
          cell6.innerHTML = dateConvert(mapPro[i].created_on);
          document.getElementById("displayTimes").style.display = "none";
          document.getElementById("displayMapTimes").style.display = "flex";
        }
        setTimeout(function(){
          document.getElementById("loading").style.zIndex = -1;
          document.getElementById("loading").style.opacity = 0;
        }, 500);
        enableScrolling();
        document.getElementById("pagination").style.display = "flex";
        $('td').click(function(event){
          if (event.target.parentNode.id.includes("STEAM_") && event.target.parentNode.parentNode.parentNode.id === "TableProTimes") {
            document.getElementById("searchMap").value = event.target.parentNode.id;
            getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + event.target.parentNode.id + "&tickrate=128&stage=0&has_teleports=false&limit=1200&place_top_at_least=20&modes_list_string=" + currentmode);
          }
        });
      }
    });
  }
}

function getRecent() {
  let records;
  xhr2 = $.ajax({
    url: recordsUrl,
    success: function(records) {
      document.getElementById("displayTimes").style.display === "flex";
      mostRecentTimes = [];
      // Hides broken times
      for(i=0;i<records.length;i++) {
        if(records[i].time < 14) { continue; }
        mostRecentTimes.push(records[i]);
      }

      mostRecentTimes = sortArray(mostRecentTimes);
      forSize = (records.length < 5 ? records.length : 5);

      for (i=0;i<forSize;i++) {
        if (document.getElementsByClassName("recent_runs").length >= 5) {
          break;
        }
        checkLength(mostRecentTimes[i])
        const ReadableTime = (mostRecentTimes[i].updated_on).split("T");
        const $map_div = $("<div>", {id: mostRecentTimes[i].map_name, "class": "map_div recent_runs"});

        $map_div.append("<img src=" + "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + mostRecentTimes[i].map_name + ".jpg>" + "<span style='color: white;'>" + mostRecentTimes[i].map_name + " <br>" + playerName + "<br>" + "<div>" + (mostRecentTimes[i].top_100 === 0 ? "NA" : '#' + mostRecentTimes[i].top_100) + "</div>" + " | " + "<div>" + timeConvert(mostRecentTimes[i].time) + "</div><br>" + mostRecentTimes[i].teleports + " TPs" + "</span>");
        // This was created by Chuckles to help with selecting maps for users. Extremely useful as most users tend to not use their keyboard in 2018.
        $map_div.click(function(event){
          if (event.target.parentNode.id.includes("_")) {
            document.getElementById("searchMap").value = event.target.parentNode.id;
            loadMap(document.getElementById("searchMap").value);
          }
        });
        $("#recentTimes").append($map_div);
        if (document.getElementsByClassName("pro_runs").length == 5 && document.getElementsByClassName("recent_runs").length == 5) {
          setTimeout(function(){ document.getElementById("loading").style.zIndex = -1; }, 1000);
          setTimeout(function(){ document.getElementById("loading").style.opacity = 0; }, 500);
        }
      }
      enableScrolling();
    },
    timeout: 16000,
    error: function(jqXHR, textStatus, errorThrown) {
      if(textStatus==="timeout") {
        console.log("Request has timed out.");
        xhr2.abort();
        getRecent(); //Handle the timeout
      }
      else if (errorThrown === "abort") {
      }
      else {
        console.log(errorThrown); //Handle other error type
        document.getElementById("errorloading").innerHTML = errorThrown + ". Please try again in a few minutes.";
        document.getElementById("errorloading").style.display = "flex";
      }
    }
  });
}

function getLatest() {

  let recordsTop;
  xhr = $.ajax({
    url: recordsTopUrl,
    success: function(response) {
      recordsTop = response;

      mostRecentTopTimes = [];
      usedTopTimes = [];
      mostRecentTopTimesFiltered = [];

      for(i=0;i<recordsTop.length;i++) {
        mostRecentTopTimes.push(recordsTop[i]);
      }

      for (i=0;i<mostRecentTopTimes.length;i++) {
        if (usedTopTimes.includes(mostRecentTopTimes[i].map_id)) {
          continue;
        }
        mostRecentTopTimesFiltered.push(mostRecentTopTimes[i]);
        usedTopTimes.push(mostRecentTopTimes[i].map_id);
      }
      mostRecentTopTimesFiltered = sortArray(mostRecentTopTimesFiltered);

      for (m=0;m<5;m++) {
        if (document.getElementsByClassName("pro_runs").length >= 5) {
          break;
        }
        if (m >= mostRecentTopTimesFiltered.length) {
          break;
        }

        checkLength(mostRecentTopTimesFiltered[m]);

        const ReadableTime = (mostRecentTopTimesFiltered[m].updated_on).split("T");
        const $map_div = $("<div>", {id: mostRecentTopTimesFiltered[m].map_name, "class": "map_div pro_runs"});

        $map_div.append("<img src=" + "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + mostRecentTopTimesFiltered[m].map_name + ".jpg>" + "<span style='color: white;'>" + mostRecentTopTimesFiltered[m].map_name + "<br>" + playerName + "<br>" + "<div>" + timeConvert(mostRecentTopTimesFiltered[m].time) + "</div>" + "<br>" + "<div style='color: white; font-size: 90%; font-style: italic'>" + getTimeDifference(mostRecentTopTimesFiltered[m].created_on) + "</div>" + "</span>");
        $map_div.click(function(event){
          if (event.target.parentNode.id.includes("_")) {
            document.getElementById("searchMap").value = event.target.parentNode.id;
            loadMap(document.getElementById("searchMap").value);
          }
        });
        $("#topTimes").append($map_div);
        if (document.getElementsByClassName("pro_runs").length == 5 && document.getElementsByClassName("recent_runs").length == 5) {
          setTimeout(function(){ document.getElementById("loading").style.zIndex = -1; }, 1000);
          setTimeout(function(){ document.getElementById("loading").style.opacity = 0; }, 500);
        }
      }
      enableScrolling();
    },
    timeout: 16000,
    error: function(jqXHR, textStatus, errorThrown) {
      if(textStatus==="timeout") {
        console.log("Request has timed out.");
        xhr.abort();
        getLatest(); //Handle the timeout
      }
      else if (errorThrown === "abort") {
      }
      else {
        console.log(errorThrown); //Handle other error type
        document.getElementById("errorloading").innerHTML = errorThrown + ". Please try again in a few minutes.";
        document.getElementById("errorloading").style.display = "flex";
      }
    }
  });
}

function recentAndLatest() {
  resetAll();
  disableScrolling();
  document.getElementById("loading").style.opacity = 1;
  document.getElementById("loading").style.zIndex = 1;
  document.getElementById("displayTimes").style.display = "flex";
  document.getElementById("pagination").style.display = "flex";
  currentpage = 0;
  document.getElementById("previous").style.background = "#E45051";
  document.getElementById("next").style.background = "#212121";
  //window.history.pushState('home', 'Home', '/kreedz/gokzstats_dev.html');
  window.history.pushState('home', 'Home', '/');
  getRecent();
  getLatest();
}

/* Burr stuff */

let c,d,loc,scale;
arrayX = [];
arrayY = [];
arrayX2 = [];
arrayY2 = [];
maplist = [];
let map_id;
let trace1;
let trace2;
let minPoints = 0.1;

function fmtMSS(s){
  return(s-(s%=60))/60+(9<s?':':':0')+s.toFixed(2);
}

function convertUTCDateToLocalDate(date) {
  let newDate = new Date(new Date(date).getTime() - new Date(date).getTimezoneOffset()*60000);
  return newDate;
}

function showWRProgression(map) {
  arrayX = [];
  arrayY = [];
  arrayX2 = [];
  arrayY2 = [];
  arrayY3 = [];


  fetch('https://kztimerglobal.com/api/v1.0/maps?name=' + map)
  .then(function(response) {
    return response.json();
  })
  .then(function(map) {
    map_id = map[0].id;
  })
  .then(() => {
    if (currentmode === "kz_timer") {
      map_mode = 200;
    }
    else if (currentmode === "kz_simple") {
      map_mode = 201;
    }
    else if (currentmode === "kz_vanilla") {
      map_mode = 202;
    }
    let trace1 = [], arrayX = [], arrayY = [], arrayY2 = [], arrayYFix = [], hover = [];
    fetch("https://kztimerglobal.com/api/v1.0/records/top/recent?map_id=" + map_id + "&has_teleports=false&tickrate=128&stage=0&modes_list_string=" + currentmode + "&place_top_at_least=1")
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.length === 0) {
        return;
      }

      data.sort(function(a, b) {
        return (new Date(b.created_on).getTime() - new Date(a.created_on).getTime());
      });


      arrayX.push(new Date());
      arrayY.push(data[0].time);
      arrayY2.push(fmtMSS(data[0].time));
      hover.push(data[0].player_name + "<br>" + timeConvert(data[0].time));

      let previous = (new Date(data[0].created_on).getTime());
      let previoustime = data[0].time;
      for(i=0;i<data.length;i++) {
        if (new Date(data[i].created_on).getTime() < previous) {
          if (data[i].time < previoustime) {
            continue;
          }
          previous = new Date(data[i].created_on).getTime();
          previoustime = data[i].time;
        }
        arrayX.push(convertUTCDateToLocalDate(data[i].created_on));
        arrayY.push(data[i].time);
        arrayY2.push(fmtMSS(data[i].time));
        arrayY3.push(timeConvert(data[i].time));
        hover.push(data[i].player_name + "<br>" + timeConvert(data[i].time));
      }

      trace1 = {
        x: arrayX,
        y: arrayY,
        name: "WR Progression",
        type: "scatter",
        hoverinfo: "text+x",
        hovertext: hover,
        hoverlabel: {
          bgcolor: "#191919",
        },
        line: {
          shape: 'vh',
          color: "#E45051",
        },
      }

      let list = [];
      let listtext = [];
      let increment = arrayY[arrayY.length -1] - arrayY[0];
      for (i=arrayY[0];i<arrayY[arrayY.length-1];i+=(increment/11)) {
        list.push(i);
        listtext.push(timeConvert(i));
      }


      let layout = {
        title: 'World Record Progression for ' + data[0].map_name + " on " + getmode_name(data[0].mode),
        yaxis: {
          autorange: true,
          gridcolor: "#424242",
          title: 'Time',
          ticks: 'outside',
          tickmode: 'array',
          tickvals: list,
          ticktext: listtext,
          tick0: 0,
          ticklen: 8,
          tickwidth: 1,
          tickcolor: "#E45051",
        },
        xaxis: {
          autorange: true,
          title: 'Date',
          gridcolor: "#424242",
        },
        paper_bgcolor: "#191919",
        plot_bgcolor: "#191919",
        font: {
          color: "#FFFFFF"
        },
        modebar: {
          orientation: "v",
        }
      }

      Plotly.newPlot('map_graph', [trace1], layout);
      document.getElementById("button_container").style.display = "none";
      document.getElementById('graph_container').style.display = "flex";
      document.getElementById('map_graph').style.display = "flex";
    });
  });
}


function burr(c,d) {
  for (i=0;i<10000;i++) {
    t = ((i - loc) / scale)

    //We're doing this calc twice, which is bad.  Once in perc and once here.  combine
    let score = Math.pow(1 + Math.pow(t,c),-d);
    if(score < minPoints){
      break;
    }

    arrayX2.push(i);
    arrayY2.push((c*d*Math.pow(t,c-1)) * Math.pow(1+Math.pow(t,c),-d-1) / scale)
  }

  trace1 = {
    x: arrayX2,
    y: arrayY2,
    name: "burr",
    type: "scatter"
  }
}

function perc(c,k,top_scale) {
  for (i=0;i<10000;i++) {
    t = ((i - loc) / scale);

    let percentile = Math.pow(1 + Math.pow(t,c),-d);
    if(percentile < minPoints){
      break;
    }
    arrayX.push(i);
    top_scale_fix = Math.pow(1 + Math.pow(t,c),-d)*top_scale;
    bigger_top_scale_fix = (top_scale_fix > 1 ? top_scale_fix = 1 : top_scale_fix);
    arrayY.push(bigger_top_scale_fix);
    //arrayY.push(Math.pow(1 + Math.pow(t,c),-d))
  }
  trace2 = {
    x: arrayX,
    y: arrayY,
    name: "percentile",
    yaxis: 'y2',
    type: "scatter"
  };
}

/**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************
**************************************************************************************************************************/

function showLeaderboards() {
  if (typeof(currenttype) === "undefined") {
    currenttype = "overall";

    if (typeof(currentmode) === "undefined") {
      currentmode = "kz_simple";
      window.history.pushState('page', 'Page', '/?page=leaderboards' + '&mode=' + currentmode + '&type=' + currenttype);
      Leaderboard(currentmode,currenttype, current_has_teleports, 20);
    }
    else {
      window.history.pushState('page', 'Page', '/?page=leaderboards' + '&mode=' + currentmode + '&type=' + currenttype);
      Leaderboard(currentmode,currenttype, current_has_teleports, 20);
    }
  }
  else {
    if (typeof(currentmode) === "undefined") {
      currentmode = "kz_simple";
      window.history.pushState('page', 'Page', '/?page=leaderboards' + '&mode=' + currentmode + '&type=' + currenttype);
      Leaderboard(currentmode,currenttype, current_has_teleports, 20);
    }
    else {
      window.history.pushState('page', 'Page', '/?page=leaderboards' + '&mode=' + currentmode + '&type=' + currenttype);
      Leaderboard(currentmode,currenttype, current_has_teleports, 20);
    }
  }
}

function showBans() {
  document.getElementById("searchMap").value = "";
  document.getElementById("playerBans").style.display = "flex";
  document.getElementById("playerBanInfo").style.display = "none";
  document.getElementById("maps").style.display = "none";
  document.getElementById("playerLeaderboards").style.display = "none";
  document.getElementById("displayMapTimes").style.display = "none";
  document.getElementById("displayTimes").style.display = "none";
  document.getElementById("displayPlayerProfile").style.display = "none";
  document.getElementById("pagination").style.display = "none";
  document.getElementById("graph_container").style.display = "none";
  document.getElementById("button_container").style.display = "none";
  document.getElementById("wr_progression_button").style.display = "none";
  getBans(0);
}

function showMaps() {
  document.getElementById("searchMap").value = "";
  document.getElementById("playerBans").style.display = "none";
  document.getElementById("playerBanInfo").style.display = "none";
  document.getElementById("playerLeaderboards").style.display = "none";
  document.getElementById("displayMapTimes").style.display = "none";
  document.getElementById("displayTimes").style.display = "none";
  document.getElementById("displayPlayerProfile").style.display = "none";
  document.getElementById("maps").style.display = "flex";
  document.getElementById("pagination").style.display = "flex";
  document.getElementById("graph_container").style.display = "none";
  document.getElementById("button_container").style.display = "none";
  document.getElementById("wr_progression_button").style.display = "none";
  window.history.pushState('page', 'Page', '/?page=maps');
  getMaps(0);
}

function toggle(object) {
  object.disabled = true;
  setTimeout(function() {
    object.disabled = false;
  }, 500);
}

function delete_recent_and_wr() {
  let recentTimesNodes = document.getElementById("recentTimes")
  let worldRecordsNodes = document.getElementById("topTimes");
  while (recentTimesNodes.childNodes.length !== 3) {
    recentTimesNodes.removeChild(recentTimesNodes.lastChild);
  }
  while (worldRecordsNodes.childNodes.length !== 3) {
    worldRecordsNodes.removeChild(worldRecordsNodes.lastChild);
  }
}

function delete_maps_from_map_list() {
  let listofmaps = document.getElementsByClassName("maps_page_list");
  while (listofmaps[0]) {
    listofmaps[0].parentNode.removeChild(listofmaps[0]);
  }
}

window.onload = function() {

  window.history.replaceState(state, null, "");

  // This allows a user to link to a direct map. Used in the discord bot.
  // Example: gokzstats.com/?map=kz_beginnerblock_go
  if (/Edge\/\d./i.test(navigator.userAgent)){
    // Microsoft Edge does not support searchParams.get. This just skips everything if you're on edge.
  } else {
    const url = new URL(document.location);
    page = url.searchParams.get("page") || "empty";
    name = url.searchParams.get("name") || "empty";
    map = url.searchParams.get("map") || "empty";
    mode = url.searchParams.get("mode") || "empty";
    type = url.searchParams.get("type") || "empty";

    if (mode !== "empty") {
      currentmode = mode;
    }
    if (type !== "empty") {
      currenttype = type;

      document.getElementById("LeaderBoardOptions_overall").style.color = '#E45051';
      document.getElementById("LeaderBoardOptions_" + currenttype).style.color = "orange";
    }
    else if (type === "empty") {
      document.getElementById("LeaderBoardOptions_overall").style.color = 'orange';
    }
    if (page !== "empty") {
      if (page === "leaderboards" || page === "leaderboard") {
        window.history.pushState('page', 'Page', '/?page=leaderboards' + '&mode=' + currentmode + '&type=' + type);
        showLeaderboards();
      }
      if (page === "bans" || page === "Bans") {
        window.history.pushState('page', 'Page', '/?page=bans');
        showBans();
      }
      if (page === "maps" || page === "Maps") {
        window.history.pushState('page', 'Page', '/?page=maps');
        setTimeout(function() {
          showMaps();
        }, 1000);
      }
    }
    if (map !== "empty") {
      document.getElementById("searchMap").value = map;
      setTimeout(function() {
        loadMap(document.getElementById("searchMap").value);
        document.getElementById("displayMapTimes").style.display = "flex";
        document.getElementById("displayTimes").style.display = "none";
      }, 500);
    }
    if (name !== "empty") {
      document.getElementById("searchMap").value = name;
      setTimeout(function() {
        if (name.startsWith("STEAM")) {
          getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&modes_list_string=" + currentmode);
        }
        else {
          getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?player_name=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&modes_list_string=" + currentmode);
        }
        document.getElementById("displayPlayerTimes").style.display = "flex";
        document.getElementById("displayMapTimes").style.display = "none";
        document.getElementById("displayTimes").style.display = "none";
      });
    }
  }

  // Resets to main page if no text being searched.
  document.getElementById("searchMap").addEventListener("input", function() {
    if (!this.value && document.getElementById("displayMapTimes").style.display === "flex") {
      document.getElementById("displayMapTimes").style.display = "none";
      document.getElementById("displayTimes").style.display = "flex";
      document.getElementById("displayPlayerProfile").style.display = "none";
      document.getElementById("playerLeaderboards").style.display = "none";
      // This deletes every .map_div on the page
      delete_recent_and_wr();
    }
  });

  document.getElementById("LeaderBoardOptions_tech").addEventListener("click", function() {
    resetMapTags();
    document.getElementById("LeaderBoardOptions_tech").style.color = "orange";
    currenttype = "tech";
    Leaderboard(currentmode,currenttype, current_has_teleports, 20);
  });
  document.getElementById("LeaderBoardOptions_bhop").addEventListener("click", function() {
    resetMapTags();
    document.getElementById("LeaderBoardOptions_bhop").style.color = "orange";
    currenttype = "bhop";
    Leaderboard(currentmode,currenttype, current_has_teleports, 20);
  });
  document.getElementById("LeaderBoardOptions_climb").addEventListener("click", function() {
    resetMapTags();
    document.getElementById("LeaderBoardOptions_climb").style.color = "orange";
    currenttype = "climb";
    Leaderboard(currentmode,currenttype, current_has_teleports, 20);
  });
  document.getElementById("LeaderBoardOptions_combo").addEventListener("click", function() {
    resetMapTags();
    document.getElementById("LeaderBoardOptions_combo").style.color = "orange";
    currenttype = "combo";
    Leaderboard(currentmode,currenttype, current_has_teleports, 20);
  });
  document.getElementById("LeaderBoardOptions_overall").addEventListener("click", function() {
    resetMapTags();
    document.getElementById("LeaderBoardOptions_overall").style.color = 'orange';
    currenttype = "overall";
    Leaderboard(currentmode,currenttype, current_has_teleports, 20);
  });



  // Vanilla
  document.getElementById("mode-kz_vanilla-desktop").addEventListener("click", function() {
    if (xhr !== undefined) {
      xhr.abort();
    }

    if (xhr2 !== undefined) {
      xhr2.abort();
    }

    recordsUrl = kz_vanillaRecords;
    recordsTopUrl = kz_vanillaTopRecords;
    kz_loadmap = kz_vanillaLoadMap;
    currenttype = "overall";

    // Sets Vanilla color, reset other modes
    resetModeColor();
    document.getElementById("mode-kz_vanilla-desktop").style.color = "orange";

    resetMapTags()
    document.getElementById("LeaderBoardOptions_overall").style.color = 'orange';

    // Leaderboards (Vanilla)
    if (document.getElementById("playerBans").style.display === "flex") {
      $("#TableTimes tr").remove();
      $("#TableTimes td").remove();
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    }


    if (currentmode === "kz_vanilla" && document.getElementById("playerLeaderboards").style.display === "flex") {
      $("#TableTimes tr").remove();
      $("#TableTimes td").remove();
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    } else if (currentmode !== "kz_vanilla" && document.getElementById("playerLeaderboards").style.display === "flex") {
      currentmode = "kz_vanilla";
      showLeaderboards();
      return;
    }

    // Player Profiles (Vanilla)
    if (currentmode === "kz_vanilla" && document.getElementById("displayPlayerProfile").style.display === "flex") {
      $("#TableTimes tr").remove();
      $("#TableTimes td").remove();
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    }

    // Map Times (Vanilla)
    if (currentmode === "kz_vanilla" && document.getElementById("displayMapTimes").style.display === "flex") {
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    }
    delete_recent_and_wr();

    // Pagination
    currentmode = "kz_vanilla";
    currentpage = 0;
    document.getElementById('graph_container').style.display = "none";
    document.getElementById('map_graph').style.display = "none";
    document.getElementById("previous").style.background = "#E45051";

    if (document.getElementById("searchMap").value.length > 0) {
      if (document.getElementById("searchMap").value.startsWith("kz_") ||
      document.getElementById("searchMap").value.startsWith("bkz_") ||
      document.getElementById("searchMap").value.startsWith("xc_") ||
      document.getElementById("searchMap").value.startsWith("skz_"))
      {
        loadMap(document.getElementById("searchMap").value);
        document.getElementById("displayMapTimes").style.display = "flex";
        document.getElementById("displayTimes").style.display = "none";
      }
      else if (document.getElementById("searchMap").value.toLowerCase().startsWith("steam")) {
        getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&modes_list_string=" + currentmode);
        return;
      }
      else {
        getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?player_name=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&modes_list_string=" + currentmode);
        return;
      }
    } else {
      resetAll();
      recentAndLatest();
    }
  });

  // SimpleKZ
  document.getElementById("mode-kz_simple-desktop").addEventListener("click", function() {
    if (xhr !== undefined) {
      xhr.abort();
    }

    if (xhr2 !== undefined) {
      xhr2.abort();
    }

    recordsUrl = kz_simpleRecords;
    recordsTopUrl = kz_simpleTopRecords;
    kz_loadmap = kz_simpleLoadMap;
    currenttype = "overall";

    // Sets SimpleKZ color, reset other modes
    resetModeColor();
    document.getElementById("mode-kz_simple-desktop").style.color = "orange";

    resetMapTags()
    document.getElementById("LeaderBoardOptions_overall").style.color = 'orange';

    // Leaderboards (SimpleKZ)
    if (document.getElementById("playerBans").style.display === "flex") {
      $("#TableTimes tr").remove();
      $("#TableTimes td").remove();
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    }


    if (currentmode === "kz_simple" && document.getElementById("playerLeaderboards").style.display === "flex") {
      $("#TableTimes tr").remove();
      $("#TableTimes td").remove();
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    } else if (currentmode !== "kz_simple" && document.getElementById("playerLeaderboards").style.display === "flex") {
      currentmode = "kz_simple";
      showLeaderboards();
      return;
    }

    // Player Profiles (SimpleKZ)
    if (currentmode === "kz_simple" && document.getElementById("displayPlayerProfile").style.display === "flex") {
      $("#TableTimes tr").remove();
      $("#TableTimes td").remove();
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    }

    // Map Times (SimpleKZ)
    if (currentmode === "kz_simple" && document.getElementById("displayMapTimes").style.display === "flex") {
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    }
    delete_recent_and_wr();

    // Pagination
    currentmode = "kz_simple";
    currentpage = 0;
    document.getElementById('graph_container').style.display = "none";
    document.getElementById('map_graph').style.display = "none";
    document.getElementById("previous").style.background = "#E45051";
    if (document.getElementById("searchMap").value.length > 0) {
      if (document.getElementById("searchMap").value.startsWith("kz_") ||
      document.getElementById("searchMap").value.startsWith("bkz_") ||
      document.getElementById("searchMap").value.startsWith("xc_") ||
      document.getElementById("searchMap").value.startsWith("skz_"))
      {
        loadMap(document.getElementById("searchMap").value);
        document.getElementById("displayMapTimes").style.display = "flex";
        document.getElementById("displayTimes").style.display = "none";
      }
      else if (document.getElementById("searchMap").value.toLowerCase().startsWith("steam")) {
        getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&modes_list_string=" + currentmode);
        return;
      }
      else {
        getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?player_name=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&modes_list_string=" + currentmode);
        return;
      }
    } else {
      resetAll();
      recentAndLatest();
    }
  });

  // KZTimer
  document.getElementById("mode-kz_timer-desktop").addEventListener("click", function() {
    if (xhr !== undefined) {
      xhr.abort();
    }

    if (xhr2 !== undefined) {
      xhr2.abort();
    }
    recordsUrl = kz_timerRecords;
    recordsTopUrl = kz_timerTopRecords;
    kz_loadmap = kz_timerLoadMap;
    currenttype = "overall";

    // Sets KZTimer color, reset other modes
    resetModeColor();
    document.getElementById("mode-kz_timer-desktop").style.color = "orange";

    resetMapTags()
    document.getElementById("LeaderBoardOptions_overall").style.color = 'orange';

    // PlayerBans (KZTimer)
    if (document.getElementById("playerBans").style.display === "flex") {
      $("#TableTimes tr").remove();
      $("#TableTimes td").remove();
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    }

    // Leaderboards (KZTimer)
    if (currentmode === "kz_timer" && document.getElementById("playerLeaderboards").style.display === "flex") {
      $("#TableTimes tr").remove();
      $("#TableTimes td").remove();
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    } else if (currentmode !== "kz_timer" && document.getElementById("playerLeaderboards").style.display === "flex") {
      currentmode = "kz_timer";
      showLeaderboards();
      return;
    }

    // Player Profiles (KZTimer)
    if (currentmode === "kz_timer" && document.getElementById("displayPlayerProfile").style.display === "flex") {
      $("#TableTimes tr").remove();
      $("#TableTimes td").remove();
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    }

    // Map Times (KZTimer)
    if (currentmode === "kz_timer" && document.getElementById("displayMapTimes").style.display === "flex") {
      delete_recent_and_wr();
      resetAll();
      recentAndLatest();
      return;
    }
    delete_recent_and_wr();

    // Pagination
    currentmode = "kz_timer";
    currentpage = 0;
    document.getElementById('graph_container').style.display = "none";
    document.getElementById('map_graph').style.display = "none";
    document.getElementById("previous").style.background = "#E45051";
    if (document.getElementById("searchMap").value.length > 0) {
      if (document.getElementById("searchMap").value.startsWith("kz_") ||
      document.getElementById("searchMap").value.startsWith("bkz_") ||
      document.getElementById("searchMap").value.startsWith("xc_") ||
      document.getElementById("searchMap").value.startsWith("skz_"))
      {
        loadMap(document.getElementById("searchMap").value);
        document.getElementById("displayMapTimes").style.display = "flex";
        document.getElementById("displayTimes").style.display = "none";
      }
      else if (document.getElementById("searchMap").value.toLowerCase().startsWith("steam")) {
        getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&modes_list_string=" + currentmode);
        return;
      }
      else {
        getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?player_name=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&modes_list_string=" + currentmode);
        return;
      }
    } else {
      resetAll();
      recentAndLatest();
    }
  });


  // If enter is pressed while there is text in the search bar, it searches. If no text, it switches back to the normal view.
  // Search (Profile Bar)
  document.getElementById("searchPlayerInfo_input").addEventListener("keydown", function (e) {
    let mapArray = [];
    if (e.keyCode === 13) {
      for (i=0;i<maplist.length;i++) {
        if (maplist[i].name === document.getElementById("searchPlayerInfo_input").value) {
          mapArray.push(maplist[i].name);
          break;
        }
        if (maplist[i].name.includes(document.getElementById("searchPlayerInfo_input").value)) {
          mapArray.push(maplist[i].name);
        }
      }
      if (mapArray.length > 1) {
        if (document.getElementById("displayPlayerProfile").style.display === "flex") {
          if (mapArray.length > 20) {
            document.getElementById("pagination").style.display = "flex";
          }
          else {
            document.getElementById("pagination").style.display = "none";
          }
          sortPlayerInfo(document.getElementById("searchPlayerInfo_input").value);
          return;
        }
      }
      if (mapArray.length === 1) {
        if (document.getElementById("displayPlayerProfile").style.display === "flex") {
          document.getElementById("searchPlayerInfo_input").value = mapArray[0];
          document.getElementById("pagination").style.display = "none";
          sortPlayerInfo(mapArray[0]);
          return;
        }
      }
    }
  })

  // If enter is pressed while there is text in the search bar, it searches. If no text, it switches back to the normal view.
  // Search (Top Bar)
  document.getElementById("searchMap").addEventListener("keydown", function (e) {
    let mapArray = [];
    if (e.keyCode === 13) {
      if (document.getElementById("searchMap").value.length > 0) {
        for (i=0;i<maplist.length;i++) {
          if (maplist[i].name === document.getElementById("searchMap").value) {
            mapArray.push(maplist[i].name);
            break;
          }
          if (maplist[i].name.includes(document.getElementById("searchMap").value)) {
            mapArray.push(maplist[i].name);
          }
        }
        if (mapArray.length > 1) {
          getsMapsSearch(mapArray);
          return;
        }
        if (mapArray.length === 1) {
          document.getElementById("searchMap").value = mapArray[0];
          loadMap(document.getElementById("searchMap").value);
          return;
        }
        if (document.getElementById("searchMap").value.toLowerCase().startsWith("steam")) {
          if (document.getElementById("playerBans").style.display === "flex") {
            getPlayerBanInfo("https://kztimerglobal.com/api/v1.0/bans?steam_id=" + document.getElementById("searchMap").value);
          }
          else {
            getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&modes_list_string=" + currentmode);
          }
          return;
        }
        else {
          getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?player_name=" + document.getElementById("searchMap").value + "&tickrate=128&stage=0&has_teleports=false&limit=1200&modes_list_string=" + currentmode);
          return;
        }
      }
    }
  });





  // Previous Navigation Button
  document.getElementById("previous").addEventListener("click", function() {

    if (document.getElementById("maps").style.display === "flex") {
      if (document.getElementById("previous").style.background === "#E45051") {
        return;
      }
      currentpage -= 18;
      if (currentpage <= 0) {
        currentpage = 0;
        document.getElementById("previous").style.background = "#E45051";
      }
      if (currentpage < maplist.length) {
        document.getElementById("next").style.background = "#212121";
      }
      getMaps(currentpage);
    }

    if (document.getElementById("displayMapTimes").style.display !== "none") {
      if (document.getElementById("next").style.background === "#E45051") {
        return;
      }
      currentpage -= 20;
      if (currentpage <= 0) {
        currentpage = 0;
        document.getElementById("previous").style.background = "#E45051";
      }
      let mapOverallPosition = currentpage;
      let mapProPosition = currentpage;
      mostPositions = (mapRecentTimes >= mapProTimes ? mapRecentTimes : mapProTimes);
      if (currentpage >= mostPositions.length) {
        currentpage = Math.floor(mostPositions.length);
        document.getElementById("previous").style.background = "#212121";
        document.getElementById("next").style.background = "#E45051";
      } else {
        document.getElementById("next").style.background = "#212121";
      }

      $("#TableOverallTimes tr").remove();
      $("#TableProTimes tr").remove();
      if (mostPositions.length <= currentpage) {
        let row = document.getElementById("TableOverallTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = "No Other Records Found";
        let row2 = document.getElementById("TableProTimes").insertRow(-1);
        let cell2 = row2.insertCell(0);
        cell2.innerHTML = "No Other Records Found";

        return;
      } else {

        let row = document.getElementById("TableOverallTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);
        let cell7 = row.insertCell(6);
        row.id = "TableTitle";
        cell1.innerHTML = "#";
        cell2.innerHTML = "Player";
        cell3.innerHTML = "Time";
        cell4.innerHTML = "Teleports";
        cell5.innerHTML = "Points";
        cell6.innerHTML = "Server";
        cell7.innerHTML = "Date";

        for (i=currentpage;i<currentpage+20;i++) {
          if (mapRecentTimes.length <= i) {
            break;
          }
          mapOverallPosition++;
          checkLength(mapRecentTimes[i]);
          let row = document.getElementById("TableOverallTimes").insertRow(-1);
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          let cell3 = row.insertCell(2);
          let cell4 = row.insertCell(3);
          let cell5 = row.insertCell(4);
          let cell6 = row.insertCell(5);
          let cell7 = row.insertCell(6);

          row.id = mapRecentTimes[i].steam_id;
          cell2.id = "name";
          cell2.innerHTML = playerName;
          cell3.innerHTML = timeConvert(mapRecentTimes[i].time);

          if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))) {
            cell1.innerHTML = mapOverallPosition;
            cell4.innerHTML = mapRecentTimes[i].teleports + " TPs";
            cell5.innerHTML = mapRecentTimes[i].points;
            if (mapRecentTimes[i].server_name == null) {
              cell6.innerHTML = "NA";
            }
            else if (mapRecentTimes[i].server_name.length > 18) {
              cell6.innerHTML = mapRecentTimes[i].server_name.substr(0,15) + "...";
            } else {
              cell6.innerHTML = mapRecentTimes[i].server_name;
            }
            cell7.innerHTML = dateConvert(mapRecentTimes[i].created_on);
          } else {
            cell4.innerHTML = mapRecentTimes[i].teleports;
          }
        }
        $('td').click(function(event){
          if (event.target.parentNode.id.includes("STEAM_")) {
            document.getElementById("searchMap").value = event.target.parentNode.id;
            getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + event.target.parentNode.id + "&tickrate=128&stage=0&has_teleports=false&limit=1200&&place_top_at_least=20&modes_list_string=" + currentmode);
          }
        });
      }


      if (mapProTimes.length <= currentpage) {
        let row = document.getElementById("TableProTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = "No Other Records Found";
      }

      else {
        let row = document.getElementById("TableProTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);
        row.id = "TableTitle";
        cell1.innerHTML = "#";
        cell2.innerHTML = "Player";
        cell3.innerHTML = "Time";
        cell4.innerHTML = "Points";
        cell5.innerHTML = "Server";
        cell6.innerHTML = "Date";

        for (i=currentpage;i<currentpage+20;i++) {
          if (mapProTimes.length === i) {
            break;
          }
          mapProPosition++;
          checkLength(mapProTimes[i]);
          let row = document.getElementById("TableProTimes").insertRow(-1);
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          let cell3 = row.insertCell(2);
          let cell4 = row.insertCell(3);
          let cell5 = row.insertCell(4);
          row.id = mapProTimes[i].steam_id;
          cell1.innerHTML = mapProPosition;
          cell2.id = "name";
          cell2.innerHTML = playerName;
          if (mapProTimes[i].points === 0) {
            cell4.innerHTML = "-";
          }
          else {
            cell4.innerHTML = mapProTimes[i].points;
          }
          cell3.innerHTML = timeConvert(mapProTimes[i].time);
          if (mapProTimes[i].server_name == null) {
            cell5.innerHTML = "NA";
          }
          else if (mapProTimes[i].server_name.length > 18) {
            cell5.innerHTML = mapProTimes[i].server_name.substr(0,15) + "...";
          } else {
            cell5.innerHTML = mapProTimes[i].server_name;
          }
          let cell6 = row.insertCell(5);
          cell6.innerHTML = dateConvert(mapProTimes[i].created_on);
        }
        $('td').click(function(event){
          if (event.target.parentNode.id.includes("STEAM_")) {
            document.getElementById("searchMap").value = event.target.parentNode.id;
            resetAll();
            getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + event.target.parentNode.id + "&tickrate=128&stage=0&has_teleports=false&limit=1200&&place_top_at_least=20&modes_list_string=" + currentmode);
          }
        });
      }
    }

    if (document.getElementById("displayPlayerProfile").style.display !== "none") {
      if (document.getElementById("previous").style.background === "#E45051") {
        return;
      }
      currentpage -= 20;
      if (currentpage <= 0) {
        currentpage = 0;
        document.getElementById("previous").style.background = "#E45051";
      }
      if (currentpage < 80) {
        document.getElementById("next").style.background = "#212121";
      }
      $("#TableTimes tr").remove();
      let count = 0;

      if (postTimes.length <= (currentpage + count)) {
        let row = document.getElementById("TableTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = "No Other Records Found";
        return;
      }
      if (document.getElementById("showGlobalTimes").innerHTML === "Show All Times") {
        if (globalTimes.length < currentpage) {
          let row = document.getElementById("TableTimes").insertRow(-1);
          let cell1 = row.insertCell(0);
          cell1.innerHTML = "No Other Records Found";
          return;
        }
        else {
          let temparray = [];
          count = 0;
          for (i=currentpage;i<currentpage+20;i++) {
            if (globalTimes.length <= (currentpage + count)) {
              break;
            }
            if (globalTimes[i].points !== 1000) {
              continue;
            }
            else {
              temparray.push(globalTimes[i]);
            }
            count++;
          }
          getPlayerInfo_table_globals_only(temparray);
        }
      }
      else {
        let temparray = [];
        for (i=currentpage;i<currentpage+20;i++) {
          if (postTimes.length <= (currentpage + count)) {
            break;
          }
          if (count === 20) {
            count = 0;
            break;
          }
          temparray.push(postTimes[i]);
          count++;
        }
        getPlayerInfo_table(temparray);
      }
    }

    if (document.getElementById("displayTimes").style.display !== "none") {
      if (document.getElementById("previous").style.background === "#E45051") {
        return;
      }
      currentpage -= 5;
      if (currentpage <= 0) {
        currentpage = 0;
        document.getElementById("previous").style.background = "#E45051";
      }
      if (currentpage < 25) {
        document.getElementById("next").style.background = "#212121";
      }

      // Deletes the current shown times
      delete_recent_and_wr();

      for (i=currentpage;i<currentpage+5;i++) {

        checkLength(mostRecentTimes[i]);

        const ReadableTime = (mostRecentTimes[i].updated_on).split("T");
        const $map_div = $("<div>", {id: mostRecentTimes[i].map_name, "class": "map_div"});

        $map_div.append("<img src=" + "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + mostRecentTimes[i].map_name + ".jpg>" + "<span style='color: white;'>" + mostRecentTimes[i].map_name + " <br>" + playerName + "<br>" + "<div>" + (mostRecentTimes[i].top_100 === 0 ? "NA" : '#' + mostRecentTimes[i].top_100) + "</div>" + " | " + "<div>" + timeConvert(mostRecentTimes[i].time) + "</div><br>" + mostRecentTimes[i].teleports + " TPs</span>");
        // This was created by Chuckles to help with selecting maps for users. Extremely useful as most users tend to not use their keyboard in 18.
        $map_div.click(function(event){
          if (event.target.parentNode.id.includes("_")) {
            document.getElementById("searchMap").value = event.target.parentNode.id;
            loadMap(document.getElementById("searchMap").value);
          }
        });
        $("#recentTimes").append($map_div);
      }

      for (m=currentpage;m<currentpage+5;m++) {
        if (m > mostRecentTopTimesFiltered.length) {
          $("#topTimes").append("<div style='color:#E45051'>No other records found</div>");
          break;
        }
        if (m >= mostRecentTopTimesFiltered.length) {
          break;
        }

        checkLength(mostRecentTopTimesFiltered[m]);

        const ReadableTime = (mostRecentTopTimesFiltered[m].updated_on).split("T");
        const $map_div = $("<div>", {id: mostRecentTopTimesFiltered[m].map_name, "class": "map_div"});
        $map_div.append("<img src=" + "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + mostRecentTopTimesFiltered[m].map_name + ".jpg>" + "<span style='color: white;'>" + mostRecentTopTimesFiltered[m].map_name + "<br>" + playerName + "<br>" + "<div>" + timeConvert(mostRecentTopTimesFiltered[m].time) + "</div>" + "<br>" + "<div style='color: white; font-size: 90%; font-style: italic'>" + getTimeDifference(mostRecentTopTimesFiltered[m].created_on) + "</div>" + "</span>");
        $map_div.click(function(event){
          if (event.target.parentNode.id.includes("_")) {
            document.getElementById("searchMap").value = event.target.parentNode.id;
            loadMap(document.getElementById("searchMap").value);
          }
        });
        $("#topTimes").append($map_div);
      }
    }
  });


  // Next Navigation Button
  document.getElementById("next").addEventListener("click", function() {

    if (document.getElementById("maps").style.display === "flex") {
      if (document.getElementById("previous").style.background === "#E45051") {
        return;
      }
      currentpage += 18;
      if (currentpage >= maplist.length) {
        currentpage = maplist.length-18;
        document.getElementById("next").style.background = "#E45051";
      }
      if (currentpage > 0) {
        document.getElementById("previous").style.background = "#212121";
      }
      getMaps(currentpage);
    }


    if (document.getElementById("displayMapTimes").style.display !== "none") {
      if (document.getElementById("next").style.background === "#E45051") {
        return;
      }
      currentpage += 20;
      if (currentpage > 0) {
        document.getElementById("previous").style.background = "#212121";
      }
      if (currentpage >= 80) {
        document.getElementById("next").style.background = "#E45051";
      }
      if (currentpage >= 100) {
        currentpage = 80;
        return;
      }
      let mapOverallPosition = currentpage;
      let mapProPosition = currentpage;
      mostPositions = (mapRecentTimes >= mapProTimes ? mapRecentTimes : mapProTimes);
      if (currentpage >= mostPositions.length) {
        currentpage = Math.floor(mostPositions.length);
        document.getElementById("previous").style.background = "#212121";
      }

      $("#TableOverallTimes tr").remove();
      $("#TableProTimes tr").remove();
      if (mostPositions.length <= currentpage) {
        let row = document.getElementById("TableOverallTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = "No Other Records Found";
        let row2 = document.getElementById("TableProTimes").insertRow(-1);
        let cell2 = row2.insertCell(0);
        cell2.innerHTML = "No Other Records Found";
        currentpage = Math.ceil(currentpage / 10) * 10
        return;
      } else {

        let row = document.getElementById("TableOverallTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);
        let cell7 = row.insertCell(6);
        row.id = "TableTitle";
        cell1.innerHTML = "#";
        cell2.innerHTML = "Player";
        cell3.innerHTML = "Time";
        cell4.innerHTML = "Teleports";
        cell5.innerHTML = "Points";
        cell6.innerHTML = "Server";
        cell7.innerHTML = "Date";

        for (i=currentpage;i<currentpage+20;i++) {
          if (mapRecentTimes.length <= i) {
            break;
          }
          mapOverallPosition++;
          checkLength(mapRecentTimes[i]);
          let row = document.getElementById("TableOverallTimes").insertRow(-1);
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          let cell3 = row.insertCell(2);
          let cell4 = row.insertCell(3);
          let cell5 = row.insertCell(4);
          let cell6 = row.insertCell(5);
          let cell7 = row.insertCell(6);
          row.id = mapRecentTimes[i].steam_id;
          cell2.id = "name";
          cell2.innerHTML = playerName;
          cell3.innerHTML = timeConvert(mapRecentTimes[i].time);
          if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))) {
            cell1.innerHTML = mapOverallPosition;
            cell4.innerHTML = mapRecentTimes[i].teleports + " TPs";
            cell5.innerHTML = mapRecentTimes[i].points;
            if (mapRecentTimes[i].server_name == null) {
              cell6.innerHTML = "NA";
            }
            else if (mapRecentTimes[i].server_name.length > 18) {
              cell6.innerHTML = mapRecentTimes[i].server_name.substr(0,15) + "...";
            } else {
              cell6.innerHTML = mapRecentTimes[i].server_name;
            }
            cell7.innerHTML = dateConvert(mapRecentTimes[i].created_on);
          } else {
            cell4.innerHTML = mapRecentTimes[i].teleports;
          }
        }
      }


      if (mapProTimes.length <= currentpage) {
        let row = document.getElementById("TableProTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = "No Other Records Found";
      } else {

        let row = document.getElementById("TableProTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        let cell2 = row.insertCell(1);
        let cell3 = row.insertCell(2);
        let cell4 = row.insertCell(3);
        let cell5 = row.insertCell(4);
        let cell6 = row.insertCell(5);
        row.id = "TableTitle";
        cell1.innerHTML = "#";
        cell2.innerHTML = "Player";
        cell3.innerHTML = "Time";
        cell4.innerHTML = "Points";
        cell5.innerHTML = "Server";
        cell6.innerHTML = "Date";

        for (i=currentpage;i<currentpage+20;i++) {
          if (mapProTimes.length === i) {
            break;
          }
          mapProPosition++;
          checkLength(mapProTimes[i]);
          let row = document.getElementById("TableProTimes").insertRow(-1);
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          let cell3 = row.insertCell(2);
          let cell4 = row.insertCell(3);
          let cell5 = row.insertCell(4);
          row.id = mapProTimes[i].steam_id;
          cell1.innerHTML = mapProPosition;
          cell2.id = "name";
          cell2.innerHTML = playerName;
          cell3.innerHTML = timeConvert(mapProTimes[i].time);
          if (mapProTimes[i].points === 0) {
            cell4.innerHTML = "-";
          }
          else {
            cell4.innerHTML = mapProTimes[i].points;
          }
          if (mapProTimes[i].server_name == null) {
            cell5.innerHTML = "NA";
          }
          else if (mapProTimes[i].server_name.length > 18) {
            cell5.innerHTML = mapProTimes[i].server_name.substr(0,15) + "...";
          } else {
            cell5.innerHTML = mapProTimes[i].server_name;
          }
          let cell6 = row.insertCell(5);
          cell6.innerHTML = dateConvert(mapProTimes[i].created_on);
        }
      }
      $('td').click(function(event){
        if (event.target.parentNode.id.includes("STEAM_")) {
          document.getElementById("searchMap").value = event.target.parentNode.id;
          getPlayerInfo("https://kztimerglobal.com/api/v1.0/records/top?steam_id=" + event.target.parentNode.id + "&tickrate=128&stage=0&has_teleports=false&limit=1200&&place_top_at_least=20&modes_list_string=" + currentmode);
        }
      });
    }

    if (document.getElementById("displayPlayerProfile").style.display !== "none") {
      if (document.getElementById("next").style.background === "#E45051") {
        return;
      }
      currentpage += 20;
      if (currentpage > 0) {
        document.getElementById("previous").style.background = "#212121";
      }
      if (currentpage >= maplist.length) {
        currentpage = Math.floor(maplist.length);
        document.getElementById("previous").style.background = "#212121";
        document.getElementById("next").style.background = "#E45051";
      }
      $("#TableTimes tr").remove();
      let count = 0;
      if (postTimes.length <= (currentpage + count)) {
        let row = document.getElementById("TableTimes").insertRow(-1);
        let cell1 = row.insertCell(0);
        cell1.innerHTML = "No Other Records Found";
        return;
      }
      if (document.getElementById("showGlobalTimes").innerHTML === "Show All Times") {
        if (globalTimes.length < currentpage) {
          let row = document.getElementById("TableTimes").insertRow(-1);
          let cell1 = row.insertCell(0);
          cell1.innerHTML = "No Other Records Found";
          return;
        }
        else {
          let temparray = [];
          count = 0;
          for (i=currentpage;i<currentpage+20;i++) {
            if (globalTimes.length <= (currentpage + count)) {
              break;
            }
            if (globalTimes[i].points !== 1000) {
              continue;
            }
            else {
              temparray.push(globalTimes[i]);
            }
            count++;
          }
          getPlayerInfo_table_globals_only(temparray);
        }
      }
      else {
        let temparray = [];
        for (i=currentpage;i<currentpage+20;i++) {
          if (postTimes.length <= (currentpage + count)) {
            break;
          }
          if (count === 20) {
            count = 0;
            break;
          }
          else {
            temparray.push(postTimes[i]);
          }
          count++;
        }
        getPlayerInfo_table(temparray);
      }
    }

    if (document.getElementById("displayTimes").style.display !== "none") {
      if (document.getElementById("next").style.background === "#E45051") {
        return;
      }
      currentpage += 5;
      if (currentpage > 0) {
        document.getElementById("previous").style.background = "#212121";
      }
      if (currentpage >= 25) {
        currentpage = 25;
        document.getElementById("previous").style.background = "#212121";
        document.getElementById("next").style.background = "#E45051";
      }

      // Deletes the current shown times
      delete_recent_and_wr();

      for (i=currentpage;i<currentpage+5;i++) {
        checkLength(mostRecentTimes[i]);
        const ReadableTime = (mostRecentTimes[i].updated_on).split("T");
        const $map_div = $("<div>", {id: mostRecentTimes[i].map_name, "class": "map_div"});
        $map_div.append("<img src=" + "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + mostRecentTimes[i].map_name + ".jpg>" + "<span style='color: white;'>" + mostRecentTimes[i].map_name + " <br>" + playerName + "<br>" + "<div>" + (mostRecentTimes[i].top_100 === 0 ? "NA" : '#' + mostRecentTimes[i].top_100) + "</div>" + " | " + "<div>" + timeConvert(mostRecentTimes[i].time) + "</div><br>" + mostRecentTimes[i].teleports + " TPs</span>");
        // This was created by Chuckles to help with selecting maps for users. Extremely useful as most users tend to not use their keyboard in 2018.
        $map_div.click(function(event){
          if (event.target.parentNode.id.includes("_")) {
            document.getElementById("searchMap").value = event.target.parentNode.id;
            loadMap(document.getElementById("searchMap").value);
          }
        });
        $("#recentTimes").append($map_div);
      }
      for (m=currentpage;m<currentpage+5;m++) {
        if (m > mostRecentTopTimesFiltered.length) {
          $("#topTimes").append("<div style='color:#E45051'>No other records found</div>");
          break;
        }
        if (m >= mostRecentTopTimesFiltered.length) {
          break;
        }
        checkLength(mostRecentTopTimesFiltered[m])
        const ReadableTime = (mostRecentTopTimesFiltered[m].updated_on).split("T");
        const $map_div = $("<div>", {id: mostRecentTopTimesFiltered[m].map_name, "class": "map_div"});
        $map_div.append("<img src=" + "https://d2u7y93d5eagqt.cloudfront.net/mapImages/thumbs/tn_" + mostRecentTopTimesFiltered[m].map_name + ".jpg>" + "<span style='color: white;'>" + mostRecentTopTimesFiltered[m].map_name + "<br>" + playerName + "<br>" + "<div>" + timeConvert(mostRecentTopTimesFiltered[m].time) + "</div>" + "<br>" + "<div style='color: white; font-size: 90%; font-style: italic'>" + getTimeDifference(mostRecentTopTimesFiltered[m].created_on) + "</div>" + "</span>");
        $map_div.click(function(event){
          if (event.target.parentNode.id.includes("_")) {
            document.getElementById("searchMap").value = event.target.parentNode.id;
            loadMap(document.getElementById("searchMap").value);
          }
        });
        $("#topTimes").append($map_div);
      }
    }
    if (document.getElementById("playerLeaderboards").style.display !== "none") {
    }
  });

  // WR Progression Event Listener
  document.getElementById("wr_progression_button").addEventListener("click", function () {
    if (document.getElementById("searchMap").value.length > 0) {
      for (i=0;i<maplist.length;i++) {
        if (maplist[i].name.includes(currentmap)) {
          document.getElementById("searchMap").value = maplist[i].name;
          showWRProgression(document.getElementById("searchMap").value);
          break;
        }
      }
    }
  });

  // Leaderboard Show More Event Listener
  document.getElementById("show_more_leaderboards_button").addEventListener("click", function () {
    Leaderboard(currentmode, currenttype, current_has_teleports, 100);
  });

  // Leaderboard Mode Event Listener
  document.getElementById("LeaderboardMode").addEventListener("click", function() {
    if (current_has_teleports === "false") {
      current_has_teleports = "true";
      document.getElementById("LeaderboardMode").innerHTML = "<h2>TP</h2>";
    }
    else {
      current_has_teleports = "false";
      document.getElementById("LeaderboardMode").innerHTML = "<h2>Pro</h2>";
    }
    Leaderboard(currentmode, currenttype, current_has_teleports, 20);
  })



  // On load show recent and latest
  if (mode === "empty") {
    currentmode = "kz_simple";
    recordsUrl = kz_simpleRecords;
    recordsTopUrl = kz_simpleTopRecords;
    kz_loadmap = kz_simpleLoadMap;
    document.getElementById("mode-kz_simple-desktop").style.color = "orange";
  }
  else if (mode === "kz_simple") {
    recordsUrl = kz_simpleRecords;
    recordsTopUrl = kz_simpleTopRecords;
    kz_loadmap = kz_simpleLoadMap;
    document.getElementById("mode-kz_simple-desktop").style.color = "orange";
  }
  else if (mode === "kz_timer") {
    recordsUrl = kz_timerRecords;
    recordsTopUrl = kz_timerTopRecords;
    kz_loadmap = kz_timerLoadMap;
    document.getElementById("mode-kz_timer-desktop").style.color = "orange";
  }
  else if (mode === "kz_vanilla") {
    recordsUrl = kz_vanillaRecords;
    recordsTopUrl = kz_vanillaTopRecords;
    kz_loadmap = kz_vanillaLoadMap;
    document.getElementById("mode-kz_vanilla-desktop").style.color = "orange";
  }


  document.getElementById("displayPlayerProfile").style.display = "none";
  document.getElementById("displayMapTimes").style.display = "none";
  document.getElementById("next").style.background = "#212121";

  if((/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent))) {
    recentAndLatest();
  }

  if (page === "empty" && map === "empty" && name === "empty") {
    recentAndLatest();
  }
}
