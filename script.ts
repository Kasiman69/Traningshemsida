// =========================
// SIDNAVIGATION
// =========================

const homePage = document.getElementById("homePage") as HTMLElement;
const pushPage = document.getElementById("pushPage") as HTMLElement;
const pullPage = document.getElementById("pullPage") as HTMLElement;
const legsPage = document.getElementById("legsPage") as HTMLElement;
const historyPage = document.getElementById("historyPage") as HTMLElement;

const choosePushButton = document.getElementById("choosePushButton") as HTMLButtonElement;
const choosePullButton = document.getElementById("choosePullButton") as HTMLButtonElement;
const chooseLegsButton = document.getElementById("chooseLegsButton") as HTMLButtonElement;
const historyButton = document.getElementById("historyButton") as HTMLButtonElement;

const backFromPushButton = document.getElementById("backFromPushButton") as HTMLButtonElement;
const backFromPullButton = document.getElementById("backFromPullButton") as HTMLButtonElement;
const backFromLegsButton = document.getElementById("backFromLegsButton") as HTMLButtonElement;
const backFromHistoryButton = document.getElementById("backFromHistoryButton") as HTMLButtonElement;        

// =========================
// VISA SIDA
// =========================

function showPage(page: HTMLElement): void {
    homePage.classList.add("hidden");
    pushPage.classList.add("hidden");
    pullPage.classList.add("hidden");
    legsPage.classList.add("hidden");
    historyPage.classList.add("hidden");
    page.classList.remove("hidden");
}


// =========================
// DATA
// =========================

function getWorkouts() {
    return JSON.parse(
        localStorage.getItem("workouts") || "[]"
    );
}


function getActiveWorkout() {
    return JSON.parse(
        localStorage.getItem("activeWorkout") || "null"
    );
}


// =========================
// VISA FÖREGÅENDE PASS
// =========================

function renderPreviousWorkout(category: string): void {

    const workouts = getWorkouts();

    const categoryWorkouts = workouts.filter(
        workout => workout.category === category
    );


    let previousWorkoutElement: HTMLElement;

    if (category === "Push") {
        previousWorkoutElement =
            document.getElementById("previousPush") as HTMLElement;

    } else if (category === "Pull") {
        previousWorkoutElement =
            document.getElementById("previousPull") as HTMLElement;

    } else {
        previousWorkoutElement =
            document.getElementById("previousLegs") as HTMLElement;
    }


    previousWorkoutElement.innerHTML = "";


    if (categoryWorkouts.length === 0) {

        previousWorkoutElement.innerHTML =
            "<p>Inget tidigare pass sparat ännu.</p>";

        return;
    }


    // Hitta det senaste färdiga passet
    const lastWorkout = categoryWorkouts[categoryWorkouts.length - 1];


    let previousWorkout;


    // Nya pass har ett sessionId
    if (lastWorkout.sessionId) {

        previousWorkout = categoryWorkouts.filter(
            workout => workout.sessionId === lastWorkout.sessionId
        );

    } else {

        // Gamla träningsdata utan sessionId
        // grupperas efter datum
        previousWorkout = categoryWorkouts.filter(
            workout => workout.date === lastWorkout.date
        );
    }


    for (const workout of previousWorkout) {

        const entry = document.createElement("p");

        entry.textContent =
            `${workout.exercise}: ${workout.weight} kg × ${workout.reps} reps`;

        previousWorkoutElement.appendChild(entry);
    }


    const date = document.createElement("small");

    date.textContent =
        `Datum: ${lastWorkout.date}`;

    previousWorkoutElement.appendChild(date);
}


// =========================
// VISA PÅGÅENDE PASS
// =========================

function renderActiveWorkout(category: string): void {

    const activeWorkout = getActiveWorkout();


    let elementId = "";

    if (category === "Push") {
        elementId = "todayPush";
    } else if (category === "Pull") {
        elementId = "todayPull";
    } else {
        elementId = "todayLegs";
    }


    const element =
        document.getElementById(elementId) as HTMLElement;


    if (!element) {
        return;
    }


    element.innerHTML = "";


    if (
        !activeWorkout ||
        activeWorkout.category !== category ||
        activeWorkout.workouts.length === 0
    ) {

        element.innerHTML =
            "<p>Inga set sparade ännu.</p>";

        return;
    }


    for (const workout of activeWorkout.workouts) {

        const entry = document.createElement("p");

        entry.textContent =
            `${workout.exercise}: ${workout.weight} kg × ${workout.reps} reps`;

        element.appendChild(entry);
    }
}


// =========================
// SPARA SET
// =========================

function saveWorkout(
    category: string,
    exercise: string,
    weight: string,
    reps: string
) {

    let activeWorkout = getActiveWorkout();


    // Om inget pass pågår
    if (!activeWorkout) {

        activeWorkout = {
            sessionId: Date.now().toString(),
            category: category,
            date: new Date().toLocaleDateString("sv-SE"),
            workouts: []
        };
    }


    // Om ett annat pass redan pågår
    if (activeWorkout.category !== category) {

        alert(
            `Du har redan ett pågående ${activeWorkout.category}-pass. Avsluta det först.`
        );

        return;
    }


    const workout = {

        id: Date.now().toString(),

        sessionId: activeWorkout.sessionId,

        category: category,

        exercise: exercise,

        weight: weight,

        reps: reps,

        date: activeWorkout.date
    };


    // Lägg till setet i det pågående passet
    activeWorkout.workouts.push(workout);


    // Spara det pågående passet
    localStorage.setItem(
        "activeWorkout",
        JSON.stringify(activeWorkout)
    );


    // Visa dagens pass
    renderActiveWorkout(category);
}


// =========================
// AVSLUTA PASS
// =========================

function finishWorkout(category: string): void {

    const activeWorkout = getActiveWorkout();


    if (
        !activeWorkout ||
        activeWorkout.category !== category ||
        activeWorkout.workouts.length === 0
    ) {

        alert("Du har inga sparade set i detta pass ännu.");

        return;
    }


    // Hämta tidigare färdiga pass
    const savedWorkouts = getWorkouts();


    // Lägg dagens alla set bland de färdiga passen
    for (const workout of activeWorkout.workouts) {

        savedWorkouts.push(workout);
    }


    // Spara den nya historiken
    localStorage.setItem(
        "workouts",
        JSON.stringify(savedWorkouts)
    );


    // Ta bort det pågående passet
    localStorage.removeItem("activeWorkout");


    // Uppdatera allt
    renderPreviousWorkout(category);
    renderActiveWorkout(category);
    renderHistory();


    alert("Passet är avslutat och sparat!");
}


// =========================
// PUSH / PULL / LEGS NAVIGATION
// =========================

choosePushButton.addEventListener("click", () => {

    showPage(pushPage);

    renderPreviousWorkout("Push");
    renderActiveWorkout("Push");
});


choosePullButton.addEventListener("click", () => {

    showPage(pullPage);

    renderPreviousWorkout("Pull");
    renderActiveWorkout("Pull");
});


chooseLegsButton.addEventListener("click", () => {

    showPage(legsPage);

    renderPreviousWorkout("Legs");
    renderActiveWorkout("Legs");
});


historyButton.addEventListener("click", () => {

    showPage(historyPage);

    renderHistory();
});

backFromPushButton.addEventListener("click", () => {
    showPage(homePage);
});


backFromPullButton.addEventListener("click", () => {
    showPage(homePage);
});


backFromLegsButton.addEventListener("click", () => {
    showPage(homePage);
});


backFromHistoryButton.addEventListener("click", () => {
    showPage(homePage);
});
// =========================
// PUSH
// =========================

// Bänkpress

const benchWeight =
    document.getElementById("benchWeight") as HTMLInputElement;

const benchReps =
    document.getElementById("benchReps") as HTMLInputElement;

const benchSaveButton =
    document.getElementById("benchSaveButton") as HTMLButtonElement;


benchSaveButton.addEventListener("click", () => {

    saveWorkout(
        "Push",
        "Bänkpress",
        benchWeight.value,
        benchReps.value
    );
});


// Axelpress

const shoulderWeight =
    document.getElementById("shoulderWeight") as HTMLInputElement;

const shoulderReps =
    document.getElementById("shoulderReps") as HTMLInputElement;

const shoulderSaveButton =
    document.getElementById("shoulderSaveButton") as HTMLButtonElement;


shoulderSaveButton.addEventListener("click", () => {

    saveWorkout(
        "Push",
        "Axelpress",
        shoulderWeight.value,
        shoulderReps.value
    );
});


// Overhead Tricep Extension

const tricepWeight =
    document.getElementById("tricepWeight") as HTMLInputElement;

const tricepReps =
    document.getElementById("tricepReps") as HTMLInputElement;

const tricepSaveButton =
    document.getElementById("tricepSaveButton") as HTMLButtonElement;


tricepSaveButton.addEventListener("click", () => {

    saveWorkout(
        "Push",
        "Overhead Tricep Extension",
        tricepWeight.value,
        tricepReps.value
    );
});


// =========================
// PULL
// =========================

// Marklyft

const deadliftWeight =
    document.getElementById("deadliftWeight") as HTMLInputElement;

const deadliftReps =
    document.getElementById("deadliftReps") as HTMLInputElement;

const deadliftSaveButton =
    document.getElementById("deadliftSaveButton") as HTMLButtonElement;


deadliftSaveButton.addEventListener("click", () => {

    saveWorkout(
        "Pull",
        "Marklyft",
        deadliftWeight.value,
        deadliftReps.value
    );
});


// Pullups

const pullupWeight =
    document.getElementById("pullupWeight") as HTMLInputElement;

const pullupReps =
    document.getElementById("pullupReps") as HTMLInputElement;

const pullupSaveButton =
    document.getElementById("pullupSaveButton") as HTMLButtonElement;


pullupSaveButton.addEventListener("click", () => {

    saveWorkout(
        "Pull",
        "Pullups",
        pullupWeight.value,
        pullupReps.value
    );
});


// Biceps Curl

const curlWeight =
    document.getElementById("curlWeight") as HTMLInputElement;

const curlReps =
    document.getElementById("curlReps") as HTMLInputElement;

const curlSaveButton =
    document.getElementById("curlSaveButton") as HTMLButtonElement;


curlSaveButton.addEventListener("click", () => {

    saveWorkout(
        "Pull",
        "Biceps Curl",
        curlWeight.value,
        curlReps.value
    );
});


// =========================
// LEGS
// =========================

// Squat

const squatWeight =
    document.getElementById("squatWeight") as HTMLInputElement;

const squatReps =
    document.getElementById("squatReps") as HTMLInputElement;

const squatSaveButton =
    document.getElementById("squatSaveButton") as HTMLButtonElement;


squatSaveButton.addEventListener("click", () => {

    saveWorkout(
        "Legs",
        "Squat",
        squatWeight.value,
        squatReps.value
    );
});


// Leg Extension

const legExtensionWeight =
    document.getElementById("legExtensionWeight") as HTMLInputElement;

const legExtensionReps =
    document.getElementById("legExtensionReps") as HTMLInputElement;

const legExtensionSaveButton =
    document.getElementById("legExtensionSaveButton") as HTMLButtonElement;


legExtensionSaveButton.addEventListener("click", () => {

    saveWorkout(
        "Legs",
        "Leg Extension",
        legExtensionWeight.value,
        legExtensionReps.value
    );
});


// Leg Curl

const legCurlWeight =
    document.getElementById("legCurlWeight") as HTMLInputElement;

const legCurlReps =
    document.getElementById("legCurlReps") as HTMLInputElement;

const legCurlSaveButton =
    document.getElementById("legCurlSaveButton") as HTMLButtonElement;


legCurlSaveButton.addEventListener("click", () => {

    saveWorkout(
        "Legs",
        "Leg Curl",
        legCurlWeight.value,
        legCurlReps.value
    );
});


// Calf Raise

const calfRaiseWeight =
    document.getElementById("calfRaiseWeight") as HTMLInputElement;

const calfRaiseReps =
    document.getElementById("calfRaiseReps") as HTMLInputElement;

const calfRaiseSaveButton =
    document.getElementById("calfRaiseSaveButton") as HTMLButtonElement;


calfRaiseSaveButton.addEventListener("click", () => {

    saveWorkout(
        "Legs",
        "Calf Raise",
        calfRaiseWeight.value,
        calfRaiseReps.value
    );
});


// =========================
// AVSLUTA PASS-KNAPPAR
// =========================

const finishPushButton =
    document.getElementById("finishPushButton") as HTMLButtonElement;

const finishPullButton =
    document.getElementById("finishPullButton") as HTMLButtonElement;

const finishLegsButton =
    document.getElementById("finishLegsButton") as HTMLButtonElement;


finishPushButton.addEventListener("click", () => {
    finishWorkout("Push");
});


finishPullButton.addEventListener("click", () => {
    finishWorkout("Pull");
});


finishLegsButton.addEventListener("click", () => {
    finishWorkout("Legs");
});


// =========================
// HISTORIK
// =========================

function renderHistory(): void {

    const workouts = getWorkouts();

    const pushHistory =
        document.getElementById("pushHistory") as HTMLDivElement;

    const pullHistory =
        document.getElementById("pullHistory") as HTMLDivElement;

    const legsHistory =
        document.getElementById("legsHistory") as HTMLDivElement;


    pushHistory.innerHTML = "";
    pullHistory.innerHTML = "";
    legsHistory.innerHTML = "";


    const sessions: any[] = [];


    // Gå bakifrån så att det senaste passet kommer först
    const reversedWorkouts = [...workouts].reverse();


    for (const workout of reversedWorkouts) {

        // Nya pass har sessionId.
        // Gamla sparningar använder kategori + datum.
        const sessionId =
            workout.sessionId ||
            `${workout.category}-${workout.date}`;


        // Kolla om vi redan har lagt till detta pass
        let session = sessions.find(
            session => session.id === sessionId
        );


        if (!session) {

            session = {
                id: sessionId,
                category: workout.category,
                date: workout.date,
                workouts: []
            };

            sessions.push(session);
        }


        session.workouts.push(workout);
    }


    // Visa passen
    for (const session of sessions) {

        const sessionElement =
            document.createElement("div");

        sessionElement.className = "history-session";


        const date =
            document.createElement("h4");

        date.textContent = session.date;

        sessionElement.appendChild(date);


        for (const workout of session.workouts) {

            const entry =
                document.createElement("p");

            entry.textContent =
                `${workout.exercise}: ${workout.weight} kg × ${workout.reps} reps`;

            sessionElement.appendChild(entry);
        }


        // Radera-knappar
        for (const workout of session.workouts) {

            const deleteButton =
                document.createElement("button");

            deleteButton.textContent = "Radera pass";

            deleteButton.addEventListener("click", () => {

                deleteSession(session.id);
            });

            sessionElement.appendChild(deleteButton);

            break;
        }


        if (session.category === "Push") {

            pushHistory.appendChild(sessionElement);

        } else if (session.category === "Pull") {

            pullHistory.appendChild(sessionElement);

        } else if (session.category === "Legs") {

            legsHistory.appendChild(sessionElement);
        }
    }
}


// =========================
// RADERA
// =========================


function deleteSession(sessionId: string): void {

    const workouts = getWorkouts();


    const remainingWorkouts = workouts.filter(workout => {

        const workoutSessionId =
            workout.sessionId ||
            `${workout.category}-${workout.date}`;

        return workoutSessionId !== sessionId;
    });


    localStorage.setItem(
        "workouts",
        JSON.stringify(remainingWorkouts)
    );


    renderHistory();
}

// =========================
// START
// =========================

renderHistory();