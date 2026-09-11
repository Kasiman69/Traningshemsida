function getWorkouts() {
    return JSON.parse(
        localStorage.getItem("workouts") || "[]"
    );
}

function saveWorkout(
    category: string,
    exercise: string,
    weight: string,
    reps: string
) {
    const date = new Date().toLocaleDateString("sv-SE");

    const workout = {
        id: Date.now().toString(),
        category: category,
        exercise: exercise,
        weight: weight,
        reps: reps,
        date: date
    };

    const savedWorkouts = JSON.parse(
        localStorage.getItem("workouts") || "[]"
    );

    savedWorkouts.push(workout);

    localStorage.setItem("workouts", JSON.stringify(savedWorkouts));

    renderHistory();
}

function renderHistory(): void {
    const workouts = getWorkouts();

    const pushHistory = document.getElementById("pushHistory") as HTMLDivElement;
    const pullHistory = document.getElementById("pullHistory") as HTMLDivElement;
    const legsHistory = document.getElementById("legsHistory") as HTMLDivElement;

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
        } else if (workout.category === "Pull") {
            pullHistory.appendChild(entry);
        } else if (workout.category === "Legs") {
            legsHistory.appendChild(entry);
        }
    }
}

function deleteWorkout(id: string): void {
    const workouts = getWorkouts().filter(workout => workout.id !== id);

    localStorage.setItem("workouts", JSON.stringify(workouts));

    renderHistory();
}

// Push 

//Bänkpress

const benchWeight = document.getElementById("benchWeight") as HTMLInputElement;
const benchReps = document.getElementById("benchReps") as HTMLInputElement;
const benchSaveButton = document.getElementById("benchSaveButton") as HTMLButtonElement;

benchSaveButton.addEventListener("click", () => {
    const weight = benchWeight.value;
    const reps = benchReps.value;

    saveWorkout("Push", "Bänkpress", weight, reps);
});

// Axelpress

const shoulderWeight = document.getElementById("shoulderWeight") as HTMLInputElement;
const shoulderReps = document.getElementById("shoulderReps") as HTMLInputElement;
const shoulderSaveButton = document.getElementById("shoulderSaveButton") as HTMLButtonElement;

shoulderSaveButton.addEventListener("click", () => {
    const weight = shoulderWeight.value;
    const reps = shoulderReps.value;

    saveWorkout("Push", "Axelpress", weight, reps);});

// Tricep extension

const tricepWeight = document.getElementById("tricepWeight") as HTMLInputElement;
const tricepReps = document.getElementById("tricepReps") as HTMLInputElement;
const tricepSaveButton = document.getElementById("tricepSaveButton") as HTMLButtonElement;

tricepSaveButton.addEventListener("click", () => {
    const weight = tricepWeight.value;
    const reps = tricepReps.value;

    saveWorkout("Push", "Overhead Tricep Extension", weight, reps);
});

// Pull

// Marklyft

const deadliftWeight = document.getElementById("deadliftWeight") as HTMLInputElement;
const deadliftReps = document.getElementById("deadliftReps") as HTMLInputElement;
const deadliftSaveButton = document.getElementById("deadliftSaveButton") as HTMLButtonElement;

deadliftSaveButton.addEventListener("click", () => {
    const weight = deadliftWeight.value;
    const reps = deadliftReps.value;

    saveWorkout("Pull", "Marklyft", weight, reps);
});

// Pullups

const pullupWeight = document.getElementById("pullupWeight") as HTMLInputElement;
const pullupReps = document.getElementById("pullupReps") as HTMLInputElement;
const pullupSaveButton = document.getElementById("pullupSaveButton") as HTMLButtonElement;

pullupSaveButton.addEventListener("click", () => {
    const weight = pullupWeight.value;
    const reps = pullupReps.value;

    saveWorkout("Pull", "Pullups", weight, reps);
});

// Biceps curl

const curlWeight = document.getElementById("curlWeight") as HTMLInputElement;
const curlReps = document.getElementById("curlReps") as HTMLInputElement;
const curlSaveButton = document.getElementById("curlSaveButton") as HTMLButtonElement;

curlSaveButton.addEventListener("click", () => {
    const weight = curlWeight.value;
    const reps = curlReps.value;

    saveWorkout("Pull", "Biceps Curl", weight, reps);
});

// Legs

// Squat

const squatWeight = document.getElementById("squatWeight") as HTMLInputElement;
const squatReps = document.getElementById("squatReps") as HTMLInputElement;
const squatSaveButton = document.getElementById("squatSaveButton") as HTMLButtonElement;

squatSaveButton.addEventListener("click", () => {
    const weight = squatWeight.value;
    const reps = squatReps.value;

    saveWorkout("Legs", "Squat", weight, reps);
});


// Lex extension

const legExtensionWeight = document.getElementById("legExtensionWeight") as HTMLInputElement;
const legExtensionReps = document.getElementById("legExtensionReps") as HTMLInputElement;
const legExtensionSaveButton = document.getElementById("legExtensionSaveButton") as HTMLButtonElement;

legExtensionSaveButton.addEventListener("click", () => {
    const weight = legExtensionWeight.value;
    const reps = legExtensionReps.value;

    saveWorkout("Legs", "Leg Extension", weight, reps);
});

// Leg curl

const legCurlWeight = document.getElementById("legCurlWeight") as HTMLInputElement;
const legCurlReps = document.getElementById("legCurlReps") as HTMLInputElement;
const legCurlSaveButton = document.getElementById("legCurlSaveButton") as HTMLButtonElement;

legCurlSaveButton.addEventListener("click", () => {
    const weight = legCurlWeight.value;
    const reps = legCurlReps.value;

    saveWorkout("Legs", "Leg Curl", weight, reps);
});

// Calf raise

const calfRaiseWeight = document.getElementById("calfRaiseWeight") as HTMLInputElement;
const calfRaiseReps = document.getElementById("calfRaiseReps") as HTMLInputElement;
const calfRaiseSaveButton = document.getElementById("calfRaiseSaveButton") as HTMLButtonElement;

calfRaiseSaveButton.addEventListener("click", () => {
    const weight = calfRaiseWeight.value;
    const reps = calfRaiseReps.value;

    saveWorkout("Legs", "Calf Raise", weight, reps);
});

renderHistory();

