// =========================
// SIDNAVIGATION
// =========================

import { supabase } from "./supabase.js";



const homePage = document.getElementById("homePage") as HTMLElement;
const pushPage = document.getElementById("pushPage") as HTMLElement;
const pullPage = document.getElementById("pullPage") as HTMLElement;
const legsPage = document.getElementById("legsPage") as HTMLElement;
const historyPage = document.getElementById("historyPage") as HTMLElement;

const choosePushButton = document.getElementById("choosePushButton") as HTMLButtonElement;
const choosePullButton = document.getElementById("choosePullButton") as HTMLButtonElement;
const chooseLegsButton = document.getElementById("chooseLegsButton") as HTMLButtonElement;
const historyButton = document.getElementById("chooseHistoryButton") as HTMLButtonElement;

const backFromPushButton = document.getElementById("backFromPushButton") as HTMLButtonElement;
const backFromPullButton = document.getElementById("backFromPullButton") as HTMLButtonElement;
const backFromLegsButton = document.getElementById("backFromLegsButton") as HTMLButtonElement;
const backFromHistoryButton = document.getElementById("backFromHistoryButton") as HTMLButtonElement;        

// =========================
// LOGIN / SKAPA KONTO
// =========================

const loginPage =
    document.getElementById("loginPage") as HTMLElement;

const loginEmail =
    document.getElementById("loginEmail") as HTMLInputElement;

const loginPassword =
    document.getElementById("loginPassword") as HTMLInputElement;

const loginButton =
    document.getElementById("loginButton") as HTMLButtonElement;

const signupEmail =
    document.getElementById("signupEmail") as HTMLInputElement;

const signupPassword =
    document.getElementById("signupPassword") as HTMLInputElement;

const signupButton =
    document.getElementById("signupButton") as HTMLButtonElement;

const authMessage =
    document.getElementById("authMessage") as HTMLParagraphElement;


// =========================
// LOGGA IN
// =========================

loginButton.addEventListener("click", async () => {

    const email = loginEmail.value;
    const password = loginPassword.value;

    const { data, error } =
        await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {

        authMessage.textContent =
            "Fel e-post eller lösenord.";

        console.error("Inloggning misslyckades:", error);

        return;
    }

    console.log("Inloggad användare:", data.user);

    // Dölj login
    loginPage.classList.add("hidden");

    // Visa hemsidan
    showPage(homePage);
});


// =========================
// SKAPA KONTO
// =========================

signupButton.addEventListener("click", async () => {

    const email = signupEmail.value;
    const password = signupPassword.value;

    const { data, error } =
        await supabase.auth.signUp({
            email: email,
            password: password
        });

    if (error) {

        authMessage.textContent =
            error.message;

        console.error("Kunde inte skapa konto:", error);

        return;
    }

    console.log("Konto skapat:", data.user);

    authMessage.textContent =
        "Kontot har skapats! Du kan nu logga in.";
});

// =========================
// VISA SIDA
// =========================

function showPage(page: HTMLElement): void {

    loginPage.classList.add("hidden");
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

async function renderPreviousWorkout(category: string): Promise<void> {

    const workouts = await getWorkoutsFromSupabase();

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


    // Hitta det senaste setet
    const lastWorkout = categoryWorkouts[0];


    // Hitta alla set från samma pass.
    // Just nu använder vi kategori + datum.
    const previousWorkout = categoryWorkouts.filter(
        workout =>
            workout.category === lastWorkout.category &&
            workout.date === lastWorkout.date
    );


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

async function saveWorkout(
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


    // Spara det pågående passet lokalt
    localStorage.setItem(
        "activeWorkout",
        JSON.stringify(activeWorkout)
    );


    // Spara setet i Supabase
    await saveWorkoutToSupabase(
        category,
        exercise,
        Number(weight),
        Number(reps)
    );


    // Visa dagens pass
    renderActiveWorkout(category);
}

async function saveWorkoutToSupabase(
  category: string,
  exercise: string,
  weight: number,
  reps: number
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Ingen användare är inloggad");
    return;
  }

  const { data, error } = await supabase
    .from("workouts")
    .insert({
      user_id: user.id,
      category: category,
      exercise: exercise,
      weight: weight,
      reps: reps,
    })
    .select();

  if (error) {
    console.error("Kunde inte spara träningspass:", error);
    return;
  }

  console.log("Träningspass sparat i Supabase:", data);
}

async function loginTestUser() {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email: "pohnerisak@gmail.com",
      password: "GPo5dUNVW8b:_8Me8j",
    });

  if (error) {
    console.error("Inloggning misslyckades:", error);
    return;
  }

  console.log("Inloggad användare:", data.user);
}

async function getWorkoutsFromSupabase() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        console.error("Ingen användare är inloggad");
        return [];
    }

    const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Kunde inte hämta träningshistorik:", error);
        return [];
    }

    console.log("Träningshistorik från Supabase:", data);

    return data;
}

// =========================
// AVSLUTA PASS
// =========================

async function finishWorkout(category: string): Promise<void> {

    const activeWorkout = getActiveWorkout();

    if (
        !activeWorkout ||
        activeWorkout.category !== category ||
        activeWorkout.workouts.length === 0
    ) {
        alert("Du har inga sparade set i detta pass ännu.");
        return;
    }

    // Ta bort det pågående passet från localStorage
    localStorage.removeItem("activeWorkout");

    // Uppdatera sidan
    renderActiveWorkout(category);
    await renderHistory();

    alert("Passet är avslutat och sparat!");
}

// =========================
// PUSH / PULL / LEGS NAVIGATION
// =========================

choosePushButton.addEventListener("click", async () => {

    showPage(pushPage);

    await renderPreviousWorkout("Push");
    renderActiveWorkout("Push");
});


choosePullButton.addEventListener("click", async () => {

    showPage(pullPage);

    await renderPreviousWorkout("Pull");
    renderActiveWorkout("Pull");
});


chooseLegsButton.addEventListener("click", async () => {

    showPage(legsPage);

    await renderPreviousWorkout("Legs");
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

async function renderHistory(): Promise<void> {

    const workouts = await getWorkoutsFromSupabase();

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

        // Supabase har inte sessionId ännu.
        // Därför grupperar vi tills vidare på kategori + datum.
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


        // Radera-knapp
        for (const workout of session.workouts) {

            const deleteButton =
                document.createElement("button");

            deleteButton.textContent = "Radera pass";

            deleteButton.addEventListener("click", () => {

                deleteSession(
                    session.category,
                    session.date
                );
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


async function deleteSessionFromSupabase(
    category: string,
    date: string
): Promise<void> {

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        console.error("Ingen användare är inloggad");
        return;
    }

    const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("user_id", user.id)
        .eq("category", category)
        .eq("date", date);

    if (error) {
        console.error("Kunde inte radera pass:", error);
        return;
    }

    console.log("Pass raderat från Supabase");

    await renderHistory();
}

async function deleteSession(
    category: string,
    date: string
): Promise<void> {

    await deleteSessionFromSupabase(category, date);
}


// =========================
// KONTROLLERA INLOGGNING
// =========================

async function checkLogin(): Promise<void> {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (session) {

        // Användaren är redan inloggad
        loginPage.classList.add("hidden");

        showPage(homePage);

        console.log(
            "Redan inloggad:",
            session.user.email
        );

    } else {

        // Ingen användare är inloggad
        loginPage.classList.remove("hidden");

        homePage.classList.add("hidden");
        pushPage.classList.add("hidden");
        pullPage.classList.add("hidden");
        legsPage.classList.add("hidden");
        historyPage.classList.add("hidden");
    }
}

const logoutButton =
    document.getElementById("logoutButton") as HTMLButtonElement;


// =========================
// LOGGA UT
// =========================

logoutButton.addEventListener("click", async () => {

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Kunde inte logga ut:", error);
        return;
    }

    // Dölj alla träningssidor
    homePage.classList.add("hidden");
    pushPage.classList.add("hidden");
    pullPage.classList.add("hidden");
    legsPage.classList.add("hidden");
    historyPage.classList.add("hidden");

    // Visa login
    loginPage.classList.remove("hidden");

    // Töm login-fälten
    loginEmail.value = "";
    loginPassword.value = "";

    console.log("Utloggad");
});

checkLogin();



