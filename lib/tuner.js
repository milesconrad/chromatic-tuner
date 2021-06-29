import { freelizer } from './freelizer/index.js'

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const noteDisplay = document.querySelector('#note');
let notes = {
    'C': 32.7,
    'C#/Db': 34.65,
    'D': 36.71,
    'D#/Eb': 38.89,
    'E': 41.20,
    'F': 43.65,
    'F#/Gb': 46.25,
    'G': 49.00,
    'G#/Ab': 51.91,
    'A': 55.00,
    'A#/Bb': 58.27,
    'B': 61.74,
};
let lastPlayed = new Date().getTime();
let lastFrequency;

canvas.width = 600;
canvas.height = 400;

ctx.fillStyle = '#1a1a1a';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#4e38ca';
ctx.fillRect(300-30, 0, 60, canvas.height);

ctx.strokeStyle = '#2a2a2a';
for (let i = 0; i < 600; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
}
for (let i = 0; i < 600; i += 20) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
}

ctx.strokeStyle = '#fff';
ctx.beginPath();
ctx.moveTo(0, 200);
ctx.lineTo(canvas.width, 200);
ctx.stroke();

ctx.strokeRect(0, 0, canvas.width, canvas.height);
ctx.strokeStyle = '#7e1010';
ctx.lineWidth = 3;
let backup = ctx.getImageData(0, 0, canvas.width, canvas.height);

function findNote(frequency) {
    // 1.835 is the largest deviation a frequency can have before changing notes
    // check to see if frequency is in the current octave
    if (frequency > notes['B'] + 1.835) {
        return findNote(frequency / 2)
    }
    else if (frequency < notes['C'] - 1.835) {
        return findNote(frequency * 2)
    }

    let smallestDifference = ['No note found', frequency];
    // find the note closest to the given frequency
    for (let noteName in notes) {
        let difference = frequency - notes[noteName];
        if (difference < smallestDifference[1] && difference >= 0) {
            smallestDifference = [noteName, difference];
        } else {
            difference = notes[noteName] - frequency;
            if (difference < smallestDifference[1] && difference >= 0) {
                smallestDifference = [noteName, difference];
            }
        }
    }

    // check if the frequency is higher or lower than the decided note
    if (frequency < notes[smallestDifference[0]]) {
        smallestDifference[1] = 0 - smallestDifference[1];
    }
    return smallestDifference;
}

// the data variable consists of the frequency and the volume of the mic
function displayDraw(data) {
    const [noteName, difference] = findNote(data[0]);

    // if a note has been played before, find the difference between the current 
    // frequency and the frequency of the last played note
    let frequencyChange;
    if (lastFrequency) {
        if (data[0] >= lastFrequency) {
            frequencyChange = data[0] - lastFrequency;
        } else {
            frequencyChange = lastFrequency - data[0];
        }
    } else {
        frequencyChange = 0;
    }
    lastFrequency = data[0];

    // adds a noise gate and ignores spikes in frequencies
    if (data[1] > 5 && frequencyChange < 1) {
        noteDisplay.innerHTML = noteName;
        ctx.putImageData(backup, 0, 0);
        lastPlayed = new Date().getTime();

        // 1.835 is the largest deviation a frequency can have before changing notes
        // ratio determines where the frequency stands on the graph
        let ratio = difference / 1.835;
        ctx.beginPath();
        ctx.moveTo(300 + (300 * ratio), 0);
        ctx.lineTo(300 + (300 * ratio), canvas.height);
        ctx.stroke();
    }
    // if the last note was played over 3 seconds ago, wipe the canvas
    else if (new Date().getTime() - lastPlayed > 3000) {
        noteDisplay.innerHTML = 'Play a note to start';
        ctx.putImageData(backup, 0, 0);
    }
};

// start listening to mic, pass data to displayDraw
const { start, subscribe } = await freelizer();
start();
subscribe(displayDraw);