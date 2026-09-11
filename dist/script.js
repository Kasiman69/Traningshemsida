"use strict";
function getWorkouts() {
    return JSON.parse(localStorage.getItem("workouts") || "[]");
}
function saveWorkout(category, exercise, weight, reps) {
    const date = new Date().toLocaleDateString("sv-SE");
    const workout = {
        id: Date.now().toString(),
        category: category,
        exercise: exercise,
        weight: weight,
        reps: reps,
        date: date
    };
    const savedWorkouts = JSON.parse(localStorage.getItem("workouts") || "[]");
    savedWorkouts.push(workout);
    localStorage.setItem("workouts", JSON.stringify(savedWorkouts));
    renderHistory();
}
function renderHistory() {
    const workouts = getWorkouts();
    const pushHistory = document.getElementById("pushHistory");
    const pullHistory = document.getElementById("pullHistory");
    const legsHistory = document.getElementById("legsHistory");
    pushHistory.innerHTML = "";
    pullHistory.innerHTML = "";
    legsHistory.innerHTML = "";
    for (const workout of workouts.reverse()) {
        const entry = document.createElement("p");
        entry.textContent =
            `${workout.exercise}: ${workout.weight} kg × ${workout.reps} reps — ${workout.date} `;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Radera";
        deleteButton.addEventListener("click", () => {
            deleteWorkout(workout.id);
        });
        entry.appendChild(deleteButton);
        if (workout.category === "Push") {
            pushHistory.appendChild(entry);
        }
        else if (workout.category === "Pull") {
            pullHistory.appendChild(entry);
        }
        else if (workout.category === "Legs") {
            legsHistory.appendChild(entry);
        }
    }
}
function deleteWorkout(id) {
    const workouts = getWorkouts().filter(workout => workout.id !== id);
    localStorage.setItem("workouts", JSON.stringify(workouts));
    renderHistory();
}
// Push 
//Bänkpress
const benchWeight = document.getElementById("benchWeight");
const benchReps = document.getElementById("benchReps");
const benchSaveButton = document.getElementById("benchSaveButton");
benchSaveButton.addEventListener("click", () => {
    const weight = benchWeight.value;
    const reps = benchReps.value;
    saveWorkout("Push", "Bänkpress", weight, reps);
});
// Axelpress
const shoulderWeight = document.getElementById("shoulderWeight");
const shoulderReps = document.getElementById("shoulderReps");
const shoulderSaveButton = document.getElementById("shoulderSaveButton");
shoulderSaveButton.addEventListener("click", () => {
    const weight = shoulderWeight.value;
    const reps = shoulderReps.value;
    saveWorkout("Push", "Axelpress", weight, reps);
});
// Tricep extension
const tricepWeight = document.getElementById("tricepWeight");
const tricepReps = document.getElementById("tricepReps");
const tricepSaveButton = document.getElementById("tricepSaveButton");
tricepSaveButton.addEventListener("click", () => {
    const weight = tricepWeight.value;
    const reps = tricepReps.value;
    saveWorkout("Push", "Overhead Tricep Extension", weight, reps);
});
// Pull
// Marklyft
const deadliftWeight = document.getElementById("deadliftWeight");
const deadliftReps = document.getElementById("deadliftReps");
const deadliftSaveButton = document.getElementById("deadliftSaveButton");
deadliftSaveButton.addEventListener("click", () => {
    const weight = deadliftWeight.value;
    const reps = deadliftReps.value;
    saveWorkout("Pull", "Marklyft", weight, reps);
});
// Pullups
const pullupWeight = document.getElementById("pullupWeight");
const pullupReps = document.getElementById("pullupReps");
const pullupSaveButton = document.getElementById("pullupSaveButton");
pullupSaveButton.addEventListener("click", () => {
    const weight = pullupWeight.value;
    const reps = pullupReps.value;
    saveWorkout("Pull", "Pullups", weight, reps);
});
// Biceps curl
const curlWeight = document.getElementById("curlWeight");
const curlReps = document.getElementById("curlReps");
const curlSaveButton = document.getElementById("curlSaveButton");
curlSaveButton.addEventListener("click", () => {
    const weight = curlWeight.value;
    const reps = curlReps.value;
    saveWorkout("Pull", "Biceps Curl", weight, reps);
});
// Legs
// Squat
const squatWeight = document.getElementById("squatWeight");
const squatReps = document.getElementById("squatReps");
const squatSaveButton = document.getElementById("squatSaveButton");
squatSaveButton.addEventListener("click", () => {
    const weight = squatWeight.value;
    const reps = squatReps.value;
    saveWorkout("Legs", "Squat", weight, reps);
});
// Lex extension
const legExtensionWeight = document.getElementById("legExtensionWeight");
const legExtensionReps = document.getElementById("legExtensionReps");
const legExtensionSaveButton = document.getElementById("legExtensionSaveButton");
legExtensionSaveButton.addEventListener("click", () => {
    const weight = legExtensionWeight.value;
    const reps = legExtensionReps.value;
    saveWorkout("Legs", "Leg Extension", weight, reps);
});
// Leg curl
const legCurlWeight = document.getElementById("legCurlWeight");
const legCurlReps = document.getElementById("legCurlReps");
const legCurlSaveButton = document.getElementById("legCurlSaveButton");
legCurlSaveButton.addEventListener("click", () => {
    const weight = legCurlWeight.value;
    const reps = legCurlReps.value;
    saveWorkout("Legs", "Leg Curl", weight, reps);
});
// Calf raise
const calfRaiseWeight = document.getElementById("calfRaiseWeight");
const calfRaiseReps = document.getElementById("calfRaiseReps");
const calfRaiseSaveButton = document.getElementById("calfRaiseSaveButton");
calfRaiseSaveButton.addEventListener("click", () => {
    const weight = calfRaiseWeight.value;
    const reps = calfRaiseReps.value;
    saveWorkout("Legs", "Calf Raise", weight, reps);
});
renderHistory();
