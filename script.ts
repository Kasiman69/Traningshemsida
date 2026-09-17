// =========================
// SIDNAVIGATION
// =========================

import { supabase } from "./supabase.js";



const homePage = document.getElementById("homePage") as HTMLElement;
const pushPage = document.getElementById("pushPage") as HTMLElement;
const pullPage = document.getElementById("pullPage") as HTMLElement;
const legsPage = document.getElementById("legsPage") as HTMLElement;
const historyPage = document.getElementById("historyPage") as HTMLElement;
const customWorkoutPage = document.getElementById("customWorkoutPage") as HTMLElement;
const customWorkoutTrainingPage = document.getElementById("customWorkoutTrainingPage") as HTMLElement;

const choosePushButton = document.getElementById("choosePushButton") as HTMLButtonElement;
const choosePullButton = document.getElementById("choosePullButton") as HTMLButtonElement;
const chooseLegsButton = document.getElementById("chooseLegsButton") as HTMLButtonElement;
const historyButton = document.getElementById("chooseHistoryButton") as HTMLButtonElement;
const customWorkoutButton = document.getElementById("customWorkoutButton") as HTMLButtonElement;

const backFromPushButton = document.getElementById("backFromPushButton") as HTMLButtonElement;
const backFromPullButton = document.getElementById("backFromPullButton") as HTMLButtonElement;
const backFromLegsButton = document.getElementById("backFromLegsButton") as HTMLButtonElement;
const backFromHistoryButton = document.getElementById("backFromHistoryButton") as HTMLButtonElement;        
const backFromCustomWorkoutButton = document.getElementById("backFromCustomWorkoutButton") as HTMLButtonElement;
const backFromCustomTrainingButton = document.getElementById("backFromCustomTrainingButton") as HTMLButtonElement;

let currentCustomWorkoutSessionId: string | null = null;
let currentCustomWorkoutId: string | null = null;

const finishCustomWorkoutButton = document.getElementById("finishCustomWorkoutButton") as HTMLButtonElement;

const customTrainingTitle = document.getElementById("customTrainingTitle") as HTMLHeadingElement;
const customTrainingExercises = document.getElementById("customTrainingExercises") as HTMLDivElement;

finishCustomWorkoutButton.addEventListener("click", async () => {

    if (!currentCustomWorkoutSessionId) {
        alert("Du har inga sparade set i detta pass ännu.");
        return;
    }

    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        alert("Du måste vara inloggad.");
        return;
    }

    const { data: completedSession, error } = await supabase
        .from("custom_workout_sessions")
        .update({ completed_at: new Date().toISOString() })
        .eq("id", currentCustomWorkoutSessionId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

    if (error || !completedSession) {
        console.error("Kunde inte avsluta eget träningspass:", error);
        alert("Kunde inte avsluta träningspasset.");
        return;
    }

    currentCustomWorkoutSessionId = null;
    currentCustomWorkoutId = null;

    await renderCustomWorkouts();
    showPage(customWorkoutPage);
});

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
    customWorkoutTrainingPage.classList.add("hidden");
    
    customWorkoutPage.style.display = "none";

    page.classList.remove("hidden");

    if (page === customWorkoutPage) {
        customWorkoutPage.style.display = "block";
    }
}

// =========================
// EGET TRÄNINGSPASS
// =========================

const addCustomExerciseButton =
    document.getElementById("addCustomExerciseButton") as HTMLButtonElement;

const customExercises =
    document.getElementById("customExercises") as HTMLDivElement;


// Lägg till en övning
addCustomExerciseButton.addEventListener("click", () => {

    const exerciseContainer = document.createElement("div");

    exerciseContainer.className = "custom-exercise";

    const exerciseInput = document.createElement("input");

    exerciseInput.type = "text";
    exerciseInput.placeholder = "Namn på övning";

    const removeButton = document.createElement("button");

    removeButton.textContent = "Ta bort";

    removeButton.addEventListener("click", () => {
        exerciseContainer.remove();
    });

    exerciseContainer.appendChild(exerciseInput);
    exerciseContainer.appendChild(removeButton);

    customExercises.appendChild(exerciseContainer);
});

// =========================
// SPARA EGET TRÄNINGSPASS
// =========================

const customWorkoutName =
    document.getElementById("customWorkoutName") as HTMLInputElement;

const saveCustomWorkoutButton =
    document.getElementById("saveCustomWorkoutButton") as HTMLButtonElement;


saveCustomWorkoutButton.addEventListener("click", async () => {

    const workoutName = customWorkoutName.value.trim();

    // Egna pass har ingen kategori som användaren behöver välja.
    // Värdet behålls för kompatibilitet med den befintliga databastabellen.
    const category = "Custom";

    if (!workoutName) {
        alert("Skriv ett namn på träningspasset.");
        return;
    }


    // Hämta alla övningar
    const exerciseInputs =
        customExercises.querySelectorAll("input");


    const exercises: string[] = [];

    for (const input of exerciseInputs) {

        const exerciseName = input.value.trim();

        if (exerciseName) {
            exercises.push(exerciseName);
        }
    }


    if (exercises.length === 0) {
        alert("Lägg till minst en övning.");
        return;
    }


    // Hämta inloggad användare
    const {
        data: { user }
    } = await supabase.auth.getUser();


    if (!user) {
        alert("Du måste vara inloggad.");
        return;
    }


    // Spara träningspasset i Supabase
    const { data, error } = await supabase
        .from("custom_workouts")
        .insert({
            user_id: user.id,
            name: workoutName,
            category: category,
            exercises: exercises
        })
        .select();


    if (error) {

        console.error(
            "Kunde inte spara träningspass:",
            error
        );

        alert("Kunde inte spara träningspasset.");

        return;
    }


    console.log(
        "Eget träningspass sparat:",
        data
    );


    await renderCustomWorkouts();

    // Rensa formuläret
    customWorkoutName.value = "";
    customExercises.innerHTML = "";
});

// =========================
// VISA EGNA TRÄNINGSPASS
// =========================

const savedCustomWorkouts =
    document.getElementById("savedCustomWorkouts") as HTMLDivElement;


async function renderCustomWorkouts(): Promise<void> {

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        return;
    }


    const { data, error } = await supabase
        .from("custom_workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });


    if (error) {

        console.error(
            "Kunde inte hämta egna träningspass:",
            error
        );

        return;
    }


    savedCustomWorkouts.innerHTML = "";


    for (const workout of data) {

        const workoutItem =
            document.createElement("div");

        workoutItem.className =
            "saved-custom-workout";

        const openButton =
            document.createElement("button");

        openButton.textContent = workout.name;

        openButton.addEventListener("click", () => {

            openCustomWorkout(workout);

        });

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-custom-workout";
        deleteButton.textContent = "Radera";

        deleteButton.addEventListener("click", async () => {
            if (!window.confirm(
                `Vill du radera träningspasset \"${workout.name}\" och all dess historik?`
            )) {
                return;
            }

            const wasDeleted = await deleteCustomWorkout(workout.id);

            if (wasDeleted) {
                await renderCustomWorkouts();
            }
        });

        workoutItem.append(openButton, deleteButton);
        savedCustomWorkouts.appendChild(workoutItem);
    }
}

async function deleteCustomWorkout(workoutId: any): Promise<boolean> {
    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        alert("Du måste vara inloggad.");
        return false;
    }

    const { data: sessions, error: sessionsError } = await supabase
        .from("custom_workout_sessions")
        .select("id")
        .eq("custom_workout_id", workoutId)
        .eq("user_id", user.id);

    if (sessionsError) {
        console.error("Kunde inte hämta passets sessioner:", sessionsError);
        alert("Kunde inte radera träningspasset.");
        return false;
    }

    const sessionIds = (sessions || []).map((session: any) => session.id);

    if (sessionIds.length > 0) {
        const { error: exercisesError } = await supabase
            .from("custom_workout_exercises")
            .delete()
            .in("workout_id", sessionIds)
            .eq("user_id", user.id);

        if (exercisesError) {
            console.error("Kunde inte radera passets set:", exercisesError);
            alert("Kunde inte radera träningspasset.");
            return false;
        }

        const { error: deleteSessionsError } = await supabase
            .from("custom_workout_sessions")
            .delete()
            .in("id", sessionIds)
            .eq("user_id", user.id);

        if (deleteSessionsError) {
            console.error("Kunde inte radera passets sessioner:", deleteSessionsError);
            alert("Kunde inte radera träningspasset.");
            return false;
        }
    }

    const { data: deletedWorkout, error: deleteWorkoutError } = await supabase
        .from("custom_workouts")
        .delete()
        .eq("id", workoutId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

    if (deleteWorkoutError || !deletedWorkout) {
        console.error("Kunde inte radera träningspasset:", deleteWorkoutError);
        alert("Kunde inte radera träningspasset.");
        return false;
    }

    return true;
}

/* Öppna ett eget träningspass */
async function openCustomWorkout(workout: any): Promise<void> {
    showPage(customWorkoutTrainingPage);

    customTrainingTitle.textContent = workout.name;

    // Rensa gamla övningar
    customTrainingExercises.innerHTML = "";

    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        alert("Du måste vara inloggad.");
        return;
    }

    // Ingen session skapas när passet öppnas.
    // Den skapas först när första setet sparas.
    currentCustomWorkoutSessionId = null;
    currentCustomWorkoutId = workout.id;


    /* =========================================
       FÖRRA PASSET
       ========================================= */

    const previousWorkoutContainer =
        document.getElementById(
            "customPreviousWorkout"
        ) as HTMLDivElement;

    previousWorkoutContainer.innerHTML = "";


    // Hämta senaste avslutade sessionen
    const {
        data: completedPreviousSession,
        error: previousSessionError
    } = await supabase
        .from("custom_workout_sessions")
        .select("id, completed_at")
        .eq("custom_workout_id", workout.id)
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();


    if (previousSessionError) {
        console.error(
            "Kunde inte hämta förra passet:",
            previousSessionError
        );
    }


    // Äldre pass skapades innan completed_at sattes när användaren
    // avslutade passet. Om inget avslutat pass finns, visa därför det
    // senaste sparade passet i stället.
    let previousSession = completedPreviousSession;

    if (!previousSession && !previousSessionError) {
        const {
            data: latestSession,
            error: latestSessionError
        } = await supabase
            .from("custom_workout_sessions")
            .select("id")
            .eq("custom_workout_id", workout.id)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (latestSessionError) {
            console.error(
                "Kunde inte hämta senaste sparade passet:",
                latestSessionError
            );
        } else {
            previousSession = latestSession;
        }
    }

    let previousExercises: any[] = [];


    if (previousSession) {

        const {
            data: previousData,
            error: previousExercisesError
        } = await supabase
            .from("custom_workout_exercises")
            .select("*")
            .eq(
                "workout_id",
                previousSession.id
            )
            .order("position", {
                ascending: true
            });


        if (previousExercisesError) {

            console.error(
                "Kunde inte hämta övningar från förra passet:",
                previousExercisesError
            );

        } else {

            previousExercises =
                previousData || [];

        }
    }


    if (previousExercises.length === 0) {

        const noPreviousText =
            document.createElement("p");

        noPreviousText.textContent =
            "Inget tidigare pass sparat ännu.";

        previousWorkoutContainer.appendChild(
            noPreviousText
        );

    } else {

        for (
            const previousExercise
            of previousExercises
        ) {

            const entry =
                document.createElement("p");

            entry.textContent =
                `${previousExercise.exercise}: ` +
                `${previousExercise.weight} kg × ` +
                `${previousExercise.reps} reps`;

            previousWorkoutContainer.appendChild(
                entry
            );
        }
    }

    const showHistoryButton = document.createElement("button");
    showHistoryButton.type = "button";
    showHistoryButton.textContent = "Visa all historik";

    showHistoryButton.addEventListener("click", async () => {
        const allHistoryContainer = document.createElement("div");
        allHistoryContainer.className = "custom-workout-history";

        previousWorkoutContainer.appendChild(allHistoryContainer);
        showHistoryButton.remove();

        await renderAllCustomWorkoutHistory(
            workout.id,
            allHistoryContainer
        );
    });

    previousWorkoutContainer.appendChild(showHistoryButton);


    /* =========================================
       DAGENS SPARADE SET
       ========================================= */

    const todaySetsList =
        document.getElementById(
            "todayCustomSets"
        ) as HTMLDivElement;

    todaySetsList.innerHTML =
        "<p>Inga set sparade ännu.</p>";


    /*
     * Vi använder samma typ av sparad-rad
     * som resten av hemsidan.
     */
    const addTodaySet = (savedSet: any) => {

        // Om standardtexten finns kvar,
        // ta bort den först.
        const emptyText =
            todaySetsList.querySelector(
                ".empty-set-message"
            );

        if (emptyText) {
            emptyText.remove();
        }

        const entry =
            document.createElement("div");

        entry.className =
            "saved-set";

        const setText =
            document.createElement("p");

        const editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.textContent = "Ändra";

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Radera";

        const showSavedSet = () => {
            setText.textContent =
                `${savedSet.exercise}: ` +
                `${savedSet.weight} kg × ` +
                `${savedSet.reps} reps`;

            entry.replaceChildren(setText, editButton, deleteButton);
        };

        editButton.addEventListener("click", () => {
            const weightInput = document.createElement("input");
            weightInput.type = "number";
            weightInput.step = "0.5";
            weightInput.value = String(savedSet.weight);
            weightInput.setAttribute("aria-label", "Ny vikt i kilogram");

            const repsInput = document.createElement("input");
            repsInput.type = "number";
            repsInput.value = String(savedSet.reps);
            repsInput.setAttribute("aria-label", "Nytt antal reps");

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.textContent = "Spara ändring";

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.textContent = "Avbryt";

            cancelButton.addEventListener("click", showSavedSet);

            saveButton.addEventListener("click", async () => {
                const weight = Number(weightInput.value);
                const reps = Number(repsInput.value);

                if (weight < 0 || reps <= 0) {
                    alert("Vikt kan inte vara mindre än 0 och reps måste vara större än 0.");
                    return;
                }

                const { data: updatedSet, error } = await supabase
                    .from("custom_workout_exercises")
                    .update({ weight, reps })
                    .eq("id", savedSet.id)
                    .eq("user_id", user.id)
                    .select()
                    .single();

                if (error || !updatedSet) {
                    console.error("Kunde inte ändra set:", error);
                    alert("Kunde inte ändra setet.");
                    return;
                }

                savedSet = updatedSet;
                showSavedSet();
            });

            entry.replaceChildren(
                weightInput,
                repsInput,
                saveButton,
                cancelButton
            );
        });

        deleteButton.addEventListener("click", async () => {
            if (!window.confirm("Vill du radera det här setet?")) {
                return;
            }

            const { error } = await supabase
                .from("custom_workout_exercises")
                .delete()
                .eq("id", savedSet.id)
                .eq("user_id", user.id);

            if (error) {
                console.error("Kunde inte radera set:", error);
                alert("Kunde inte radera setet.");
                return;
            }

            entry.remove();

            if (!todaySetsList.querySelector(".saved-set")) {
                const emptyText = document.createElement("p");
                emptyText.className = "empty-set-message";
                emptyText.textContent = "Inga set sparade ännu.";
                todaySetsList.appendChild(emptyText);
            }
        });

        showSavedSet();

        todaySetsList.appendChild(entry);
    };


    // Byt ut standardtexten mot en klass
    // så att vi enkelt kan ta bort den.
    todaySetsList.innerHTML = "";

    const emptyText =
        document.createElement("p");

    emptyText.className =
        "empty-set-message";

    emptyText.textContent =
        "Inga set sparade ännu.";

    todaySetsList.appendChild(
        emptyText
    );


    /* =========================================
       DAGENS ÖVNINGAR
       ========================================= */

    for (
        let i = 0;
        i < workout.exercises.length;
        i++
    ) {

        const exercise =
            workout.exercises[i];


        const exerciseContainer =
            document.createElement("div");

        exerciseContainer.className =
            "exercise";


        const title =
            document.createElement("h3");

        title.textContent =
            exercise;


        const weightLabel =
            document.createElement("label");

        weightLabel.textContent =
            "Vikt (kg):";


        const weightInput =
            document.createElement("input");

        weightInput.type =
            "number";

        weightInput.step =
            "0.5";

        weightInput.placeholder =
            "Vikt";


        const repsLabel =
            document.createElement("label");

        repsLabel.textContent =
            "Reps:";


        const repsInput =
            document.createElement("input");

        repsInput.type =
            "number";

        repsInput.placeholder =
            "Reps";


        const saveSetButton =
            document.createElement("button");

        saveSetButton.textContent =
            "Spara set";


        /* =====================================
           SPARA SET
           ===================================== */

        saveSetButton.addEventListener(
            "click",
            async () => {

                if (!currentCustomWorkoutId) {

                    alert(
                        "Inget aktivt träningspass."
                    );

                    return;
                }


                if (
                    !weightInput.value ||
                    !repsInput.value
                ) {

                    alert(
                        "Fyll i vikt och reps."
                    );

                    return;
                }


                const weight =
                    Number(
                        weightInput.value
                    );

                const reps =
                    Number(
                        repsInput.value
                    );


                if (
                    weight < 0 ||
                    reps <= 0
                ) {

                    alert(
                        "Vikt kan inte vara mindre än 0 och reps måste vara större än 0."
                    );

                    return;
                }


                /* =================================
                   SKAPA SESSION VID FÖRSTA SETET
                   ================================= */

                if (
                    !currentCustomWorkoutSessionId
                ) {

                    const {
                        data: session,
                        error: sessionError
                    } = await supabase
                        .from(
                            "custom_workout_sessions"
                        )
                        .insert({
                            custom_workout_id:
                                currentCustomWorkoutId,

                            user_id:
                                user.id
                        })
                        .select()
                        .single();


                    if (
                        sessionError ||
                        !session
                    ) {

                        console.error(
                            "Kunde inte skapa träningssession:",
                            sessionError
                        );

                        alert(
                            "Kunde inte starta träningspasset."
                        );

                        return;
                    }


                    currentCustomWorkoutSessionId =
                        session.id;
                }


                /* =================================
                   SPARA SETET
                   ================================= */

                const {
                    data: savedSet,
                    error: saveError
                } = await supabase
                    .from(
                        "custom_workout_exercises"
                    )
                    .insert({
                        workout_id:
                            currentCustomWorkoutSessionId,

                        exercise:
                            exercise,

                        position:
                            i + 1,

                        user_id:
                            user.id,

                        weight:
                            weight,

                        reps:
                            reps
                    })
                    .select()
                    .single();


                if (saveError) {

                    console.error(
                        "Kunde inte spara set:",
                        JSON.stringify(
                            saveError,
                            null,
                            2
                        )
                    );

                    alert(
                        "Kunde inte spara setet."
                    );

                    return;
                }


                /* =================================
                   VISA SETET UNDER
                   "DAGENS SPARADE SET"
                   ================================= */

                const emptyMessage =
                    todaySetsList.querySelector(
                        ".empty-set-message"
                    );

                if (emptyMessage) {
                    emptyMessage.remove();
                }


                addTodaySet(savedSet);


                console.log(
                    "Set sparat:",
                    savedSet
                );
            }
        );


        /* =================================
           BYGG ÖVNINGEN
           ================================= */

        exerciseContainer.appendChild(
            title
        );

        exerciseContainer.appendChild(
            weightLabel
        );

        exerciseContainer.appendChild(
            weightInput
        );

        exerciseContainer.appendChild(
            repsLabel
        );

        exerciseContainer.appendChild(
            repsInput
        );

        exerciseContainer.appendChild(
            saveSetButton
        );


        customTrainingExercises.appendChild(
            exerciseContainer
        );
    }
}


async function renderAllCustomWorkoutHistory(
    customWorkoutId: any,
    container: HTMLElement
): Promise<void> {
    container.innerHTML = "";

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        container.textContent = "Du måste vara inloggad för att se historiken.";
        return;
    }

    const { data: sessions, error: sessionsError } = await supabase
        .from("custom_workout_sessions")
        .select("id, created_at, completed_at")
        .eq("custom_workout_id", customWorkoutId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (sessionsError) {
        console.error("Kunde inte hämta passets historik:", sessionsError);
        container.textContent = "Kunde inte hämta historiken.";
        return;
    }

    if (!sessions || sessions.length === 0) {
        container.textContent = "Ingen historik sparad ännu.";
        return;
    }

    const historyTitle = document.createElement("h3");
    historyTitle.textContent = "All historik";
    container.appendChild(historyTitle);

    for (const session of sessions) {
        const sessionDate = document.createElement("h4");
        const timestamp = session.completed_at || session.created_at;
        sessionDate.textContent = new Date(timestamp).toLocaleDateString("sv-SE");
        container.appendChild(sessionDate);

        const { data: exercises, error: exercisesError } = await supabase
            .from("custom_workout_exercises")
            .select("exercise, weight, reps, position")
            .eq("workout_id", session.id)
            .eq("user_id", user.id)
            .order("position", { ascending: true });

        if (exercisesError) {
            console.error("Kunde inte hämta set från historiken:", exercisesError);
            continue;
        }

        for (const exercise of exercises || []) {
            const entry = document.createElement("p");
            entry.textContent =
                `${exercise.exercise}: ${exercise.weight} kg × ${exercise.reps} reps`;
            container.appendChild(entry);
        }
    }
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

    const showHistoryButton = document.createElement("button");
    showHistoryButton.type = "button";
    showHistoryButton.textContent = "Visa all historik";

    showHistoryButton.addEventListener("click", async () => {
        await renderAllWorkoutHistory(
            category,
            previousWorkoutElement
        );
    });

    previousWorkoutElement.appendChild(showHistoryButton);
}

async function renderAllWorkoutHistory(
    category: string,
    container: HTMLElement
): Promise<void> {
    const workouts = await getWorkoutsFromSupabase();
    const categoryWorkouts = workouts.filter(
        workout => workout.category === category
    );

    container.innerHTML = "";

    if (categoryWorkouts.length === 0) {
        container.innerHTML = "<p>Ingen historik sparad ännu.</p>";
        return;
    }

    const workoutsByDate = new Map<string, any[]>();

    for (const workout of categoryWorkouts) {
        const workoutsForDate = workoutsByDate.get(workout.date) || [];
        workoutsForDate.push(workout);
        workoutsByDate.set(workout.date, workoutsForDate);
    }

    for (const [date, workoutsForDate] of workoutsByDate) {
        const sessionTitle = document.createElement("h3");
        sessionTitle.textContent = date;
        container.appendChild(sessionTitle);

        for (const workout of workoutsForDate) {
            const entry = document.createElement("p");
            entry.textContent =
                `${workout.exercise}: ${workout.weight} kg × ${workout.reps} reps`;
            container.appendChild(entry);
        }
    }

    const showPreviousButton = document.createElement("button");
    showPreviousButton.type = "button";
    showPreviousButton.textContent = "Visa endast förra passet";

    showPreviousButton.addEventListener("click", async () => {
        await renderPreviousWorkout(category);
    });

    container.appendChild(showPreviousButton);
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

        const entry = document.createElement("div");
        entry.className = "saved-set";

        const setText = document.createElement("p");
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.textContent = "Ändra";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Radera";

        const showSavedSet = () => {
            setText.textContent =
                `${workout.exercise}: ${workout.weight} kg × ${workout.reps} reps`;

            entry.replaceChildren(setText, editButton, deleteButton);
        };

        editButton.addEventListener("click", () => {
            const weightInput = document.createElement("input");
            weightInput.type = "number";
            weightInput.step = "0.5";
            weightInput.value = String(workout.weight);
            weightInput.setAttribute("aria-label", "Ny vikt i kilogram");

            const repsInput = document.createElement("input");
            repsInput.type = "number";
            repsInput.value = String(workout.reps);
            repsInput.setAttribute("aria-label", "Nytt antal reps");

            const saveButton = document.createElement("button");
            saveButton.type = "button";
            saveButton.textContent = "Spara ändring";

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.textContent = "Avbryt";

            cancelButton.addEventListener("click", showSavedSet);

            saveButton.addEventListener("click", async () => {
                const weight = Number(weightInput.value);
                const reps = Number(repsInput.value);

                if (weight < 0 || reps <= 0) {
                    alert("Vikt kan inte vara mindre än 0 och reps måste vara större än 0.");
                    return;
                }

                const updatedWorkout = await updateActiveWorkoutSet(
                    workout,
                    weight,
                    reps
                );

                if (!updatedWorkout) {
                    return;
                }

                workout.weight = updatedWorkout.weight;
                workout.reps = updatedWorkout.reps;
                showSavedSet();
            });

            entry.replaceChildren(
                weightInput,
                repsInput,
                saveButton,
                cancelButton
            );
        });

        deleteButton.addEventListener("click", async () => {
            if (!window.confirm("Vill du radera det här setet?")) {
                return;
            }

            const wasDeleted = await deleteActiveWorkoutSet(workout);

            if (wasDeleted) {
                renderActiveWorkout(category);
            }
        });

        showSavedSet();
        element.appendChild(entry);
    }
}


// =========================
// SPARA SET
// =========================

function getActiveWorkout() {
    return JSON.parse(
        localStorage.getItem("activeWorkout") || "null"
    );
}

async function updateActiveWorkoutSet(
    workout: any,
    weight: number,
    reps: number
): Promise<any | null> {
    if (!workout.databaseId) {
        alert("Det här setet skapades innan ändra-funktionen lades till och kan inte ändras.");
        return null;
    }

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        alert("Du måste vara inloggad.");
        return null;
    }

    const { data, error } = await supabase
        .from("workouts")
        .update({ weight, reps })
        .eq("id", workout.databaseId)
        .eq("user_id", user.id)
        .select()
        .maybeSingle();

    if (error || !data) {
        console.error("Kunde inte ändra set:", error);
        alert("Kunde inte ändra setet.");
        return null;
    }

    const activeWorkout = getActiveWorkout();
    const savedWorkout = activeWorkout?.workouts.find(
        (item: any) => item.id === workout.id
    );

    if (savedWorkout) {
        savedWorkout.weight = data.weight;
        savedWorkout.reps = data.reps;
        localStorage.setItem("activeWorkout", JSON.stringify(activeWorkout));
    }

    return data;
}

async function deleteActiveWorkoutSet(
    workout: any
): Promise<boolean> {
    if (!workout.databaseId) {
        alert("Det här setet skapades innan radera-funktionen lades till och kan inte raderas.");
        return false;
    }

    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
        alert("Du måste vara inloggad.");
        return false;
    }

    const { data, error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workout.databaseId)
        .eq("user_id", user.id)
        .select("id")
        .maybeSingle();

    if (error || !data) {
        console.error("Kunde inte radera set:", error);
        alert("Kunde inte radera setet.");
        return false;
    }

    const activeWorkout = getActiveWorkout();

    if (activeWorkout) {
        activeWorkout.workouts = activeWorkout.workouts.filter(
            (item: any) => item.id !== workout.id
        );

        localStorage.setItem("activeWorkout", JSON.stringify(activeWorkout));
    }

    return true;
}

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


    // Spara setet i Supabase först så att den lokala raden kan kopplas
    // till rätt databasrad när användaren vill ändra den.
    const savedWorkout = await saveWorkoutToSupabase(
        category,
        exercise,
        Number(weight),
        Number(reps)
    );

    if (!savedWorkout) {
        return;
    }

    const workout = {

        id: Date.now().toString(),

        sessionId: activeWorkout.sessionId,

        category: category,

        exercise: exercise,

        weight: weight,

        reps: reps,

        date: activeWorkout.date,

        databaseId: savedWorkout.id
    };


    // Lägg till setet i det pågående passet
    activeWorkout.workouts.push(workout);


    // Spara det pågående passet lokalt
    localStorage.setItem(
        "activeWorkout",
        JSON.stringify(activeWorkout)
    );
    // Visa dagens pass
    renderActiveWorkout(category);
}

async function saveCustomWorkoutEntry(
    customWorkoutId: number,
    exercise: string,
    weight: number,
    reps: number
): Promise<void> {

    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Ingen inloggad användare:", userError);
        alert("Du måste vara inloggad.");
        return;
    }

    console.log("SAVE CUSTOM WORKOUT:", {
        customWorkoutId,
        exercise,
        weight,
        reps,
        userId: user.id
    });

    const { data, error } = await supabase
        .from("custom_workout_exercises")
        .insert({
            workout_id: customWorkoutId,
            user_id: user.id,
            exercise: exercise,
            weight: weight,
            reps: reps,
            position: 1
        })
        .select()
        .single();

    if (error) {
        console.error(
            "Kunde inte spara eget träningspass:",
            JSON.stringify(error, null, 2)
        );
        alert("Kunde inte spara träningspasset.");
        return;
    }

    console.log("Övning sparad:", data);

    await renderCustomWorkouts();
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
    return null;
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
    .select()
    .single();

  if (error) {
    console.error("Kunde inte spara träningspass:", error);
    return null;
  }

  console.log("Träningspass sparat i Supabase:", data);
  return data;
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

    // Hämta vanliga workouts
    const { data: workouts, error: workoutError } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (workoutError) {
        console.error(
            "Kunde inte hämta träningshistorik:",
            workoutError
        );
        return [];
    }

    // Hämta custom-övningar + information om vilket custom-pass de tillhör
    const { data: customExercises, error: customError } = await supabase
        .from("custom_workout_exercises")
        .select(`
            *,
            custom_workouts (
                name,
                category
            )
        `)
        .eq("user_id", user.id);

    if (customError) {
        console.error(
            "Kunde inte hämta custom-övningar:",
            customError
        );
    }

    // Gör custom-övningarna till samma format som vanliga workouts
    const formattedCustomExercises = (customExercises || []).map(
        (customExercise: any) => {

            const customWorkout =
                customExercise.custom_workouts;

            return {
                id: `custom-${customExercise.id}`,
                category: customWorkout?.category,
                exercise: customExercise.exercise,
                weight: customExercise.weight,
                reps: customExercise.reps,
                date: new Date(
                    customExercise.created_at
                ).toLocaleDateString("sv-SE"),
                created_at: customExercise.created_at
            };
        }
    );

    // Kombinera vanliga och custom workouts
    const allWorkouts = [
        ...(workouts || []),
        ...formattedCustomExercises
    ];

    // Nyast först
    allWorkouts.sort(
        (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
    );

    console.log(
        "All träningshistorik från Supabase:",
        allWorkouts
    );

    return allWorkouts;
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

customWorkoutButton.addEventListener("click", () => {
    showPage(customWorkoutPage);
});

backFromCustomWorkoutButton.addEventListener("click", () => {
    showPage(homePage);
});

backFromCustomTrainingButton.addEventListener("click", () => {
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

        loginPage.classList.add("hidden");

        showPage(homePage);

        await renderCustomWorkouts();

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



