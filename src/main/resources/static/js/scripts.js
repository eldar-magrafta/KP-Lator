function mid(text, start, length) {
    return text.substr(start - 1, length);
}

function hex2dec(hex) {
    return parseInt(hex, 16).toString();
}

function hex2bin(hexString) {
    let binary = "";
    for (let i = 0; i < hexString.length; i++) {
        let hex = hexString[i];
        let dec = parseInt(hex, 16);
        let bin = dec.toString(2).padStart(4, "0");
        binary += bin;
    }
    return binary;
}

function bin2dec(binary) {
    return parseInt(binary, 2);
}

function dec2hex(dec, padding = 2) {
    return parseInt(dec).toString(16).padStart(padding, "0").toUpperCase();
}

function formatDecimal(number) {
    let str = number.toFixed(6);
    str = str.replace(/\.?0+$/, "");
    return str;
}

function validateInput(value, min, max) {
    const num = parseInt(value);
    return !isNaN(num) && num >= min && num <= max;
}

function copyToClipboard(text, type) {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            const button = document.querySelector(`#${type} .copy-button`);
            button.textContent = "Copied!";
            setTimeout(() => {
                button.textContent = "Copy";
            }, 1500);
        })
        .catch((err) => {
            console.error("Failed to copy text: ", err);
            alert("Failed to copy to clipboard");
        });
}

function setNearestPastTime(prefix) {
    const now = new Date();

    if (prefix === "genMeter") {
        // Round down to nearest 15 minutes for meter section
        const minutes = now.getMinutes();
        const nearestQuarter = Math.floor(minutes / 15) * 15;

        // Set the date fields
        document.getElementById(`${prefix}Year`).value = now.getFullYear();
        document.getElementById(`${prefix}Month`).value = now.getMonth() + 1;
        document.getElementById(`${prefix}Day`).value = now.getDate();
        document.getElementById(`${prefix}Hour`).value = now.getHours();

        // For meter section, use select element with 15-minute intervals
        const minuteSelect = document.getElementById(`${prefix}Minute`);
        minuteSelect.value = nearestQuarter.toString().padStart(2, "0");
    } else {
        // For installation, box, and analog sections, use exact current time
        document.getElementById(`${prefix}Year`).value = now.getFullYear();
        document.getElementById(`${prefix}Month`).value = now.getMonth() + 1;
        document.getElementById(`${prefix}Day`).value = now.getDate();
        document.getElementById(`${prefix}Hour`).value = now.getHours();
        document.getElementById(`${prefix}Minute`).value = now.getMinutes();
    }
}

// Tab switching functionality
function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach((tab) => {
        tab.classList.remove("active");
    });
    document.querySelectorAll(".tab-button").forEach((button) => {
        button.classList.remove("active");
    });
    document.getElementById(tabId).classList.add("active");
    document
        .querySelector(`button[onclick="showTab('${tabId}')"]`)
        .classList.add("active");
}

// Meter Related Functions //
function getMeterType(typeChar) {
    const types = {
        0: `<span>Absolute value of the meter</span>`,
        1: `<span style="color: red; text-decoration: line-through">Received signal strength indication</span>`,
        3: `<span style="color: red; text-decoration: line-through">Previous Reading</span>`,
        4: `<span style="color: red; text-decoration: line-through">Analog</span>`,
        5: `<span style="color: red; text-decoration: line-through">Previous Analog Reading</span>`,
        6: `<span style="color: red; text-decoration: line-through">Serial Number of the Meter (Installation)</span>`,
        7: `<span style="color: red; text-decoration: line-through">Event</span>`,
        E: `<span style="color: red; text-decoration: line-through">On-Demand</span>`,
    };
    return (
        types[typeChar] ||
        `<span style="color: red; text-decoration: line-through">Unknown</span>`
    );
}

function renderMeterPreview(str) {
    const parts = [
        {text: str.slice(0, 3), color: "#000000", name: "Header (STX + DC)", start: 0, end: 2},
        {text: str.slice(3, 4), color: "#ff00ff", name: "Receiver Number", start: 3, end: 3},
        {text: str.slice(4, 5), color: "#22c55e", name: "Index", start: 4, end: 4},
        {text: str.slice(5, 6), color: "#f97316", name: "Type", start: 5, end: 5},
        {text: str.slice(6, 11), color: "#3b82f6", name: "Account (KP id)", start: 6, end: 10},
        {text: str.slice(11, 19), color: "#ef4444", name: "Current Reading", start: 11, end: 18},
        {text: str.slice(19, 49), color: "#a855f7", name: "Data", start: 19, end: 48},
        {text: str.slice(49, 50), color: "#000000", name: "Channel", start: 49, end: 49},
        {text: str.slice(50, 52), color: "#d8c724", name: "Signal Strength", start: 50, end: 51},
        {text: str.slice(52, 54), color: "#ff00ff", name: "Repeater #", start: 52, end: 53},
        {text: str.slice(54, 57), color: "#000000", name: "ETX + Checksum", start: 54, end: 56},
        {text: str.slice(57, 61), color: "#40ff00", name: "Year", start: 57, end: 60},
        {text: str.slice(61, 63), color: "#0ea5e9", name: "Month", start: 61, end: 62},
        {text: str.slice(63, 65), color: "#ca8a04", name: "Day", start: 63, end: 64},
        {text: str.slice(65, 67), color: "#15803d", name: "Hour", start: 65, end: 66},
        {text: str.slice(67, 69), color: "#ef4444", name: "Minute", start: 67, end: 68},
    ];

    let html = "";
    parts.forEach((part) => {
        if (part.text) {
            html += `<span class="hex-segment" style="color: ${part.color}" data-name="${part.name}" data-start="${part.start}" data-end="${part.end}">${part.text}</span>`;
        }
    });

    return html;
}

function parseMeterHexString(hexString) {
    try {
        document.getElementById("meterPreview").innerHTML =
            renderMeterPreview(hexString);

        document.getElementById("meterReceiverNumber").textContent = mid(
            hexString,
            4,
            1,
        );
        document.getElementById("meterIndex").textContent = mid(hexString, 5, 1);
        document.getElementById("meterType").innerHTML = getMeterType(
            mid(hexString, 6, 1),
        );
        document.getElementById("meterAccount").textContent = hex2dec(
            mid(hexString, 7, 5),
        );
        document.getElementById("currentReading").textContent = hex2dec(
            mid(hexString, 12, 8),
        );
        document.getElementById("data").textContent = hex2dec(
            mid(hexString, 20, 30),
        );
        document.getElementById("meterSignalStrength").textContent = hex2dec(
            mid(hexString, 51, 2),
        );
        document.getElementById("meterRepeater").textContent = hex2dec(
            mid(hexString, 53, 2),
        );

        document.getElementById("meterYear").textContent = hex2dec(
            mid(hexString, 58, 4),
        );
        document.getElementById("meterMonth").textContent = hex2dec(
            mid(hexString, 62, 2),
        );
        document.getElementById("meterDay").textContent = hex2dec(
            mid(hexString, 64, 2),
        );
        document.getElementById("meterHour").textContent = hex2dec(
            mid(hexString, 66, 2),
        );
        document.getElementById("meterMinute").textContent = hex2dec(
            mid(hexString, 68, 2),
        );
    } catch (error) {
        console.error("Error parsing meter hex string:", error);
    }
}

function generateMeterHexString() {
    try {
        const receiverNumber = document.getElementById(
            "genMeterReceiverNumber",
        ).value;
        const index = document.getElementById("genMeterIndex").value;
        const type = document.getElementById("genMeterType").value;
        const account = document.getElementById("genMeterAccount").value;
        const currentReading = document.getElementById("genCurrentReading").value;
        const data = document.getElementById("genData").value;
        const signalStrength = document.getElementById(
            "genMeterSignalStrength",
        ).value;
        const repeater = document.getElementById("genMeterRepeater").value;
        const year = document.getElementById("genMeterYear").value;
        const month = document.getElementById("genMeterMonth").value;
        const day = document.getElementById("genMeterDay").value;
        const hour = document.getElementById("genMeterHour").value;
        const minute = document.getElementById("genMeterMinute").value;

        if (
            !validateInput(year, 2000, 9999) ||
            !validateInput(month, 1, 12) ||
            !validateInput(day, 1, 31) ||
            !validateInput(hour, 0, 23)
        ) {
            alert("Error in timestamp values");
            return;
        }

        let hexString = "DC";
        hexString += dec2hex(receiverNumber, 1);
        hexString += dec2hex(index, 1);
        hexString += type;
        hexString += dec2hex(account, 5);
        hexString += dec2hex(currentReading, 8);
        hexString += dec2hex(data, 30).padStart(30, "0");
        hexString += "0";
        hexString += dec2hex(signalStrength, 2);
        hexString += dec2hex(repeater, 2);
        hexString += "40";
        hexString += dec2hex(year, 4);
        hexString += dec2hex(month, 2);
        hexString += dec2hex(day, 2);
        hexString += dec2hex(hour, 2);
        hexString += dec2hex(minute, 2);

        document.getElementById("generatedMeterHex").innerHTML =
            renderMeterPreview(hexString);
    } catch (error) {
        console.error("Error generating meter hex string:", error);
        alert("Error generating hex string. Please check your input values.");
    }
}

function copyMeterHexString() {
    const hexString = document
        .getElementById("generatedMeterHex")
        .textContent.trim();
    copyToClipboard(hexString, "meter");
}

function copyMeterToGenerator() {
    // Copy all parsed values to generator fields
    document.getElementById("genMeterReceiverNumber").value =
        document.getElementById("meterReceiverNumber").textContent;
    document.getElementById("genMeterIndex").value =
        document.getElementById("meterIndex").textContent;
    document.getElementById("genMeterAccount").value =
        document.getElementById("meterAccount").textContent;
    document.getElementById("genCurrentReading").value =
        document.getElementById("currentReading").textContent;
    document.getElementById("genData").value =
        document.getElementById("data").textContent;
    document.getElementById("genMeterSignalStrength").value =
        document.getElementById("meterSignalStrength").textContent;
    document.getElementById("genMeterRepeater").value =
        document.getElementById("meterRepeater").textContent;
    document.getElementById("genMeterYear").value =
        document.getElementById("meterYear").textContent;
    document.getElementById("genMeterMonth").value =
        document.getElementById("meterMonth").textContent;
    document.getElementById("genMeterDay").value =
        document.getElementById("meterDay").textContent;
    document.getElementById("genMeterHour").value =
        document.getElementById("meterHour").textContent;

    // For minute, find the closest 15-minute interval
    const parsedMinute = parseInt(
        document.getElementById("meterMinute").textContent,
    );
    const nearestQuarter = Math.round(parsedMinute / 15) * 15;
    const minuteValue =
        nearestQuarter === 60 ? "00" : nearestQuarter.toString().padStart(2, "0");
    document.getElementById("genMeterMinute").value = minuteValue;

    // Visual feedback
    const button = document.querySelector(".copy-to-gen-button-meter");
    button.textContent = "Copied!";
    setTimeout(() => {
        button.textContent = "Copy to Generator →";
    }, 1500);
}

// Installation Related Functions //

function getInstallationType(typeChar) {
    const types = {
        0: `<span style="color: red; text-decoration: line-through">Absolute value of the meter</span>`,
        1: `<span style="color: red; text-decoration: line-through">Received signal strength indication</span>`,
        3: `<span style="color: red; text-decoration: line-through">Previous Reading</span>`,
        4: `<span style="color: red; text-decoration: line-through">Analog</span>`,
        5: `<span style="color: red; text-decoration: line-through">Previous Analog Reading</span>`,
        6: `<span>Serial Number of the Meter (Installation)</span>`,
        7: `<span style="color: red; text-decoration: line-through">Event</span>`,
        E: `<span style="color: red; text-decoration: line-through">On-Demand</span>`,
    };
    return (
        types[typeChar] ||
        `<span style="color: red; text-decoration: line-through">Unknown</span>`
    );
}

function getMedium(mediumHex) {
    const mediumValue = parseInt(mediumHex, 16);
    switch (mediumValue) {
        case 7:
            return "Water";
        case 9:
            return "Security";
        case 15:
            return "Analog";
        default:
            return "Unknown";
    }
}

function getMediumHex(mediumText) {
    switch (mediumText) {
        case "Water":
            return "07";
        case "Security":
            return "09";
        case "Analog":
            return "0F";
        default:
            return "07";
    }
}

function getManufacturer(manufacturerId) {
    const manufacturers = {
        1592: "Elster Meters",
        "4CAE": "Sensus Meters",
        5345: "Octave Meters",
        "2A18": "Modbus Siemens MAG6000",
        "2A1B": "Modbus Siemens MAG8000",
        "1A1F": "Modbus ABB WaterMaster",
        "1A1D": "Modbus ABB AquaMaster",
        "2B0E": "Modbus KHRONE IFC300",
        "7A7B": "Pulse Meter",
    };
    return manufacturers[manufacturerId] || "Unknown";
}

function getManufacturerHex(manufacturerText) {
    const manufacturers = {
        "Elster Meters": "1592",
        "Sensus Meters": "4CAE",
        "Octave Meters": "5345",
        "Modbus Siemens MAG6000": "2A18",
        "Modbus Siemens MAG8000": "2A1B",
        "Modbus ABB WaterMaster": "1A1F",
        "Modbus ABB AquaMaster": "1A1D",
        "Modbus KHRONE IFC300": "2B0E",
        "Pulse Meter": "7A7B",
    };
    return manufacturers[manufacturerText] || "4CAE";
}

function calculateFactorHex(factorValue) {
    switch (factorValue) {
        case "0.000001":
            return "00";
        case "0.00001":
            return "01";
        case "0.0001":
            return "02";
        case "0.001":
            return "03";
        case "0.01":
            return "04";
        case "0.1":
            return "05";
        case "1":
            return "06";
        case "10":
            return "07";
    }
}

function getFactorValue(factorDecimal) {
    // Map decimal factor values to select option values
    const factorMap = {
        0.000001: "0.000001",
        0.00001: "0.00001",
        0.0001: "0.0001",
        0.001: "0.001",
        0.01: "0.01",
        0.1: "0.1",
        1: "1",
        10: "10",
    };
    return factorMap[factorDecimal] || "0.01";
}

// render colored preview
function renderInstallationPreview(str) {
    const parts = [
        {text: str.slice(0, 3), color: "#000000", name: "Header (STX + DC)", start: 0, end: 2},
        {text: str.slice(3, 4), color: "#ff00ff", name: "Receiver Number", start: 3, end: 3},
        {text: str.slice(4, 5), color: "#22c55e", name: "Index", start: 4, end: 4},
        {text: str.slice(5, 6), color: "#f97316", name: "Type", start: 5, end: 5},
        {text: str.slice(6, 11), color: "#3b82f6", name: "Account (KP id)", start: 6, end: 10},
        {text: str.slice(11, 33), color: "#000000", name: "Reserved", start: 11, end: 32},
        {text: str.slice(33, 35), color: "#ef4444", name: "Factor", start: 33, end: 34},
        {text: str.slice(35, 37), color: "#22c55e", name: "Medium", start: 35, end: 36},
        {text: str.slice(37, 41), color: "#cc7400", name: "Manufacturer", start: 37, end: 40},
        {text: str.slice(41, 49), color: "#a855f7", name: "Meter S/N", start: 41, end: 48},
        {text: str.slice(49, 50), color: "#000000", name: "Channel", start: 49, end: 49},
        {text: str.slice(50, 52), color: "#d8c724", name: "Signal Strength", start: 50, end: 51},
        {text: str.slice(52, 54), color: "#ff00ff", name: "Repeater #", start: 52, end: 53},
        {text: str.slice(54, 57), color: "#000000", name: "ETX + Checksum", start: 54, end: 56},
        {text: str.slice(57, 61), color: "#40ff00", name: "Year", start: 57, end: 60},
        {text: str.slice(61, 63), color: "#0ea5e9", name: "Month", start: 61, end: 62},
        {text: str.slice(63, 65), color: "#ca8a04", name: "Day", start: 63, end: 64},
        {text: str.slice(65, 67), color: "#15803d", name: "Hour", start: 65, end: 66},
        {text: str.slice(67, 69), color: "#ef4444", name: "Minute", start: 67, end: 68},
    ];

    let html = "";
    parts.forEach((part) => {
        if (part.text) {
            html += `<span class="hex-segment" style="color: ${part.color}" data-name="${part.name}" data-start="${part.start}" data-end="${part.end}">${part.text}</span>`;
        }
    });

    return html;
}

// Parse functions
function parseInstallationHexString(hexString) {
    try {
        document.getElementById("preview").innerHTML =
            renderInstallationPreview(hexString);

        document.getElementById("receiverNumber").textContent = mid(
            hexString,
            4,
            1,
        );
        document.getElementById("index").textContent = mid(hexString, 5, 1);
        document.getElementById("type").innerHTML = getInstallationType(
            mid(hexString, 6, 1),
        );
        document.getElementById("account").textContent = hex2dec(
            mid(hexString, 7, 5),
        );

        document.getElementById("factor").textContent = mid(hexString, 34, 2);
        let x = mid(hexString, 34, 2);
        x = hex2bin(x);
        x = bin2dec(x.slice(-3)) - 6;
        let factor = 10 ** x;
        document.getElementById("factor").textContent = formatDecimal(factor);

        document.getElementById("medium").textContent = getMedium(
            mid(hexString, 36, 2),
        );
        document.getElementById("manufacturer").textContent = getManufacturer(
            mid(hexString, 38, 4),
        );
        document.getElementById("sn").textContent = mid(hexString, 42, 8);
        document.getElementById("signalStrength").textContent = hex2dec(
            mid(hexString, 51, 2),
        );
        document.getElementById("repeater").textContent = hex2dec(
            mid(hexString, 53, 2),
        );

        document.getElementById("year").textContent = hex2dec(
            mid(hexString, 58, 4),
        );
        document.getElementById("month").textContent = hex2dec(
            mid(hexString, 62, 2),
        );
        document.getElementById("day").textContent = hex2dec(mid(hexString, 64, 2));
        document.getElementById("hour").textContent = hex2dec(
            mid(hexString, 66, 2),
        );
        document.getElementById("minute").textContent = hex2dec(
            mid(hexString, 68, 2),
        );
    } catch (error) {
        console.error("Error parsing installation hex string:", error);
    }
}

// Generate functions
function generateInstallationHexString() {
    try {
        const receiverNumber = document.getElementById("genReceiverNumber").value;
        const index = document.getElementById("genIndex").value;
        const type = document.getElementById("genType").value;
        const account = document.getElementById("genAccount").value;
        const factor = document.getElementById("genFactor").value;
        const medium = document.getElementById("genMedium").value;
        const manufacturer = document.getElementById("genManufacturer").value;
        const serial = document.getElementById("genSerialNumber").value;
        const signalStrength = document.getElementById("genSignalStrength").value;
        const repeater = document.getElementById("genRepeater").value;
        const year = document.getElementById("genYear").value;
        const month = document.getElementById("genMonth").value;
        const day = document.getElementById("genDay").value;
        const hour = document.getElementById("genHour").value;
        const minute = document.getElementById("genMinute").value;

        if (
            !validateInput(year, 2000, 9999) ||
            !validateInput(month, 1, 12) ||
            !validateInput(day, 1, 31) ||
            !validateInput(hour, 0, 23) ||
            !validateInput(minute, 0, 59)
        ) {
            alert("Error in timestamp values");
            return;
        }

        let hexString = "DC";
        hexString += dec2hex(receiverNumber, 1);
        hexString += dec2hex(index, 1);
        hexString += type;
        hexString += dec2hex(account, 5);
        hexString += "000000000000000000000C";
        hexString += calculateFactorHex(factor);
        hexString += medium;
        hexString += manufacturer;
        hexString += serial;
        hexString += "0";
        hexString += dec2hex(signalStrength, 2);
        hexString += dec2hex(repeater, 2);
        hexString += "40";
        hexString += dec2hex(year, 4);
        hexString += dec2hex(month, 2);
        hexString += dec2hex(day, 2);
        hexString += dec2hex(hour, 2);
        hexString += dec2hex(minute, 2);

        document.getElementById("generatedInstallationHex").innerHTML =
            renderInstallationPreview(hexString);
    } catch (error) {
        console.error("Error generating installation hex string:", error);
        alert("Error generating hex string. Please check your input values.");
    }
}

function copyInstallationHexString() {
    const hexString = document
        .getElementById("generatedInstallationHex")
        .textContent.trim();
    copyToClipboard(hexString, "installation");
}

function copyInstallationToGenerator() {
    // Copy all parsed values to generator fields
    document.getElementById("genReceiverNumber").value =
        document.getElementById("receiverNumber").textContent;
    document.getElementById("genIndex").value =
        document.getElementById("index").textContent;
    document.getElementById("genAccount").value =
        document.getElementById("account").textContent;

    // Factor - match the parsed value to the select option
    const factorValue = document.getElementById("factor").textContent;
    document.getElementById("genFactor").value = getFactorValue(factorValue);

    // Medium - convert text back to hex code for select
    const mediumText = document.getElementById("medium").textContent;
    document.getElementById("genMedium").value = getMediumHex(mediumText);

    // Manufacturer - convert text back to hex code for select
    const manufacturerText = document.getElementById("manufacturer").textContent;
    document.getElementById("genManufacturer").value =
        getManufacturerHex(manufacturerText);

    document.getElementById("genSerialNumber").value =
        document.getElementById("sn").textContent;
    document.getElementById("genSignalStrength").value =
        document.getElementById("signalStrength").textContent;
    document.getElementById("genRepeater").value =
        document.getElementById("repeater").textContent;
    document.getElementById("genYear").value =
        document.getElementById("year").textContent;
    document.getElementById("genMonth").value =
        document.getElementById("month").textContent;
    document.getElementById("genDay").value =
        document.getElementById("day").textContent;
    document.getElementById("genHour").value =
        document.getElementById("hour").textContent;
    document.getElementById("genMinute").value =
        document.getElementById("minute").textContent;

    // Visual feedback
    const button = document.querySelector(".copy-to-gen-button-installation");
    button.textContent = "Copied!";
    setTimeout(() => {
        button.textContent = "Copy to Generator →";
    }, 1500);
}

// Analog Related Functions //

// Add new analog type function
function getAnalogType(typeChar) {
    const types = {
        4: `<span>Analog</span>`,
        5: `<span>Previous Analog Reading</span>`,
    };
    return (
        types[typeChar] ||
        `<span style="color: red; text-decoration: line-through">Unknown</span>`
    );
}

// Add new render function
function renderAnalogPreview(str) {
    const parts = [
        {text: str.slice(0, 3), color: "#000000", name: "Header (STX + DC)", start: 0, end: 2},
        {text: str.slice(3, 4), color: "#ff00ff", name: "Receiver Number", start: 3, end: 3},
        {text: str.slice(4, 5), color: "#22c55e", name: "Index", start: 4, end: 4},
        {text: str.slice(5, 6), color: "#f97316", name: "Type", start: 5, end: 5},
        {text: str.slice(6, 11), color: "#3b82f6", name: "Account (KP id)", start: 6, end: 10},
        {text: str.slice(11, 14), color: "#ef4444", name: "Analog Sample", start: 11, end: 13},
        {text: str.slice(14, 49), color: "#000000", name: "Reserved", start: 14, end: 48},
        {text: str.slice(49, 50), color: "#000000", name: "Channel", start: 49, end: 49},
        {text: str.slice(50, 52), color: "#d8c724", name: "Signal Strength", start: 50, end: 51},
        {text: str.slice(52, 54), color: "#ff00ff", name: "Repeater #", start: 52, end: 53},
        {text: str.slice(54, 57), color: "#000000", name: "ETX + Checksum", start: 54, end: 56},
        {text: str.slice(57, 61), color: "#40ff00", name: "Year", start: 57, end: 60},
        {text: str.slice(61, 63), color: "#0ea5e9", name: "Month", start: 61, end: 62},
        {text: str.slice(63, 65), color: "#ca8a04", name: "Day", start: 63, end: 64},
        {text: str.slice(65, 67), color: "#15803d", name: "Hour", start: 65, end: 66},
        {text: str.slice(67, 69), color: "#ef4444", name: "Minute", start: 67, end: 68},
    ];

    let html = "";
    parts.forEach((part) => {
        if (part.text) {
            html += `<span class="hex-segment" style="color: ${part.color}" data-name="${part.name}" data-start="${part.start}" data-end="${part.end}">${part.text}</span>`;
        }
    });
    return html;
}

// Add parse function
function parseAnalogHexString(hexString) {
    try {
        document.getElementById("analogPreview").innerHTML =
            renderAnalogPreview(hexString);

        // Parse basic values
        document.getElementById("analogReceiverNumber").textContent = mid(
            hexString,
            4,
            1,
        );
        document.getElementById("analogIndex").textContent = mid(hexString, 5, 1);
        document.getElementById("analogIndex").textContent = mid(hexString, 5, 1);
        document.getElementById("analogType").innerHTML = getAnalogType(
            mid(hexString, 6, 1),
        );
        document.getElementById("analogAccount").textContent = hex2dec(
            mid(hexString, 7, 5),
        );
        document.getElementById("analogSample").textContent = hex2dec(
            mid(hexString, 12, 3),
        );
        document.getElementById("analogSignalStrength").textContent = hex2dec(
            mid(hexString, 51, 2),
        );
        document.getElementById("analogRepeater").textContent = hex2dec(
            mid(hexString, 53, 2),
        );

        // Parse timestamp
        document.getElementById("analogYear").textContent = hex2dec(
            mid(hexString, 58, 4),
        );
        document.getElementById("analogMonth").textContent = hex2dec(
            mid(hexString, 62, 2),
        );
        document.getElementById("analogDay").textContent = hex2dec(
            mid(hexString, 64, 2),
        );
        document.getElementById("analogHour").textContent = hex2dec(
            mid(hexString, 66, 2),
        );
        document.getElementById("analogMinute").textContent = hex2dec(
            mid(hexString, 68, 2),
        );

        // Calculate pressure after the Analog Sample value is updated
        calculateResults();
    } catch (error) {
        console.error("Error parsing analog hex string:", error);
    }
}

// Add generate function
function generateAnalogHexString() {
    try {
        // Get all input values from the form
        const receiverNumber = document.getElementById(
            "genAnalogReceiverNumber",
        ).value;
        const index = document.getElementById("genAnalogIndex").value;
        const type = document.getElementById("genAnalogType").value;
        const account = document.getElementById("genAnalogAccount").value;
        const analogSample = document.getElementById("genAnalogSample").value;
        const signalStrength = document.getElementById(
            "genAnalogSignalStrength",
        ).value;
        const repeater = document.getElementById("genAnalogRepeater").value;
        const year = document.getElementById("genAnalogYear").value;
        const month = document.getElementById("genAnalogMonth").value;
        const day = document.getElementById("genAnalogDay").value;
        const hour = document.getElementById("genAnalogHour").value;
        const minute = document.getElementById("genAnalogMinute").value;

        // Validate timestamp values
        if (
            !validateInput(year, 2000, 9999) ||
            !validateInput(month, 1, 12) ||
            !validateInput(day, 1, 31) ||
            !validateInput(hour, 0, 23) ||
            !validateInput(minute, 0, 59)
        ) {
            alert("Error in timestamp values");
            return;
        }

        // Generate the hex string
        let hexString = "DC";
        hexString += dec2hex(receiverNumber, 1);
        hexString += dec2hex(index, 1);
        hexString += type;
        hexString += dec2hex(account, 5);
        hexString += dec2hex(analogSample, 3);
        hexString += "0".repeat(35); // Reserved space
        hexString += "0"; // Channel
        hexString += dec2hex(signalStrength, 2);
        hexString += dec2hex(repeater, 2);
        hexString += "40"; // ETX + Checksum
        hexString += dec2hex(year, 4);
        hexString += dec2hex(month, 2);
        hexString += dec2hex(day, 2);
        hexString += dec2hex(hour, 2);
        hexString += dec2hex(minute, 2);

        // Display the generated hex string with color formatting
        document.getElementById("generatedAnalogHex").innerHTML =
            renderAnalogPreview(hexString);

        // Calculate and display pressure and temperature results
        calculateGeneratorResults();
    } catch (error) {
        console.error("Error generating analog hex string:", error);
        alert("Error generating hex string. Please check your input values.");
    }
}

function calculateResults() {
    try {
        const analogSample =
            parseInt(document.getElementById("analogSample").textContent) || 0;
        const pressureMaxScale =
            document.getElementById("pressureMaxScale").value === ""
                ? NaN
                : parseFloat(document.getElementById("pressureMaxScale").value);
        const tempMinScale =
            document.getElementById("tempMinScale").value === ""
                ? NaN
                : parseFloat(document.getElementById("tempMinScale").value);
        const tempMaxScale =
            document.getElementById("tempMaxScale").value === ""
                ? NaN
                : parseFloat(document.getElementById("tempMaxScale").value);

        // Calculate pressure
        const reading0 = 186;
        const pressure =
            ((analogSample - reading0) * (pressureMaxScale / 16)) / (reading0 / 4);

        // Calculate temperature
        const reading1 = 184;
        let temperature;
        if (isNaN(tempMinScale) || isNaN(tempMaxScale)) {
            temperature = NaN;
        } else if (tempMinScale < 0) {
            temperature =
                ((analogSample - reading1) *
                    (Math.abs(tempMinScale) + Math.abs(tempMaxScale))) /
                16 /
                (reading1 / 4) -
                20;
        } else {
            temperature =
                ((analogSample - reading1) *
                    (Math.abs(tempMaxScale) + Math.abs(tempMinScale))) /
                16 /
                (reading1 / 4) -
                20;
        }

        // Display results with 10 decimal places
        document.getElementById("pressureResult").textContent = isNaN(pressure)
            ? "NaN"
            : pressure.toFixed(10);
        document.getElementById("tempResult").textContent = isNaN(temperature)
            ? "NaN"
            : temperature.toFixed(10);
    } catch (error) {
        console.error("Error calculating values:", error);
        document.getElementById("pressureResult").textContent = "Error";
        document.getElementById("tempResult").textContent = "Error";
    }
}

function calculateGeneratorResults() {
    try {
        const analogSample =
            parseInt(document.getElementById("genAnalogSample").value) || 0;
        const pressureMaxScale =
            document.getElementById("genPressureMaxScale").value === ""
                ? NaN
                : parseFloat(document.getElementById("genPressureMaxScale").value);
        const tempMinScale =
            document.getElementById("genTempMinScale").value === ""
                ? NaN
                : parseFloat(document.getElementById("genTempMinScale").value);
        const tempMaxScale =
            document.getElementById("genTempMaxScale").value === ""
                ? NaN
                : parseFloat(document.getElementById("genTempMaxScale").value);

        // Calculate pressure
        const reading0 = 186;
        const pressure =
            ((analogSample - reading0) * (pressureMaxScale / 16)) / (reading0 / 4);

        // Calculate temperature
        const reading1 = 184;
        let temperature;
        if (isNaN(tempMinScale) || isNaN(tempMaxScale)) {
            temperature = NaN;
        } else if (tempMinScale < 0) {
            temperature =
                ((analogSample - reading1) *
                    (Math.abs(tempMinScale) + Math.abs(tempMaxScale))) /
                16 /
                (reading1 / 4) -
                20;
        } else {
            temperature =
                ((analogSample - reading1) *
                    (Math.abs(tempMaxScale) + Math.abs(tempMinScale))) /
                16 /
                (reading1 / 4) -
                20;
        }

        // Display results with 10 decimal places
        document.getElementById("genPressureResult").textContent = isNaN(pressure)
            ? "NaN"
            : pressure.toFixed(10);
        document.getElementById("genTempResult").textContent = isNaN(temperature)
            ? "NaN"
            : temperature.toFixed(10);
    } catch (error) {
        console.error("Error calculating generator values:", error);
        document.getElementById("genPressureResult").textContent = "Error";
        document.getElementById("genTempResult").textContent = "Error";
    }
}

// Add copy function
function copyAnalogHexString() {
    const hexString = document
        .getElementById("generatedAnalogHex")
        .textContent.trim();
    copyToClipboard(hexString, "analog");
}

function copyAnalogToGenerator() {
    // Copy all parsed values to generator fields
    document.getElementById("genAnalogReceiverNumber").value =
        document.getElementById("analogReceiverNumber").textContent;
    document.getElementById("genAnalogIndex").value =
        document.getElementById("analogIndex").textContent;

    // Type - get the text content and match to select value
    const typeText = document.getElementById("analogType").textContent;
    if (typeText === "Analog") {
        document.getElementById("genAnalogType").value = "4";
    } else if (typeText === "Previous Analog Reading") {
        document.getElementById("genAnalogType").value = "5";
    }

    document.getElementById("genAnalogAccount").value =
        document.getElementById("analogAccount").textContent;
    document.getElementById("genAnalogSample").value =
        document.getElementById("analogSample").textContent;
    document.getElementById("genAnalogSignalStrength").value =
        document.getElementById("analogSignalStrength").textContent;
    document.getElementById("genAnalogRepeater").value =
        document.getElementById("analogRepeater").textContent;
    document.getElementById("genAnalogYear").value =
        document.getElementById("analogYear").textContent;
    document.getElementById("genAnalogMonth").value =
        document.getElementById("analogMonth").textContent;
    document.getElementById("genAnalogDay").value =
        document.getElementById("analogDay").textContent;
    document.getElementById("genAnalogHour").value =
        document.getElementById("analogHour").textContent;
    document.getElementById("genAnalogMinute").value =
        document.getElementById("analogMinute").textContent;

    // Also copy the scale values for calculations
    document.getElementById("genPressureMaxScale").value =
        document.getElementById("pressureMaxScale").value;
    document.getElementById("genTempMinScale").value =
        document.getElementById("tempMinScale").value;
    document.getElementById("genTempMaxScale").value =
        document.getElementById("tempMaxScale").value;

    // Recalculate generator results
    calculateGeneratorResults();

    // Visual feedback
    const button = document.querySelector(".copy-to-gen-button-analog");
    button.textContent = "Copied!";
    setTimeout(() => {
        button.textContent = "Copy to Generator →";
    }, 1500);
}

// BOX Related Functions //

function getEventType(first_digits, second_digits) {
    const eventValue = first_digits;
    const additionalValue = parseInt(second_digits, 16);

    if (eventValue === "11") return "Door Opened";
    if (eventValue === "21") return "Door Closed";
    if (eventValue === "12") return "Magnet";
    if (eventValue === "00" && additionalValue === 0) return "Test Event";
    if (eventValue === "00" && additionalValue === 9) return "Install";
    return "Unknown";
}

function getEventTypeValue(eventText) {
    switch (eventText) {
        case "Door Opened":
            return "11";
        case "Door Closed":
            return "21";
        case "Magnet":
            return "12";
        case "Test Event":
            return "00-testEvent";
        case "Install":
            return "00-install";
        default:
            return "21";
    }
}

function renderBoxPreview(str) {
    const parts = [
        {text: str.slice(0, 4), color: "#000000", name: "Header", start: 0, end: 3},
        {text: str.slice(4, 5), color: "#22c55e", name: "Index", start: 4, end: 4},
        {text: str.slice(5, 6), color: "#000000", name: "Reserved", start: 5, end: 5},
        {text: str.slice(6, 11), color: "#3b82f6", name: "Account (KP id)", start: 6, end: 10},
        {text: str.slice(11, 35), color: "#000000", name: "Reserved", start: 11, end: 34},
        {text: str.slice(35, 37), color: "#f97316", name: "Event Type (secondary)", start: 35, end: 36},
        {text: str.slice(37, 47), color: "#000000", name: "Reserved", start: 37, end: 46},
        {text: str.slice(47, 49), color: "#f97316", name: "Event Type (primary)", start: 47, end: 48},
        {text: str.slice(49, 50), color: "#000000", name: "Reserved", start: 49, end: 49},
        {text: str.slice(50, 52), color: "#d8c724", name: "Signal Strength", start: 50, end: 51},
        {text: str.slice(52, 54), color: "#ff00ff", name: "Repeater #", start: 52, end: 53},
        {text: str.slice(54, 57), color: "#000000", name: "ETX + Checksum", start: 54, end: 56},
        {text: str.slice(57, 61), color: "#40ff00", name: "Year", start: 57, end: 60},
        {text: str.slice(61, 63), color: "#0ea5e9", name: "Month", start: 61, end: 62},
        {text: str.slice(63, 65), color: "#ca8a04", name: "Day", start: 63, end: 64},
        {text: str.slice(65, 67), color: "#15803d", name: "Hour", start: 65, end: 66},
        {text: str.slice(67, 69), color: "#ef4444", name: "Minute", start: 67, end: 68},
    ];

    let html = "";
    parts.forEach((part) => {
        if (part.text) {
            html += `<span class="hex-segment" style="color: ${part.color}" data-name="${part.name}" data-start="${part.start}" data-end="${part.end}">${part.text}</span>`;
        }
    });

    return html;
}

function parseBoxHexString(hexString) {
    try {
        document.getElementById("boxPreview").innerHTML =
            renderBoxPreview(hexString);

        document.getElementById("boxAccount").textContent = hex2dec(
            mid(hexString, 7, 5),
        );
        document.getElementById("boxIndex").textContent = mid(hexString, 5, 1);
        document.getElementById("boxSignalStrength").textContent = hex2dec(
            mid(hexString, 51, 2),
        );
        document.getElementById("boxRepeater").textContent = hex2dec(
            mid(hexString, 53, 2),
        );

        const eventType = getEventType(
            mid(hexString, 48, 2),
            mid(hexString, 36, 2),
        );
        document.getElementById("boxEventType").textContent = eventType;

        document.getElementById("boxYear").textContent = hex2dec(
            mid(hexString, 58, 4),
        );
        document.getElementById("boxMonth").textContent = hex2dec(
            mid(hexString, 62, 2),
        );
        document.getElementById("boxDay").textContent = hex2dec(
            mid(hexString, 64, 2),
        );
        document.getElementById("boxHour").textContent = hex2dec(
            mid(hexString, 66, 2),
        );
        document.getElementById("boxMinute").textContent = hex2dec(
            mid(hexString, 68, 2),
        );
    } catch (error) {
        console.error("Error parsing box hex string:", error);
    }
}

function generateBoxHexString() {
    try {
        const account = document.getElementById("genBoxAccount").value;
        const index = document.getElementById("genBoxIndex").value;
        const signalStrength = document.getElementById(
            "genBoxSignalStrength",
        ).value;
        const repeater = document.getElementById("genBoxRepeater").value;

        const eventType = document.getElementById("genBoxEventType").value;

        const year = document.getElementById("genBoxYear").value;
        const month = document.getElementById("genBoxMonth").value;
        const day = document.getElementById("genBoxDay").value;
        const hour = document.getElementById("genBoxHour").value;
        const minute = document.getElementById("genBoxMinute").value;

        if (
            !validateInput(year, 2000, 9999) ||
            !validateInput(month, 1, 12) ||
            !validateInput(day, 1, 31) ||
            !validateInput(hour, 0, 23)
        ) {
            alert("Error in timestamp values");
            return;
        }

        let hexString = "DC1"; // Header
        hexString += dec2hex(index, 1);
        hexString += "7"; //dummy type
        hexString += dec2hex(account, 5);
        hexString += "0".repeat(24); // Reserved space

        // Handle medium and event type
        if (eventType === "00-install") {
            hexString += "09"; // Medium for Install
            hexString += "0".repeat(10);
            hexString += "00"; // Event type for Install
        } else if (eventType === "00-testEvent") {
            // Changed 'elif' to 'else if'
            hexString += "0".repeat(14);
        } else {
            hexString += "00"; // Medium for other events
            hexString += "0".repeat(10);
            hexString += eventType; // Event type
        }

        hexString += "0";
        hexString += dec2hex(signalStrength, 2);
        hexString += dec2hex(repeater, 2);
        hexString += "34"; // ETX + Checksum
        hexString += dec2hex(year, 4);
        hexString += dec2hex(month, 2);
        hexString += dec2hex(day, 2);
        hexString += dec2hex(hour, 2);
        hexString += dec2hex(minute, 2);

        document.getElementById("generatedBoxHex").innerHTML =
            renderBoxPreview(hexString);
    } catch (error) {
        console.error("Error generating box hex string:", error);
        alert("Error generating hex string. Please check your input values.");
    }
}

function copyBoxHexString() {
    const hexString = document
        .getElementById("generatedBoxHex")
        .textContent.trim();
    copyToClipboard(hexString, "box");
}

function copyBoxToGenerator() {
    // Copy all parsed values to generator fields
    document.getElementById("genBoxAccount").value =
        document.getElementById("boxAccount").textContent;
    document.getElementById("genBoxIndex").value =
        document.getElementById("boxIndex").textContent;
    document.getElementById("genBoxSignalStrength").value =
        document.getElementById("boxSignalStrength").textContent;
    document.getElementById("genBoxRepeater").value =
        document.getElementById("boxRepeater").textContent;

    // Event type - convert text to select value
    const eventText = document.getElementById("boxEventType").textContent;
    document.getElementById("genBoxEventType").value =
        getEventTypeValue(eventText);

    document.getElementById("genBoxYear").value =
        document.getElementById("boxYear").textContent;
    document.getElementById("genBoxMonth").value =
        document.getElementById("boxMonth").textContent;
    document.getElementById("genBoxDay").value =
        document.getElementById("boxDay").textContent;
    document.getElementById("genBoxHour").value =
        document.getElementById("boxHour").textContent;
    document.getElementById("genBoxMinute").value =
        document.getElementById("boxMinute").textContent;

    // Visual feedback
    const button = document.querySelector(".copy-to-gen-button-box");
    button.textContent = "Copied!";
    setTimeout(() => {
        button.textContent = "Copy to Generator →";
    }, 1500);
}

function handleColorModeChange(event) {
    const body = document.body;
    if (event.target.value === "bw") {
        body.classList.add("no-color");
    } else {
        body.classList.remove("no-color");
    }
}

// On-Demand Related Functions
function getRequestType(reqChar, typeChar) {
    // First determine if it's a request or response
    const isRequest = reqChar === "0";
    if (isRequest) {
        return "Request";
    } else if (reqChar === "1") {
        return "Response was received by Automation Software";
    }
    return "Unknown";
}

function getOnDemandType(typeChar) {
    const types = {
        0: "Request for On-Demand",
        1: "Response to On-Demand that On-Demand message was received by Automation Software",
        2: "Request for Previous reading",
        6: "Transmit every 4 hours",
        7: "Transmit every 1 hour",
        9: "Diameter download",
    };
    return types[typeChar] || "Unknown";
}

function getOnDemandTypeValue(typeText) {
    const types = {
        "Request for On-Demand": "0",
        "Response to On-Demand that On-Demand message was received by Automation Software":
            "1",
        "Request for Previous reading": "2",
        "Transmit every 4 hours": "6",
        "Transmit every 1 hour": "7",
        "Diameter download": "9",
    };
    return types[typeText] || "0";
}

function renderOnDemandPreview(str) {
    const parts = [
        {text: str.slice(0, 1), color: "#000000", name: "Header", start: 0, end: 0},
        {text: str.slice(1, 2), color: "#22c55e", name: "Index", start: 1, end: 1},
        {text: str.slice(2, 7), color: "#3b82f6", name: "Account (KP id)", start: 2, end: 6},
        {text: str.slice(7, 9), color: "#ff00ff", name: "Repeater #", start: 7, end: 8},
        {text: str.slice(9, 10), color: "#f97316", name: "Request/Response", start: 9, end: 9},
        {text: str.slice(10, 11), color: "#22c55e", name: "On-Demand Type", start: 10, end: 10},
        {text: str.slice(11), color: "#000000", name: "Footer", start: 11, end: str.length - 1},
    ];

    let html = "";
    parts.forEach((part) => {
        if (part.text) {
            html += `<span class="hex-segment" style="color: ${part.color}" data-name="${part.name}" data-start="${part.start}" data-end="${part.end}">${part.text}</span>`;
        }
    });
    return html;
}

function parseOnDemandHexString(hexString) {
    try {
        document.getElementById("onDemandPreview").innerHTML =
            renderOnDemandPreview(hexString);

        // Parse Index (character before Account)
        document.getElementById("onDemandIndex").textContent = mid(hexString, 2, 1);

        // Parse Account (KP id)
        document.getElementById("onDemandAccount").textContent = hex2dec(
            mid(hexString, 3, 5),
        );

        // Rest of the parsing...
        document.getElementById("onDemandRepeater").textContent = hex2dec(
            mid(hexString, 8, 2),
        );
        const reqStatus = getRequestType(mid(hexString, 10, 1));
        document.getElementById("onDemandRequestType").textContent = reqStatus;
        const onDemandType = getOnDemandType(mid(hexString, 11, 1));
        document.getElementById("onDemandOnDemandType").textContent = onDemandType;
    } catch (error) {
        console.error("Error parsing on-demand hex string:", error);
    }
}

function generateOnDemandHexString() {
    try {
        // Get input values
        const index = document.getElementById("genOnDemandIndex").value;
        const account = document.getElementById("genOnDemandAccount").value;
        const repeater = document.getElementById("genOnDemandRepeater").value;
        const requestType = document.getElementById("genOnDemandRequestType").value;
        const onDemandType = document.getElementById(
            "genOnDemandOnDemandType",
        ).value;

        // Start with "2" header for On-Demand
        let hexString = "2";

        // Add Index - 1 character
        hexString += dec2hex(index, 1);

        // Add Account (KP id) - 5 characters
        hexString += dec2hex(account, 5);

        // Add Repeater (RMR) - 2 characters
        hexString += dec2hex(repeater, 2);

        // Add request/response indicator (0 for request, 1 for response)
        hexString += requestType;

        // Add On-Demand type from select value
        hexString += onDemandType;

        // Add the remaining static values "30A0D"
        hexString += "30A0D";

        // Display the generated hex string with color formatting
        document.getElementById("generatedOnDemandHex").innerHTML =
            renderOnDemandPreview(hexString);
    } catch (error) {
        console.error("Error generating on-demand hex string:", error);
        alert("Error generating hex string. Please check your input values.");
    }
}

function copyOnDemandHexString() {
    const hexString = document
        .getElementById("generatedOnDemandHex")
        .textContent.trim();
    copyToClipboard(hexString, "onDemand");
}

function copyOnDemandToGenerator() {
    // Copy all parsed values to generator fields
    document.getElementById("genOnDemandIndex").value =
        document.getElementById("onDemandIndex").textContent;
    document.getElementById("genOnDemandAccount").value =
        document.getElementById("onDemandAccount").textContent;
    document.getElementById("genOnDemandRepeater").value =
        document.getElementById("onDemandRepeater").textContent;

    // Request/Response type
    const reqText = document.getElementById("onDemandRequestType").textContent;
    if (reqText === "Request") {
        document.getElementById("genOnDemandRequestType").value = "0";
    } else {
        document.getElementById("genOnDemandRequestType").value = "1";
    }

    // On-Demand type
    const onDemandText = document.getElementById(
        "onDemandOnDemandType",
    ).textContent;
    document.getElementById("genOnDemandOnDemandType").value =
        getOnDemandTypeValue(onDemandText);

    // Visual feedback
    const button = document.querySelector(".copy-to-gen-button-ondemand");
    button.textContent = "Copied!";
    setTimeout(() => {
        button.textContent = "Copy to Generator →";
    }, 1500);
}

document.addEventListener("DOMContentLoaded", function () {
    // =============== INITIAL PARSING ===============
    parseMeterHexString(document.getElementById("meterHexInput").value);
    parseInstallationHexString(document.getElementById("hexInput").value);
    parseAnalogHexString(document.getElementById("analogHexInput").value);
    parseBoxHexString(document.getElementById("boxHexInput").value);
    parseOnDemandHexString(document.getElementById("onDemandHexInput").value);

    // =============== HEX INPUT EVENT LISTENERS ===============
    document.getElementById("meterHexInput").addEventListener("input", function (e) {
        parseMeterHexString(e.target.value);
    });

    document.getElementById("hexInput").addEventListener("input", function (e) {
        parseInstallationHexString(e.target.value);
    });

    document.getElementById("analogHexInput").addEventListener("input", function (e) {
        parseAnalogHexString(e.target.value);
    });

    document.getElementById("boxHexInput").addEventListener("input", function (e) {
        parseBoxHexString(e.target.value);
    });

    document.getElementById("onDemandHexInput").addEventListener("input", function (e) {
        parseOnDemandHexString(e.target.value);
    });

    // =============== DISPLAY MODE TOGGLES ===============
    // Dark mode - load saved preference
    const darkModePreference = localStorage.getItem("darkMode");
    const darkModeToggle = document.getElementById("displayModeToggle");

    if (darkModePreference === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener("change", toggleDarkMode);

    // Color mode toggle (B&W)
    document.getElementById("colorModeToggle").addEventListener("change", function () {
        if (this.checked) {
            document.body.classList.add("no-color");
        } else {
            document.body.classList.remove("no-color");
        }
    });

    // =============== HEX SEGMENT TOOLTIP ===============
    const tooltip = document.createElement("div");
    tooltip.className = "hex-tooltip";
    tooltip.style.display = "none";
    document.body.appendChild(tooltip);

    document.addEventListener("mouseover", function (e) {
        if (e.target.classList.contains("hex-segment")) {
            const name = e.target.dataset.name;
            const start = e.target.dataset.start;
            const end = e.target.dataset.end;

            const positionText = start === end ? `Position: ${start}` : `Position: ${start}-${end}`;
            const lengthText = start === end ? "(1 char)" : `(${parseInt(end) - parseInt(start) + 1} chars)`;

            tooltip.innerHTML = `
                <div class="tooltip-name">${name}</div>
                <div class="tooltip-position">${positionText} ${lengthText}</div>
            `;
            tooltip.style.display = "block";
        }
    });

    document.addEventListener("mousemove", function (e) {
        if (tooltip.style.display === "block") {
            tooltip.style.left = (e.clientX + 15) + "px";
            tooltip.style.top = (e.clientY + 15) + "px";
        }
    });

    document.addEventListener("mouseout", function (e) {
        if (e.target.classList.contains("hex-segment")) {
            tooltip.style.display = "none";
        }
    });
});

function sendToMeterQueue() {
    const hexString = document
        .getElementById("generatedMeterHex")
        .textContent.trim();
    if (!hexString) {
        alert("Please generate a hex string first.");
        return;
    }

    // Simple UI feedback
    const sendButton = document.querySelector("#meter .send-button");
    sendButton.textContent = "Sending...";

    // Basic fetch request to the server
    fetch("/api/queue/meter", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "message=" + encodeURIComponent(hexString),
    }).finally(() => {
        setTimeout(() => {
            sendButton.textContent = 'Send to ActiveMQ Queue "meters"';
        }, 2000); // Reset button after 2 seconds
    });
}

function sendToInstallationQueue() {
    const hexString = document
        .getElementById("generatedInstallationHex")
        .textContent.trim();

    if (!hexString) {
        alert("Please generate an installation hex string first.");
        return;
    }

    // Simple UI feedback
    const sendButton = document.querySelector(".installation-send-button");
    sendButton.textContent = "Sending...";

    // Send the request to the backend
    fetch("/api/queue/installation", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "message=" + encodeURIComponent(hexString),
    })
        .then((response) => response.text())
        .then((result) => {
            console.log("Installation message sent:", result);
        })
        .catch((error) => {
            console.error("Error sending installation message:", error);
        })
        .finally(() => {
            // Reset button text after 2 seconds
            setTimeout(() => {
                sendButton.textContent = 'Send to ActiveMQ Queue "installation"';
            }, 2000);
        });
}

function sendToAnalogQueue() {
    const hexString = document
        .getElementById("generatedAnalogHex")
        .textContent.trim();

    if (!hexString) {
        alert("Please generate an analog hex string first.");
        return;
    }

    // Simple UI feedback
    const sendButton = document.querySelector("#analog .send-button");
    sendButton.textContent = "Sending...";

    // Send the request to the backend
    fetch("/api/queue/analog", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "message=" + encodeURIComponent(hexString),
    })
        .then((response) => response.text())
        .then((result) => {
            console.log("Analog message sent:", result);
        })
        .catch((error) => {
            console.error("Error sending analog message:", error);
        })
        .finally(() => {
            // Reset button text after 2 seconds
            setTimeout(() => {
                sendButton.textContent = 'Send to ActiveMQ Queue "analog"';
            }, 2000);
        });
}

function sendToBoxQueue() {
    const hexString = document
        .getElementById("generatedBoxHex")
        .textContent.trim();

    if (!hexString) {
        alert("Please generate a box hex string first.");
        return;
    }

    // Simple UI feedback
    const sendButton = document.querySelector("#box .send-button");
    sendButton.textContent = "Sending...";

    // Send the request to the backend
    fetch("/api/queue/box", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "message=" + encodeURIComponent(hexString),
    })
        .then((response) => response.text())
        .then((result) => {
            console.log("Box message sent:", result);
        })
        .catch((error) => {
            console.error("Error sending box message:", error);
        })
        .finally(() => {
            // Reset button text after 2 seconds
            setTimeout(() => {
                sendButton.textContent = 'Send to ActiveMQ Queue "box"';
            }, 2000);
        });
}

function toggleDarkMode(event) {
    const body = document.body;
    if (event.target.checked) {
        body.classList.add("dark-mode");
        // Save preference to localStorage
        localStorage.setItem("darkMode", "enabled");
    } else {
        body.classList.remove("dark-mode");
        // Save preference to localStorage
        localStorage.setItem("darkMode", "disabled");
    }
}
