var UNITS = {
    defensive: ['spear', 'sword', 'archer', 'heavy'],
    offensive: ['axe', 'light', 'marcher', 'ram'],
    other: ['spy', 'catapult', 'noble']
};
var TRANSLATIO_HU = {
    'spear': 'Lándzsás',
    'sword': 'Kardforgató',
    'archer': 'Íjász',
    'heavy': 'Nehézlovas',
    'axe': 'Bárdos',
    'light': 'Könnyűlovas',
    'marcher': 'Lovasíjász',
    'ram': 'Kos',
    'spy': 'Kém',
    'catapult': 'Katapult',
    'noble': 'Nemes'
}

// 3rdparty - csoportképző

if (document.querySelector('#uzi') == null) {
    var csop_uzi = document.createElement("div");
    csop_uzi.setAttribute("id", "uzi");
    csop_uzi.setAttribute("style", "display: none; width: auto; background-color: #F0C0Bb; position: fixed; left: 60%; top:250px; border:3px solid black; padding: 10px; z-index:10;");
    document.getElementById("content_value").appendChild(csop_uzi);

    $(document).ready(function () {
        $("#uzi").draggable({ handle: "#uzi_drag" });
    });
    $("#uzi").keyup(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });
}
function displayMessage(cim, str) {
    try {
        if (cim == "disable" || str == "disable") { $("#uzi").hide(); return; }
        document.getElementById("uzi").innerHTML = '<div style="background: rgba(255,255,0,0.1); cursor: move; margin-bottom: 10px; padding: 5px;" id="uzi_drag"><p align="left" style="margin: 0;display:inline-block; font-weight: bold">' + cim + '</p><p align="right" style="float:right; margin: 0; display:inline-block;"><input type="button" onclick=displayMessage("","disable") style="font-weight:bold;color:#FFFFFF;background-color:#FF0000; border-style:double;border-color:#666666;"  title="Bezár" value="X"></p></div>' + str;
        $("#uzi").show();
    } catch (e) { alert(e); }
}

// 3rdparty VÉGE

function drawUnitsTable(title, units) {
    let tableHTML = `<strong style="padding-bottom: 8px;display: inline-block;">${title}</strong><br><table class="vis stat_table">`;
    for (const unit in units) {
        if (units[unit] == 0) continue;
        tableHTML += `<tr>
            <td><img src="/graphic/unit/unit_${unit}.png"></img> ${TRANSLATIO_HU[unit]||unit}</td>
            <td>${units[unit]}</td></tr>`
    }
    tableHTML+='</table>';

    return tableHTML;
}

function drawUnitStatsWindow() {
    if (
        document.querySelector('#units_table') == null ||
        document.querySelector('#units_table .row_marker') == null ||
        document.querySelector('#units_table .row_marker').rows.length !== 5) {
        alert('Rossz vagy értelmezhetetlen nézet. Sereg/minden kell');
        return;
    }
    const seregstats = {
        totalHome: {},
        totalAll: {},
        totalTransit: {},
        defensive: {
            vills_5k: [],
            vills_5_10k: [],
            vills_10_15k: [],
            vills_15k: [],
        }
    };

    const unitsTable = document.querySelector('#units_table');
    const colIndexes = getColindexes(unitsTable);
    const villageRows = unitsTable.querySelectorAll('.row_marker');

    for (let i = 0; i < villageRows.length; i++) {
        const row_1home = getUnitNumbers(villageRows[i], 0, colIndexes),
            row_3onSupp = getUnitNumbers(villageRows[i], 2, colIndexes),
            row_4ontheway = getUnitNumbers(villageRows[i], 3, colIndexes)

        seregstats.totalHome = sumUpObjs(row_1home, seregstats.totalHome);
        seregstats.totalTransit = sumUpObjs(row_4ontheway, seregstats.totalTransit);
        seregstats.totalAll = sumUpObjs(row_1home, row_3onSupp, row_4ontheway, seregstats.totalTransit);
    }
    
    let resultHTML = `
        ${drawUnitsTable('Összes egység', seregstats.totalHome)}<br><br>
        ${drawUnitsTable('Indításra kész / otthon', seregstats.totalHome)}
    `;
    displayMessage('Sereg statisztika', resultHTML);

    function getColindexes(units_table) {
        const result = {};
        for (let i = 0; i < units_table.rows[0].cells.length; i++) {
            try {
                const img = units_table.rows[0].cells[i].querySelector('img');
                if (img == null) continue;
                const unit = img.src.match(/unit_[a-z]+/g)[0].replace('unit_', '');
                result[unit] = i;
            } catch (e) { console.warn('Kép ami nem unit?', e); }
        }
        return result;
    }
    function getUnitNumbers(villageTable, locationRow, colIndexes) {
        const result = {};
        Object.keys(colIndexes).forEach(unit => {
            result[unit] = parseInt(villageTable.rows[locationRow].cells[locationRow == 0 ? colIndexes[unit] : (colIndexes[unit] - 1)].textContent, 10);
            if (isNaN(result[unit])) {
                console.warn('Nem szám van egyik helyen', result[unit], villageTable, locationRow, colIndexes);
                result[unit] = 0;
            }
        });
        return result;
    }
    function sumUpObjs(...sumObjs) {
        const result = { };
        for (const obj of sumObjs) {
            for (const key in obj) {
                result[key] = (result[key] || 0) + obj[key];
            }
        }
        return result;
    }
}

drawUnitStatsWindow();

/*
Első sor: Jelenleg készen a faluban. --> védőknek összegezzük, hogy ready-to-send (ott is lehet db-számra, hogy pl. >5k, 5k-10k, 10k-15k, 15k+ ready); támadónak nuke-ra osztva (negyedekre) hogy ready-to-send (+koord is mellé)
1.sor + 3. sor + 4. sor --> total. Védőnek és támadónak is összegezzük (4. sor = gyűjtögetés+úton van épp -> sztem ez ki/be kapcs kéne h legyen, külső erősítésnek mutassuk-e vagy itthoninak számoljuk)
3. sor: --> kint van. dbszám + %-osan lehet kiírni h mennyi van kint.
*/