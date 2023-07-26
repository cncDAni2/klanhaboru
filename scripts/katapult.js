var LVL_MAXRIX_1 = [0, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 5, 5, 6, 6, 6, 7, 8, 8, 9, 10, 10, 11, 12, 13, 15, 16, 17, 19, 20];
var PLUSLEVEL = 1;
/* 16 bárdos kíséret kell */

function setCookie(c_name, value) {
	localStorage.setItem(c_name,value);
}
function getCookie(name) {
	return localStorage.getItem(name);
}

function report_learning() {
	let buildings_1 = document.getElementById('attack_spy_buildings_left');
	if (!buildings_1) {
		alert("Nincs felderített épületszint");
		return;
	}

	let buildings = {};
	for (let i=1;i<buildings_1.rows.length;i++) {
		buildings[buildings_1.rows[i].cells[0].textContent.trim()] = parseInt(buildings_1.rows[i].cells[1].textContent);
	}

	let buildings_2 = document.getElementById('attack_spy_buildings_right');
	if (buildings_2) {
		for (let i=1;i<buildings_2.rows.length;i++) {
			buildings[buildings_2.rows[i].cells[0].textContent.trim()] = parseInt(buildings_2.rows[i].cells[1].textContent);
		}
	}
	let coords = document.getElementById("attack_info_def").rows[1].textContent.match(/[0-9]+\|[0-9]+/);
	setCookie('cnc_katapult', `;${coords[coords.length-1]};${JSON.stringify(buildings)}`);
	alert(`Megtanulva +${PLUSLEVEL}lvl mode`);
}

function tamadas_OK() {
	let myCookie = getCookie('cnc_katapult').split(';');
	// Check: Célpont, kataszám stimmel?
	let buildings = JSON.parse(myCookie[2]);
	let nextTarget = getNextTarget(buildings);
	let form = document.getElementById('command-data-form');
	for (let i = 0; i < form['building'].options.length; i++) {
		const option = form['building'].options[i];
		if (option.text === nextTarget.target) {
			option.selected = true;
			break; // Stop the loop since the value is selected
		}
	}

	debugger;
	buildings[nextTarget.target] -= 1;

	setCookie('cnc_katapult', `;${myCookie[1]};${JSON.stringify(buildings)}`);
	form.submit_confirm.click();
}

function send_units() {
	if (document.location.href.includes('try=confirm')) {
		tamadas_OK();
		return;
	}

	let myCookie = getCookie('cnc_katapult').split(';');
	let form = document.getElementById('command-data-form');

	form.input.value = myCookie[1];

	let buildings = JSON.parse(myCookie[2]);
	let nextTarget = getNextTarget(buildings);
	if (!nextTarget) {
		alert("VÉGE");
		return;
	}
	form.catapult.value = LVL_MAXRIX_1[nextTarget.level + PLUSLEVEL];

	form.attack.click();
}

function getNextTarget(buildings) {
	for (let building in buildings) {
		if (building == '') {
			delete buildings[building];
			continue;
		}
		if (building == 'Gyülekezőhely' ||
			building == 'Szobor' ||
			building == 'Fatelep' ||
			building == 'Agyagbánya' ||
			building == 'Vasbánya' ||
			building == 'Raktár' ||
			building == 'Rejtekhely' ||
			(building == 'Főhadiszállás' && buildings[building] <= 1) ||
			(building == 'Tanya' && buildings[building] <= 6) ||
			buildings[building] == 0)
		continue;
		debugger;
		return {
			target: building,
			level: buildings[building]
		};
	}
}

if (document.location.href.includes('screen=report')) {
	report_learning();
}
if (document.location.href.includes('screen=place')) {
	send_units();
}