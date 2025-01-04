// app.js

let audioContext;
let analyser;
let microphone;
let startButton = document.getElementById("startButton");
let pitchDisplay = document.getElementById("detectedPitch");
let statusDisplay = document.getElementById("status");
let noteInput = document.getElementById("noteInput");
let showNoteButton = document.getElementById("showNoteButton");
let staffCanvas = document.getElementById("staffCanvas");
let staffContext = staffCanvas.getContext("2d");

// Standard frequencies for guitar strings (E4, A4, D4, G4, B3, E3)
const guitarStrings = {
    "E4": 329.63,
    "A4": 440.00,
    "D4": 293.66,
    "G4": 196.00,
    "B3": 246.94,
    "E3": 164.81
};

// Standard note-to-frequency map
const noteFrequencies = {
    "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23,
    "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
    // Add more as needed
};

// Start Tuning button listener
startButton.addEventListener("click", startTuning);

// Show note on staff button listener
showNoteButton.addEventListener("click", showNoteOnStaff);

// Initialize audio context for pitch detection
function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048; // Frequency data length

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
        })
        .catch(err => {
            console.error("Error accessing microphone:", err);
            statusDisplay.innerText = "Failed to access microphone.";
        });
}

// Start Tuning function
function startTuning() {
    startButton.disabled = true;
    statusDisplay.innerText = "Listening for audio...";
    initAudioContext();
    startListening();
}

// Start listening for microphone input
function startListening() {
    detectPitch();
}

// Function to detect pitch from microphone input
function detectPitch() {
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Float32Array(bufferLength);

    analyser.getFloatFrequencyData(dataArray);

    let fundamentalFrequency = getFundamentalFrequency(dataArray);

    if (fundamentalFrequency) {
        let detectedNote = getNoteFromFrequency(fundamentalFrequency);
        pitchDisplay.innerText = detectedNote;
        statusDisplay.innerText = `Status: ${isInTune(detectedNote) ? "In Tune!" : "Out of Tune!"}`;
    }

    requestAnimationFrame(detectPitch);
}

// Function to get the fundamental frequency from frequency data
function getFundamentalFrequency(dataArray) {
    let maxIndex = -1;
    let maxValue = -Infinity;

    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > maxValue) {
            maxValue = dataArray[i];
            maxIndex = i;
        }
    }

    if (maxIndex === -1) return null;
    let nyquist = audioContext.sampleRate / 2;
    return maxIndex * nyquist / dataArray.length;
}

// Function to convert frequency to musical note
function getNoteFromFrequency(frequency) {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const noteIndex = Math.round(12 * (Math.log(frequency / 440.0) / Math.log(2))) + 49;
    const noteName = notes[noteIndex % 12];
    const octave = Math.floor(noteIndex / 12) - 1;
    return `${noteName}${octave}`;
}

// Function to check if note is in tune with guitar
function isInTune(detectedNote) {
    const targetFrequency = guitarStrings[detectedNote];
    if (!targetFrequency) return false;
    return Math.abs(detectedNote - targetFrequency) < 5;
}

// Function to show inputted note on staff
function showNoteOnStaff() {
    let note = noteInput.value.trim().toUpperCase();
    if (!noteFrequencies[note]) {
        alert("Invalid note entered. Please use a valid note (e.g., C4, G#4).");
        return;
    }

    drawStaff();
    drawNoteOnStaff(note);
}

// Function to draw the musical staff
function drawStaff() {
    staffContext.clearRect(0, 0, staffCanvas.width, staffCanvas.height);
    staffContext.beginPath();
    let lineSpacing = 20;
    for (let i = 0; i < 5; i++) {
        staffContext.moveTo(20, 50 + i * lineSpacing);
        staffContext.lineTo(580, 50 + i * lineSpacing);
    }
    staffContext.stroke();
}

// Function to draw a note on the staff
function drawNoteOnStaff(note) {
    let notePosition = getNotePosition(note);
    let x = 200;
    let y = notePosition;

    staffContext.beginPath();
    staffContext.arc(x, y, 10, 0, Math.PI * 2);
    staffContext.fillStyle = "black";
    staffContext.fill();
}

// Function to calculate the vertical position of a note on the staff
function getNotePosition(note) {
    // Mapping notes to staff lines/space positions
    const notePositions = {
        "C4": 100, "C#4": 90, "D4": 80, "D#4": 70, "E4": 60, "F4": 50,
        "F#4": 40, "G4": 30, "G#4": 20, "A4": 10, "A#4": 0, "B4": -10
    };
    return notePositions[note] || 100; // Default position for unknown notes
}

// Function to toggle the account menu
function toggleAccountMenu() {
    const accountMenu = document.getElementById('accountMenu');
    const isVisible = accountMenu.style.display === 'block';

    // Hide the menu if it's already visible
    if (isVisible) {
        accountMenu.style.display = 'none';
    } else {
        // Show the menu
        accountMenu.style.display = 'block';
    }
}

