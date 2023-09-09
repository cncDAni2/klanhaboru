function stop(){
	var x = setTimeout('',100); for (var i = 0 ; i < x ; i++) clearTimeout(i);
}
stop(); /*Időstop*/
document.getElementsByTagName("html")[0].setAttribute("class","");

function loadXMLDoc(dname) {
	if (window.XMLHttpRequest) xhttp=new XMLHttpRequest();
		else xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	xhttp.open("GET",dname,false);
	xhttp.send();
	return xhttp.responseXML;
}

if (typeof(AZON)!="undefined") { alert("Itt már fut SZEM. \n Ha ez nem igaz, nyitsd meg új lapon a játékot, és próbáld meg ott futtatni"); exit();}
var VERZIO = 'v4.6 Alfa Build 23.09.10';
var SZEM4_SETTINGS = {};
var TIME_ZONE = 0;
try{ /*Rendszeradatok*/
	var AZON="S0";
	if (window.name.indexOf(AZON)>-1) AZON="S1";
	var BASE_URL=document.location.href.split("game.php")[0];
	var CONFIG=loadXMLDoc(BASE_URL+"interface.php?func=get_config");

	var SPEED=parseFloat(CONFIG.getElementsByTagName("speed")[0].textContent);
	var UNIT_S=parseFloat(CONFIG.getElementsByTagName("unit_speed")[0].textContent);
	
	var MOBILE_MODE = false;
	var ALL_EXTENSION = [];

	var KTID={}, /*Koord-ID párosok*/
	TERMELES=[5,30,35,41,47,55,64,74,86,100,117,136,158,184,214,249,289,337,391,455,530,616,717,833,969,1127,1311,1525,1774,2063,2400],
	UNITS=["spear","sword","axe","archer","spy","light","marcher","heavy"],
	TEHERARR=[25,15,10,10,0,80,50,50];
	if (parseFloat(CONFIG.getElementsByTagName("archer")[0].textContent) == 0) {
		let index = UNITS.findIndex(el => el.includes("archer"));
		UNITS.splice(index, 1);
		TEHERARR.splice(index, 1);
		index = UNITS.findIndex(el => el.includes("marcher"));
		UNITS.splice(index, 1);
		TEHERARR.splice(index, 1);
	}
	var TEHER = {
		spear: 25,
		sword: 15,
		axe: 10,
		archer: 10,
		spy: 0,
		light: 80,
		marcher: 50,
		heavy: 50
	},
	TANYAARR=[1,1,1,1,2,4,5,6],
	TANYA = {
		spear: 1,
		sword: 1,
		axe: 1,
		archer: 1,
		spy: 2,
		light: 4,
		marcher: 5,
		heavy: 6
	},
	E_SEB_ARR=[18,22,18,18,9,10,10,11],
	E_SEB = {
		spear: 18,
		sword: 22,
		axe: 18,
		archer: 18,
		spy: 9,
		light: 10,
		marcher: 10,
		heavy: 11
	};

	var VILL1ST="";
	var MAX_IDO_PERC = 20; // shorttest-be van felülírva!!!
	AZON=game_data.player.id+"_"+game_data.world+AZON;
	var CLOUD_AUTHS = localStorage.getItem('szem_firebase');
	var USER_ACTIVITY = false;
	var USER_ACTIVITY_TIMEOUT;
	var worker = createWorker(function(self){
		self.TIMERS = {};
		self.addEventListener("message", function(e) {
			if (e.data.id == 'stopTimer') {
				clearTimeout(self.TIMERS[e.data.value]);
			} else {
				self.TIMERS[e.data.id] = setTimeout(() => { postMessage(e.data); }, e.data.time);
			}
		}, false);
	});
	worker.onmessage = function(worker_message) {
		worker_message = worker_message.data;
		switch(worker_message.id) {
			case 'farm': szem4_farmolo_motor(); break;
			case 'vije': szem4_VIJE_motor(); break;
			case 'epit': szem4_EPITO_motor(); break;
			case 'adatok': szem4_ADAT_motor(); break;
			default: debug('worker','Ismeretlen ID', JSON.stringify(worker_message))
		}
	};
	function createWorker(main){
		var blob = new Blob(
			["(" + main.toString() + ")(self)"],
			{type: "text/javascript"}
		);
		return new Worker(window.URL.createObjectURL(blob));
	}
}catch(e){alert('SZEM Nem tud elindulni/n' + e); exit(0);}

function init(){try{
	getServerTime(window, true);
	if (document.getElementById("production_table")) var PFA=document.getElementById("production_table"); else 
	if (document.getElementById("combined_table")) var PFA=document.getElementById("combined_table"); else 
	if (document.getElementById("buildings_table")) var PFA=document.getElementById("buildings_table"); else 
	if (document.getElementById("techs_table")) var PFA=document.getElementById("techs_table");
	else {
		alert("Ilyen nézetbe való futtatás nem támogatott. Kísérlet az áttekintés betöltésére...\n\nLaunching from this view is not supported. Trying to load overview...");
		document.location.href=document.location.href.replace(/screen=[a-zA-Z]+/g,"screen=overview_villages");
		return false;
	}
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (patt.test(PFA.rows[1].cells[0].textContent)) var oszl=0; else
	if (patt.test(PFA.rows[1].cells[1].textContent)) var oszl=1; else
	if (patt.test(PFA.rows[1].cells[2].textContent)) var oszl=2; else
	{alert("Nem találok koordinátákat ebbe a listába.\n\nI can not find coordinates in this view."); return false;}
	VILL1ST=PFA.rows[1].cells[oszl].getElementsByTagName("a")[0].href;
	for (var i=1;i<PFA.rows.length;i++) {
		var kord=PFA.rows[i].cells[oszl].textContent.match(/[0-9]+(\|)[0-9]+/g);
		kord=kord[kord.length-1];
		KTID[kord] = PFA.rows[i].cells[oszl].getElementsByTagName("span")[0].getAttribute("data-id").match(/[0-9]+/g)[0];
	}
	const szemStyle = `
		body { background: #111; scrollbar-width: none; padding-bottom: 0; }
		body::-webkit-scrollbar { width: 0; }
		#content > table { box-shadow: 0 0 12px black; min-height: 100vh; }
		#side-notification-container {
			pointer-events: none;
			display: none;
		}
		#alert2 {
			width: 300px;
			background-color: #0d47a1;
    		color: #FFF;
			position: fixed;
			left:40%;
			top:40%;
			font-size: 11pt;
			padding: 5px;
			z-index: 200;
			border-radius: 5px;
			box-shadow: black 0 0 7px;
			display: none;
			animation: blinkingalert 0.5s infinite;
		}
		@keyframes blinkingalert {
			0% {
				box-shadow: #0d47a1 0 0 0px;
			}
			100% {
				box-shadow: #0d47a1 0 0 20px;
			}
		}
		#alert2head {
			display: flex;
			justify-content: space-between;
			width: 100%;
			cursor: all-scroll;
			background: rgba(255,255,255,0.1);
			margin: -5px;
			padding: 5px;
			font-weight: bold;
			height: 20px;
		}
		#alert2head a {
			padding: 10px 0 10px 10px;
		}
		#kiegs img {
			cursor: pointer;
		}
		#content {
			width: 1024px;
			margin: auto;
			position: relative;
			z-index: 2;
		}
		.fej {
			width: 1024px;
			margin: auto;
			color: white;
			position: relative;
			box-shadow: 0 0 12px black;
		}
		.fej a {
			color: white;
		}
		.fej > table {
			padding:1px;
			border: 1px solid yellow;
		}
		#global_notifications {
			position: absolute;
			top: 0;
			left: -22px;
			width: 18px;
		}
		#global_notifications img { width: 18px; }
		#global_notifications img.rotate { animation: rotation 2s infinite linear; }
		@keyframes rotation {
			from {
				transform: rotate(0deg);
			}
			to {
				transform: rotate(360deg);
			}
		}
		table.menuitem {
			vertical-align:top;
			text-align: top;
			padding: 20px;
			margin:auto;
			color: white;
			border: 1px solid yellow;
		}
		table.menuitem > tbody > tr > td {
			padding: 0px;
			vertical-align:top;
		}
		table td {
			padding: 0px;
			vertical-align:middle;
		}
		table {
			padding: 0px;
			margin: auto;
			color: white;
		}
		table.vis { color:black; }
		table.vis td, table.vis th { padding: 3px 6px 3px 6px; }
		#farm_hova > tbody > tr > td:last-child {
			width: 135px;
		}
		textarea {
			background-color: #020;
			color:white;
		}
		.divrow { display: flex; align-items: center; }
		.divcell {
			display: table-cell;
			text-align: center;
			vertical-align:top;
		}
		a { color: white; }
		img{
			border-color: grey;
			padding:1px;
		}
		#naploka a { color:blue; }
		input[type="button"] {
			font-size:13px;
			font-family: Century Gothic, sans-serif;
			color:#FFFF77;
			background-color:#3366CC;
			border-style: ridge;
			border-color:#000000;
			border-width:3px;
		}
		#adat_opts tr td,
		#adat_opts tr th {
			text-align: center;
			vertical-align: middle;
		}
		.szem4_vije_optsTable {
			margin: initial;
			border-collapse: separate;
			border-spacing: 0px 7px;
		}
		.szem4_vije_optsTable input {
			font-size: 10pt;
		}
		#vije_opts input[type="checkbox"] { width: 17px; height: 17px; }

		.tooltip-wrapper { display: flex; flex-wrap: wrap; gap: 10px 0; }
		.tooltip-wrapper img { padding-left: 2px; padding-right: 0; display: table-cell; }
		.tooltip_hover { position: relative; display: table; border-collapse: collapse; }
		.tooltip_text {
			position: absolute; z-index: 1; left: 50%; bottom: 100%; transform: translateX(-50%); white-space: nowrap; font-style: normal; background: gray; padding: 5px 8px; border-radius: 3px; margin-bottom: 5px; color: white; display: none; border: 1px solid black;
		}
		.bottom-tooltip .tooltip_text { top: 100%; bottom: auto; }
		.tooltip_text:after { content: ""; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border-top: 5px solid gray; border-left: 5px solid transparent; border-right: 5px solid transparent }
		.bottom-tooltip .tooltip_text:after { top: auto; bottom: 100%; border-bottom: 5px solid gray; border-top: 5px solid transparent; }
		table.no-bg-table td {
			vertical-align: middle;
			background: transparent;
		}
		table.no-bg-table td .flex_middle {
			display: flex;
			align-items: center;
		}
		.szem4_unitbox {
			display: inline-block;
			position: relative;
			border-radius: 5px;
		}
		.szem4_unitbox label {
			cursor: pointer;
			display: block;
		}
		.szem4_unitbox label:hover {
			background: rgba(0,0,0,0.2);
		}
		.szem4_unitbox input {
			cursor: pointer;
			margin-left: -2px;
			margin-right: 3px;
		}
		.szem4_farmolo_datatable_wrapper {
			display: flex;
			justify-content: space-between;
		}
		.szem4_farmolo_datatable_wrapper table {
			margin: 0;
		}
		.nopadding_td {
			padding: 0 !important;
		}
		.heartbeat_wrapper {
			height: 18px;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.heartbeat_icon {
			height: 15px;
			padding: 0 2px;
			margin-right: 5px;
			animation: heartbeatanimation 1.0s infinite;
			cursor: pointer
		}
		@keyframes heartbeatanimation {
			0% {
				height: 15px;
				padding: 0 2px;
			}
			33% {
				height: 15px;
				padding: 0 2px;
			}
			50% {
				height: 19px;
				padding: 0;
			}
			66% {
				height: 15px;
				padding: 0 2px;
			}
		}
		#farmolo_options table {
			color: black;
			text-align: left;
		}
		#farmolo_options table td,
		#vije_opts table.szem4_vije_optsTable td {
			vertical-align: middle;
		}
		#farmolo_options table td:first-child {
			padding: 0;
		}
		#farmolo_options .combo-cell {
			display: flex;
			align-items: center;
		}
		#farmolo_options .imgbox {
			width: 40px;
			margin-right: 5px;
			text-align: center;
		}
		#farmolo_options .imgbox img {
			height: 24px;
		}
		.left-background {
			width: calc(50vw - 512px);
			height: 100vh;
			position: fixed;
			left: 0;
			top: 0;
			background-repeat: no-repeat;
    		background-position-x: right;
			background-size: cover;
		}
		.left-background video,
		.right-background video {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		.left-background video {
			object-position: right center;
		}
		.left-background.mirrored_bg video {
			object-position: left center;
		}
		.left-background.mirrored_bg {
			background-position-x: left;
		}
		.left-background.mirrored_bg,
		.right-background.mirrored_bg {
			-moz-transform: scale(-1, 1);
			-webkit-transform: scale(-1, 1);
			-o-transform: scale(-1, 1);
			-ms-transform: scale(-1, 1);
			transform: scale(-1, 1);
		}
		.right-background video {
			object-position: left center;
		}
		.right-background.mirrored_bg video {
			object-position: right center;
		}
		.mirrored_bg video::-webkit-media-controls-panel {
			transform: scale(-1,1);
		}
		.right-background {
			width: calc(50vw - 512px);
			height: 100vh;
			position: fixed;
			right: 0;
			top: 0;
			background-repeat: no-repeat;
    		background-position-x: left;
			background-size: cover;
		}
		.right-background.mirrored_bg {
			background-position-x: right;
		}
		#farm_hova .szem4_farms_overflow {
			display: none;
		}
		.style-settings-table { border-collapse: collapse; }
		.style-settings-table tr { border-bottom: 1px solid black; }
		table.style-settings-table td { padding: 15px 4px; vertical-align: middle; }
		.szem_old_build_tooltip {
			border-left: 3px solid red;
		}
		.szem_old_build_tooltip i {
			font-weight: bold;
			color: red;
		}
		.wagon_time {
			position: absolute;
			color: lavenderblush;
			font-size: 11px;
			top: 5px;
			width: 42px;
			text-align: center;
			text-shadow: 0px 0px 1px black;
		}
		.gyujto_table td:nth-child(2) {
			cursor: pointer;
			text-align: center;
		}
	`;
	let szemStyle_el = document.createElement('style');
	szemStyle_el.textContent = szemStyle;
	document.head.appendChild(szemStyle_el);
	document.getElementsByTagName("body")[0].innerHTML=`
		<div class="left-background">
			<video src="" autoplay loop muted></video>
		</div>
		<div class="right-background">
			<video src="" autoplay loop muted></video>
		</div>
		<div id="alert2">
			<div id="alert2head">
				<div>Üzenet</div>
				<div><a href='javascript: alert2("close");'>[ESC] ❌</a></div>
			</div>
			<p id="alert2szov"></p>
		</div>
		<div class="fej">
			<div id="global_notifications"></div>
			<table width="100%" align="center" style="background: #111; background-image:url('${pic("wallp.jpg")}'); background-size:1024px;">
				<tr>
					<td width="70%" id="fejresz" style="vertical-align:middle; margin:auto;">
						<h1><i></i></h1>
					</td>
					<td id="sugo" height="110px"></td>
				</tr>
				<tr><td colspan="2" id="menuk" style="">
					<div class="divrow" style="width: 1016px">
						<span class="divcell" id="kiegs" style="text-align:left; padding-top: 9px;width:870px;">
							<img src="${pic("muhely_logo.png")}" alt="GIT" title="GIT C&amp;C Műhely megnyitása" onclick="window.open('https://github.com/cncDAni2/klanhaboru')">
							<img src="${pic("kh_logo.png")}" alt="Game" title="Klánháború megnyitása" onclick="window.open(document.location.href)">
							|
						</span>
						<span class="divcell" style="text-align:right; width:250px">
							<a href=\'javascript: nyit("naplo");\' onmouseover="sugo(this,\'Események naplója\')">Napló</a>
							<a href=\'javascript: nyit("debug");\' onmouseover="sugo(this,\'Hibanapló\')">Debug</a>
							<a href=\'javascript: nyit("hang");\'><img src="${pic("hang.png")}" onmouseover="sugo(this,\'Hangbeállítások\')" alt="hangok"></a>
						</span>
					</div>
				</td></tr>
			</table>
		</div>
		<div id="content"></div>`;
	document.getElementById("content").innerHTML=`
	<table class="menuitem" width="1024px" align="center" id="naplo" style="display: none"><tbody>
	<tr><td>
		<h1 align="center">Napló</h1>
		<br>
		<br>
		<table align="center" class="vis" id="naploka"><tbody>
			<tr>
				<th onclick="\'rendez("datum2",false,this,"naploka",0)\'" style="cursor: pointer;">Dátum</th>
				<th onclick="\'rendez("szoveg",false,this,"naploka",1)\'" style="cursor: pointer;">Script</th>
				<th onclick="\'rendez("szoveg",false,this,"naploka",2)\'" style="cursor: pointer;">Esemény</th>
			</tr>
		</tbody></table>
	</td></tr>
</tbody></table>
<table class="menuitem" width="1024px" align="center" id="debug" style="display: none"><tbody>
	<tr><td>
		<h1 align="center">DeBugger</h1>
		<br>
		<br>
		<button type="button" onclick="debug_urit()">Ürít</button>
		<button type="button" onclick="switchMobileMode()">Mobile_mode</button>
		<table align="center" class="vis" id="debugger"><tbody>
			<tr>
				<th onclick="rendez('datum2',false,this,'debugger',0)" style="cursor: pointer;">Dátum</th>
				<th onclick="rendez('szoveg',false,this,'debugger',1)" style="cursor: pointer;">Script</th>
				<th onclick="rendez('szoveg',false,this,'debugger',2)" style="cursor: pointer;">Esemény</th>
			</tr>
		</tbody></table>
	</td></tr>
</tbody></table>
<table class="menuitem" width="1024px" align="center" id="hang" style="display: none"><tbody>
	<tr><td><form id="settings">
		<p align="center">
			<audio id="audio1" controls="controls" autoplay="autoplay">
				<source id="wavhang" src="" type="audio/wav">
			</audio>
		</p>
		<h1 align="center">Hangbeállítás</h1>
		<br>
		<div id="hangok" style="display:table;">
			<div style="display:table-row;">
				<div style="display:table-cell; padding:10px;" onmouseover="sugo(this, 'Ha be van kapcsolva, bot védelem esetén ez a link is megnyitódik, mint figyelmeztetés.')">
					<b><input type="checkbox" name="altbot" onchange="saveSettings()"> Alternatív botriadó?
						<br>Megnyitott URL (egyszer)<br>
						<input type="text" id="altbotURL" name="altboturl" size="42" onchange="saveSettings()" value="http://www.youtube.com/watch?v=k2a30--j37Q">
					</b>
				</div>
				<b>
				</b>
			</div>
			<b>
			</b>
		</div>
		<h1 align="center">Háttér- és stílus beállítás</h1>
		<div><table class="style-settings-table">
			<tr><td>Bal háttérkép</td><td><input type="text" size="80" name="wallp_left" value="${pic('default_bg_left.jpg')}" onchange="onWallpChange()"><br>
										Videó: <input type="text" size="70" name="wallp_left_vid" value="-" onchange="onWallpChange()"><br>
										Tükrözött? <input type="checkbox" onclick="onWallpChange()" name="wallp_left_mirror"></td><td rowspan="2">Videólink. Ha nincs/invalid, háttérkép. Ha az sincs akkor háttérszín lesz használva</td></tr>
			<tr><td>Jobb háttérkép</td><td><input type="text" size="80"  name="wallp_right" value="${pic('default_bg_right.jpg')}" onchange="onWallpChange()"><br>
										Videó: <input type="text" size="70" name="wallp_right_vid" value="-" onchange="onWallpChange()"><br>
										Tükrözött? <input type="checkbox" onclick="onWallpChange()" name="wallp_right_mirror"></td></tr>
			<tr><td>Tartalom háttérszíne</td><td><input type="text" size="30" name="content_bgcolor" value="#111" onchange="onWallpChange()"></td><td>[Default: #111] Minden CSS "background" property támogatott. <a href="https://www.w3schools.com/cssref/css3_pr_background.php" target="_BLANK">W3School link</a></td></tr>
			<tr><td>Tartalom betűszíne</td><td><input type="text" size="30" name="content_fontcolor" value="white" onchange="onWallpChange()"></td><td>[Default: white] Minden CSS "color" property támogatott. <a href="https://www.w3schools.com/cssref/css_colors_legal.php" target="_BLANK">W3School link</a></td></tr>
			<tr><td>Keret színe</td><td><input type="text" size="30" name="content_border" value="yellow" onchange="onWallpChange()"></td><td>[Default: yellow] Valid CSS "border-color" property támogatott. <a href="https://www.w3schools.com/css/css_border_color.asp" target="_BLANK">W3School link</a></td></tr>
			<tr><td>Vetett árnyék</td><td><input type="text" size="30" name="content_shadow" value="0 0 12px black" onchange="onWallpChange()"></td><td>[Default: 0 0 12px black] Valid CSS "box-shadow" property támogatott. <a href="https://www.w3schools.com/cssref/css3_pr_box-shadow.php" target="_BLANK">W3School link</a></td></tr>
			<tr><td>Beállítás táblázat háttere</td>       <td><input type="text" size="30" name="table_bgcolor"      value="-" onchange="onWallpChange(undefined, 'table_bgcolor')"></td>     <td>[Default: -] A háttér cellánként értendő. Minden CSS "background" property támogatott. <a href="https://www.w3schools.com/cssref/css3_pr_background.php" target="_BLANK">W3School link</a></td></tr>
			<tr><td>Beállítás táblázat szövegszíne</td>   <td><input type="text" size="30" name="table_color"        value="-" onchange="onWallpChange(undefined, 'table_color')"></td>       <td>[Default: -] Minden CSS "color" property támogatott. <a href="https://www.w3schools.com/cssref/css_colors_legal.php" target="_BLANK">W3School link</a></td></tr>
			<tr><td>Táblázatok fejlécének háttere</td>    <td><input type="text" size="30" name="table_head_bgcolor" value="-" onchange="onWallpChange(undefined, 'table_head_bgcolor')"></td><td>[Default: -] A háttér cellánként értendő. Minden CSS "background" property támogatott. <a href="https://www.w3schools.com/cssref/css3_pr_background.php" target="_BLANK">W3School link</a></td></tr>
			<tr><td>Táblázatok fejlécének szövegszíne</td><td><input type="text" size="30" name="table_head_color"   value="-" onchange="onWallpChange(undefined, 'table_head_color')"></td>  <td>[Default: -] A háttér cellánként értendő. Minden CSS "background" property támogatott. <a href="https://www.w3schools.com/cssref/css3_pr_background.php" target="_BLANK">W3School link</a></td></tr>
		</div></table>
	</form></td></tr>
</tbody></table>`;
	document.title="SZEM IV";
	
	debug("SZEM 4","Verzió: GIT_"+new Date().toLocaleDateString());
	debug("SZEM 4","Prog.azon: "+AZON);
	debug("SZEM 4","W-Speed: "+SPEED);
	debug("SZEM 4","U-Speed: "+UNIT_S);
	return true;
}catch(e){alert("Hiba indításkor:\n\nError at starting:\n"+e); return false;}}

function pic(file){
	return "https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/"+file;
}
function picBuilding(bId) {
	return `<img src="https://dshu.innogamescdn.com/asset/88651122/graphic/buildings/mid/${bId}3.png">`;
}

function onWallpChange(isUpdate=true, changedText) {
	const settingsForm = document.getElementById('settings');

	document.querySelector('.left-background video').src = settingsForm.wallp_left_vid.value;
	document.querySelector('.right-background video').src = settingsForm.wallp_right_vid.value;
	document.getElementsByClassName('left-background')[0].style.backgroundImage = `url('${settingsForm.wallp_left.value}')`;
	document.getElementsByClassName('right-background')[0].style.backgroundImage = `url('${settingsForm.wallp_right.value}')`;
	if (settingsForm.wallp_left_mirror.checked)
		document.querySelector('.left-background').classList.add('mirrored_bg');
	else
		document.querySelector('.left-background').classList.remove('mirrored_bg');
	if (settingsForm.wallp_right_mirror.checked)
		document.querySelector('.right-background').classList.add('mirrored_bg');
	else
		document.querySelector('.right-background').classList.remove('mirrored_bg');

	$('body').css('background',settingsForm.content_bgcolor.value);
	$('.menuitem').css('background',settingsForm.content_bgcolor.value);
	$('table.menuitem').css('color',settingsForm.content_fontcolor.value);
	$('#content a').css('color',settingsForm.content_fontcolor.value);
	$('table.style-settings-table').css('color',settingsForm.content_fontcolor.value);
	$('table.menuitem').css('border-color', settingsForm.content_border.value);
	$('.fej > table').css('border-color', settingsForm.content_border.value);
	$('#content > table').css('box-shadow', settingsForm.content_shadow.value);
	$('.fej').css('box-shadow', settingsForm.content_shadow.value);
	if (changedText == 'table_bgcolor' || changedText == 'ALL') {
		const styleElement = $("<style>")
			.attr("type", "text/css")
			.html(`.vis:not(#farm_honnan):not(#farm_hova) td { background: ${settingsForm.table_bgcolor.value}; }`);
		$("head").append(styleElement);
	}
	if (changedText == 'table_head_bgcolor' || changedText == 'ALL') {
		const styleElement = $("<style>")
			.attr("type", "text/css")
			.html(`.vis th { background: ${settingsForm.table_head_bgcolor.value} !important; }`);
		$("head").append(styleElement);
	}
	if (changedText == 'table_color' || changedText == 'ALL') {
		const styleElement = $("<style>")
			.attr("type", "text/css")
			.html(`.vis:not(#farm_honnan):not(#farm_hova) td { color: ${settingsForm.table_color.value}; }`);
		$("head").append(styleElement);
	}
	if (changedText == 'table_head_color' || changedText == 'ALL') {
		const styleElement = $("<style>")
			.attr("type", "text/css")
			.html(`.vis th { color: ${settingsForm.table_head_color.value} !important; }`);
		$("head").append(styleElement);
	}
	if (isUpdate) saveSettings();
}

function soundVolume(vol){
	document.getElementById("audio1").volume=vol;
}

function playSound(hang, ext='wav'){try{
	let hang2 = hang;
	if (hang.includes('farmolas')) hang2 ='farmolas';
	var isOn=document.getElementsByName(hang2)[0];
	if (isOn==undefined) {debug("hanghiba","Nem definiált hang: "+hang2); return}
	if (isOn.checked==false) return;
	var play = `https://raw.githubusercontent.com/cncDAni2/klanhaboru/main/images/szem4/${hang}.${ext}`;
	document.getElementById("wavhang").src=play;
	document.getElementById("audio1").load();
	document.getElementById("audio1").play();
	//setTimeout(function() { if (document.getElementById("audio1").paused) document.getElementById("audio1").play()}, 500);
}catch(e){alert2(e);}}

function validate(evt) {
	var theEvent = evt || window.event;
	var key = theEvent.keyCode || theEvent.which;
	key = String.fromCharCode( key );
	var regex = /[0-9]|\./;
	if( !regex.test(key) ) {
		theEvent.returnValue = false;
		if(theEvent.preventDefault) theEvent.preventDefault();
	}
}

function shorttest() {
	try {
		var hiba = ''; var warn = '';
		let optsForm = document.getElementById('farmolo_options');

		if (optsForm.termeles.value == '') hiba += 'Termelés/óra értéke üres. Legalább egy 0 szerepeljen!\n';
		if (parseInt(optsForm.termeles.value, 10) < 50) warn += "Termelés/óra értéke nagyon alacsony. Min 50\n";

		if (optsForm.maxtav_ora.value == '') hiba += 'Max táv/óra: Üres érték. \n';
		if (optsForm.maxtav_p.value == '') hiba += 'Max táv/perc: Üres érték. \n';
		if (parseInt(optsForm.maxtav_ora.value, 10) == 0 && parseInt(optsForm.maxtav_p.value, 10) < 1) hiba += 'A jelenleg megadott max távolság 0!\n';
		if (parseInt(optsForm.maxtav_ora.value, 10) == 0 && parseInt(optsForm.maxtav_p.value, 10) < 40) warn += 'A jelenleg megadott max távolság nagyon rövid!\n';

		if (optsForm.kemdb.value == '') hiba += 'Ha nem szeretnél kémet küldeni, írj be 0-t.\n';
		if (parseInt(optsForm.kemdb.value, 10) > 3) warn += '3-nál több kém egyik szerveren sem szükséges. Javasolt: 1 vagy 3.\n';
		if (optsForm.isforced.checked && parseInt(optsForm.kemdb.value, 10) == 0) warn += 'Kényszeríted a kémek küldését, de a küldendő kém értékére 0 van megadva!\n';

		if (optsForm.kemperc.value == '') hiba += 'Kém/perc üres. Ha mindig küldenél kémet, legyen 0, bár ilyenre semmi szükség';

		if (optsForm.minsereg.value == '') hiba += 'Ha minimum limit nélkül szeretnéd egységeid küldeni, írj be 0-t.\n';

		if (optsForm.sebesseg_p.value == '') hiba += 'A legkevesebb pihenő idő: 1 perc, ne hagyd üresen.\n';
		if (parseInt(optsForm.sebesseg_p.value, 10) < 1) hiba += 'A legkevesebb pihenő idő: 1 perc.\n';
		if (parseInt(optsForm.sebesseg_p.value, 10) > 30) warn += '30 percnél több pihenő időt adtál meg. Biztos?\n';
		if (parseInt(optsForm.sebesseg_p.value, 10) > 150) hiba += '150 percnél több pihenő időt nem lehet megadni.\n';
		if (optsForm.sebesseg_m.value == '') hiba += 'A leggyorsabb ciklusidő: 200 ms, ne hagyd üresen.\n';
		if (parseInt(optsForm.sebesseg_m.value, 10) < 200) hiba += 'A leggyorsabb ciklusidő: 200 ms\n';
		if (parseInt(optsForm.sebesseg_m.value, 10) > 5000) hiba += '5000 ms-nél több ciklusidő felesleges, és feltűnő. Írj be 5000 alatti értéket.\n';

		if (optsForm.raktar.value == '' || parseInt(optsForm.raktar.value, 10) < 20) hiba += 'Raktár telítettségi értéke túl alacsony, így vélhetőleg sehonnan se fog fosztani. Min 20%';

		if (optsForm.megbizhatosag.value == '' || parseInt(optsForm.megbizhatosag.value, 10) < 5 || parseInt(optsForm.megbizhatosag.value, 10) > 180) hiba += 'Megbízhatósági szint 5-180 perc között legyen';
		// inkább hogy az első szám legyen kisebb mint a megb.
		else MAX_IDO_PERC = parseInt(optsForm.megbizhatosag.value, 10);

		if (hiba != '' && !FARM_PAUSE) document.querySelector('#kiegs img[name="farm"]').click();
		if (hiba != '') {
			alert2('<b>Egy vagy több beállítási hiba miatt nem indítható a farmoló!</b><br><br>' + hiba);
			return false;
		} else {
			if (warn == '')
				alert2('close');
			else
				alert2('Javaslatok:\n' + warn);
		}
		for (const el of optsForm) {
			if (!el.name) continue;
			if (el.type == 'checkbox') {
				SZEM4_FARM.OPTIONS[el.name] = el.checked;
			} else {
				if (isNaN(el.value)) {
					SZEM4_FARM.OPTIONS[el.name] = el.value;
				} else {
					SZEM4_FARM.OPTIONS[el.name] = parseInt(el.value, 10);
				}
			}
		}
		return true;
	} catch (e) { alert2('Hiba validáláskor:\n' + e); }
}

var SUGOORA;
function sugo(el, str) {
	if (str == '') {
		document.getElementById("sugo").innerHTML=str;
		return;
	}
	if (!el.hasAttribute("data-hossz")) {
		el.addEventListener("mouseout", (event) => {
			SUGOORA = setTimeout(() => sugo(event.fromElement, ""), parseInt(event.fromElement.getAttribute('data-hossz'), 10));
		});
	}
	var hossz=str.length;
	hossz=Math.round((hossz*1000)/40);
	if (SUGOORA!="undefined") clearTimeout(SUGOORA);
	document.getElementById("sugo").innerHTML=str;
	el.setAttribute('data-hossz', hossz);
}

function prettyDatePrint(m) {
	return m.getFullYear() + "/" +
	("0" + (m.getMonth()+1)).slice(-2) + "/" +
	("0" + m.getDate()).slice(-2) + " " +
	("0" + m.getHours()).slice(-2) + ":" +
	("0" + m.getMinutes()).slice(-2) + ":" +
	("0" + m.getSeconds()).slice(-2);
}
function nyit(ezt){try{
	var temp=document.getElementById("content").childNodes;
	var cid="";
	for (var i=0;i<temp.length;i++) {
		if (temp[i].nodeName.toUpperCase()=="TABLE") {cid=temp[i].getAttribute("id");
		$("#"+cid).fadeOut(300);}
	} var patt=new RegExp("\""+ezt+"\"");
	temp=document.getElementById("menuk").getElementsByTagName("a");
	for (i=0;i<temp.length;i++) {
		temp[i].style.padding="3px";
		if (patt.test(temp[i].getAttribute("href"))) temp[i].style.backgroundColor="#000000"; else temp[i].style.backgroundColor="transparent";
	}
	setTimeout(function(){$("#"+ezt).fadeIn(300)},300);
	//addFlyingOptions(ezt);
}catch(e){alert(e);}}

function alert2(szov){
	szov=szov+"";
	if (szov=="close") {$("#alert2").hide(); return;}
	szov=szov.replace("\n","<br>");
	document.getElementById("alert2szov").innerHTML=szov;
	$("#alert2").show();
}

function naplo(script,szoveg){
	var d=new Date();
	var perc=d.getMinutes(); var mp=d.getSeconds(); if (perc<10) perc="0"+perc; if (mp<10) mp="0"+mp;
	var honap=new Array("Jan","Febr","March","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
	var table=document.getElementById("naploka");
	var row=table.insertRow(1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	var cell3=row.insertCell(2);
	cell1.innerHTML=honap[d.getMonth()]+" "+d.getDate()+", "+d.getHours()+":"+perc+":"+mp;
	cell2.innerHTML=script;
	cell3.innerHTML=szoveg;
	playSound("naplobejegyzes");
	return;
}
function debug(script,szoveg) {
	let d = new Date();
	var table=document.getElementById("debugger");
	var row=table.insertRow(1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	var cell3=row.insertCell(2);
	cell1.innerHTML=d.toLocaleString();
	cell2.innerHTML=script;
	cell3.innerHTML=szoveg;
	if (table.rows.length > 300) {
		$("#debugger").find('tr:gt(150)').remove();
	}
	if (table.rows.length > 10 && d - new Date(`${table.rows[10].cells[0].textContent}`) < 180000) {
		let errorCount = 0;
		for (var i = 1; i < 11; i++) {
			let cellText = table.rows[i].cells[2].textContent;
			if (cellText.toLowerCase().includes("error")) {
				errorCount++;
			}
		}
		if (errorCount > 4) {
			naplo('Auto-error', 'Túl sok hiba valahol?');
			playSound('kritikus_hiba');
		}
	}
}
function debug_urit() {
	$("#debugger").find('tr:gt(0)').remove();
}

function ujkieg(id,nev,tartalom){
	if (document.getElementById(nev)) return false;
	ALL_EXTENSION.push(id);
	document.getElementById("kiegs").innerHTML+='<img onclick=\'szunet("'+id+'",this)\' name="'+id+'" onmouseover=\'sugo(this,"Az érintett scriptet tudod megállítani/elindítani.")\' src="'+pic(((id=='farm'||id=='vije')?'pause':'play')+ ".png")+'" alt="Stop" title="Klikk a szüneteltetéshez"> <a href=\'javascript: nyit("'+id+'");\'>'+nev.toUpperCase()+'</a> ';
	document.getElementById("content").innerHTML+='<table class="menuitem" width="1024px" align="center" id="'+id+'" style="display: none">'+tartalom+'</table>';
	return true;
}
function ujkieg_hang(nev,hangok){
	try{var files=hangok.split(";");}catch(e){var files=hangok;}
	var hely=document.getElementById("hangok").getElementsByTagName("div")[0];
	var kieg=document.createElement("div"); kieg.setAttribute("style","display:table-cell; padding:10px;");
	var str="<h3>"+nev+"</h3>";
	for (var i=0;i<files.length;i++) {
		str+=`<input type="checkbox" name="${files[i]}" checked onchange="saveSettings()"> <a href="javascript: playSound('${files[i]}');"> ${files[i]} </a><br>`;
	}
	kieg.innerHTML=str;
	hely.appendChild(kieg);
	return;
}

function szunet(script,kep){try{
	switch (script) {
		case "farm":
			FARM_PAUSE=!FARM_PAUSE;
			var sw=FARM_PAUSE;
			break;
		case "vije":
			VIJE_PAUSE=!VIJE_PAUSE;
			var sw=VIJE_PAUSE;
			break;
		case "idtamad":
			alert2("Ezt a script nem állítható meg, mivel nem igényel semmilyen erőforrást.<br>Ha a hangot szeretnéd kikapcsolni, megteheted azt a hangbeállításoknál.");
			break;
		case "epit":
			EPIT_PAUSE=!EPIT_PAUSE;
			var sw=EPIT_PAUSE;
			break;
		case "adatok":
			ADAT_PAUSE=!ADAT_PAUSE;
			var sw=ADAT_PAUSE;
			break;
		default: {alert2("Sikertelen script megállatás. Nincs ilyen alscript: "+script);return;}
	}
	
	if (sw) {
		kep.src=pic("pause.png");
		kep.alt="Start";
		kep.title="Klikk a folytatáshoz";
	} else {
		kep.src=pic("play.png");
		kep.alt="Stop";
		kep.title="Klikk a szüneteltetéshez";
	}
	
	if (script=="farm") shorttest();
}catch(e){alert2("Hiba:\n"+e);}}

function distCalc(S,D){
	S[0]=parseInt(S[0]);
	S[1]=parseInt(S[1]);
	D[0]=parseInt(D[0]);
	D[1]=parseInt(D[1]);
	return Math.abs(Math.sqrt(Math.pow(S[0]-D[0],2)+Math.pow(S[1]-D[1],2)));
}

function rendez(tipus, isAsc, thislink, table_azon, oszlop){try{
/*Tipus: "szoveg" v "szam"*/
	var OBJ=document.getElementById(table_azon).getElementsByTagName("tbody")[0];
	var prodtable=document.getElementById(table_azon).rows;
	if (prodtable.length<2) return;
	var tavok=new Array(); var sorok=new Array(); var indexek=new Array();
	
	for (var i=1;i<prodtable.length;i++) {
		switch (tipus) {
			case "szoveg": tavok[i-1]=prodtable[i].cells[oszlop].textContent; break;
			case "szam":
				let tc = prodtable[i].cells[oszlop].textContent.trim();
				if (!tc || tc == '')
					tavok[i-1] = -0.1;
				else
					tavok[i-1]=parseInt(tc.replace(".",""));
				break;
			case "datum": if (prodtable[i].cells[oszlop].textContent.trim() == '') tavok[i-1]=getServerTime(); else tavok[i-1]=new Date(prodtable[i].cells[oszlop].textContent.trim()); break;
			case "datum2": var honap=new Array("Jan","Febr","March","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec");
				var d=new Date();
				var s=prodtable[i].cells[oszlop].textContent.trim();
				d.setMonth(honap.indexOf(s.split(" ")[0]));
				d.setDate(s.split(" ")[1].replace(",",""));
				d.setHours(s.split(" ")[2].split(":")[0]);
				d.setMinutes(s.split(" ")[2].split(":")[1]);
				d.setSeconds(s.split(" ")[2].split(":")[2]);
				tavok[i-1]=d; break;
			case "lista": tavok[i-1]=prodtable[i].cells[oszlop].getElementsByTagName("select")[0].value; break;
			default: throw("Nem értelmezhető mi szerint kéne rendezni."); return;
		}
		sorok[i-1]=prodtable[i];
		indexek[i-1]=i-1;
	}
	
	for (var i=0;i<tavok.length;i++) {
		var min=i;
		for (var j=i;j<tavok.length;j++) {
			if (isAsc) {if (tavok[j]>tavok[min]) min=j;}
			else {if (tavok[j]<tavok[min]) min=j;}
		}
		var Ttemp=tavok[i];
		tavok[i]=tavok[min];
		tavok[min]=Ttemp;
		
		var Ttemp=indexek[i];
		indexek[i]=indexek[min];
		indexek[min]=Ttemp;
	}
	
	for (var i=prodtable.length-1;i>0;i--) {
		OBJ.deleteRow(i);
	}
	
	for (var i=0;i<tavok.length;i++) {
		OBJ.appendChild(sorok[indexek[i]]);
	}
	
	thislink.setAttribute("onclick","rendez(\""+tipus+"\","+!isAsc+",this,\""+table_azon+"\","+oszlop+")");
	hideFarms();
	return;
}catch(e){alert2("Hiba rendezéskor:\n"+e);}}

function rovidit(tipus) {
	var ret="";
	switch (tipus) {
		case "egysegek": 
			for (var i=0;i<UNITS.length;i++)
			ret+=`<div class="szem4_unitbox" data-allunit="999" name="${UNITS[i]}"><label>
				<img src="/graphic/unit/unit_${UNITS[i]}.png">
				<input type="checkbox" name="${UNITS[i]}" onclick="szem4_farmolo_multiclick(${i},'honnan',this.checked)">
				</label></div>`;
			break;
		default: ret="";
	}
	return ret;
}

function getServerTime(ref, isSilent=false) {
	if (ref) {
		if (ref.document.getElementById('serverTime') && ref.document.getElementById('serverDate')) {
			let currentDate = convertDateString(ref.document.getElementById('serverTime').textContent, ref.document.getElementById('serverDate').textContent);
			let newDate = new Date();
			let diff = currentDate - newDate;
			if (Math.abs(diff / 60000) > 2) {
				let newZone = Math.round(diff / 900000) * 15;
				if (TIME_ZONE != newZone && !isSilent) naplo('Időzóna 🕐', `Időeltolódás frissítve: eltolódás ${TIME_ZONE} perccel.`);
				TIME_ZONE = newZone;
			}
		} else {
			if (!isSilent) naplo('Időzóna 🕐', `Nem megállapítható időzóna (betöltetlen lap?), frissítés sikertelen.`);
		}
	}
	let newDate = new Date();
	newDate.setMinutes(newDate.getMinutes() + TIME_ZONE);
	return newDate;

	function convertDateString(timeString, dateString) {
		let dateParts = dateString.split("/");
		let newDate = dateParts[1] + "/" + dateParts[0] + "/" + dateParts[2];
		return new Date(newDate + " " + timeString);
	}
}

function maplink(koord){
	return '<a href="'+VILL1ST.replace("screen=overview","x="+koord.split("|")[0]+"&y="+koord.split("|")[1]+"&screen=map")+'" target="_BLANK">'+koord+'</a>';
}
/*dupla klikk események*/
function multipricer(ez,tip,s1){try{
	if (ez==undefined) return;
	if (!(document.getElementById("farm_multi_"+ez).checked)) return;
	var x=document.getElementById("farm_"+ez).rows;
	for (var i=x.length-1;i>0;i--) {
		if (x[i].style.display!="none") {
			let koord = x[i].closest('tr').cells[0].textContent;
			SZEM4_FARM.DOMINFO_FARMS[koord].szin = SZEM4_FARM.DOMINFO_FARMS[koord].szin || {};
			switch(tip) {
				case "del": delete SZEM4_FARM.DOMINFO_FARMS[koord]; x[i].parentNode.removeChild(x[i]); break;
				case "urit": x[i].cells[2].innerHTML=""; break;
				case "mod": SZEM4_FARM.DOMINFO_FARMS[koord].nyers = parseInt(s1, 10); x[i].cells[3].innerHTML=s1; break;
				case "htor":
					SZEM4_FARM.DOMINFO_FARMS[koord].szin.falu = '';
					x[i].cells[0].style.backgroundColor="#f4e4bc";
					break;
				case 'hreset':
					SZEM4_FARM.DOMINFO_FARMS[koord].szin.fal = '';
					SZEM4_FARM.DOMINFO_FARMS[koord].szin.marks = '';
					x[i].cells[2].style.backgroundColor = s1;
					x[i].cells[2].style.border = '';
					break;
				case "hcser": 
					SZEM4_FARM.DOMINFO_FARMS[koord].szin.fal = s1;
					x[i].cells[2].style.backgroundColor=s1;
					break;
				case 'addmark':
					SZEM4_FARM.DOMINFO_FARMS[koord].szin.marks = s1;
					x[i].cells[2].style.border = `2px solid ${s1}`;
					break;
			}
		}
	}
}catch(e){ console.error(e); }}

function sortorol(cella,ismulti) {
	var row = cella.parentNode;
	delete SZEM4_FARM.DOMINFO_FARMS[row.cells[0].textContent];
	delete SZEM4_FARM.DOMINFO_FROM[row.cells[0].textContent];
	row.parentNode.removeChild(row);
	multipricer(ismulti, "del");
}
function urit(cella,ismulti){
	cella.innerHTML="";
	multipricer(ismulti,"urit");
}
function modosit_szam(cella){
	var uj=prompt('Új érték?');
	if (uj==null) return;
	uj=uj.replace(/[^0-9]/g,"");
	if (uj=="") return;
	uj = parseInt(uj, 10);
	cella.innerHTML=uj;
	SZEM4_FARM.DOMINFO_FARMS[cella.closest('tr').cells[0].textContent].nyers = uj;
	multipricer("hova","mod",uj);
}
function hattertolor(cella) {
	cella.style.backgroundColor="#f4e4bc";
	let koord = cella.closest('tr').cells[0].textContent;
	SZEM4_FARM.DOMINFO_FARMS[koord].szin = SZEM4_FARM.DOMINFO_FARMS[koord].szin || {};
	SZEM4_FARM.DOMINFO_FARMS[koord].szin.falu = '';
	multipricer("hova","htor");
}
function hattercsere(cella){
	var szin = "#00FF00";
	let koord = cella.closest('tr').cells[0].textContent;
	SZEM4_FARM.DOMINFO_FARMS[koord].szin = SZEM4_FARM.DOMINFO_FARMS[koord].szin || {};

	if (cella.style.backgroundColor=="rgb(0, 255, 0)" || cella.style.backgroundColor=="#00FF00") {
		if (cella.style.border) {
			szin="#f4e4bc";
			cella.style.backgroundColor = szin;
			SZEM4_FARM.DOMINFO_FARMS[koord].szin.fal = '';
			cella.style.border = '';
			SZEM4_FARM.DOMINFO_FARMS[koord].szin.marks = '';
			multipricer("hova","hreset",szin);
		} else {
			szin='blue';
			cella.style.border = `2px solid ${szin}`;
			SZEM4_FARM.DOMINFO_FARMS[koord].szin.marks = szin;
			multipricer("hova","addmark",szin);
		}
	} else {
		cella.style.backgroundColor = szin;
		SZEM4_FARM.DOMINFO_FARMS[koord].szin.fal = szin;
		multipricer("hova","hcser",szin);
	}
	
}
function addFreezeNotification() {
	if (!USER_ACTIVITY) document.getElementById('global_notifications').innerHTML = `<img src="${pic('freeze.png')}" class="rotate" onmouseover="sugo(this,'Amíg SZEM keretrendszert piszkálod, SZEM pihen hogy fókuszálni tudj (automata)')">`;
	USER_ACTIVITY = true;
	clearTimeout(USER_ACTIVITY_TIMEOUT);
	USER_ACTIVITY_TIMEOUT = setTimeout(() => {
		USER_ACTIVITY = false;
		document.getElementById('global_notifications').innerHTML = '';
	}, 5000);
}

var BOTORA, ALTBOT2=false, BOT_VOL=0.0; /*ALTBOT2 --> megnyílt e már 1x az ablak*/
var BOT_REF;
function BotvedelemBe(){
	try{
		if (!BOT_REF) {
			BOT_REF = window.open(VILL1ST);
			throw "Waiting for auto-resolver...";
		} else if (BOT_REF.document.getElementById('botprotection_quest')) {
			BOT_REF.document.getElementById('botprotection_quest').click();
		} else if (BOT_REF.document.getElementById('bot_check')) {
			BOT_REF.document.getElementById('bot_check').getElementsByTagName('a')[0].click();
		}
		if (BOT_REF && !(BOT_REF.document.getElementById('bot_check') || BOT_REF.document.getElementById('popup_box_bot_protection') || BOT_REF.document.title=="Bot védelem" || BOT_REF.document.getElementById('botprotection_quest'))) {
			BotvedelemKi();
			return;
		}
		BOT_VOL+=0.2;
		if (BOT_VOL>1.0) BOT_VOL=1.0;
		soundVolume(BOT_VOL);
		playSound("bot2");
		BOT=true;
		alert2('BOT VÉDELEM!!!<br>Írd be a kódot, és kattints ide lentre!<br><br><a href="javascript: BotvedelemKi()">Beírtam a kódot, mehet tovább!</a>');
		if (SZEM4_SETTINGS.altbot && !ALTBOT2) {
			window.open(document.getElementById("altbotURL").value);
			ALTBOT2=true;
		}
	} catch(e){ debug("BotvedelemBe()",e); }

	BOTORA = setTimeout("BotvedelemBe()", 2500);
}
function BotvedelemKi(){
	BOT=false; ALTBOT2=false; BOT_VOL=0.0;
	BOT_REF.close();
	BOT_REF = null;
	document.getElementById("audio1").pause;
	alert2("OK");
	clearTimeout(BOTORA);
	/*Megnyitott lapok frissítése*/
	try{FARM_REF.location.reload();}catch(e){}
	try{VIJE_REF1.location.reload();}catch(e){}
	try{VIJE_REF2.location.reload();}catch(e){}
	try{IDTAMAD_REF.location.reload();}catch(e){}
	try{EPIT_REF.location.reload();}catch(e){}
	return;
}

function isPageLoaded(ref,faluid,address){try{
	if (ref.closed) return false;
	if (ref.document.getElementById('botprotection_quest')) {
		ref.document.getElementById('botprotection_quest').click();
		naplo("Globális","Bot védelem aktív!!!");
		document.getElementById("audio1").volume=0.2;
		BotvedelemBe();
		return false;
	}
	if (ref.document.getElementById('bot_check')) {
		BOT_REF.document.getElementById('bot_check').getElementsByTagName('a')[0].click();
		naplo("Globális","Bot védelem aktív!!!");
		document.getElementById("audio1").volume=0.2;
		BotvedelemBe();
		return false;
	}
	if (ref.document.getElementById('bot_check') || ref.document.getElementById('popup_box_bot_protection') || ref.document.title=="Bot védelem") {
		naplo("Globális","Bot védelem aktív!!!");
		document.getElementById("audio1").volume=0.2;
		BotvedelemBe();
		return false;
	}
	if (ref.document.location.href.indexOf("sid_wrong")>-1) {
		naplo("Globális","Kijelentkezett fiók. Jelentkezzen be újra, vagy állítsa le a programot.");
		BotvedelemBe();
		return false;
	}
	if (!address) return false;
	if (address.indexOf("not ")>-1) var neg=true; else var neg=false;
	if (faluid>-1) if (ref.game_data.village.id!=faluid) return false;
	if (ref.document.getElementById("serverTime").innerHTML.length>4) {
		if (neg) {
			if (ref.document.location.href.indexOf(address.split(" ")[1])==-1) return true;
		} else {
			if (ref.document.location.href.indexOf(address)>-1)	return true;
		}
	}
	return false;
}catch(e){return false;}}
function windowOpener(id, url, windowId) {
	return window.open(url, windowId);
}
function addTooltip(el, text) {
	removeTooltip(el.closest('.tooltip-wrapper'));
	$(el).children('.tooltip_text').css({"display": "block"})
	$(el).children('.tooltip_text').html(text);
}
function addTooltip_build(el, koord) {
	removeTooltip(el.closest('.tooltip-wrapper'));
	el.querySelector('.tooltip_text').style.display = "block";

	const isNew = koord in SZEM4_VIJE.ALL_VIJE_SAVED;
	if (isNew) el.querySelector('.tooltip_text').classList.remove('szem_old_build_tooltip'); else el.querySelector('.tooltip_text').classList.add('szem_old_build_tooltip');
	let buildingTooltip = `<table class="no-bg-table">`;
	const i18nBuildings=document.getElementById("vije_opts");
	for (build in SZEM4_FARM.DOMINFO_FARMS[koord].buildings) {
		if (SZEM4_FARM.DOMINFO_FARMS[koord].buildings[build] < 1) continue;
		buildingTooltip += `<tr><td>${i18nBuildings[build].value}:</td><td>${SZEM4_FARM.DOMINFO_FARMS[koord].buildings[build]}</td></tr>`
	}
	buildingTooltip += '</table>';
	buildingTooltip += `<br><i>Felderítés ideje:<br>${isNew ? new Date(SZEM4_VIJE.ALL_VIJE_SAVED[koord]).toLocaleString() : 'Ismeretlen/régi'}</i>`
	el.querySelector('.tooltip_text').innerHTML = buildingTooltip;
}
function removeTooltip(el) {
	$(el).find('.tooltip_hover').each(function(i, el) {
		var thisText = $(el).children('.tooltip_text').html();
		if (thisText == "") return;
		$(el).children('.tooltip_text').html("");
		$(el).children('.tooltip_text').css({"display": "none"});
	});
}
function switchMobileMode() {
	MOBILE_MODE = !MOBILE_MODE;
	alert(`Mobile Mode = ${MOBILE_MODE}`);
}
function saveSettings() {
	const allOptions = document.getElementById('settings');
	SZEM4_SETTINGS = {};
	Array.from(allOptions.elements).forEach((input) => {
		if (input.name) {
			if (input.type === 'checkbox') {
				SZEM4_SETTINGS[input.name] = input.checked;
			} else if (input.value) {
				SZEM4_SETTINGS[input.name] = input.value;
			}
		}
	});
}
function loadSettings() {
	const allOptions = document.getElementById('settings');
	Array.from(allOptions.elements).forEach((input) => {
		if (input.name && SZEM4_SETTINGS[input.name] !== undefined) {
			if (input.type === 'checkbox') {
				input.checked = SZEM4_SETTINGS[input.name];
			} else if (input.value) {
				input.value = SZEM4_SETTINGS[input.name];
			}
		}
	});
	onWallpChange(false, 'ALL');
}

function restartKieg(type) {
	worker.postMessage({'id': 'stopTimer', 'value': type});
	setTimeout(function() {
		switch (type) {
			case 'farm': szem4_farmolo_motor(); break;
			case 'vije': szem4_VIJE_motor(); break;
			case 'epit': szem4_EPITO_motor(); break;
		}
	}, 133);
}
/* ------------------- FARMOLÓ ----------------------- */
function drawWagons(koord) {
	let farms = document.getElementById('farm_hova').rows;
	if (!koord) {
		for (var i=1;i<farms.length;i++) {
			addWagons(farms[i]);
		}
	} else {
		for (var i=1;i<farms.length;i++) {
			if (farms[i].cells[0].textContent == koord) {
				addWagons(farms[i]);
				break;
			}
		}
	}
}
function addWagons(farmRow) {
	let koord = farmRow.cells[0].textContent;
	let attacks = SZEM4_FARM.ALL_UNIT_MOVEMENT[koord];
	
	farmRow.cells[5].innerHTML = ''; //Fixme: Nem csak ez van  (Why? lesz?) itt, ne töröld az egészet
	if (!attacks) return;
	attacks.sort((a, b) => a[1] - b[1]);
	const tmp = document.createElement('div');
	tmp.setAttribute('class', 'tooltip-wrapper');
	let tmp_content = '';
	let prodHour = SZEM4_FARM.DOMINFO_FARMS[koord].prodHour;
	attacks.forEach((attack, index) => {
		let wagonType = 'wagon_normal.png';
		if (attack[2] > (prodHour * 5)) wagonType = 'wagon_nuclear.png';
		else if (attack[2] > (prodHour * 2)) wagonType = 'wagon_coal.png';
		else if (attack[2] < 5 && attack[0] < 5) wagonType = 'wagon_empty.png';

		let min = Math.round(convertTbToTime(farmRow.cells[1].textContent, attack[0]));
		tmp_content += `
		<span onmouseenter="setTooltip(this, ${index})" class="tooltip_hover">
			<img src="${pic(wagonType)}?v=4" title="" width="40px">
			<span class="wagon_time">${(min>3 && wagonType!='wagon_nuclear.png')?min:''}</span>
			<span class="tooltip_text"></span>
		</span>`
	});
	tmp.innerHTML = tmp_content;
	farmRow.cells[5].appendChild(tmp);
}
function setTooltip(el, index) {
	let farmRow = el.closest('tr');
	let farmCoord = farmRow.cells[0].textContent;
	let attack = [...SZEM4_FARM.ALL_UNIT_MOVEMENT[farmCoord][index]];
	let min = convertTbToTime(farmRow.cells[1].textContent, attack[0]);
	let kezdet = new Date(attack[1]);
	kezdet.setSeconds(kezdet.getSeconds() - (min * 60));
	min = min.toFixed(2);

	let content = `<table class="no-bg-table">
		<tr><td>Szerelvény hossza</td><td><div class="flex_middle">${min} perc (<img src="${pic('resource.png')}"> ${attack[0]})</div></td></tr>
		<tr><td>Szerelvény kezdete</td><td>${kezdet.toLocaleString()}</td></tr>
		<tr><td>Érkezés</td><td>${new Date(attack[1]).toLocaleString()}</td></tr>
		<tr><td>Extra nyers</td><td><div class="flex_middle"><img src="${pic('resource.png')}"> ${attack[2]}</div></td></tr>
		<tr><td>Nyerstermelés/óra</td><td>${getProdHour(farmRow.cells[1].textContent)}</td></tr>
	</table>
	<i>Utolsó jelentés: ${SZEM4_VIJE.ALL_VIJE_SAVED[farmCoord] ? new Date(SZEM4_VIJE.ALL_VIJE_SAVED[farmCoord]).toLocaleString() : 'Nincs'}</i>`;
	addTooltip(el, content);
}
function add_farmolando(){try{
	let addFarmolandoFaluk = document.getElementById('add_farmolando_faluk');
	var faluk = addFarmolandoFaluk.value;
	if (faluk == '') return;
	var patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (!patt.test(faluk)) throw "Nincs érvényes koordináta megadva";
	faluk = faluk.match(/[0-9]+(\|)[0-9]+/g);
	
	var dupla='';
	let defaultProdHour = parseInt(document.getElementById('farmolo_options').termeles.value,10);
	for (var i=0;i<faluk.length;i++) {
		if (SZEM4_FARM.DOMINFO_FARMS[faluk[i]] || SZEM4_FARM.DOMINFO_FROM[faluk[i]]) {
			dupla+=faluk[i] + ', ';
			faluk[i] = '';
			continue;
		}
		const a=document.getElementById("farm_hova");
		const a_row=a.insertRow(-1); 
		var c=a_row.insertCell(0); c.innerHTML=faluk[i]; c.setAttribute("ondblclick","hattertolor(this)");
		var c=a_row.insertCell(1); c.innerHTML=""; c.setAttribute("ondblclick",'sortorol(this,"hova")');
		var c=a_row.insertCell(2);
			c.innerHTML=`<span class="tooltip_hover">
				0
				<span class="tooltip_text"></span>
			</span>`;
			c.setAttribute("ondblclick","hattercsere(this)");
			c.setAttribute("onclick","learnCatapult(this)");
			c.setAttribute("onmouseenter",`addTooltip_build(this, '${faluk[i]}')`);
			c.setAttribute("onmouseleave",'removeTooltip(this)');
		var c=a_row.insertCell(3); c.innerHTML="0"; c.setAttribute("ondblclick",'modosit_szam(this)');
		var c=a_row.insertCell(4); c.innerHTML='<input type="checkbox" onclick="szem4_farmolo_multiclick(0,\'hova\',this.checked)">';
		var c=a_row.insertCell(5); c.innerHTML=""; c.setAttribute("onmouseleave",'removeTooltip(this)');
		SZEM4_FARM.DOMINFO_FARMS[faluk[i]] = {
			prodHour: defaultProdHour,
			buildings: {},
			nyers: 0,
			szin: {
				falu: '',
				fal: '',
				marks: ''
			},
			isJatekos: false
		};
	}
		
	addFarmolandoFaluk.value="";
	let text = '';
	if (Object.keys(SZEM4_FARM.DOMINFO_FARMS).length > 200) {
		text += 'Túl sok farm, csak az első 200-at jelenítem meg (ettől még aktívak és szűrhetőek/rendezhetőek)\n';
	}
	hideFarms();
	if (dupla!="") text+='Dupla falumegadások kiszűrve:\n' + dupla;
	if (text !== '') alert2(text);
	return;	
}catch(e){alert(e);}}
function add_farmolo(){ try{
	const addFaluk = document.getElementById('add_farmolo_faluk');
	let faluk = addFaluk.value;
	if (faluk == '') return;
	const patt = new RegExp(/[0-9]+(\|)[0-9]+/);
	if (!patt.test(faluk)) throw "Nincs érvényes koordináta megadva";
	faluk = faluk.match(/[0-9]+(\|)[0-9]+/g);
	
	if (!document.querySelector('#add_farmolo_egysegek input:checked')) {
		if (!confirm('Nincs semmilyen egység megadva, amit küldhetnék. Folytatod?\n(később ez a megadás módosítható)')) return;
	}
	
	for (var i=0;i<faluk.length;i++) {
		if (!SZEM4_FARM.DOMINFO_FROM[faluk[i]] && KTID[faluk[i]]) {
			SZEM4_FARM.DOMINFO_FROM[faluk[i]] = {
				isUnits: {},
				noOfUnits: {}
			};
			document.querySelectorAll('#add_farmolo_egysegek input').forEach((el) => {
				SZEM4_FARM.DOMINFO_FROM[faluk[i]].isUnits[el.name] = el.checked;
				SZEM4_FARM.DOMINFO_FROM[faluk[i]].noOfUnits[el.name] = 999;
			});

			add_attackerRow(faluk[i]);
		}
	}
	addFaluk.value="";
	return;	
} catch(e) {
	alert(e);
}}

/**
 * @description Limitálja hogy max 200 farm jelenjen meg egyszerre, performancia okok végett
 */
function hideFarms() {
	const allFarm = document.getElementById('farm_hova').rows;
	let visible = 0;
	for (let i=0;i<allFarm.length;i++) {
		if (allFarm[i].style.display !== 'none') visible++;
		if (visible > 200) allFarm[i].classList.add('szem4_farms_overflow'); else allFarm[i].classList.remove('szem4_farms_overflow');
	}
}

function add_attackerRow(attackerCoord) {
	const attackerRow = document.querySelector(`#ffrom_${attackerCoord.replace('|','-')}`);
	if (!attackerRow) {
		// CREATE
		const a = document.getElementById("farm_honnan");
		const b = a.insertRow(-1);
		b.setAttribute('id', `ffrom_${attackerCoord.replace('|','-')}`);
		let c = b.insertCell(0);
		c.innerHTML = attackerCoord;
		c.setAttribute("ondblclick",'sortorol(this,"honnan")');
	
		c = b.insertCell(1);
		c.innerHTML = rovidit("egysegek");
		c.querySelectorAll('input').forEach((el) => {
			el.checked = SZEM4_FARM.DOMINFO_FROM[attackerCoord].isUnits[el.name];
		});
	} else {
		// UPDATE (Not a valid case)
	}
}

function rebuildDOM_farm() {try{
	// BEÁLLÍTÁSOK
	const optsForm = document.querySelector('#farmolo_options');
	for (const el of optsForm) {
		if (!el.name || SZEM4_FARM.OPTIONS[el.name] == undefined) continue;
		if (el.type == 'checkbox') {
			el.checked = SZEM4_FARM.OPTIONS[el.name];
		} else {
			el.value = SZEM4_FARM.OPTIONS[el.name];
		}
	}

	// FARMOLÓ FALUK
	$("#farm_honnan tr:gt(0)").remove();
	for (attacker in SZEM4_FARM.DOMINFO_FROM) {
		add_attackerRow(attacker);
	}

	// FARMOK
	const farmTable = document.getElementById('farm_hova');
	$("#farm_hova tr:gt(0)").remove();
	for (farm in SZEM4_FARM.DOMINFO_FARMS) {
		SZEM4_FARM.DOMINFO_FARMS[farm].szin = SZEM4_FARM.DOMINFO_FARMS[farm].szin || {};
		const a_row = farmTable.insertRow(-1);
		// HOVA
		let c = a_row.insertCell(0);
		c.innerHTML=farm;
		c.setAttribute("ondblclick","hattertolor(this)");
		if (SZEM4_FARM.DOMINFO_FARMS[farm].szin.falu) c.style.backgroundColor = SZEM4_FARM.DOMINFO_FARMS[farm].szin.falu;
		
		// BÁNYÁK
		const buildings = SZEM4_FARM.DOMINFO_FARMS[farm].buildings;
		c=a_row.insertCell(1);
		if (buildings.wood == undefined) {
			SZEM4_FARM.DOMINFO_FARMS[farm].prodHour = parseInt(document.getElementById('farmolo_options').termeles.value, 10);
		} else {
			let banyak = `${buildings.wood},${buildings.stone},${buildings.iron}`;
			c.innerHTML=`${banyak}`;
			SZEM4_FARM.DOMINFO_FARMS[farm].prodHour = getProdHour(banyak);
		}
		c.style.backgroundColor = SZEM4_FARM.DOMINFO_FARMS[farm].szin.banya;
		c.setAttribute("ondblclick",'sortorol(this,"hova")');
		
		// FAL
		c=a_row.insertCell(2);
		let fal = '';
		if (buildings.wall !== undefined) {
			fal = parseInt(buildings.wall,10);
			if (fal == 0) {
				if (buildings.main == 1) fal -= 2;
				if (buildings.main == 2) fal -= 1;
				if (buildings.barracks == 0) fal -= 1;
			}
		}
		c.innerHTML=`<span class="tooltip_hover">
			${fal}
			<span class="tooltip_text"></span>
		</span>`;
		c.setAttribute("onmouseenter",`addTooltip_build(this, '${farm}')`);
		c.setAttribute("ondblclick","hattercsere(this)");
		c.setAttribute("onclick","learnCatapult(this)");
		c.setAttribute("onmouseleave",'removeTooltip(this)');
		if (SZEM4_FARM.DOMINFO_FARMS[farm].szin.fal) c.style.backgroundColor = SZEM4_FARM.DOMINFO_FARMS[farm].szin.fal;
		if (SZEM4_FARM.DOMINFO_FARMS[farm].szin.marks) c.style.border = `2px solid ${SZEM4_FARM.DOMINFO_FARMS[farm].szin.marks}`;
		
		// NYERS
		c=a_row.insertCell(3); c.innerHTML=SZEM4_FARM.DOMINFO_FARMS[farm].nyers; c.setAttribute("ondblclick",'modosit_szam(this)');
		
		// J?
		c=a_row.insertCell(4); c.innerHTML=`<input type="checkbox" onclick="szem4_farmolo_multiclick(0,\'hova\',this.checked)" ${SZEM4_FARM.DOMINFO_FARMS[farm].isJatekos?'checked':''}>`;
		
		// WAGONS
		c=a_row.insertCell(5); c.innerHTML=""; c.setAttribute("onmouseleave",'removeTooltip(this)');
		drawWagons(farm);
	}
	hideFarms();
} catch(e) {
	debug('rebuildDOM_farms', e);
	alert2('ERROR__ rebuild: \n' + e);
}}

function learnCatapult(el){
	let coord = el.closest('tr').cells[0].textContent;
	let toCatapult = {};
	const ignoreCatapult=['wood', 'stone', 'iron', 'wall'];
	const i18nBuildings=document.getElementById("vije_opts");
	for (b in SZEM4_FARM.DOMINFO_FARMS[coord].buildings) {
		if (ignoreCatapult.includes(b) || SZEM4_FARM.DOMINFO_FARMS[coord].buildings[b] == 0) continue;
		toCatapult[i18nBuildings[b].value] = SZEM4_FARM.DOMINFO_FARMS[coord].buildings[b];
	}
	alert2(`Katapultozó script betanítva \n ${coord}`);
	console.info(coord, toCatapult);
	localStorage.setItem('cnc_katapult', `;${coord};${JSON.stringify(toCatapult)}`);
}

function szem4_farmolo_multiclick(no,t,mire){try{
	if (!(document.getElementById("farm_multi_"+t).checked)) return;
	var x=document.getElementById("farm_"+t).rows;
	if (t=="honnan") t=1; else t=4;
	for (var i=1;i<x.length;i++) {
		if (x[i].style.display!="none") x[i].cells[t].getElementsByTagName("input")[no].checked=mire;
	}
	return;
}catch(e){alert2("Hiba: "+t+"-"+no+"\n"+e);}}
function szem4_farmolo_csoport(tabla){try{
	var lista = prompt("Faluszűrő\nAdd meg azon faluk koordinátáit, melyeket a listában szeretnél látni. A többi falu csupán láthatatlan lesz, de tovább folyik a használata.\nSpeciális lehetőségid:\n-1: Csupán ezt az értéket adva meg megfordítódik a jelenlegi lista láthatósága (negáció)\n-...: Ha az első karakter egy - jel, akkor a felsorolt faluk kivonódnak a jelenlegi listából (különbség)\n+...: Ha az első karaktered +, akkor a felsorolt faluk hozzáadódnak a listához (unió)\nÜresen leokézva az összes falu láthatóvá válik");
	if (lista==null) return;
	var type="norm";
	if (lista=="-1") type="negalt";
		else {
			if (lista[0]=="-") type="kulonbseg";
			if (lista[0]=="+") type="unio";
		}
	if (lista=="") type="all";
	if (lista=="S") type="yellow";
	lista=lista.match(/[0-9]+(\|)[0-9]+/g);
	var uj=false; var jel;
	var x=document.getElementById("farm_"+tabla).rows;
	for (var i=1;i<x.length;i++) {
		uj=false; jel=x[i].cells[0].textContent;
		switch(type) {
			case "norm": if (lista.indexOf(jel)>-1) uj=true; break;
			case "negalt": if (x[i].style.display=="none") uj=true; break;
			case "kulonbseg": if (x[i].style.display!="none" && lista.indexOf(jel)==-1) uj=true; break;
			case "unio": if (x[i].style.display!="none" || lista.indexOf(jel)>-1) uj=true; break;
			case "all": uj=true; break;
			case "yellow": if (x[i].cells[0].style.backgroundColor=="yellow") uj=true; break;
		}
		if (uj) x[i].setAttribute("style","display:line"); else x[i].setAttribute("style","display:none");
	}
	hideFarms();
}catch(e){alert2("Hiba: \n"+e);}}
function getAllResFromVIJE(coord) {
	var allAttack = SZEM4_FARM.ALL_UNIT_MOVEMENT[coord];
	if (!allAttack) return 0;
	var allRes = 0;
	for (let att in allAttack) {
		allRes+=allAttack[att][2];
	}

	if (isNaN(allRes)) {debug('getAllResFromVIJE', 'allRes is NaN at ' + coord + ': ' + JSON.stringify(allAttack)); return 0;}
	return allRes;
}
function subtractNyersValue(coord, val) {
	var nyersTable = document.getElementById('farm_hova').rows;
	var cells;
	for (var i=1;i<nyersTable.length;i++) {
		cells = nyersTable[i].cells;
		if (cells[0].textContent == coord) {
			var oldValue = parseInt(cells[3].innerText,10);
			oldValue-=val;
			if (oldValue<0) oldValue=0;
			cells[3].innerHTML = oldValue;
			SZEM4_FARM.DOMINFO_FARMS[coord].nyers = oldValue;
			break;
		}
	}
}
function clearAttacks() {try{
	const currentTime = getServerTime().getTime();
	for (let item in SZEM4_FARM.ALL_UNIT_MOVEMENT) {
		// Current utáni érkezések kivágása
		var outdatedArrays = [];
		for (var i=SZEM4_FARM.ALL_UNIT_MOVEMENT[item].length-1;i>=0;i--) {
			// Ha VIJE nyersért ment csak, töröljük
			if (SZEM4_FARM.ALL_UNIT_MOVEMENT[item][i][1] <= currentTime && SZEM4_FARM.ALL_UNIT_MOVEMENT[item][i][0] < 30) {
				subtractNyersValue(item, SZEM4_FARM.ALL_UNIT_MOVEMENT[item][i][2]);
				SZEM4_FARM.ALL_UNIT_MOVEMENT[item].splice(i, 1);
				drawWagons(item);
				continue;
			}
			if (SZEM4_FARM.ALL_UNIT_MOVEMENT[item][i][1] <= currentTime - (MAX_IDO_PERC * 60000 * 2)) { // Kuka, ha nagyon régi
				SZEM4_FARM.ALL_UNIT_MOVEMENT[item].splice(i, 1);
				drawWagons(item);
				continue;
			}
			if (SZEM4_FARM.ALL_UNIT_MOVEMENT[item][i][1] <= currentTime) outdatedArrays.push(SZEM4_FARM.ALL_UNIT_MOVEMENT[item][i]);
		}
		// Beérkezett támadások nyerstörlése
		if (!outdatedArrays) continue;
		for (let movement of outdatedArrays) {
			if (movement.length != 3) {
				debug('clearAttacks', 'Anomaly, nem szabályszerű mozgás ('+item+'):'+JSON.stringify(movement)+' -- össz:'+JSON.stringify(outdatedArrays));
			}
			if (movement[2] > 0) {
				subtractNyersValue(item, movement[2]);
				movement[2] = 0;
			}
		}

		if (outdatedArrays.length < 2) continue;
		// Leghamarábbi keresése
		var closestArray = outdatedArrays.reduce(function(prev, current) {
			return (current[1] > prev[1]) ? current : prev;
		}, outdatedArrays[0]);

		SZEM4_FARM.ALL_UNIT_MOVEMENT[item] = SZEM4_FARM.ALL_UNIT_MOVEMENT[item].filter(function(array) {
			return array[1] >= closestArray[1];
		});
		drawWagons(item);
	}
	for (let item in SZEM4_VIJE.ALL_VIJE_SAVED) {
		if (SZEM4_VIJE.ALL_VIJE_SAVED[item] < currentTime - (3 * 60 * 60000)) {
			subtractNyersValue(item, 400000);
			delete SZEM4_VIJE.ALL_VIJE_SAVED[item];
		}
	}
}catch(e) {debug('clearAttacks', e);}}

function getProdHour(banyaszintek) {
	var prodHour = 0;
	if (banyaszintek.split(',').length < 3) {
		prodHour=document.getElementById("farmolo_options").termeles.value;
		if (prodHour != "") prodHour = parseInt(prodHour, 10); else prodHour = 1000;
	} else {
		var r=banyaszintek.split(",").map(item => parseInt(item, 10));
		prodHour=(TERMELES[r[0]]+TERMELES[r[1]]+TERMELES[r[2]])*SPEED;
	}
	return parseFloat(prodHour.toFixed(2),10);
}
function updateDefaultProdHour() {
	const newProdHour = parseInt(document.getElementById('farmolo_options').termeles.value, 10);
	for (koord in SZEM4_FARM.DOMINFO_FARMS) {
		if (SZEM4_FARM.DOMINFO_FARMS[koord].buildings.iron || SZEM4_FARM.DOMINFO_FARMS[koord].buildings.stone || SZEM4_FARM.DOMINFO_FARMS[koord].buildings.wood) continue;
		SZEM4_FARM.DOMINFO_FARMS[koord].prodHour = newProdHour;
	}
}
function getResourceProduction(prodHour, idoPerc) {try{
	// idoPerc alatt termelt mennyiség. idoperc MAX=megbízhatósági idő, vagy amennyi idő megtermelni határszám-nyi nyerset
	// var corrigatedMaxIdoPerc = getCorrigatedMaxIdoPerc(banyaszintek);
	if (idoPerc == 'max') idoPerc = parseInt(document.getElementById('farmolo_options').megbizhatosag.value, 10);
	// if (idoPerc == 'max') idoPerc = corrigatedMaxIdoPerc;

	var idoOra = idoPerc/60;
	return Math.round(prodHour * idoOra);
}catch(e) {debug('getResourceProduction', e);}}
function convertTbToTime(banyaszintek, tb) {
	var termeles = getProdHour(banyaszintek); // 1000 
	var idoPerc = (tb / termeles) * 60;
	return idoPerc;
}
function calculateNyers(farmCoord, travelTimeMinutes) {try{
	// Kiszámolja a többi támadásokhoz képest, mennyi a lehetséges nyers, kivonva amiért már megy egység.
	// Az érkezési idő +-X perc közötti rablási lefedettséget néz
	var foszthatoNyers = 0;
	var arriveTime = getServerTime();
	arriveTime.setSeconds(arriveTime.getSeconds() + (travelTimeMinutes * 60));
	arriveTime = arriveTime.getTime();
	if (!SZEM4_FARM.ALL_UNIT_MOVEMENT[farmCoord]) {
		foszthatoNyers = getResourceProduction(SZEM4_FARM.DOMINFO_FARMS[farmCoord].prodHour, 'max');
		return foszthatoNyers;
	}
	allAttack = SZEM4_FARM.ALL_UNIT_MOVEMENT[farmCoord];
	// Vonat:   [ ---- lastBefore ----|]        [ ---- firstAfter ---- |]
	//                         [ ---- arriveTime ----|]
	var closests = findClosestTimes(allAttack, arriveTime);
	var lastBefore = closests[0],
		firstAfter = closests[1];
	if (lastBefore) {
		foszthatoNyers+=getResourceProduction(SZEM4_FARM.DOMINFO_FARMS[farmCoord].prodHour, (arriveTime - lastBefore[1]) / 60000);
	} else {
		foszthatoNyers+=getResourceProduction(SZEM4_FARM.DOMINFO_FARMS[farmCoord].prodHour, 'max');
	}

	if (firstAfter) {
		let prodHour = SZEM4_FARM.DOMINFO_FARMS[farmCoord].prodHour;
		let minimumFrom = 0;

		for (let i=0; i<allAttack.length; i++) {
			if (allAttack[i][1] > arriveTime) {
				let lefedesIdo = (allAttack[i][0] / prodHour) * 60 * 60000
				let from = allAttack[i][1] - lefedesIdo;
				if (minimumFrom == 0 || minimumFrom > from) minimumFrom = from;
			}
		}
		if (minimumFrom < arriveTime)
			foszthatoNyers -= getResourceProduction(SZEM4_FARM.DOMINFO_FARMS[farmCoord].prodHour, (arriveTime - minimumFrom) / 60000);
	}
	return foszthatoNyers;
}catch(e) {debug('calculateNyers', e);}}
function findClosestTimes(allAttack, arriveTime) {
	let lastBefore = null;
	let firstAfter = null;

	for (let i=0; i<allAttack.length; i++) {
		if (allAttack[i][0] < 50) continue;
		let d = allAttack[i][1];
		if (d < arriveTime) {
			if (!lastBefore || d > lastBefore[1]) lastBefore = allAttack[i];
		} else if (d > arriveTime) {
			if (!firstAfter || d < firstAfter[1]) firstAfter = allAttack[i];
		}
	}

	return [lastBefore, firstAfter];
}
function addCurrentMovementToList(formEl, farmCoord, farmHelyRow) {try{
	var patternOfIdo = /<td>[0-9]+:[0-9]+:[0-9]+<\/td>/g;
	var travelTime = formEl.innerHTML.match(patternOfIdo)[0].match(/[0-9]+/g);
	travelTime = parseInt(travelTime[0],10) * 3600 + parseInt(travelTime[1],10) * 60 + parseInt(travelTime[2],10);
	var arriveTime = getServerTime();
	arriveTime.setSeconds(arriveTime.getSeconds() + travelTime);
	arriveTime = arriveTime.getTime();

	var teherbiras = parseInt(formEl.querySelector('.icon.header.ressources').parentElement.innerText.replaceAll('.',''), 10);
	var VIJE_teher = 0;
	var VIJE_nyers = SZEM4_FARM.DOMINFO_FARMS[farmCoord].nyers;
	if (VIJE_nyers > 0) {
		VIJE_nyers-=getAllResFromVIJE(farmCoord);
		if (VIJE_nyers > 0) {
			VIJE_teher = Math.min(teherbiras, VIJE_nyers);
			teherbiras-=VIJE_teher;
		}
	}

	if (teherbiras < 10 && VIJE_teher < 10) {
		debug('addCurrentMovementToList', `ERROR: ${formEl.querySelector('.icon.header.ressources').parentElement.innerText} -- teherbírás=0; Farm: ${farmCoord} | Innen: ${FARM_REF.game_data.village.display_name}`);
	}
	var allAttack = SZEM4_FARM.ALL_UNIT_MOVEMENT[farmCoord];
	if (!allAttack) {
		SZEM4_FARM.ALL_UNIT_MOVEMENT[farmCoord] = [[teherbiras, arriveTime, VIJE_teher]];
	} else {
		allAttack.push([teherbiras, arriveTime, VIJE_teher]);
	}
	addWagons(farmHelyRow);
	// KÉM?
	if (!FARM_REF.document.getElementById('place_confirm_units').querySelector('[data-unit="spy"]').getElementsByTagName('img')[0].classList.contains('faded')) {
		if (!SZEM4_FARM.ALL_SPY_MOVEMENTS[farmCoord] || SZEM4_FARM.ALL_SPY_MOVEMENTS[farmCoord] < arriveTime) SZEM4_FARM.ALL_SPY_MOVEMENTS[farmCoord] = arriveTime;
	}
}catch(e) {debug('addCurrentMovementToList', e); console.error(e);}}

function planAttack(farmRow, nyers_VIJE, bestSpeed, hatarszam) {try{
	// Megtervezi, miből mennyit küldjön SZEM. Falu megnyitása után intelligensen még módosíthatja ezt (2. lépés) (nem változtatva a MAX_SPEED-et)
	const farmCoord = farmRow.cells[0].textContent;
	const allOptions = document.getElementById('farmolo_options');
	const minSereg = parseInt(allOptions.minsereg.value, 10);
	const maxTavPerc = parseInt(allOptions.maxtav_ora.value, 10) * 60 + parseInt(allOptions.maxtav_p.value, 10);
	let plan = {};

	for (attacker in SZEM4_FARM.DOMINFO_FROM) {
		let unifiedTraverTime = (1/SPEED)*(1/UNIT_S);
		unifiedTraverTime = unifiedTraverTime*(distCalc(farmCoord.split("|"), attacker.split("|"))); /*a[i]<->fromVillRow távkeresés*/
		
		// Távolásszűrő: MAX távon belüli, legjobb?
		let priority = getSlowestUnit(SZEM4_FARM.DOMINFO_FROM[attacker]);
		if (priority == '') continue;
		while(true) {
			if (unifiedTraverTime * E_SEB[priority] > maxTavPerc) {
				if (priority == 'heavy') {
					if (unifiedTraverTime * E_SEB.light > maxTavPerc) break;
					priority = 'light'; // Talán!
				} else if (priority == 'sword') {
					if (unifiedTraverTime * E_SEB.spear > maxTavPerc) break;
					priority = 'spear'; // Talán!
				} else break;
			}
			let myTime = unifiedTraverTime * E_SEB[priority];
			if (bestSpeed !== -1 && myTime > bestSpeed) break;

			// Mennyi nyerset tudnék hozni? Határszámon belül van?
			let nyers_termeles = calculateNyers(farmCoord, myTime);
			if (isNaN(nyers_termeles)) { nyers_termeles = 0; debug('planAttack', `nyers_termeles = NaN - ${farmCoord}`); }
			if (isNaN(nyers_VIJE)) { nyers_VIJE = 0; debug('planAttack', `nyers_VIJE = NaN - ${farmCoord}`); } 
			if (!(Number.isInteger(nyers_VIJE) && Number.isInteger(nyers_termeles))) debug('planAttack', `Nem is szám: nyers_VIJE=${nyers_VIJE} -- nyers_termeles=${nyers_termeles}`);
			let max_termeles = (SZEM4_FARM.DOMINFO_FARMS[farmCoord].prodHour / 60) * SZEM4_FARM.OPTIONS.megbizhatosag;
			nyers_termeles = Math.min(nyers_termeles, max_termeles);
			let isMax = nyers_termeles == max_termeles;
			let teher = nyers_VIJE + nyers_termeles;
			if (teher < hatarszam) {
				if (priority == 'heavy' || priority == 'light') {
					priority = 'sword';
					continue;
				}
				break;
			}

			// buildArmy - mivel getSlowestUnit kérés volt, így ebből az egységből biztos van, nem lehet 0
			let plannedArmy = buildArmy(SZEM4_FARM.DOMINFO_FROM[attacker], priority, teher, isMax);
			if (plannedArmy.units.pop == 0) break;
			if (!isMax && (plannedArmy.units.pop < minSereg || plannedArmy.teher < hatarszam)) {
				break;
			}
			bestSpeed = myTime;
			plan = {
				fromVill: attacker,
				farmVill: farmCoord,
				units: {...plannedArmy.units},
				travelTime: myTime,
				slowestUnit: priority,
				nyersToFarm: teher,
				debug_teher: plannedArmy.teher,
				debug_hatar: hatarszam,
				isMax: isMax
			};
			break;
		}
	}
	return plan;
	//	Megállapítani, mennyi nyersért kell menni , prió heavy > light > sword > spear
	//		Megnézi pl. heavy-vel, ha nem 0 van belőle: erre számol egyet.
	//			Ha a távolság > min(eddigi_legjobb_terv, bestSpeed): újratervezés kl-ekkel (csak heavy/sword esetén!) (!! bestSpeed=0 -> nincs még legjobb)
	//			Ha ez határszám alatti: újratervezés gyalogosokkal
	//			Ha max táv-on túl van: újratervezés light/march-al (csak heavy esetén!)
	//			Ha TERV során nem tudtunk elég egységet megfogni, újratervezés gyalogosokkal
	//	Ha a végén üres az eddigi_legjobb_terv, akkor return "NO_PLAN"; -> ugrás a következő farmra
}catch(e) {console.error(e); debug('planAttack', e);}}
function buildArmy(attacker, priorityType, teher, isMax) {try{
	let originalTeher = teher;
	const availableUnits = UNITS.reduce((obj, unit) => {
		obj[unit] = attacker.isUnits[unit] ? attacker.noOfUnits[unit] : 0;
		return obj;
	}, {});

	const unitToSend = { pop: 0 };
	let temp_plan = {};
	switch (priorityType) {
		// ----------- LOVASSÁG -------------
		case 'heavy':
			temp_plan = useUpUnit('heavy', teher);
			if (temp_plan.pop == 0)
				return {
					units: unitToSend,
					teher: originalTeher - teher
				};
			teher -= temp_plan.teher;
			unitToSend.heavy = temp_plan.unit;
			unitToSend.pop += temp_plan.pop;
			if (teher < 40)	break;
		case 'light':
			temp_plan = useUpUnit('marcher', teher);
			if (temp_plan.pop !== 0) {
				teher -= temp_plan.teher;
				unitToSend.marcher = temp_plan.unit;
				unitToSend.pop += temp_plan.pop;
			}
			if (teher < 40)	break;

			temp_plan = useUpUnit('light', teher);
			if (temp_plan.pop !== 0) {
				teher -= temp_plan.teher;
				unitToSend.light = temp_plan.unit;
				unitToSend.pop += temp_plan.pop;
			}
			break;
		// ----------- GYALOGOS -------------
		case 'sword':
			temp_plan = useUpUnit('sword', teher);
			if (temp_plan.pop == 0)
				return {
					units: unitToSend,
					teher: originalTeher - teher
				};
			teher -= temp_plan.teher;
			unitToSend.sword = temp_plan.unit;
			unitToSend.pop += temp_plan.pop;
			if (teher < 40)	break;
		case 'spear':
			temp_plan = useUpUnit('spear', teher);
			if (temp_plan.pop !== 0) {
				teher -= temp_plan.teher;
				unitToSend.spear = temp_plan.unit;
				unitToSend.pop += temp_plan.pop;
			}
			if (teher < 20)	break;

			temp_plan = useUpUnit('axe', teher);
			if (temp_plan.pop !== 0) {
				teher -= temp_plan.teher;
				unitToSend.axe = temp_plan.unit;
				unitToSend.pop += temp_plan.pop;
			}
			if (teher < 20)	break;

			temp_plan = useUpUnit('archer', teher);
			if (temp_plan.pop !== 0) {
				teher -= temp_plan.teher;
				unitToSend.archer = temp_plan.unit;
				unitToSend.pop += temp_plan.pop;
			}
			break;
	}

	return {
		units: unitToSend,
		teher: originalTeher - teher
	};

	function useUpUnit(type, teher) {
		const usedUp = {
			pop: 0,
			unit: 0,
			teher: 0
		}
		if (availableUnits[type] == undefined || availableUnits[type] < 1) return usedUp;
		if (availableUnits[type] * TEHER[type] > teher) {
			usedUp.unit = Math.round(teher / TEHER[type]);
			if (isMax && usedUp.unit == 0) { usedUp.unit = 1; }
		} else {
			usedUp.unit = availableUnits[type];
		}
		usedUp.pop = usedUp.unit * TANYA[type];
		usedUp.teher = usedUp.unit * TEHER[type];
		return usedUp;
	}
}catch(e) {console.error(e); debug('buildArmy', e);}}
function extendArmy(oArmy, falukoord, slowestUnit) {try{
	/*  oArmy:
		units: {spear: 1, sword: 2, ..., pop: 3},
		teher: 322000
	 */
	switch(slowestUnit) {
		case 'heavy': tryAdd('heavy'); tryAdd('light'); tryAdd('marcher'); break;
		case 'light': tryAdd('light'); tryAdd('marcher'); break;
		case 'sword': tryAdd('sword'); tryAdd('axe'); tryAdd('spear'); tryAdd('archer'); break;
		case 'spear': tryAdd('axe'); tryAdd('spear'); tryAdd('archer'); break;
	}
	return oArmy;

	function tryAdd(unitType) {
		if (!SZEM4_FARM.DOMINFO_FROM[falukoord].isUnits[unitType]) return;
		if (!oArmy.units[unitType]) oArmy.units[unitType] = 0;
		while (oArmy.units.pop < SZEM4_FARM.OPTIONS.minsereg) {
			if (SZEM4_FARM.DOMINFO_FROM[falukoord].noOfUnits[unitType] < oArmy.units[unitType] + 1) {
				SZEM4_FARM.DOMINFO_FROM[falukoord].noOfUnits[unitType] = 0; //Hogy még 1x ne hozza fel, mert a minimumot se tudom elküldeni!
				break;
			}
			oArmy.units[unitType]++;
			oArmy.units.pop += TANYA[unitType];
			oArmy.teher += TEHER[unitType];
		}
	}
}catch(e){ console.error(e); debug('extendArmy', 'Error: '+e); return oArmy; }}

function getSlowestUnit(attacker) {try{
	// Get unit speed of the smallest available, but priorize horse
	// heavy > light,marcher > sword > spear,axe,archer
	const available_units = {};
	isUnit = false;
	for (let i=0;i<UNITS.length;i++) {
		if (UNITS[i] !== 'spy' && attacker.isUnits[UNITS[i]] && attacker.noOfUnits[UNITS[i]] > 0) {
			available_units[UNITS[i]] = true;
			isUnit = true;
		}
	}
	if (available_units.heavy) return 'heavy';
	if (available_units.light || available_units.marcher) return 'light';
	if (available_units.sword) return 'sword';
	if (isUnit) return 'spear';
	return '';
}catch(e) { debug('getSlowestUnit','Nem megállapítható egységsebesség, kl-t feltételezek ' + e); return E_SEB_ARR[5];}}
function updateAvailableUnits(attacker, isError=false) {try{
	for (let i=0;i<UNITS.length;i++) {
		let allUnit = parseInt(FARM_REF.document.getElementById(`units_entry_all_${UNITS[i]}`).textContent.match(/[0-9]+/g)[0],10);
		let unitToSendString = FARM_REF.document.getElementById(`unit_input_${UNITS[i]}`).value;
		if (unitToSendString == '') unitToSendString = 0;
		let unitToSend = isError ? 0 : parseInt(unitToSendString,10);
		attacker.noOfUnits[UNITS[i]] = allUnit - unitToSend;
	}
}catch(e) { console.error(e); debug('updateAvailableUnits', e);}}
function setNoUnits(attacker, unitType) {try{
	for (let i=0;i<UNITS.length;i++) {
		let unit = UNITS[i];
		if (unitType == 'troop' && (unit == 'spear' || unit == 'sword' || unit == 'axe' || unit == 'archer')) {
			attacker.noOfUnits[unit] = 0;
		}
		if (unitType == 'horse' && (unit == 'light' || unit == 'marcher' || unit == 'heavy')) {
			attacker.noOfUnits[unit] = 0;
		}
		if (unitType == 'all') {
			attacker.noOfUnits[unit] = 0;
		}
	}
}catch(e) { console.error(e); debug('setNoUnits', e);}}

function szem4_farmolo_1kereso(){try{/*Farm keresi párját :)*/
	// Nem pipálja a kémest az a baj
	var farmList = document.getElementById("farm_hova").rows;
	if (Object.keys(SZEM4_FARM.DOMINFO_FARMS) == 0 || Object.keys(SZEM4_FARM.DOMINFO_FROM) == 0) return "zero";
	var verszem = false;
	const targetIdo = SZEM4_FARM.OPTIONS.targetIdo;
	const maxWall = SZEM4_FARM.OPTIONS.maxfal;

	let bestPlan = { travelTime: -1 };
	for (var i=1;i<farmList.length;i++) {
		if (farmList[i].cells[0].style.backgroundColor=="red") continue;
		var farmCoord = farmList[i].cells[0].textContent;
		if (SZEM4_FARM.DOMINFO_FARMS[farmCoord].buildings.wall > maxWall) continue;
		let prodHour = SZEM4_FARM.DOMINFO_FARMS[farmCoord].prodHour;
		let hatarszam = prodHour * (targetIdo / 60);
		var nyers_VIJE = SZEM4_FARM.DOMINFO_FARMS[farmCoord].nyers;
		if (nyers_VIJE > 0) nyers_VIJE -= getAllResFromVIJE(farmCoord);
		verszem = false;
		if (nyers_VIJE > (hatarszam * 4)) verszem = true;
		
		/*Farm vizsgálat (a[i]. sor), legközelebbi saját falu keresés hozzá (van e egyátalán (par.length==3?))*/
		let attackPlan = planAttack(farmList[i], nyers_VIJE, verszem ? -1 : bestPlan.travelTime, hatarszam);
		
		if (attackPlan.travelTime && (bestPlan.travelTime == -1 || attackPlan.travelTime < bestPlan.travelTime)) {
			bestPlan = JSON.parse(JSON.stringify(attackPlan));
		}
		if (verszem && attackPlan.travelTime) {
			bestPlan = JSON.parse(JSON.stringify(attackPlan));
			break;
		}
	}
	return bestPlan;
}catch(e){debug('szem4_farmolo_1kereso()',e); return 'ERROR';}}

function szem4_farmolo_2illeszto(bestPlan){try{/*FIXME: határszám alapján számolódjon a min. sereg*/
	try{TamadUpdt(FARM_REF);}catch(e){}
	const allOptions = document.getElementById('farmolo_options');
	const minSereg = parseInt(allOptions.minsereg.value,10);
	const kemPerMin = parseInt(allOptions.kemperc.value,10);
	const kemdb = parseInt(allOptions.kemdb.value,10);
	const raktarLimit = parseInt(allOptions.raktar.value,10);
	const targetIdo = parseInt(allOptions.targetIdo.value,10);
	const hatarszam = SZEM4_FARM.DOMINFO_FARMS[bestPlan.farmVill].prodHour * (targetIdo / 60);
	const C_form = FARM_REF.document.forms["units"];
	
	// Kiiktatja ha van kiválasztott falu
	if (document.querySelector('#place_target .village-item')) document.querySelector('#place_target .village-item').click();

	if (!C_form) {
		if (FARM_REF.document.getElementById('command-data-form')) {
			C_form=FARM_REF.document.getElementById('command-data-form');
			debug('szem4_farmolo_2illeszto', 'ROllback-to-IDForm');
		} else {
			throw "Nincs gyülekezőhely?";
		}
	}
	if (C_form["input"].value == undefined) {
		throw "Nem töltött be az oldal? " + C_form["input"].innerHTML;
	}
	
	updateAvailableUnits(SZEM4_FARM.DOMINFO_FROM[bestPlan.fromVill]);
	//attackerRow, priorityType, teher
	const plannedArmy = buildArmy(SZEM4_FARM.DOMINFO_FROM[bestPlan.fromVill], bestPlan.slowestUnit, bestPlan.nyersToFarm);
	if (bestPlan.isMax && plannedArmy.units.pop < minSereg) {
		extendArmy(plannedArmy, bestPlan.fromVill, bestPlan.slowestUnit);
	}
	if (!plannedArmy.units || plannedArmy.units.pop < minSereg || plannedArmy.teher < hatarszam) {
		console.info(`Invalid config, replanning. minSereg: ${minSereg}, hatarszam: ${hatarszam}, prodHour: ${SZEM4_FARM.DOMINFO_FARMS[bestPlan.farmVill].prodHour} Config was:`, JSON.stringify(bestPlan), 'Config expected: ', JSON.stringify(plannedArmy));
		return 'semmi'; // FIXME: Nem jó, újratervezés
	}
	bestPlan.nyersToFarm = plannedArmy.teher;

	Object.entries(plannedArmy.units).forEach(entry => {
		const [unit, unitToSend] = entry;
		if (unit !== 'pop') {
			C_form[unit].value = unitToSend;
		}
	});

	// KÉMEK
	C_form.spy.value=0;
	let kemToSend = 0;
	if (SZEM4_FARM.DOMINFO_FROM[bestPlan.fromVill].isUnits.spy) {
		var ut_perc = distCalc(bestPlan.fromVill.split('|'), bestPlan.farmVill.split('|')) * E_SEB[bestPlan.slowestUnit] * (1/SPEED)*(1/UNIT_S);
		var erk = getServerTime();
		erk=erk.setSeconds(erk.getSeconds() + (ut_perc *60));
		
		if (!SZEM4_FARM.ALL_SPY_MOVEMENTS[bestPlan.farmVill] || (erk - SZEM4_FARM.ALL_SPY_MOVEMENTS[bestPlan.farmVill]) > (kemPerMin * 60000)) {
			let kemElerheto = FARM_REF.document.getElementById("unit_input_spy").parentNode.children[2].textContent.match(/[0-9]+/g)[0]
			kemElerheto = parseInt(kemElerheto, 10);
			kemToSend = (kemElerheto >= kemdb ? kemdb : 0)
			C_form.spy.value= kemToSend;
		}
	}

	/*Raktár túltelített?*/
	var nyersarany=((FARM_REF.game_data.village.wood+FARM_REF.game_data.village.stone+FARM_REF.game_data.village.iron) / 3) / FARM_REF.game_data.village.storage_max;
	if (Math.round(nyersarany*100)>parseInt(raktarLimit)) {
		setNoUnits(SZEM4_FARM.DOMINFO_FROM[bestPlan.fromVill], 'all');
		naplo('Farmoló', 'Raktár túltelített ebben a faluban: ' + bestPlan.fromVill + '. (' + Math.round(nyersarany*100) + '% > ' + raktarLimit + '%)');
		return "semmi";
	}

	C_form.x.value=bestPlan.farmVill.split("|")[0];
	C_form.y.value=bestPlan.farmVill.split("|")[1];
	
	updateAvailableUnits(SZEM4_FARM.DOMINFO_FROM[bestPlan.fromVill]);
	C_form.attack.click();

	bestPlan.units = JSON.parse(JSON.stringify(plannedArmy.units));
	return {
		plannedArmy: bestPlan,
		kem: kemToSend
	};
	//return [resultInfo.requiredNyers,ezt+'',adatok[2],adatok[3],slowestUnit,kek,resultInfo.debugzsak]; /*nyers_maradt;all/gyalog/semmi;honnan;hova;speed_slowest;kém ment e;teherbírás*/
}catch(e){debug("Illeszto()",e);FARM_LEPES=0;return "";}}

function szem4_farmolo_3egyeztet(adatok){try{
	var farm_helye=document.getElementById("farm_hova").rows;
	for (var i=1;i<farm_helye.length;i++) {
		if (farm_helye[i].cells[0].textContent==adatok.plannedArmy.farmVill) {farm_helye=farm_helye[i]; break;}
	}
	
	/*Piros szöveg*/
	try {
		if (FARM_REF.document.getElementById("content_value").getElementsByTagName("div")[0].getAttribute("class")=="error_box") {
			naplo("Farmoló", `Hiba  ${adatok.plannedArmy.farmVill} farmolásánál: ${FARM_REF.document.getElementById("content_value").getElementsByTagName("div")[0].textContent}. Tovább nem támadom`);
			farm_helye.cells[0].style.backgroundColor="red";
			SZEM4_FARM.DOMINFO_FARMS[adatok.plannedArmy.farmVill].szin.falu = 'red';
			if (FARM_REF.document.querySelector('.village-item')) {
				FARM_REF.document.querySelector('.village-item').click();
			}
			updateAvailableUnits(SZEM4_FARM.DOMINFO_FROM[adatok.plannedArmy.fromVill], true);
			return "ERROR";
		}
	}catch(e){ console.error('szem4_farmolo_3egyeztet - piros szöveg', e); }
	
	/*Játékos-e?*/	
	try{
		if (FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows[2].cells[1].getElementsByTagName("a")[0].href.indexOf("info_player")>-1) {
			if (!farm_helye.cells[4].getElementsByTagName("input")[0].checked) {
				naplo("Farmoló", `Játékos ${maplink(adatok.plannedArmy.farmVill)} helyen: ${FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows[2].cells[1].innerHTML.replace("href",'target="_BLANK" href')}. Tovább nem támadom`);
				FARM_REF = windowOpener('farm', VILL1ST.replace("screen=overview","screen=place"), AZON+"_Farmolo"); // Ki kell ütni a nézetből
				farm_helye.cells[0].style.backgroundColor="red";
				updateAvailableUnits(SZEM4_FARM.DOMINFO_FROM[adatok.plannedArmy.fromVill], true);
				return "ERROR";
			}
		}
	}catch(e){ /* Nem az... */ }

	/* TravelTime egyezik? */
	let timeFormatted = FARM_REF.document.querySelector('#content_value .vis').rows[2].cells[1].textContent;
	let writedTime = timeFormatted.split(':').map((a) => parseInt(a, 10));
	writedTime = writedTime[0] * 60 + writedTime[1] + (writedTime[2] / 60);
	if (Math.abs(writedTime - adatok.plannedArmy.travelTime) > 0.05) {
		debug('szem4_farmolo_3egyeztet', `A tervezett idő (${adatok.plannedArmy.travelTime} perc) nem egyezik a küldendő idővel: ${timeFormatted}.`);
		return "ERROR";
	}

	/* Teherbírás egyezik? */
	// try{
	// 	var a = FARM_REF.document.getElementById("content_value").getElementsByTagName("table")[0].rows;
	// 	a = parseInt(a[a.length-1].cells[0].textContent.replace(/[^0-9]+/g,""));
	// 	if (adatok.plannedArmy.nyersToFarm != a) debug("farm3","Valódi teherbírás nem egyezik a kiszámolttal. Hiba, ha nincs teherbírást módosító \"eszköz\".");
	// }catch(e){ console.error('szem4_farmolo_3egyeztet - teherbiras',e) }

	/* KÉK háttér bányára? */
	if (adatok.kem > 0 && farm_helye.cells[1].textContent == '') {
		const scoutColor = 'rgb(213, 188, 244)';
		farm_helye.cells[1].style.backgroundColor = scoutColor;
		SZEM4_FARM.DOMINFO_FARMS[adatok.plannedArmy.farmVill].szin.banya = scoutColor;
	}

	addCurrentMovementToList(FARM_REF.document.getElementById('command-data-form'), adatok.plannedArmy.farmVill, farm_helye);
	FARM_REF.document.getElementById("troop_confirm_submit").click();
	document.getElementById('cnc_farm_heartbeat').innerHTML = new Date().toLocaleString();
	const megbizhatosag = parseInt(document.getElementById('farmolo_options').megbizhatosag.value, 10);
	const prodHour = SZEM4_FARM.DOMINFO_FARMS[adatok.plannedArmy.farmVill].prodHour;
	if (adatok.plannedArmy.nyersToFarm > (prodHour * (megbizhatosag / 60) * 3)) {
		playSound(`farmolas_exp`, 'mp3');
	} else {
		playSound(`farmolas_${Math.floor(1 + Math.random() * (11 - 1 + 1))}`, 'mp3');
	}
	// return [nez,sarga,adatok[2],adatok[3]];
	/*Legyen e 3. lépés;sárga hátteres idő lesz?;honnan;---*/
}catch(e){debug("szem4_farmolo_3egyeztet()",e); FARM_LEPES=0;}}

function szem4_farmolo_4visszaell(adatok){try{
	/*
		true,sarga?,honnan,hova
		vagy
		nyers_maradt(db);all/gyalog + semmi;honnan;hova;speed_slowest
	*/
	var falu_helye=document.getElementById("farm_honnan").rows;
	for (var i=1;i<falu_helye.length;i++) {
		if (falu_helye[i].cells[0].textContent==adatok[2]) {falu_helye=falu_helye[i]; break;}
	}
	updateAvailableUnits(SZEM4_FARM.DOMINFO_FROM[adatok[2]], true);
	
	if (typeof adatok[1]=="boolean") var lehetEGyalog=adatok[1]; else {
		if (adatok[1].indexOf("all")>-1) var lehetEGyalog=true; else var lehetEGyalog=false;
	}

	if (lehetEGyalog) { /*Sárga; de ha nincs gyalog->fehér*/
		var backtest=false;
		for (var i=0;i<3;i++) {
			if (falu_helye.cells[1].getElementsByTagName("input")[i].checked) {
				if (FARM_REF.document.getElementById("unit_input_"+UNITS[i])) {
					if (parseInt(FARM_REF.document.getElementById("unit_input_"+UNITS[i]).parentNode.children[2].textContent.match(/[0-9]+/g)[0])>5) {
						backtest=true;
						break;
					}
				}
			}
		}
		if (!backtest) lehetEGyalog=false;
	} /*ellenben nézd meg van e bent ló amit lehet küldeni!?*/
	
	/*Leggyorsabb kijelölt egység*/
	var a=falu_helye.cells[1].getElementsByTagName("input");
	var fastest=22;
	for (var i=0;i<a.length;i++) {
		if (i==4) continue;
		if (a[i].checked && E_SEB_ARR[i]<fastest) fastest=E_SEB_ARR[i];
	}
	fastest = fastest*(1/SPEED)*(1/UNIT_S);
	
}catch(e){debug("szem4_farmolo_4visszaell()",e); return;}}

function szem4_farmolo_motor(){
	var nexttime = 500;
	var isPihen = false;
	try {
	nexttime = parseInt(document.getElementById("farmolo_options").sebesseg_m.value,10);
	
	if (BOT||FARM_PAUSE||USER_ACTIVITY) { nexttime = 5000; } else {
	/*if (FARM_REF!="undefined" && FARM_REF.closed) FARM_LEPES=0;*/
	if (FARM_HIBA>10) {
		FARM_HIBA=0; FARM_GHIBA++; FARM_LEPES=0;
		if(FARM_GHIBA>3) {
			if (FARM_GHIBA>5) {
				naplo("Globál","Nincs internet? Folyamatos hiba farmolónál");
				nexttime = 60000;
				playSound("bot2");
			}
			FARM_REF.close();
		}
	}
	switch (FARM_LEPES) {
		case 0: /*Meg kell nézni mi lesz a célpont, +nyitni a HONNAN-t.*/
				PM1=szem4_farmolo_1kereso();
				if (PM1=="zero" || PM1=="ERROR") {nexttime=10000; break;} /* Ha nincs még tábla feltöltve */
				if (PM1.travelTime == -1) { // Nincs munka
						nexttime=parseInt(document.getElementById("farmolo_options").sebesseg_p.value,10);
						nexttime*=60000;
						isPihen = true;
						// Reset round
						for (let aUnit in SZEM4_FARM.DOMINFO_FROM) {
							Object.keys(SZEM4_FARM.DOMINFO_FROM[aUnit].noOfUnits).reduce((item, key) => {
								item[key] = 999;
								return item;
							}, SZEM4_FARM.DOMINFO_FROM[aUnit].noOfUnits);
						}

						try {
							if (MOBILE_MODE)
								FARM_REF.close();
							else
								FARM_REF.document.title = 'Szem4/farmoló';
						} catch(e) {}
						break;
				}
				if (!isPageLoaded(FARM_REF, KTID[PM1.fromVill],"screen=place") ||
					FARM_REF.document.location.href.indexOf("try=confirm") > -1 ||
					(FARM_REF.document.location.href.includes("mode=") && !FARM_REF.document.location.href.includes('mode=command'))) {
						FARM_REF=windowOpener('farm', VILL1ST.replace(/village=[0-9]+/,"village="+KTID[PM1.fromVill]).replace("screen=overview","screen=place"), AZON+"_Farmolo");
				}
				/*debug("Farmoló_ToStep1",PM1);*/
				FARM_LEPES=1;
				break;
		case 1: /*Gyül.helyen vagyunk, be kell illeszteni a megfelelő sereget, -nyers.*/
				if (isPageLoaded(FARM_REF,KTID[PM1.fromVill],"screen=place")) {
					FARM_REF.document.title = 'Szem4/farmoló';
					PM1=szem4_farmolo_2illeszto(PM1);
					FARM_HIBA=0; FARM_GHIBA=0;
					if (PM1 === 'semmi') 
						FARM_LEPES = 0;
					else
						FARM_LEPES = 2;
				} else {FARM_HIBA++;}
				break;
		case 2: /*Confirm: nem e jött piros szöveg, játékos e -> OK-ézás.*/ 
				if (!PM1.plannedArmy || !PM1.plannedArmy.fromVill) {
					FARM_LEPES = 0;
					debug('szem4_farmolo_motor', 'Érvénytelen állapot' + (typeof PM1 === 'object' ? JSON.parse(PM1) : PM1));
					break;
				}
				if (isPageLoaded(FARM_REF,KTID[PM1.plannedArmy.fromVill],"try=confirm")) {
					FARM_HIBA=0; FARM_GHIBA=0;
					PM1=szem4_farmolo_3egyeztet(PM1);
					if (PM1 === 'ERROR') FARM_LEPES = 0;
					// if (typeof(PM1)=="object" && PM1.length>0 && PM1[0]==true) { FARM_LEPES=3; } else FARM_LEPES=0;
					FARM_LEPES = 0;
				} else {FARM_HIBA++;}
				break;
		case 3: /* SOSEM KELL? Jelenleg nem megyek ide */
				/*Támadás elküldve, időt és ID-t nézünk, ha kell.*/ 
				/*Kell e időt nézni? Kell, ha PM1[1].indexOf("semmi")>-1 VAGY PM1[0]=TRUE; */
				if (isPageLoaded(FARM_REF,KTID[PM1[2]],"not try=confirm")) {FARM_HIBA=0; FARM_GHIBA=0;
					szem4_farmolo_4visszaell(PM1);
					FARM_LEPES=0;
				} else {FARM_HIBA++;}
				break;
		default: FARM_LEPES=0;
	}}
}catch(e){debug("szem4_farmolo_motor()",e+" Lépés:"+FARM_LEPES);}

var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
if (isPihen) {
	debug('Farmoló', `Farmoló pihenni megy ${Math.round(nexttime / 60000)} percre`);
}
try{
	worker.postMessage({'id': 'farm', 'time': nexttime});
}catch(e){debug('farm', 'Worker engine error: ' + e);setTimeout(function(){szem4_farmolo_motor();}, 3000);}}

init();
ujkieg_hang("Alaphangok","naplobejegyzes;bot2;farmolas");
ujkieg("farm","Farmoló",`<tr><td>
	<table class="vis" id="farm_opts" style="width:100%; margin-bottom: 50px;">
		<tr>
			<th colspan="2">Beállítások</th>
		</tr>
		<tr>
			<td colspan="2" style="text-align: center">
			<form id="farmolo_options">
			<table>
			<tr><td><div class="combo-cell"><div class="imgbox"><img src="${pic('mozdony.png')}"></div><strong>Szerelvények</strong></div></td>
			<td>
			Menetrend: <input name="targetIdo" value="30" onkeypress="validate(event)" type="text" size="2" onmouseover="sugo(this, 'SZEM arra fog törekedni, hogy minimum ennyi időközönként indítson támadást egy falura')">p - 
			<input name="megbizhatosag" value="60" onkeypress="validate(event)" type="text" size="2" onmouseover="sugo(this, 'Megbízhatóság. MAX ennyi ideig létrejött termelésért indul (plusz felderített nyers)')">p
			Max táv: <input name="maxtav_ora" type="text" size="2" value="4" onkeypress="validate(event)" onmouseover="sugo(this,'A max távolság, amin túl már nem küldök támadásokat')">óra <input name="maxtav_p" onkeypress="validate(event)" type="text" size="2" value="0" onmouseover="sugo(this,'A max távolság, amin túl már nem küldök támadásokat')">perc.
			</td></tr>

			<tr>
			<td><div class="combo-cell"><div class="imgbox">${picBuilding('wall')}</div><strong>Fal szint</strong></div></td>
			<td>Ha a fal &gt; <input type="text" size="3" name="maxfal" onkeypress="validate(event)" value="3" onmouseover="sugo(this,'Élesen nagyobb! 0 esetén a fallal rendelkezőeket nem támadja.')">, nem támadja</td>
			</tr>

			<tr><td><div class="combo-cell"><div class="imgbox"><img src="${pic('beallitasok.png')}"></div><strong>Alapértékek</strong></div></td>
			<td>
			Termelés/óra: <input name="termeles" onkeypress="validate(event)" type="text" size="5" value="800" onchange="updateDefaultProdHour()" onmouseover="sugo(this,'Ha nincs felderített bányaszint, úgy veszi ennyi nyers termelődik ott óránként')">				
			Min sereg/falu: <input name="minsereg" onkeypress="validate(event)" type="text" value="20" size="4" onmouseover="sugo(this,'Ennél kevesebb fő támadásonként nem indul. A szám tanyahely szerinti foglalásban értendő. Javasolt: Határszám 1/20-ad része')">
			Ha a raktár &gt;<input name="raktar" onkeypress="validate(event)" type="text" size="2" onmouseover="sugo(this,'Figyeli a raktár telítettségét, és ha a megadott % fölé emelkedik, nem indít támadást onnan. Telítettség össznyersanyag alapján számolva. Min: 20. Ne nézze: 100-nál több érték megadása esetén.')" value="90">%, nem foszt.
			</td></tr>

			<tr><td><div class="combo-cell"><div class="imgbox"><img src="/graphic/unit/unit_spy.png"></div><strong>Kémek</strong></div></td>
			<td>
			Kém/falu: <input name="kemdb" onkeypress="validate(event)" type="text" value="1" size="2" onmouseover="sugo(this,'A kémes támadásokkal ennyi kém fog menni')">
			Kényszerített? <input name="isforced" type="checkbox" onmouseover="sugo(this,'Kémek nélkül nem indít támadást, ha kéne küldenie az időlimit esetén. Kémeket annak ellenére is fog vinni, ha nincs bepipálva a kém egység')">
			Kém/perc: <input name="kemperc" type="text" value="60" onkeypress="validate(event)" size="3" onmouseover="sugo(this,'Max ekkora időközönként küld kémet falunként')">
			</td></tr>
			
			<tr><td><div class="combo-cell"><div class="imgbox"><img src="${pic('sebesseg.png')}"></div><strong>Sebesség</strong></div></td>
			<td>
			<input name="sebesseg_p" onkeypress="validate(event)" type="text" size="2" value="10"  onmouseover="sugo(this,'Ha a farmoló nem talál több feladatot magának megáll, ennyi időre. Érték lehet: 1-300. Javasolt érték: 15 perc')">perc /
						<input name="sebesseg_m" onkeypress="validate(event)" type="text" size="3" value="900" onmouseover="sugo(this,'Egyes utasítások/lapbetöltődések ennyi időközönként hajtódnak végre. Érték lehet: 200-6000. Javasolt: gépi: 500ms, emberi: 3000.')">ms.
			</td></tr></table>
			</form>
			</td>
		</tr>
		<tr>
			<th>Farmoló falu hozzáadása</th>
			<th>Farmolandó falu hozzáadása</th>
		</tr><tr>
			<td style="width:48%;" onmouseover="sugo(this,'Adj meg koordinátákat, melyek a te faluid és farmolni szeretnél velük. A koordináták elválasztása bármivel történhet.')">
				Koordináták: <input type="text" size="45" id="add_farmolo_faluk" placeholder="111|111, 222|222, ...">
				<input type="button" value="Hozzáad" onclick="add_farmolo()">
			</td>
			<td style="width:52%;" onmouseover="sugo(this,'Adj meg koordinátákat, amelyek farmok, és farmolni szeretnéd. A koordináták elválasztása bármivel történhet.')">
				Koordináták: <input type="text" size="45" id="add_farmolando_faluk" placeholder="111|111, 222|222, ...">
				<input type="button" value="Hozzáad" onclick="add_farmolando()">
			</td>
		</tr><tr>
			<td onmouseover="sugo(this,'A felvivendő falukból ezeket az egységeket használhatja SZEM IV farmolás céljából. Később módosítható.')" id="add_farmolo_egysegek" style="vertical-align:middle;">
				Mivel? ${rovidit("egysegek")}
			</td>
			<td>
			</td>
		</tr><tr>
			<td colspan="2" class="nopadding_td" onmouseover="sugo(this, 'Farmoló által küldött utolsó támadás idejét látod itt. Ha a szívre kattintasz, újraéleszted/feléleszted a farmolót a pihenésből.')">
				<div class="heartbeat_wrapper">
					<img src="${pic("heart.png")}" class="heartbeat_icon" onclick="restartKieg('farm')">
					<span id="cnc_farm_heartbeat">---</span>
				</div>
			</td>
		</tr>
	</table>
	<div class="szem4_farmolo_datatable_wrapper">
		<table class="vis" id="farm_honnan" style="vertical-align:top; display: inline-block;"><tr>
			<th width="55px" onmouseover="sugo(this,'Ezen falukból farmolsz. Dupla klikk az érintett sor koordinátájára=sor törlése.<br>Rendezhető')" style="cursor: pointer;" onclick='rendez("szoveg",false,this,"farm_honnan",0)'>Honnan</th>
			<th onmouseover="sugo(this,'Ezen egységeket használja fel SZEM a farmoláshoz. Bármikor módosítható. <br>Pipa: egy cellán végrehajtott (duplaklikkes) művelet minden látható falura érvényes lesz.')" style="position: relative; height: 20px; min-width: 100px">
				Mivel?
				<span style="position:absolute;right: 7px;top: 3px;display: flex;vertical-align: middle;align-items: center;">
					<img src="${pic("search.png")}" alt="?" title="Szűrés falukra..." style="width:15px;height:15px; cursor: pointer;" onclick="szem4_farmolo_csoport('honnan')">
					<input type="checkbox" id="farm_multi_honnan" onmouseover="sugo(this,'Ha bepipálod, akkor egy cellán végzett dupla klikkes művelet minden sorra érvényes lesz az adott oszlopba (tehát minden falura), ami jelenleg látszik. Légy óvatos!')">
				</span>
			</th>
		</tr></table>\
		<table class="vis" id="farm_hova" style="vertical-align:top; display: inline-block;"><tr>
			<th onmouseover="sugo(this,'Ezen falukat farmolod. A háttérszín jelöli a jelentés színét: alapértelmezett=zöld jelik/nincs felderítve. Sárga=veszteség volt a falun. Piros: a támadás besült, nem megy rá több támadás.<br>Dupla klikk a koordira: a háttérszín alapértelmezettre állítása.<br>Rendezhető')" style="cursor: pointer;" onclick='rendez("szoveg",false,this,"farm_hova",0)'>Hova</th>
			<th onmouseover="sugo(this,'Felderített bányaszintek, ha van. Kék háttér: megy rá kémtámadás.<br>Dupla klikk=az érintett sor törlése')">Bányák</th>
			<th onmouseover="sugo(this,'Fal szintje. Szimpla klikk: Katapultozó scriptet megtanítja az adott falu épületszintjeire. Dupla klikk=háttér csere (csak megjelölésként). 2 féle lehet: a zöld háttér a falszint változására eltűnik, a kék keret viszont csak manuálisan törölhető.<br>Rendezhető.')" onclick='rendez("szam",false,this,"farm_hova",2)' style="cursor: pointer;">Fal</th>
			<th onmouseover="sugo(this,'Számítások szerint ennyi nyers van az érintett faluba. Dupla klikk=érték módosítása.<br>Rendezhető.')" onclick='rendez("szam",false,this,"farm_hova",3)' style="cursor: pointer;">Nyers</th>
			<th onmouseover="sugo(this,'Játékos e? Ha játékost szeretnél támadni, pipáld be a falut mint játékos uralta, így támadni fogja. Ellenben piros hátteret kap a falu. (WIP: Nem működik/nem ismer fake-limitet, csupán engedi támadni!)')">J?</th>
			<th onmouseover="sugo(this,'Támadásokat tudod itt nyomon követni szerelvények formájában, melyek a támadási algoritmus alapjait képzik<br><br>Pipa: egy cellán végrehajtott (duplaklikkes) művelet minden látható falura érvényes lesz.')" style="height: 20px; vertical-align:middle;">
				Szerelvények
				<span style="position:absolute;right: 7px;top: 3px;display: flex;vertical-align: middle;align-items: center;">
					<img src="${pic("search.png")}" alt="?" title="Szűrés falukra..." style="width:15px;height:15px;" onclick="szem4_farmolo_csoport('hova')">
					<input type="checkbox" id="farm_multi_hova">
				</span>
			</th>
		</tr></table>
</div></p></td></tr>`);

var FARM_LEPES=0, FARM_REF, FARM_HIBA=0, FARM_GHIBA=0,
	BOT=false,
	FARMOLO_TIMER,
	SZEM4_FARM = {
		ALL_UNIT_MOVEMENT: {}, //{..., hova(koord): [[ mennyi_termelésből(teherbírás), mikorra(getTime()), mennyi_VIJE_miatt(teherbírás) ], ...], ...}
		ALL_SPY_MOVEMENTS: {}, // hova(koord): mikor ment utoljára kém
		DOMINFO_FARMS: {}, // village: {prodHour: <number>, buildings: {main: <number>, barracks: <number>, wall: <number>}, nyers: <number>, isJatekos: <boolean> }
		DOMINFO_FROM: {}, // village: {isUnits: {spear: true, sword: false, ...}, noOfUnits: {spear: 999, sword: 0, ...}}
		OPTIONS: {}
	},
	PM1, FARM_PAUSE=true;
szem4_farmolo_motor();

/* --------------------- JELENTÉS ELEMZŐ ----------------------- */
function readUpVijeOpts() {
	document.querySelectorAll('#vije_opts input').forEach(el => {
		if (el.type == 'text') {
			SZEM4_VIJE.i18ns[el.name] = el.value;
		} else if (el.type == 'checkbox') {
			SZEM4_VIJE.i18ns[el.name] = el.checked;
		}
	});
}
function rebuildDOM_VIJE() {
	document.querySelectorAll('#vije_opts input').forEach(el => {
		if (SZEM4_VIJE.i18ns[el.name] == undefined) return;
		if (el.type == 'text') {
			el.value = SZEM4_VIJE.i18ns[el.name];
		} else if (el.type == 'checkbox') {
			el.value = SZEM4_VIJE.i18ns[el.name];
		}
	});
}
function VIJE_IntelliAnalyst_isRequired(koord, jelRow, jelDate) {
	jelDate.setSeconds(59);
	if (SZEM4_VIJE.ALL_VIJE_SAVED[koord] && SZEM4_VIJE.ALL_VIJE_SAVED[koord] > jelDate) return false;
	
	const isSpy = !!jelRow.querySelector('img[src*="spy"]');
	if (isSpy) return true;

	let nyers_VIJE = SZEM4_FARM.DOMINFO_FARMS[koord].nyers;
	if (nyers_VIJE > 0) nyers_VIJE -= getAllResFromVIJE(koord);
	if (nyers_VIJE > 100) return true;
	return false;
}
function szem4_VIJE_1kivalaszt(){try{
	/*Eredménye: jelentés azon (0=nincs meló);farm koord;jelentés SZÍNe;volt e checkbox-olt jeli*/
	try{TamadUpdt(VIJE_REF1);}catch(e){}
	VT=VIJE_REF1.document.getElementById("report_list").rows;
	if (VT.length<3) return [0,0,"",false];
	var isAnalize=false;
	let szin = '';
	for (var i=VT.length-2;i>0;i--) {
		var reportId=VT[i].cells[1].getElementsByTagName("span")[0].getAttribute("data-id").replace("label_","");
		if (SZEM4_VIJE.ELEMZETT.includes(reportId)) continue;

		try {
			var koord = VT[i].cells[1].textContent.match(/[0-9]+(\|)[0-9]+/g);
			koord = koord[koord.length-1];
		} catch(e) { continue; }
		var eredm = VIJE_FarmElem(koord); /*0:létező farm-e,1:van-e már bánya derítve,2:farm_helye DOM row element*/
		if (eredm[0]==false) continue;

		/*+++IDŐ*/
		var d=getServerTime(VIJE_REF1); var d2=getServerTime(VIJE_REF1);
		(function convertDate() {
			var ido = VT[i].cells[2].textContent;
			var oraperc=ido.match(/[0-9]+:[0-9]+/g)[0];
			var nap=ido.replace(oraperc,"").match(/[0-9]+/g)[0];
			d.setMinutes(parseInt(oraperc.split(":")[1],10));
			d.setHours(parseInt(oraperc.split(":")[0],10));
			d.setDate(parseInt(nap,10));
		})();

		/* Régi jelentés? */
		if ((d2-d) > 10800000 || (d2-d) < 0) var regi=true; else var regi=false; /*3 óra*/
		if (regi) continue;

		/* Szín lekezelése */
		const farm_helye = eredm[2];
		szin = VT[i].cells[1].childNodes;
		for (var s=0;s<szin.length;s++) {
			if (szin[s].nodeName=="IMG") {
				szin=szin[s].src.split(".png")[0].split("/");
				szin=szin[szin.length-1];
				break;
			}
		}

		if (szin.includes("green")) {
			VT[i].cells[0].getElementsByTagName("input")[0].checked = true;
			farm_helye.cells[0].style.backgroundColor="#f4e4bc";
		}
		else if (szin.includes('yellow')) {
			farm_helye.cells[0].style.backgroundColor = 'yellow';
			SZEM4_FARM.DOMINFO_FARMS[koord].szin.falu = 'yellow';
		}
		else if (!szin.includes('blue') && farm_helye.cells[0].style.backgroundColor !== 'red') {
			farm_helye.cells[0].style.backgroundColor = 'red';
			SZEM4_FARM.DOMINFO_FARMS[koord].szin.falu = 'red';
			naplo('Jelentés Elemző', `${koord} farm veszélyesnek ítélve. Jelentésének színe ${szin}.`);
		}

		/* Van értelme elemezni? */
		if (!VIJE_IntelliAnalyst_isRequired(koord, VT[i].cells[1], d)) {
			SZEM4_VIJE.ELEMZETT.push(reportId);
			continue;
		} else {
			isAnalize=true;
			break;
		}
	}
	/*Ha nincs talált jeli --> nézd meg volt e checkboxolt, és ha igen, akkor törlés, majd pihenés */
	if (!isAnalize) {
		for (var i=VT.length-2;i>0;i--) {
			if (VT[i].cells[0].getElementsByTagName("input")[0].checked) {
				szem4_VIJE_3torol();
				return [0,0,"",true];
			}
		}
		return [0,0,"",false];
	}
	
	// reportId, farm koord, jelentés színe, ???, régi
	return [reportId,koord,szin,false,regi];

	function VIJE_FarmElem(koord){try{
		var farm_helye=document.getElementById("farm_hova").rows;
		var isExists=false;
		for (var i=1;i<farm_helye.length;i++) {
			if (farm_helye[i].cells[0].textContent==koord) {
				isExists=true;
				farm_helye=farm_helye[i];
				break;
			}
		}
		if (!isExists) return [false,false,0];
		
		var banyaVanE=true;
		if (farm_helye.cells[1].textContent=="") banyaVanE=false;
		
		return [isExists, banyaVanE, farm_helye, true];
	}catch(e){debug("VIJE1_farmelem","Hiba: "+e);}}
}catch(e){debug("VIJE1","Hiba: "+e);return [0,0,"",false];}}

function VIJE_adatbeir(koord,nyers,banya,fal,szin, hungarianDate){try{
	// célpont, 0, '', '', szín, jelidate
	var farm_helye=document.getElementById("farm_hova").rows;
	for (var i=1;i<farm_helye.length;i++) {
		if (farm_helye[i].cells[0].textContent==koord) {farm_helye=farm_helye[i]; break;}
	}
	if (banya!=='') {
		farm_helye.cells[1].innerHTML=banya;
		SZEM4_FARM.DOMINFO_FARMS[koord].prodHour = getProdHour(banya.join(','));
		farm_helye.cells[1].style.backgroundColor = '';
		SZEM4_FARM.DOMINFO_FARMS[koord].szin.banya = '';
		if (fal == '') {
			// Elméletileg ilyen nincs
			debug('VIJE_adatbeir', `Megtörtént a lehetetlen: Látok bányát -> ${banya}, de nem tudtam megmondani a fal szintjét -> ${fal}`)
			fal = 0;
			if (parseInt(farm_helye.cells[2].innerHTML) !== 0) {
				farm_helye.cells[2].style.backgroundColor= '';
				SZEM4_FARM.DOMINFO_FARMS[koord].szin.fal = '';
			}
		}
	}
	if (szin == 'SEREG') {
		farm_helye.cells[0].style.backgroundColor = 'red';
		SZEM4_FARM.DOMINFO_FARMS[koord].szin = SZEM4_FARM.DOMINFO_FARMS[koord].szin || {};
		SZEM4_FARM.DOMINFO_FARMS[koord].szin.falu = 'red';
		naplo('VIJE', `${koord} -- Sereg a faluban!`);
	}
	if (fal !== '') {
		if (parseInt(farm_helye.cells[2].textContent.trim(), 10) !== parseInt(fal, 10)) {
			debug('VIJE_adatbeir', `Falszint változott. Volt: ${farm_helye.cells[2].textContent.trim()}, lett: ${fal}`)
			farm_helye.cells[2].style.backgroundColor = '';
			SZEM4_FARM.DOMINFO_FARMS[koord].szin.fal = '';
		}
		farm_helye.cells[2].innerHTML = `
		<span class="tooltip_hover">
			${fal}
			<span class="tooltip_text"></span>
		</span>`;
		SZEM4_FARM.DOMINFO_FARMS[koord].buildings.wall = fal;
	}
	if (nyers !== '') { // Ha van adatunk a nyersanyagról...
		farm_helye.cells[3].innerHTML = nyers;
		SZEM4_FARM.DOMINFO_FARMS[koord].nyers = nyers;
		if (!SZEM4_VIJE.ALL_VIJE_SAVED[koord] || SZEM4_VIJE.ALL_VIJE_SAVED[koord] < hungarianDate)
			SZEM4_VIJE.ALL_VIJE_SAVED[koord] = hungarianDate;
	}
	// Mockolt támadás beillesztése ha nem regisztrált támadásról jött jelentés
	var allAttack = SZEM4_FARM.ALL_UNIT_MOVEMENT[koord];
	if (!allAttack) SZEM4_FARM.ALL_UNIT_MOVEMENT[koord] = [[10000, hungarianDate, 0]];
	else {
		// debug('VIJE_adatbeir', `+Mock add: ${JSON.stringify(allAttack)} --`);
		var smallestDifference = null;
		SZEM4_FARM.ALL_UNIT_MOVEMENT[koord].forEach(arr => {
			var difference = Math.abs(arr[1] - hungarianDate);
			if (!smallestDifference || difference < smallestDifference) {
				smallestDifference = difference;
			}
		});
		if (smallestDifference > 60000) SZEM4_FARM.ALL_UNIT_MOVEMENT[koord].push([10000, hungarianDate, 0]); // FIXME: Ne 10k legyen már hanem MAX_megbízhatóság
		// debug('VIJE_adatbeir', `Mock added: ${JSON.stringify(allAttack)}`);
	}
	drawWagons(koord);
}catch(e){debug("VIJE_adatbeir","Hiba: "+e);}}
function szem4_VIJE_2elemzes(adatok){try{
	/*Adatok: [0]jelentés azon;[1]célpont koord;[2]jelentés SZÍNe;[3]volt e checkbox-olt jeli;[4]régi jeli e? (igen->nincs nyerselem)*/
	var nyersossz=0;
	var isOld = false;
	var reportTable=VIJE_REF2.document.getElementById("attack_info_att").parentNode;
	while (reportTable.nodeName != 'TABLE') {
		reportTable = reportTable.parentNode;
	}
	var hungarianDate = reportTable.rows[1].cells[1].innerText;
	var defUnits = VIJE_REF2.document.getElementById('attack_info_def_units');
	if (defUnits && defUnits.textContent.match(/[1-9]+/g)) adatok[2] = 'SEREG';
	hungarianDate = new Date(Date.parse(hungarianDate.replace(/jan\./g, "Jan").replace(/febr?\./g, "Feb").replace(/márc\./g, "Mar").replace(/ápr\./g, "Apr").replace(/máj\./g, "May").replace(/jún\./g, "Jun").replace(/júl\./g, "Jul").replace(/aug\./g, "Aug").replace(/szept\./g, "Sep").replace(/okt\./g, "Oct").replace(/nov\./g, "Nov").replace(/dec\./g, "Dec")));
	hungarianDate = hungarianDate.getTime();
	if (SZEM4_VIJE.ALL_VIJE_SAVED[adatok[1]] >= hungarianDate) isOld = true;
	if (!isOld && VIJE_REF2.document.getElementById("attack_spy_resources")) {
		var x=VIJE_REF2.document.getElementById("attack_spy_resources").rows[0].cells[1];
		if (adatok[4]) { var nyersossz=''; debug("VIJE2","Nem kell elemezni (régi)"); } else {
			try{
				if (/\d/.test(x.textContent)) {
					var nyers=x.textContent.replace(/\./g,"").match(/[0-9]+/g); 
					var nyersossz=0;
					for (var i=0;i<nyers.length;i++) nyersossz+=parseInt(nyers[i],10);
				} else {
					nyersossz=0;
				}
			}catch(e){var nyersossz=0; debug("VIJE","<a href='"+VIJE_REF2.document.location+"' target='_BLANK'>"+adatok[0]+"</a> ID-jű jelentés nem szokványos, talált nyers 0-ra állítva. Hiba: "+e);}
		}
	
		// Épületek
		if (VIJE_REF2.document.getElementById("attack_spy_buildings_left")) {
			var i18nBuildings=document.getElementById("vije_opts");
			const spyLevels = {
				main: 1,
				barracks: 0,
				stable: 0,
				garage: 0,
				smith: 0,
				market: 0,
				wood: 0,
				stone: 0,
				iron: 0,
				farm: 0,
				wall: 0
			};
			
			var spyBuildingRows_left=VIJE_REF2.document.getElementById("attack_spy_buildings_left").rows;
			var spyBuildingRows_right=VIJE_REF2.document.getElementById("attack_spy_buildings_right").rows;
			for (var i=1;i<spyBuildingRows_left.length;i++) {
				let buildingName_l = spyBuildingRows_left[i].cells[0].textContent.toUpperCase().trim();
				let buildingName_r = spyBuildingRows_right[i].cells[0].textContent.toUpperCase().trim();
				for (const key in spyLevels) {
					if (buildingName_l.includes(i18nBuildings[key].value.toUpperCase())) spyLevels[key] = parseInt(spyBuildingRows_left[i].cells[1].textContent,10);
					if (buildingName_r.includes(i18nBuildings[key].value.toUpperCase())) spyLevels[key] = parseInt(spyBuildingRows_right[i].cells[1].textContent,10);
				}
			}
			SZEM4_FARM.DOMINFO_FARMS[adatok[1]].buildings = JSON.parse(JSON.stringify(spyLevels));
			if (spyLevels.wall == 0) {
				if (spyLevels.barracks == 0) {
					spyLevels.wall--;
					if (spyLevels.main == 2) spyLevels.wall--;
					if (spyLevels.main == 1) spyLevels.wall-=2;
				}
			}
			var banyak = [spyLevels.wood, spyLevels.stone, spyLevels.iron];
			var fal = spyLevels.wall;
		} else { /*Csak nyerset láttunk*/
			var banyak = '';
			var fal = '';
		}
		VIJE_adatbeir(adatok[1],nyersossz,banyak,fal,adatok[2], hungarianDate);
	} else if (!isOld) {
		var atkTable = VIJE_REF2.document.getElementById('attack_results');
		var fosztogatas = atkTable?atkTable.rows[0].cells[2].innerText.split('/').map(item => parseInt(item,10)):0;
		var nyers = '';
		if (fosztogatas[0] + 5 < fosztogatas[1]) {
			nyers=0;
			//debug('debug/szem4_VIJE_2elemzes', `VIJE_adatbeir(${adatok[1],nyers},'','',${adatok[2]}, ${hungarianDate}`);
			VIJE_adatbeir(adatok[1],nyers,'','',adatok[2], hungarianDate);
		}
	}
	
	/*Tedd be az elemzettek listájába az ID-t*/
	SZEM4_VIJE.ELEMZETT.push(adatok[0]);
	if (SZEM4_VIJE.ELEMZETT.length > 600) {
		SZEM4_VIJE.ELEMZETT.splice(0, SZEM4_VIJE.ELEMZETT.length - 250);
	}
	
	VIJE2_HIBA=0; VIJE2_GHIBA=0;
	return true;
}catch(e){debug("VIJE2","Elemezhetetlen jelentés: "+adatok[0]+":"+adatok[1]+". Hiba: "+e); VIJE_adatbeir(adatok[1],nyersossz,"","",adatok[2]); VIJE2_HIBA++; VIJE_HIBA++; return false;}}

function szem4_VIJE_3torol(){try{
	if (document.getElementById("vije_opts").isdelete.checked) {
		try{VIJE_REF1.document.forms[0].del.click();}catch(e){VIJE_REF1.document.getElementsByName("del")[0].click();}
	}
}catch(e){debug("VIJE3","Hiba: "+e);return;}}

function szem4_VIJE_motor(){try{
	var nexttime=1500;
	if (VIJE_PAUSE) clearAttacks();
	if (BOT||VIJE_PAUSE||USER_ACTIVITY) {nexttime=5000;} else {
	if (VIJE_HIBA>10) {
		VIJE_HIBA=0; VIJE_GHIBA++; 
		if(VIJE_GHIBA>3) {
			if (VIJE_GHIBA>5) {
				naplo("Globál","Nincs internet? Folyamatos hiba a jelentés elemzőnél"); nexttime=60000; playSound("bot2");
			}
			debug('szem4_VIJE_motor', 'Jelentés elemzo hiba >3, ablak bezár/újranyit');
			VIJE_REF1.close();
		} VIJE_LEPES=0;
	}
	
	if (VIJE2_HIBA>6) {VIJE2_HIBA=0; VIJE2_GHIBA++; if(VIJE2_GHIBA>3) {if (VIJE2_GHIBA>5) naplo("Globál","Nincs internet? Folyamatos hiba a jelentés elemzőnél"); VIJE_REF2.close();} VIJE_LEPES=0;}
	if (!VIJE_REF1 || (VIJE_LEPES!=0 && VIJE_REF1.closed)) VIJE_LEPES=0;
	
	switch(VIJE_LEPES) {
		case 0: /*Támadói jelentések megnyitása*/
			if (document.getElementById("farm_hova").rows.length>1) {
			var csoport="";
			if (game_data.player.premium) csoport="group_id=-1&";
			VIJE_REF1=windowOpener('vije', VILL1ST.replace("screen=overview","mode=attack&"+csoport+"screen=report"), AZON+"_SZEM4VIJE_1");
			VIJE_LEPES=1;
			} else nexttime=10000;
			break;
		case 1: /*Megnyitandó jelentés kiválasztás(+bepipálás)*/
			if (isPageLoaded(VIJE_REF1,-1,"screen=report")) {
				VIJE_HIBA=0; VIJE_GHIBA=0;
				PM2=szem4_VIJE_1kivalaszt();
				if (PM2[0]===0) { // Nincs meló
					VIJE_LEPES=0;
					if (PM2[3] === false) {
						nexttime=120000;
						if (MOBILE_MODE) {
							VIJE_REF1.close();
							VIJE_REF2.close();
						}
					}
				} else {
					VIJE_REF2=windowOpener('vije2', VILL1ST.replace("screen=overview","mode=attack&view="+PM2[0]+"&screen=report"), AZON+"_SZEM4VIJE_2");
					VIJE_LEPES=2;
				}
				VIJE_REF1.document.title = 'Szem4/vije1';
			} else { VIJE_HIBA++; }
			break;
		case 2: /*Megnyitott jelentés elemzése*/
			if (isPageLoaded(VIJE_REF2,-1,PM2[0])) {
				clearAttacks();
				szem4_VIJE_2elemzes(PM2);
				if (PM2[3]) VIJE_LEPES=3; else VIJE_LEPES=1;
				VIJE_REF2.document.title = 'Szem4/vije2';
			} else { VIJE2_HIBA++;}
			break;
		case 3: /*bepipált jelentések törlése*/
			szem4_VIJE_3torol();
			VIJE_LEPES=0;
			if (PM2[0]===0) {
				nexttime=120000;
				if (MOBILE_MODE) {
					VIJE_REF1.close();
					VIJE_REF2.close();
				}
			}
			break;
		default: VIJE_LEPES=0;
	}}
}catch(e){debug("szem4_VIJE_motor()","ERROR: "+e+" Lépés:"+VIJE_LEPES);}
var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
try{
	worker.postMessage({'id': 'vije', 'time': nexttime});
}catch(e){debug('vije', 'Worker engine error: ' + e);setTimeout(function(){szem4_VIJE_motor();}, 3000);}}
/*VIJE*/
ujkieg("vije","Jelentés Elemző",`<tr><td>
	A VIJE a Farmoló táblázatába dolgozik, itt csupán működési beállításokat módosíthatsz.
	<form id="vije_opts">
		<table class="vis szem4_vije_optsTable">
			<tr><td>${picBuilding('main')}</td><td>"Főhadiszállás" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="main" value="Főhadiszállás"></td></tr>
			<tr><td>${picBuilding('barracks')}</td><td>"Barakk" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="barracks" value="Barakk"></td></tr>
			<tr><td>${picBuilding('stable')}</td><td>"Istálló" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="stable" value="Istálló"></td></tr>
			<tr><td>${picBuilding('garage')}</td><td>"Műhely" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="garage" value="Műhely"></td></tr>
			<tr><td>${picBuilding('smith')}</td><td>"Kovácsműhely" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="smith" value="Kovácsműhely"></td></tr>
			<tr><td>${picBuilding('market')}</td><td>"Piac" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="market" value="Piac"></td></tr>
			<tr><td>${picBuilding('wood')}</td><td>"Fatelep" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="wood" value="Fatelep"></td></tr>
			<tr><td>${picBuilding('stone')}</td><td>"Agyagbánya" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="stone" value="Agyagbánya"></td></tr>
			<tr><td>${picBuilding('iron')}</td><td>"Vasbánya" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="iron" value="Vasbánya"></td></tr>
			<tr><td>${picBuilding('farm')}</td><td>"Tanya" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="farm" value="Tanya"></td></tr>
			<tr><td>${picBuilding('wall')}</td><td>"Fal" a szerver jelenlegi nyelvén</td><td><input type="text" size="15" name="wall" value="Fal"></td></tr>
		</table>
		<input type="checkbox" name="isdelete"> Zöld farmjelentések törlése?<br><br><br>
	</form>
	</td></tr>`);

var VIJE_PAUSE=true;
var VIJE_LEPES=0;
var VIJE_REF1; var VIJE_REF2;
var VIJE_HIBA=0; var VIJE_GHIBA=0;
var VIJE2_HIBA=0; var VIJE2_GHIBA=0;
var SZEM4_VIJE = {
	ALL_VIJE_SAVED: {}, // coord: date (legfrissebb elemzés a faluról),
	i18ns: {}, // épületId: fordítás
	ELEMZETT: []
};
readUpVijeOpts();
var PM2;
szem4_VIJE_motor();

/*-----------------TÁMADÁS FIGYELŐ--------------------*/

function TamadUpdt(lap){try{
	var table=document.getElementById("idtamad_Bejovok");
	var d=getServerTime();
	var jelenlegi=parseInt(lap.game_data.player.incomings,10);
	var eddigi=0;
	if (table.rows.length>1) eddigi=parseInt(table.rows[1].cells[1].innerHTML,10);
	if (jelenlegi==eddigi) return;
	
	var row=table.insertRow(1);
	var cell1=row.insertCell(0);
	var cell2=row.insertCell(1);
	cell1.innerHTML=d;
	cell2.innerHTML=jelenlegi;
	
	if (jelenlegi>eddigi) playSound("bejovo"); /*replace: ATTACK SOUND!*/
	return;
}catch(e){debug("ID beir","Hiba: "+e);}}

ujkieg_hang("Bejövő támadások","bejovo");
ujkieg("idtamad","Bejövő támadások",'<tr><td align="center"><table class="vis" id="idtamad_Bejovok" style="vertical-align:top; display: inline-block;"><tr><th>Időpont</th><th>Támadások száma</th></tr></table> </td></tr>');

/*-----------------ÉPÍTŐ--------------------*/
function szem4_EPITO_perccsokkento(){try{
	var hely=document.getElementById("epit").getElementsByTagName("table")[1].rows;
	var patt=/[0-9]+\:[0-9]+/g;
	for (var i=1;i<hely.length;i++) {
		let currentCell = hely[i].cells[3];
		if (currentCell.textContent.search(patt)>-1) {
			let time = currentCell.textContent.match(patt)[0];
			time = time.split(':').map(a => parseInt(a,10));
			time = time[0] * 60 + time[1];
			time--;
			currentCell.textContent = currentCell.textContent.replace(patt, writeAllBuildTime(time, true));
		}
	}
}catch(e){debug("Építő_pcsökk",e); setTimeout("szem4_EPITO_perccsokkento()",60000);}}
function writeAllBuildTime(minutes, isDateOnly=false) {
	let sixty = 60;
	let hours = Math.floor(minutes / sixty);
	let mins = minutes % sixty;
	let toDate = hours.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0');
	if (isDateOnly) {
		return toDate;
	}
	return '<span class="writeOutDate">Hátralévő építési idő: ' + toDate + '</span>';
}

function szem4_EPITO_getlista(){try{
	var ret='<select>';
	var Z=document.getElementById("epit").getElementsByTagName("table")[0].rows;
	for (var i=1;i<Z.length;i++) {
		ret+='<option value="'+Z[i].cells[0].textContent+'">'+Z[i].cells[0].textContent+'</option> ';
	}
	ret+='</select>'; 
	return ret;
}catch(e){debug("Építő",e);}}

function szem4_EPITO_csopDelete(ezt){try{
	var name=ezt.innerHTML;
	if (!confirm("Biztos kitörlöd a "+name+" nevű csoportot?\nA csoportot használó faluk az Alapértelmezett csoportba fognak tartozni.")) return;
	sortorol(ezt,"");
	var bodyTable=document.getElementById("epit_lista").rows;
	for (var i=1;i<bodyTable.length;i++) {
		var selectedElement=bodyTable[i].cells[1].getElementsByTagName("select")[0];
		if (selectedElement.value==name) selectedElement.value=document.getElementById("epit").getElementsByTagName("table")[0].rows[1].cells[0].innerHTML;
	}
	bodyTable=document.getElementById("epit_ujfalu_adat").getElementsByTagName("option");
	for (var i=0;i<bodyTable.length;i++) {
		if (bodyTable[i].value==name) {
			document.getElementById("epit_ujfalu_adat").getElementsByTagName("select")[0].remove(i);
			break;
		}
	}
}catch(e){alert2("Hiba:\n"+e);}}

function szem4_EPITO_ujFalu(){try{
	var adat=document.getElementById("epit_ujfalu_adat");
	var f_nev=adat.getElementsByTagName("input")[0].value;
	if (f_nev=="" || f_nev==null) return;
	f_nev=f_nev.match(/[0-9]{1,3}(\|)[0-9]{1,3}/g);
	var Z=document.getElementById("epit_lista"); var str="";
	var lista=szem4_EPITO_getlista();
	for (var i=0;i<f_nev.length;i++) {
		var vane=false;
		for (var j=1;j<Z.rows.length;j++) {
			if (Z.rows[j].cells[0].textContent==f_nev[i]) vane=true;
		} if (vane) {str+="DUP:"+f_nev[i]+", "; continue;}
		if (!KTID[f_nev[i]]) {str+="NL: "+f_nev[i]+", "; continue;}
		
		var ZR=Z.insertRow(-1);
		var ZC=ZR.insertCell(0); ZC.innerHTML=f_nev[i]; ZC.setAttribute("ondblclick","sortorol(this)");
			ZC=ZR.insertCell(1); ZC.innerHTML=lista; ZC.getElementsByTagName("select")[0].value=adat.getElementsByTagName("select")[0].value;
			ZC=ZR.insertCell(2); ZC.style.fontSize="x-small"; var d=getServerTime(); ZC.innerHTML=d.toLocaleString(); ZC.setAttribute("ondblclick","szem4_EPITO_most(this)");
			ZC=ZR.insertCell(3); ZC.innerHTML="<i>Feldolgozás alatt...</i>"+' <a href="'+VILL1ST.replace(/(village=)[0-9]+/g,"village="+KTID[f_nev[i]]).replace('screen=overview','screen=main')+'" target="_BLANK"><img alt="Nyit" title="Falu megnyitása" src="'+pic("link.png")+'"></a>';; ZC.setAttribute("ondblclick",'szem4_EPITO_infoCell(this.parentNode,\'alap\',"")');
	}
	if (str!="") alert2("Dupla megadások/nem létező faluk kiszűrve: "+str);
	adat.getElementsByTagName("input")[0].value="";
	return;
}catch(e){alert2("Új falu(k) felvételekori hiba:\n"+e);}}

function szem4_EPITO_ujCsop(){try{
	var cs_nev=document.getElementById("epit_ujcsopnev").value.replace(/[;\._]/g,"").replace(/( )+/g," ");;
	if (cs_nev=="" || cs_nev==null) return;
	var Z=document.getElementById("epit").getElementsByTagName("table")[0];
	for (var i=1;i<Z.rows.length;i++) {
		if (Z.rows[i].cells[0].textContent==cs_nev) throw "Már létezik ilyen nevű csoport";
	}
	var ZR=Z.insertRow(-1);
	var ZC=ZR.insertCell(0); ZC.innerHTML=cs_nev; ZC.setAttribute("ondblclick","szem4_EPITO_csopDelete(this)");
		ZC=ZR.insertCell(1); ZC.innerHTML=Z.rows[1].cells[1].innerHTML; ZC.getElementsByTagName("input")[0].disabled=false;
	
	var Z=document.getElementById("epit_lista").rows;
	for (var i=1;i<Z.length;i++) {
		var Z2=Z[i].cells[1].getElementsByTagName("select")[0];
		var option=document.createElement("option");
		option.text=cs_nev;
		Z2.add(option);
	}
	Z2=document.getElementById("epit_ujfalu_adat").getElementsByTagName("select")[0];
	option=document.createElement("option");
	option.text=cs_nev;
	Z2.add(option);
	document.getElementById("epit_ujcsopnev").value="";
	return;
}catch(e){alert2("Új csoport felvételekori hiba:\n"+e);}}

function szem4_EPITO_cscheck(alma){try{
	var Z=alma.parentNode.getElementsByTagName("input")[0].value;
	Z=Z.split(";");
	
	var epuletek=new Array("main","barracks","stable","garage","church_f","church","smith","snob","place","statue","market","wood","stone","iron","farm","storage","hide","wall","MINES");
	for (var i=0;i<Z.length;i++) {
		if (epuletek.indexOf(Z[i].match(/[a-zA-Z]+/g)[0])>-1) {} else throw "Nincs ilyen épület: "+Z[i].match(/[a-zA-Z]+/g)[0];
		if (parseInt(Z[i].match(/[0-9]+/g)[0])>30) throw "Túl magas épületszint: "+Z[i];
	}
	alert2("Minden OK");
}catch(e){alert2("Hibás lista:\n"+e);}}

function szem4_EPITO_most(objektum){try{
	var d=getServerTime();
	objektum.innerHTML=d.toLocaleString();
	return;
}catch(e){alert2("Hiba lépett fel:\n"+e);}}

function szem4_EPITO_csopToList(csoport){try{
	var Z=document.getElementById("epit").getElementsByTagName("table")[0].rows;
	for (var i=1;i<Z.length;i++) {
		if (Z[i].cells[0].textContent==csoport) return Z[i].cells[1].getElementsByTagName("input")[0].value;
	}
	return ";";
}catch(e){debug("epito_csopToList",e);}}

function szem4_EPITO_Wopen(){try{
	/*Eredmény: faluID, teljes építendő lista, pointer a sorra*/
	var TT=document.getElementById("epit_lista").rows;
	var now=getServerTime();
	for (var i=1;i<TT.length;i++) {
		var datum=new Date(TT[i].cells[2].textContent);
		if (datum<now) {
			var lista=szem4_EPITO_csopToList(TT[i].cells[1].getElementsByTagName("select")[0].value);
			return [KTID[TT[i].cells[0].textContent],lista,TT[i]];
		}
	}
	return [0,";"];
}catch(e){debug("Epito_Wopen",e);}}

function szem4_EPITO_addIdo(sor, perc){try{
	if (perc == "del") {
		document.getElementById("epit_lista").deleteRow(sor.rowIndex);
	} else {
		if (perc == 0) perc = 30;
		var d=getServerTime();
		d.setSeconds(d.getMinutes() + (perc * 60));
		sor.cells[2].innerHTML=d.toLocaleString();
	}
}catch(e){debug("epito_addIdo",e); return false;}}

function szem4_EPITO_infoCell(sor,szin,info){try{
	if (szin=="alap") szin="#f4e4bc";
	if (szin=="blue") szin="#44F";
	if (szin=="red") setTimeout('playSound("kritikus_hiba")',2000);
	sor.cells[3].style.backgroundColor=szin;
	
	sor.cells[3].innerHTML=info+' <a href="'+VILL1ST.replace(/(village=)[0-9]+/g,"village="+KTID[sor.cells[0].textContent]).replace('screen=overview','screen=main')+'" target="_BLANK"><img alt="Nyit" title="Falu megnyitása" src="'+pic("link.png")+'"></a>';
	return;
}catch(e){debug("építő_infoCell",e);}}

function szem4_EPITO_getBuildLink(ref, type) {
	var row = ref.document.getElementById('main_buildrow_' + type);
	if (row.cells.length < 3) return false;
	var patt = new RegExp('main_buildlink_'+type+'_[0-9]+','g');
	var allItem = row.getElementsByTagName("*");
	for (var i=0;i<allItem.length;i++) {
		if (patt.test(allItem[i].id)) {
		return allItem[i];
		}
	}
}

function szem4_EPITO_IntettiBuild(buildOrder){try{
	try{TamadUpdt(EPIT_REF);}catch(e){}
	var buildList=""; /*Current BuildingList IDs*/
	var allBuildTime=0; /*Ennyi perc építési idő, csak kiírás végett*/
	var firstBuildTime=0; /*Az első épület építési ideje*/
	var textTime;

	try {
		if (!EPIT_REF.document.getElementById("buildqueue")) throw 'No queue';
		var buildQueueRows=EPIT_REF.document.getElementById("buildqueue").rows;
		for (var i=1;i<buildQueueRows.length;i++) {try{
			buildList+=buildQueueRows[i].cells[0].getElementsByTagName("img")[0].src.match(/[A-Za-z0-9]+\.(png)/g)[0].replace(/[0-9]+/g,"").replace(".png","");
			textTime=buildQueueRows[i].cells[1].textContent.split(":");
			allBuildTime+=parseInt(textTime[0])*60+parseInt(textTime[1])+(parseInt(textTime[2])/60);
			if (firstBuildTime==0) firstBuildTime=allBuildTime;
			buildList+=";";
		}catch(e){}}

		allBuildTime=Math.round(allBuildTime);

		firstBuildTime = Math.ceil(firstBuildTime);
		if (firstBuildTime>180) firstBuildTime=180;
	}catch(e){var buildList=";"; var allBuildTime=0; var firstBuildTime=0;}
	
	if (buildList == '') buildList = ';';
	buildList=buildList.split(";");
	buildList.pop();
	if (buildList.length>4) {
		szem4_EPITO_infoCell(PMEP[2],"alap","Építési sor megtelt. " + writeAllBuildTime(allBuildTime));
		szem4_EPITO_addIdo(PMEP[2],firstBuildTime);
		return;
	}
	
	/* Jelenlegi épületszintek kiszámítása építési sorral együtt */
	let currentBuildLvls=EPIT_REF.game_data.village.buildings;
	currentBuildLvls = Object.fromEntries(Object.entries(currentBuildLvls).map(([key, value]) => [key, parseInt(value)]));
	
	for (var i=0;i<buildList.length;i++) {
		currentBuildLvls[buildList[i]]++;
	}

	/* Következő építendő épület meghatározása */
	var nextToBuild = '';
	var buildOrderArr=buildOrder.split(";");
	for (var i=0;i<buildOrderArr.length;i++) {
		let cel = buildOrderArr[i].split(' ');
		cel[1] = parseInt(cel[1]);
		if (cel[0] == 'MINES') {
			let smallest = 31;
			if (currentBuildLvls['wood'] < cel[1]) {
				smallest = currentBuildLvls['wood'];
				nextToBuild = 'wood';
			}
			if (currentBuildLvls['stone'] < cel[1] && currentBuildLvls['stone'] < smallest) {
				smallest = currentBuildLvls['stone'];
				nextToBuild = 'stone';
			}
			if (currentBuildLvls['iron'] < cel[1] && currentBuildLvls['iron'] < smallest) {
				smallest = currentBuildLvls['iron'];
				nextToBuild = 'iron';
			}
			if (nextToBuild != '') break;
		}
		// TODO: FASTEST
		if (currentBuildLvls[cel[0]] < cel[1]) {
			nextToBuild = cel[0];
			break;
		}
	}

	/* Minden épület kész */
	if (nextToBuild == '') {
		naplo("Építő",'<a href="'+VILL1ST.replace(/(village=)[0-9]+/g,"village="+PMEP[0])+'" target="_BLANK">'+EPIT_REF.game_data.village.name+" ("+EPIT_REF.game_data.village.x+"|"+EPIT_REF.game_data.village.y+")</a> falu teljesen felépült és törlődött a listából");
		setTimeout(() => playSound("falu_kesz"), 1500);
		szem4_EPITO_addIdo(PMEP[2],"del");
		return;
	}

	/* Cél szükségeletének lekérése */
	var nextToBuildRow = EPIT_REF.document.getElementById('main_buildrow_' + nextToBuild);
	if (!nextToBuildRow) {
		szem4_EPITO_infoCell(PMEP[2],firstBuildTime==0?"red":"yellow", nextToBuild+" nem építhető. Előfeltétel szükséges? " + writeAllBuildTime(allBuildTime));
		szem4_EPITO_addIdo(PMEP[2], firstBuildTime>0?firstBuildTime:60);
		return;
	}
	var resNeed = {
		wood: parseInt(nextToBuildRow.cells[1].textContent.match(/[0-9]+/g),10),
		stone: parseInt(nextToBuildRow.cells[2].textContent.match(/[0-9]+/g),10),
		iron: parseInt(nextToBuildRow.cells[3].textContent.match(/[0-9]+/g),10),
		pop: parseInt(nextToBuildRow.cells[5].textContent.match(/[0-9]+/g),10)
	}
	if (Math.max(resNeed.wood, resNeed.stone, resNeed.iron) > EPIT_REF.game_data.village.storage_max) nextToBuild = 'storage+';
	if (resNeed.pop > (EPIT_REF.game_data.village.pop_max - EPIT_REF.game_data.village.pop)) nextToBuild = 'farm+';
	if (nextToBuild == 'farm+' && EPIT_REF.game_data.village.buildings.farm == 30) {
		szem4_EPITO_infoCell(PMEP[2],"red","Tanya megtelt, építés nem folytatható. " + writeAllBuildTime(allBuildTime));
		szem4_EPITO_addIdo(PMEP[2], 120);
		return;
	}
	if (nextToBuild == 'farm+' && buildList.includes('farm')) {
		szem4_EPITO_infoCell(PMEP[2],'yellow', 'Tanya megtelt, de már építés alatt... ' + writeAllBuildTime(allBuildTime));
		szem4_EPITO_addIdo(PMEP[2], 120);
		return;
	}
	if (nextToBuild == 'farm+' || nextToBuild == 'storage+') {
		nextToBuild = nextToBuild.slice(0, -1);
		nextToBuildRow = EPIT_REF.document.getElementById('main_buildrow_' + nextToBuild);
		resNeed = {
			wood: parseInt(nextToBuildRow.cells[1].textContent.match(/[0-9]+/g),10),
			stone: parseInt(nextToBuildRow.cells[2].textContent.match(/[0-9]+/g),10),
			iron: parseInt(nextToBuildRow.cells[3].textContent.match(/[0-9]+/g),10),
			pop: 0
		}
		// Farm kéne, de raktár nincs hozzá ~>
		if (Math.max(resNeed.wood, resNeed.stone, resNeed.iron) > EPIT_REF.game_data.village.storage_max) {
			nextToBuild = 'storage';
			nextToBuildRow = EPIT_REF.document.getElementById('main_buildrow_' + nextToBuild);
			resNeed = {
				wood: parseInt(nextToBuildRow.cells[1].textContent.match(/[0-9]+/g),10),
				stone: parseInt(nextToBuildRow.cells[2].textContent.match(/[0-9]+/g),10),
				iron: parseInt(nextToBuildRow.cells[3].textContent.match(/[0-9]+/g),10),
				pop: 0
			}
		}
	}

	if (EPIT_REF.game_data.village.wood < resNeed.wood || EPIT_REF.game_data.village.stone < resNeed.stone || EPIT_REF.game_data.village.iron < resNeed.iron) {
		szem4_EPITO_infoCell(PMEP[2],"yellow","Nyersanyag hiány lépett fel. " + writeAllBuildTime(allBuildTime));
		szem4_EPITO_addIdo(PMEP[2],firstBuildTime>0?Math.min(firstBuildTime, 60):60);
		return;
	} 

	/* Minden rendben, építhető, klikk */
	szem4_EPITO_infoCell(PMEP[2],"alap","Építés folyamatban.");
	var buildBtn = nextToBuildRow.querySelector('.btn.btn-build');
	if (buildBtn.style.display == 'none') {
		if (buildList.length < 2) {
			szem4_EPITO_infoCell(PMEP[2],"red","Ismeretlen hiba. " + writeAllBuildTime(allBuildTime));
		} else {
			szem4_EPITO_infoCell(PMEP[2],"alap","Építkezési sor megtelt. " + writeAllBuildTime(allBuildTime));
		}
		szem4_EPITO_addIdo(PMEP[2],firstBuildTime>0?firstBuildTime:60);
		return;
	}
	buildBtn.click();
	playSound("epites");
}catch(e){debug("epit_IntelliB",e);}}

function szem4_EPITO_motor(){try{
	var nexttime=2000;
	if (BOT||EPIT_PAUSE||USER_ACTIVITY) {nexttime=5000;} else {
	if (EPIT_HIBA>10) {EPIT_HIBA=0; EPIT_GHIBA++; if(EPIT_GHIBA>3) {if (EPIT_GHIBA>5) {naplo("Globál","Nincs internet? Folyamatos hiba az építőnél"); nexttime=60000; playSound("bot2");} EPIT_REF.close();} EPIT_LEPES=0;}
	switch (EPIT_LEPES) {
		case 0: PMEP=szem4_EPITO_Wopen(); /*FaluID;lista;link_a_faluhoz*/
				if (PMEP[0]) {
					EPIT_REF=windowOpener('epit', VILL1ST.replace("screen=overview","screen=main").replace(/village=[0-9]+/,"village="+PMEP[0]), AZON+"_SZEM4EPIT");
					EPIT_LEPES=1;
				} else {
					if (document.getElementById("epit_lista").rows.length==1) 
						nexttime=5000;
					else {
						nexttime=60000;
						if (MOBILE_MODE) EPIT_REF.close();
					}
				}
				if (EPIT_REF && EPIT_REF.document) EPIT_REF.document.title = 'szem4/építő';
				break;
		case 1: if (isPageLoaded(EPIT_REF,PMEP[0],"screen=main")) {EPIT_HIBA=0; EPIT_GHIBA=0;
					/*PMEP=*/szem4_EPITO_IntettiBuild(PMEP[1]);
				} else {EPIT_HIBA++;}
				EPIT_LEPES=0;
				break;
		default: EPIT_LEPES=0;
	}
	
	/*
	1.) Megnézzük melyik falut kell megnyitni -->főhadi.
	2.) <5 sor? Mit kell venni? Lehetséges e? Ha nem, lehet e valamikor az életbe? (tanya/raktár-vizsgálat)
	3.) Nincs! xD
	*/}
}catch(e){debug("Epito motor",e); EPIT_LEPES=0;}
var inga=100/((Math.random()*40)+80);
nexttime=Math.round(nexttime*inga);
try{
	worker.postMessage({'id': 'epit', 'time': nexttime});
}catch(e){debug('epit', 'Worker engine error: ' + e);setTimeout(function(){szem4_EPITO_motor();}, 3000);}}

ujkieg_hang("Építő","epites;falu_kesz;kritikus_hiba");
ujkieg("epit","Építő",'<tr><td><h2 align="center">Építési listák</h2><table align="center" class="vis" style="border:1px solid black;color: black;"><tr><th onmouseover=\'sugo(this,"Építési lista neve, amire később hivatkozhatunk")\'>Csoport neve</th><th onmouseover=\'sugo(this,"Az építési sorrend megadása. Saját lista esetén ellenőrizzük az OK? linkre kattintva annak helyességét!")\' style="width:800px">Építési lista</th></tr><tr><td>Alapértelmezett</td><td><input type="text" disabled="disabled" value="main 10;storage 10;wall 10;main 15;wall 15;storage 15;farm 10;main 20;wall 20;MINES 10;smith 5;barracks 5;stable 5;storage 20;farm 20;market 10;main 22;smith 12;farm 25;storage 28;farm 26;MINES 24;market 19;barracks 15;stable 10;garage 5;MINES 26;farm 28;storage 30;barracks 20;stable 15;farm 30;barracks 25;stable 20;MINES 30;smith 20;snob 1" size="125"><a onclick="szem4_EPITO_cscheck(this)" style="color:blue; cursor:pointer;"> OK?</a></td></tr></table><p align="center">Csoportnév: <input type="text" value="" size="30" id="epit_ujcsopnev" placeholder="Nem tartalmazhat . _ ; karaktereket"> <a href="javascript: szem4_EPITO_ujCsop()" style="color:white;text-decoration:none;"><img src="'+pic("plus.png")+' " height="17px"> Új csoport</a></p></td></tr><tr><td><h2 align="center">Építendő faluk</h2><table align="center" class="vis" style="border:1px solid black;color: black;width:900px" id="epit_lista"><tr><th style="width: 75px; cursor: pointer;" onclick=\'rendez("szoveg",false,this,"epit_lista",0)\' onmouseover=\'sugo(this,"Rendezhető. Itt építek. Dupla klikk a falura = sor törlése")\'>Falu koord.</th><th onclick=\'rendez("lista",false,this,"epit_lista",1)\' onmouseover=\'sugo(this,"Rendezhető. Felső táblázatban használt lista közül választhatsz egyet, melyet később bármikor megváltoztathatsz.")\' style="width: 135px; cursor: pointer">Használt lista</th><th style="width: 220px; cursor: pointer;" onclick=\'rendez("datum",false,this,"epit_lista",2)\' onmouseover=\'sugo(this,"Rendezhető. Ekkor fogom újranézni a falut, hogy lehet e már építeni.<br>Dupla klikk=idő azonnalira állítása.")\'>Return</th><th style="cursor: pointer;" onclick=\'rendez("szoveg",false,this,"epit_lista",3)\' onmouseover=\'sugo(this,"Rendezhető. Szöveges információ a faluban zajló építésről. Sárga hátterű szöveg orvosolható; kék jelentése hogy nem tud haladni; piros pedig kritikus hibát jelöl; a szín nélküli a normális működést jelzi.<br>Dupla klikk=alaphelyzet")\'><u>Infó</u></th></tr></table><p align="center" id="epit_ujfalu_adat">Csoport: <select><option value="Alapértelmezett">Alapértelmezett</option> </select> \Faluk: <input type="text" value="" placeholder="Koordináták: 123|321 123|322 ..." size="50"> \<a href="javascript: szem4_EPITO_ujFalu()" style="color:white;text-decoration:none;"><img src="'+pic("plus.png")+'" height="17px"> Új falu(k)</a></p></td></tr>');

var EPIT_LEPES=0;
var EPIT_REF; var EPIT_HIBA=0; var EPIT_GHIBA=0;
var PMEP; var EPIT_PAUSE=false;
szem4_EPITO_motor();
szem4_EPITO_perccsokkento();

/*-----------------GYŰJTÖGETŐ--------------------*/
function gyujto_listAllVillages() {
	let rows = '';
	for (const key in KTID) {
		rows += `<tr><td>${key}</td><td onclick="gyujto_setVill(${KTID[key]}, this)"><input name="f${KTID[key]}" type="checkbox"></td></tr>`;
	}
	return rows;
}
function gyujto_setVill(villId, el) {
	if (!SZEM4_GYUJTO[villId])
		SZEM4_GYUJTO[villId] = true;
	else
		SZEM4_GYUJTO[villId] = !SZEM4_GYUJTO[villId];
	el.querySelector('input').checked = SZEM4_GYUJTO[villId];
	console.info(SZEM4_GYUJTO);
}
function rebuildDOM_gyujto() {
	const f = document.querySelector('#gyujto_form');
	for (let villId in SZEM4_GYUJTO) {
		if (SZEM4_GYUJTO[villId] === true) f['f' + villId].checked = true;
	}
}
var SZEM4_GYUJTO = {}; //VillId: isEnabled
ujkieg('gyujto','Gyűjtő',`<tr><td>
	<h2 align="center">3rdparty gyűjtögető</h2>
	<h4 align="center">Powered by TwCheese</h4>
	<h4 align="center">...FEJLESZTÉS ALATT/NEM MŰKÖDIK...</h4>
	<br><br>
	Ez a script külön beállítást igényel. Ehhez az alábbi, legálisan is futtható scriptet kell futtatnod a gyülekezőhelyeden, a gyűjtögetésnél:<br>
	<pre>$.getScript('https://media.innogames.com/com_DS_HU/scripts/scavenging.js');</pre><br>
	SZEM ezt a scriptet fogja automata módban futtatni az alább bejelöld faluidban, az ott beállított módon.
	<form id="gyujto_form">
		<table class="vis gyujto_table">
			<thead><tr><th>Falu</th><th>Gyűjtögetés?</th></thead>
			<tbody>${gyujto_listAllVillages()}</tbody>
		</table>
	</form>
</td></tr>`);

/*-----------------Adatmentő kezelő--------------------*/
function szem4_ADAT_saveNow(tipus) {
	let dateEl = document.querySelector(`#adat_opts input[name=${tipus}]`);
	if (dateEl) dateEl = dateEl.closest('tr').cells[2];
	switch (tipus) {
		case "farm":   localStorage.setItem(AZON+"_farm", JSON.stringify(SZEM4_FARM)); break;
		case "epit":   szem4_ADAT_epito_save(); break;
		case "vije":   localStorage.setItem(AZON+"_vije", JSON.stringify(SZEM4_VIJE)); break;
		case "sys":    localStorage.setItem(AZON+"_sys", JSON.stringify(SZEM4_SETTINGS)); break;
		case "gyujto": localStorage.setItem(AZON + '_gyujto', JSON.stringify(SZEM4_GYUJTO)); break;
		case 'cloud':  saveLocalDataToCloud(false, false);
	}
	if (dateEl) dateEl.innerHTML = new Date().toLocaleString();
	return;
}
function szem4_ADAT_loadNow(tipus) {try{
	let dataObj = localStorage.getItem(`${AZON}_${tipus}`);
	if (!dataObj) return; else if (tipus != 'epit') dataObj = JSON.parse(dataObj);
	switch (tipus) {
		case "farm":
			for (let a in SZEM4_FARM) {
				if (dataObj[a] !== undefined) SZEM4_FARM[a] = dataObj[a];
			}
			rebuildDOM_farm();
			break;
		case "epit":  szem4_ADAT_epito_load(); break; // FIXME! Hiányzik!!
		case "vije":
			for (let a in SZEM4_VIJE) {
				if (dataObj[a] !== undefined) SZEM4_VIJE[a] = dataObj[a];
			}
			rebuildDOM_VIJE();
			break;
		case "sys":
			for (let a in SZEM4_SETTINGS) {
				if (dataObj[a] !== undefined) SZEM4_SETTINGS[a] = dataObj[a];
			}
			loadSettings();
			break;
		case "gyujto":
			for (let a in SZEM4_GYUJTO) {
				if (dataObj[a] !== undefined) SZEM4_GYUJTO[a] = dataObj[a];
			}
			rebuildDOM_gyujto();
			break;
		default: debug('szem4_ADAT_loadNow', `Nincs ilyen típus: ${tipus}`);
	}
}catch(e) {debug('szem4_ADAT_loadNow', `Hiba ${tipus} adatbetöltésénél: ${e}`);}}

function szem4_ADAT_restart(tipus) {
	// DEL nem is kell, csak ez a reset?
	alert('To be implemented'); return;
}

/**
 * By default, all save is enabled. This function sets all to disabled
 */
function szem4_ADAT_StopAll(){
	document.querySelectorAll('#adat_opts input[type="checkbox"]').forEach(chk => {
		chk.checked = false;
	});
	return;
}

function szem4_ADAT_LoadAll(){
	ALL_EXTENSION.forEach(id => {
		szem4_ADAT_loadNow(id);
	});
	szem4_ADAT_loadNow('sys');
}

/** OBSOLATE, NEED REFACTOR */
function szem4_ADAT_epito_save(){try{
	var eredmeny="";
	/*Csoportok*/
	var adat=document.getElementById("epit").getElementsByTagName("table")[0].rows;
	for (var i=2;i<adat.length;i++) {
		eredmeny+=adat[i].cells[0].textContent+"-"+adat[i].cells[1].getElementsByTagName("input")[0].value;
		if (i<adat.length-1) eredmeny+=".";
	}
	
	/*Falulista*/
	eredmeny+="_";
	adat=document.getElementById("epit").getElementsByTagName("table")[1].rows;
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[0].textContent;
		if (i<adat.length-1) eredmeny+=".";
	}
	eredmeny+="_";
	for (var i=1;i<adat.length;i++) {
		eredmeny+=adat[i].cells[1].getElementsByTagName("select")[0].value;
		if (i<adat.length-1) eredmeny+=".";
	}
	localStorage.setItem(AZON+"_epit",eredmeny);
	var d=new Date(); document.getElementById("adat_opts").rows[2].cells[2].textContent=d.toLocaleString();
	return;
}catch(e){debug("ADAT_epito_save",e);}}

/** OBSOLATE, NEED REFACTOR */
function szem4_ADAT_epito_load(){try{
	if(localStorage.getItem(AZON+"_epit")) var suti=localStorage.getItem(AZON+"_epit"); else return;
	/* START: Minden adat törlése a listából és falukból!*/
	var adat=document.getElementById("epit").getElementsByTagName("table")[0];
	for (var i=adat.rows.length-1;i>1;i--) {
		adat.deleteRow(i);
	}
	var adat=document.getElementById("epit").getElementsByTagName("table")[1];
	for (var i=adat.rows.length-1;i>0;i--) {
		adat.deleteRow(i);
	}
	adat=document.getElementById("epit_ujfalu_adat").getElementsByTagName("select")[0];
	while (adat.length>1) adat.remove(1);
	
	/*új csoport gomb használata, utána módosítás - ezt egyesével*/
	adat=suti.split("_")[0].split(".");
	for (var i=0;i<adat.length;i++) {
		document.getElementById("epit_ujcsopnev").value=adat[i].split("-")[0];
		szem4_EPITO_ujCsop();
		document.getElementById("epit").getElementsByTagName("table")[0].rows[i+2].cells[1].getElementsByTagName("input")[0].value=adat[i].split("-")[1];
	}
	/*Új faluk hozzáadása gomb, majd select állítása*/
	adat=suti.split("_")[1].split(".");
	document.getElementById("epit_ujfalu_adat").getElementsByTagName("input")[0].value=adat;
	szem4_EPITO_ujFalu();
	
	adat=suti.split("_")[2].split(".");
	var hely=document.getElementById("epit").getElementsByTagName("table")[1].rows;
	for (var i=0;i<adat.length;i++) {
		hely[i+1].cells[1].getElementsByTagName("select")[0].value=adat[i];
	}
	alert2("Építési adatok betöltése kész.");
	return;
}catch(e){debug("ADAT_epito_load",e);}}

function szem4_ADAT_del(tipus){try{
	if (!confirm("Biztos törli a(z) "+tipus+" összes adatát?")) return;
	if (localStorage.getItem(AZON+"_"+tipus)) {
		localStorage.removeItem(AZON+"_"+tipus);
		alert2(tipus+": Törlés sikeres");
	} else alert2(tipus+": Nincs lementett adat");
	return;
}catch(e){alert2("ADAT_epito_load HIBA\n",e);}}

function szem4_ADAT_kiir(tipus){try{
	if (localStorage.getItem(AZON+"_"+tipus)) {
		alert2("<textarea onmouseover='this.select()' onclick='this.select()' cols='38' rows='30'>"+localStorage.getItem(AZON+"_"+tipus)+"</textarea>");
	} else alert2("Nincs lementett adat");
	return;
}catch(e){debug("szem4_ADAT_kiir",e);}}

function szem4_ADAT_betolt(tipus){try{
	var beadat=prompt("Adja meg a korábban SZEM4 ÁLTAL KIÍRT ADATOT, melyet be kíván tölteni.\n\n Ne próbálj kézileg beírni ide bármit is. Helytelen adat megadását SZEM4 nem tudja kezelni, az ebből adódó működési rendellenesség csak RESET-eléssel állítható helyre.");
	if (beadat==null || beadat=="") return;
	localStorage.setItem(AZON+"_"+tipus, beadat);
	szem4_ADAT_loadNow(tipus);
	alert2("Az adatok sikeresen betöltődtek.");
}catch(e){alert2("szem4_ADAT_betolt hiba:\n" + e);}}

// Adat_FELHŐ
function loadCloudSync() {
	if (CLOUD_AUTHS) {
		try {
			CLOUD_AUTHS = JSON.parse(CLOUD_AUTHS);
			if (!CLOUD_AUTHS.authDomain || !CLOUD_AUTHS.projectId || !CLOUD_AUTHS.storageBucket || !CLOUD_AUTHS.messagingSenderId || !CLOUD_AUTHS.appId || !CLOUD_AUTHS.email || !CLOUD_AUTHS.password || !CLOUD_AUTHS.collection || !CLOUD_AUTHS.myDocument)
				throw 'Must consist these fields: authDomain projectId storageBucket messagingSenderId appId email password';
		} catch(e) { naplo('Sync', 'Invalid Auth data ' + e); }
	} else {
		return;
	}
	const script = document.createElement("script");
	script.type = "module";
	script.innerHTML = `
		import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
		import { getFirestore, collection, updateDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
		import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js"

		const app = initializeApp(CLOUD_AUTHS);
		const db = getFirestore(app);
		const auth = getAuth();

		signInWithEmailAndPassword(auth, CLOUD_AUTHS.email, CLOUD_AUTHS.password)
		.then(async (userCredential) => {
			const user = userCredential.user;

			window.readUpData = async () => {
				const myDoc = await getDoc(doc(db, CLOUD_AUTHS.collection, CLOUD_AUTHS.myDocument));
				return myDoc.data();
			}
			window.updateData = async (newData) => {
				try {
					const myDoc = await getDoc(doc(db, CLOUD_AUTHS.collection, CLOUD_AUTHS.myDocument));
					await updateDoc(myDoc.ref, newData);
					return 'OK';
				} catch(e) {
					return 'Error: '+e;
				}
			}
			window.naplo('Sync', 'Firebase felhő kapcsolat létrejött');
			if (confirm("Firebase adatok importálása helyi adatokra?")) {
				window.loadCloudDataIntoLocal();
				window.document.querySelector('#adat_opts input[name="cloud"]').checked = true;
			} else {
				window.szem4_ADAT_LoadAll();
			}
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
		});`;
	document.head.appendChild(script);
}
function loadCloudDataIntoLocal() {
	if (!CLOUD_AUTHS) {
		alert2("Nincs aktív felhő szinkronizáció");
		return;
	}
	readUpData().then((cloudData) => {
		localStorage.setItem(AZON+"_farm",   cloudData.farm);
		localStorage.setItem(AZON+"_vije",   cloudData.vije);
		localStorage.setItem(AZON+"_epit",  cloudData.epit);
		localStorage.setItem(AZON+"_sys",    cloudData.sys);
		localStorage.setItem(AZON+"_gyujto", cloudData.gyujto);
		szem4_ADAT_LoadAll();
	});
}
function saveLocalDataToCloud(isAll, isByHand=false) {
	if (!CLOUD_AUTHS) {
		if (isByHand) alert2("Nincs aktív felhő szinkronizáció");
		return;
	}
	if (isAll) {
		ALL_EXTENSION.forEach(id => {
			if (id !== '')
			szem4_ADAT_saveNow(id);
		});
		szem4_ADAT_saveNow('sys');
	}
	var jsonToSave = {
		farm:  localStorage.getItem(AZON+"_farm"),
		epit:  localStorage.getItem(AZON+"_epit"),
		vije:  localStorage.getItem(AZON+"_vije"),
		sys:   localStorage.getItem(AZON+"_sys"),
		gyujto:localStorage.getItem(AZON+"_gyujto"),
	};
	updateData(jsonToSave).then(() => {
		var d=new Date();
		document.querySelector('#adat_opts input[name="cloud"]').closest('tr').cells[2].textContent = d.toLocaleString();
	});
}

// Adat_MOTOR
function szem4_ADAT_motor() {
	try {
		if (!ADAT_PAUSE) {
			if (ADAT_FIRST) {
				ADAT_FIRST = false;
			} else {
				document.querySelectorAll('#adat_opts input:checked').forEach((el) => {
					szem4_ADAT_saveNow(el.name);
				});
				
			}
		}
 	} catch(e) { debug('ADAT_motor', e)}
	worker.postMessage({'id': 'adatok', 'time': 60000});
}

function szem4_ADAT_AddImageRow(tipus){
	return '\
	<img title="Jelenlegi adat betöltése" alt="Betölt" onclick="szem4_ADAT_'+tipus+'_load()" width="17px" src="'+pic("load.png")+'"> \
	<img title="Törlés" alt="Töröl" onclick="szem4_ADAT_del(\''+tipus+'\')" src="'+pic("del.png")+'" width="17px""> \
	<img title="Jelenlegi adat kiiratása" alt="Export" onclick="szem4_ADAT_kiir(\''+tipus+'\')" width="17px" src="'+pic("Export.png")+'"> \
	<img title="Saját adat betöltése" alt="Import" onclick="szem4_ADAT_betolt(\''+tipus+'\')" width="17px" src="'+pic("Import.png")+'"> \
	<img title="Mentés MOST" alt="Save" onclick="szem4_ADAT_saveNow(\''+tipus+'\')" width="17px" src="'+pic("saveNow.png")+'">\
	<img title="Reset: Helyreállítás" alt="Reset" onclick="szem4_ADAT_restart(\''+tipus+'\')" width="17px" src="'+pic("reset.png")+'">';
}

ujkieg("adatok","Adatmentő",'<tr><td>\
<p align="center"><b>Figyelem!</b> Az adatmentő legelső elindításakor betölti a lementett adatokat (ha van), nem törődve azzal, hogy jelenleg mi a munkafolyamat.<br>Új adatok használatához az adatmentő indítása előtt használd a törlést a lenti táblázatból.</p>\
<form id="adatmento-form"><table class="vis" id="adat_opts" style="margin-bottom: 50px;"><tr><th>Engedélyezés</th><th style="padding-right: 20px">Kiegészítő neve</th><th style="min-width:125px; padding-right: 20px;">Utolsó mentés ideje</th><th style="width:150px">Adat kezelése</th></tr>\
<tr><td><input type="checkbox" name="farm" checked></td><td>Farmoló</td><td></td><td>'+szem4_ADAT_AddImageRow("farm")+'</td></tr>\
<tr><td><input type="checkbox" name="epit" checked></td><td>Építő</td><td></td><td>'+szem4_ADAT_AddImageRow("epit")+'</td></tr>\
<tr><td><input type="checkbox" name="vije" checked></td><td>Jelentés elemző</td><td></td><td>'+szem4_ADAT_AddImageRow("vije")+'</td></tr>\
<tr><td><input type="checkbox" name="sys" checked></td><td>Hangok, témák</td><td></td><td>'+szem4_ADAT_AddImageRow("sys")+'</td></tr>\
<tr><td><input type="checkbox" name="gyujto" checked></td><td>Gyűjtögető</td><td></td><td>'+szem4_ADAT_AddImageRow("gyujto")+'</td></tr>\
<tr><td><input type="checkbox" name="cloud" unchecked></td><td><img height="17px" src="'+pic('cloud.png')+'"> Cloud sync</td><td></td><td>\
			<img title="Cloud adat betöltése a jelenlegi rendszerbe" alt="Import" onclick="loadCloudDataIntoLocal()" width="17px" src="'+pic("Import.png")+'"> \
			<img title="Local adat lementése a Cloud rendszerbe" alt="Save" onclick="saveLocalDataToCloud(true, true)" width="17px" src="'+pic("saveNow.png")+'">\
</td></tr>\
</table></form><p align="center"></p></td></tr>');
var ADAT_PAUSE=false, ADAT_FIRST = true;
szem4_ADAT_motor();
var FARM_TESZTER_TIMEOUT;

$(document).ready(function(){
	nyit("naplo");
	onWallpChange();
	naplo('Globál','Verzió ['+VERZIO+'] legfrissebb állapotban, GIT-ről szedve.');
	naplo("Indulás","SZEM 4.6 elindult.");
	naplo("Indulás","Farmolók szünetelő módban.");
	naplo("Indulás","⚠️ Teljes adatmentés átalakítás történt, a korábbi lementésed ebben a verzióban már nem érvényes.");
	if (TIME_ZONE != 0) naplo('Időzóna 🕐', `Időeltolódás frissítve: eltolódás ${TIME_ZONE} perccel.`);
	soundVolume(0.0);
	playSound("bot2"); /* Ha elmegy a net, tudjon csipogni */
	if (confirm("Engedélyezed az adatok mentését?\nKésőbb is elindíthatja, ha visszapipálja a mentés engedélyezését - ekkor szükséges kézi adatbetöltés is előtte.")) {
		if (CLOUD_AUTHS) {
			naplo("Sync","Connecting to Firebase Cloud System...");
			loadCloudSync();
		} else {
			naplo("Sync","Firebase Cloud System is not setup. Create 'szem_firebase' localStorage item with credentials");
			naplo("Adat","Adatbetöltés helyi adatokból...");
			szem4_ADAT_LoadAll();
		}
	} else {
		szem4_ADAT_StopAll();
	}
	setTimeout(function(){soundVolume(1.0);},2000);
	
	$(function() {
		$("#alert2").draggable({handle: $('#alert2head')});
		$('#sugo').mouseover(function() {sugo(this,"Ez itt a súgó");});
		$('#fejresz').mouseover(function() {sugo(this,"");});
	});
	$("#farm_opts").on('change', 'input', function() {
		if (FARM_TESZTER_TIMEOUT) clearTimeout(FARM_TESZTER_TIMEOUT);
		FARM_TESZTER_TIMEOUT = setTimeout(() => shorttest(), 1000);
	});
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape') {
			alert2('close');
		}
	});
	document.addEventListener('click', addFreezeNotification);
	document.addEventListener('keypress', addFreezeNotification);
	addFreezeNotification();
	window.onbeforeunload = function() {return true;}

	// FARMOLÓ
	$('#farm_honnan').on('change', 'input[type="checkbox"]', (ev) => {
		const checkbox = ev.target;
		if (checkbox.getAttribute('id') == 'farm_multi_honnan') return;
		if (document.querySelector('#farm_multi_honnan').checked) {
			const unitType = checkbox.name;
			const newValue = checkbox.checked;
			for (let vill in SZEM4_FARM.DOMINFO_FROM) {
				SZEM4_FARM.DOMINFO_FROM[vill].isUnits[unitType] = newValue;
			}
		} else {
			SZEM4_FARM.DOMINFO_FROM[checkbox.closest('tr').cells[0].textContent].isUnits[checkbox.name] = checkbox.checked;
		}
	});
	// VIJE
	$('#vije_opts :input').on('change', (ev) => {
		const el = ev.target;
		if (el.type == 'text') {
			SZEM4_VIJE.i18ns[el.name] = el.value;
		} else if (el.type == 'checkbox') {
			SZEM4_VIJE.i18ns[el.name] = el.checked;
		}
	});
	addEventListener("visibilitychange", (event) => {
		if (document.visibilityState == 'visible')
			document.querySelectorAll('video').forEach(a => a.play())
	});

});
/*
NEW FEATURE: Frissítse a bari listát: használja a birKer-t, nekünk csak egy számot kelljen megadni, hány mezőre keressen ~~ Helye: "Farmolandó falu hozzáadása" cells[2]-be 
BUG: Zöld háttérjelzést mindig kiszedi miután elemez... 0-s volt, 0-s lett, kém is volt, de bumm eltűnt!
BUG: Bot védelemkor nagyon sokszor írja hogy bot védelem + duplán csipog + kiütéskor nem frissíti a lapokat + hibára futkos váhhhh
FEAT: Téma profil
FEAT: Jelszóvédett profil
NEW KIEG: gyűjtögető: 3rd partyst használva, vagy épp csak static unitokat
	1.) Hívja ezt: $.getScript('https://media.innogames.com/com_DS_HU/scripts/scavenging.js');
	2.) HA $('.duration-section').last()[0].style.display != 'none' AKKOR $('.btn.btn-default.free_send_button').last()[0].click()
	3.) Amíg $('.btn.btn-default.free_send_button').length > 0
MAIN BUG: Ha max időre is kevés a sereg, akkor küldendő sereg = min sereg kéne
ADDME: J? -> FAKE limit, és ennek figyelembe vétele
ADDME: Farmok rendezése táv szerint
ADDME: Effect themes: Hozzuk be a havas témám a weboldalról, valamint legyen hullámzó víz a content tetején, átlátszó? egérre mozgó? https://jsfiddle.net/TjaBz/
CONVERT: alert notification áthelyezése, +önmagától idővel eltűnő alertek
FEAT: Minden kiírt falu ami a tied, rátéve az egeret írja ki a nevét, és ha a csoportképzőbe csoporthoz van adva, akkor azt is!
FEAT: Ahol játékos van, azt a jelit ne törölje, hiába zöld a jelentés. 
FEAT: Kék hátteret a bányára menti, de elvileg nem kéne merthogy... tudjuk, nem?
FIXME: Header rész újra átdolgozása: több soros sok-kieg.-re felkészülés
ADDME: VIJE opciók: [] zöld kém nélküli jeliket törölje csak
ADDME: Sebesség ms-e leOKézáskor ne legyen érvényes, azt csinálja gyorsabban (konstans rnd(500ms)?)
FEAT: Építőbe "FASTEST()" és "ANY()" opció. Fastest: a leggyorsabban felépítülőt építi. Any: Amire van nyersed. Használható a kettő együtt, így "amire van nyersed, abból a leggyorsabban épülő"
	Teszt: ANY(FASTEST(MINES 25))
FEAT: Építőbe TRAIN xx; épület, ami xx barakk és xx-5 istállót épít felváltva
NEW KIEG: Farmkezelő bot: Szimplán nézi a "Time"-ot, és ha user általa megadott időn belül van, akkor C-t nyom, ellenben meg A-t.
ADDON: Defibrillátor - minden script state-ét 0-ra állítja, mindent stop-ol majd elindítja a motorokat. Manuális lefejlesztés
FEAT: Reset - Adatmentőbe hiányzó függvény. Az alap értékeket állítja be neki.

FARMVÉDŐ
ADDME: New kieg.: FARMVÉDŐ (Farmolóba, opciókhoz)
minimum sereg definiálása falszintenként kísérő (ami kard, bárd, vagy kl lehet csak)+any.unit
FAL	MIN
0	80 lándzsa	4 kard+6 lándzsa	3 bárd+6 lándzsa	1 ló
1	8800lándzsa	300k+200 lándzsa	100b+50 lándzsa		4 kló	6 íló	(3nló)
2	32 kl	6kl+10íló

NEW FEATURE: Ha egy parancs screen-jén futtatjuk SZEM-et, elemezze be azt, és vegye fel mint sereg (kellene hozzá támadásID lementés is?)

- Hang átdolgozás: Választó
ADDME: Saját falunál csatára készülés: Érjenek vissza xx:xx-re
ADDME: Fokozatos SZEM betöltés/indítás: preLoader (gyors beállítások), midLoader (mostani init()), endLoader (motorok indítása)
ADDME: szüneteltethető a falu támadása pipára mint a "J?" oszlop ~~> Ikon legyen: balta/ember + tooltip
ADDME: Minimalistic view: Karikába hogy SZEM4, alá heartbeat, listázni a szünetelt kiegeket, Sebesség/max táv infót?
NEW KIEG: Autoclicker: CSS leíró + perc + ALL/1st választó -> nyom rá click() eventeket
NEW KIEG: Auto katázó: Beadod mely faluból max hány percre, mely falukat. VIJE adatai alapján küldi, [] x+1 épületszintet feltételezve 1esével bontásra. [] előtte 2/4 kos v 2/6 kata falra
ADDME: VIJE stat, h hány %-osan térnek vissza az egységek. Óránként resettelni!?
ADDME: Ai: Automatikus, falunkénti megbízhatóság- és hatászám számolás. Csak perc alapú, és farmvédő alapú
EXTRA: Pihenés sync: Ha Farmoló pihen, VIJE is (külön opció VIJE-nél: recommended ha zöld-törlése be van pipálva). Előbb VIJE, aztán farmolás!
ADDME: Signal-system: A főbb botok tudják egymásnak jelezni hogy ki dolgozik mikor, és ne üssék egymást, ill. tudjanak ezáltal adatot átdobni egymásnak
ADDME: [Lebegő ablak] PAUSE ALL, I'M OUT FOR [x] MINUTES
ADDME: Teherbírás módosító
*/

void(0);