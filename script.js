/* =========================================================
   KEEPSAKE — JAVASCRIPT
   V1
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "keepsake_people";


/* =========================================================
   STATE
   ========================================================= */

let people = loadPeople();

let selectedPersonId = null;

let editingPersonId = null;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

// Main
const peopleGrid = document.getElementById("peopleGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const memoryList = document.getElementById("memoryList");

// Buttons
const addPersonButton = document.getElementById("addPersonButton");
const emptyAddButton = document.getElementById("emptyAddButton");
const settingsButton = document.getElementById("settingsButton");
const viewAllButton = document.getElementById("viewAllButton");
const memoriesButton = document.getElementById("memoriesButton");

// Add person modal
const personModal = document.getElementById("personModal");
const closeModalButton = document.getElementById("closeModalButton");
const personForm = document.getElementById("personForm");

// Profile modal
const profileModal = document.getElementById("profileModal");
const closeProfileButton = document.getElementById("closeProfileButton");
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileBirthday = document.getElementById("profileBirthday");
const profileDetails = document.getElementById("profileDetails");

const editPersonButton = document.getElementById("editPersonButton");
const deletePersonButton = document.getElementById("deletePersonButton");

// Settings modal
const settingsModal = document.getElementById("settingsModal");
const closeSettingsButton =
    document.getElementById("closeSettingsButton");

const clearDataButton =
    document.getElementById("clearDataButton");

// Color
const favoriteColor =
    document.getElementById("favoriteColor");

const colorValue =
    document.getElementById("colorValue");


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    renderPeople();

    renderMemories();

    updateColorValue();

});


/* =========================================================
   STORAGE FUNCTIONS
   ========================================================= */

function loadPeople() {

    try {

        const savedPeople =
            localStorage.getItem(STORAGE_KEY);

        if (!savedPeople) {
            return [];
        }

        return JSON.parse(savedPeople);

    } catch (error) {

        console.error(
            "Could not load Keepsake data:",
            error
        );

        return [];
    }
}


function savePeople() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(people)
        );

    } catch (error) {

        console.error(
            "Could not save Keepsake data:",
            error
        );
    }
}


/* =========================================================
   ID GENERATOR
   ========================================================= */

function createId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );
}


/* =========================================================
   RENDER PEOPLE
   ========================================================= */

function renderPeople(searchTerm = "") {

    peopleGrid.innerHTML = "";

    const normalizedSearch =
        searchTerm.trim().toLowerCase();

    const filteredPeople =
        people.filter(person => {

            const searchableText = [
                person.name,
                person.favoriteFood,
                person.favoriteSong,
                person.hobbies,
                person.likes,
                person.dislikes,
                person.notes
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                normalizedSearch
            );
        });


    /* ---------------------------------------------
       EMPTY STATE
       --------------------------------------------- */

    if (people.length === 0) {

        peopleGrid.style.display = "none";

        emptyState.style.display = "block";

        return;
    }


    /* ---------------------------------------------
       SEARCH WITH NO RESULTS
       --------------------------------------------- */

    if (filteredPeople.length === 0) {

        peopleGrid.style.display = "none";

        emptyState.style.display = "block";

        emptyState.innerHTML = `
            <div class="empty-icon">⌕</div>

            <h3>No one found</h3>

            <p>
                Try searching with another name
                or something you remember about them.
            </p>
        `;

        return;
    }


    /* ---------------------------------------------
       SHOW PEOPLE
       --------------------------------------------- */

    peopleGrid.style.display = "grid";

    emptyState.style.display = "none";


    filteredPeople.forEach(person => {

        const card =
            createPersonCard(person);

        peopleGrid.appendChild(card);

    });
}


/* =========================================================
   PERSON CARD
   ========================================================= */

function createPersonCard(person) {

    const button =
        document.createElement("button");

    button.className = "person-card";

    button.type = "button";

    button.innerHTML = `

        <div
            class="person-avatar"
            style="
                background:
                ${hexToRgba(
                    person.favoriteColor || "#6C63FF",
                    0.12
                )};

                color:
                ${person.favoriteColor || "#6C63FF"};
            "
        >
            ${getInitials(person.name)}
        </div>

        <div class="person-info">

            <h3>
                ${escapeHTML(person.name)}
            </h3>

            <p>
                ${getPersonSubtitle(person)}
            </p>

        </div>

        <span class="person-arrow">
            ›
        </span>
    `;


    button.addEventListener(
        "click",
        () => openProfile(person.id)
    );


    return button;
}


/* =========================================================
   PERSON SUBTITLE
   ========================================================= */

function getPersonSubtitle(person) {

    if (person.birthday) {

        return `Birthday · ${formatBirthday(
            person.birthday
        )}`;

    }

    if (person.favoriteColor) {

        return `Favorite color · ${person.favoriteColor}`;

    }

    if (person.hobbies) {

        return person.hobbies;

    }

    return "A little collection of memories";
}


/* =========================================================
   ADD PERSON
   ========================================================= */

function addPerson(formData) {

    const newPerson = {

        id: createId(),

        name: formData.name,

        birthday: formData.birthday,

        favoriteColor:
            formData.favoriteColor,

        favoriteFood:
            formData.favoriteFood,

        favoriteSong:
            formData.favoriteSong,

        hobbies:
            formData.hobbies,

        likes:
            formData.likes,

        dislikes:
            formData.dislikes,

        notes:
            formData.notes,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        memories: []

    };


    people.unshift(newPerson);

    savePeople();

    renderPeople();

    renderMemories();

    closePersonModal();

    personForm.reset();

    favoriteColor.value = "#6C63FF";

    updateColorValue();

}


/* =========================================================
   EDIT PERSON
   ========================================================= */

function editPerson(personId) {

    const person =
        people.find(
            item => item.id === personId
        );

    if (!person) {
        return;
    }


    editingPersonId = personId;


    /* ---------------------------------------------
       Fill form
       --------------------------------------------- */

    document.getElementById(
        "personName"
    ).value = person.name || "";

    document.getElementById(
        "personBirthday"
    ).value = person.birthday || "";

    document.getElementById(
        "favoriteColor"
    ).value =
        person.favoriteColor || "#6C63FF";

    document.getElementById(
        "favoriteFood"
    ).value =
        person.favoriteFood || "";

    document.getElementById(
        "favoriteSong"
    ).value =
        person.favoriteSong || "";

    document.getElementById(
        "hobbies"
    ).value =
        person.hobbies || "";

    document.getElementById(
        "likes"
    ).value =
        person.likes || "";

    document.getElementById(
        "dislikes"
    ).value =
        person.dislikes || "";

    document.getElementById(
        "notes"
    ).value =
        person.notes || "";


    updateColorValue();


    /* ---------------------------------------------
       Change button text
       --------------------------------------------- */

    const submitButton =
        personForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.textContent =
        "Update keepsake";


    openPersonModal();

}


/* =========================================================
   UPDATE PERSON
   ========================================================= */

function updatePerson(formData) {

    const person =
        people.find(
            item => item.id === editingPersonId
        );

    if (!person) {
        return;
    }


    person.name =
        formData.name;

    person.birthday =
        formData.birthday;

    person.favoriteColor =
        formData.favoriteColor;

    person.favoriteFood =
        formData.favoriteFood;

    person.favoriteSong =
        formData.favoriteSong;

    person.hobbies =
        formData.hobbies;

    person.likes =
        formData.likes;

    person.dislikes =
        formData.dislikes;

    person.notes =
        formData.notes;

    person.updatedAt =
        new Date().toISOString();


    savePeople();

    renderPeople(
        searchInput.value
    );

    renderMemories();

    closePersonModal();

    closeProfileModal();

    personForm.reset();

    editingPersonId = null;


    const submitButton =
        personForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.textContent =
        "Save keepsake";

}


/* =========================================================
   DELETE PERSON
   ========================================================= */

function deletePerson(personId) {

    const person =
        people.find(
            item => item.id === personId
        );

    if (!person) {
        return;
    }


    const confirmed =
        confirm(
            `Delete ${person.name} from Keepsake?`
        );


    if (!confirmed) {
        return;
    }


    people =
        people.filter(
            item => item.id !== personId
        );


    savePeople();

    renderPeople(
        searchInput.value
    );

    renderMemories();

    closeProfileModal();

}


/* =========================================================
   OPEN PROFILE
   ========================================================= */

function openProfile(personId) {

    const person =
        people.find(
            item => item.id === personId
        );

    if (!person) {
        return;
    }


    selectedPersonId = personId;


    profileAvatar.textContent =
        getInitials(person.name);


    profileAvatar.style.background =
        hexToRgba(
            person.favoriteColor || "#6C63FF",
            0.12
        );


    profileAvatar.style.color =
        person.favoriteColor || "#6C63FF";


    profileName.textContent =
        person.name;


    profileBirthday.textContent =
        person.birthday
            ? `Birthday · ${formatBirthday(
                person.birthday
            )}`
            : "No birthday saved";


    renderProfileDetails(person);


    profileModal.classList.remove(
        "hidden"
    );

    profileModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   PROFILE DETAILS
   ========================================================= */

function renderProfileDetails(person) {

    profileDetails.innerHTML = "";


    const details = [

        {
            label: "Favorite color",
            value: person.favoriteColor
        },

        {
            label: "Favorite food",
            value: person.favoriteFood
        },

        {
            label: "Favorite song",
            value: person.favoriteSong
        },

        {
            label: "Hobbies",
            value: person.hobbies
        },

        {
            label: "Things they like",
            value: person.likes
        },

        {
            label: "Things they don't like",
            value: person.dislikes
        },

        {
            label: "Personal notes",
            value: person.notes
        }

    ];


    details.forEach(detail => {

        if (!detail.value) {
            return;
        }


        const card =
            document.createElement("div");

        card.className =
            "detail-card";


        card.innerHTML = `

            <div class="detail-label">
                ${detail.label}
            </div>

            <div class="detail-value">
                ${escapeHTML(detail.value)}
            </div>

        `;


        profileDetails.appendChild(card);

    });


    if (
        profileDetails.children.length === 0
    ) {

        profileDetails.innerHTML = `

            <div class="detail-card">

                <div class="detail-value">
                    Nothing else saved yet.
                </div>

            </div>

        `;
    }
}


/* =========================================================
   MEMORIES
   ========================================================= */

function renderMemories() {

    memoryList.innerHTML = "";


    const memories = [];


    people.forEach(person => {

        if (
            person.createdAt
        ) {

            memories.push({

                type: "created",

                personName:
                    person.name,

                date:
                    person.createdAt,

                text:
                    `You added ${person.name} to Keepsake.`

            });

        }


        if (
            person.updatedAt &&
            person.updatedAt !== person.createdAt
        ) {

            memories.push({

                type: "updated",

                personName:
                    person.name,

                date:
                    person.updatedAt,

                text:
                    `You updated ${person.name}'s keepsake.`

            });

        }


        if (
            person.memories &&
            person.memories.length
        ) {

            person.memories.forEach(memory => {

                memories.push({

                    type: "memory",

                    personName:
                        person.name,

                    date:
                        memory.date,

                    text:
                        memory.text

                });

            });

        }

    });


    memories.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    const latest =
        memories.slice(0, 5);


    if (latest.length === 0) {

        memoryList.innerHTML = `

            <div class="memory-card">

                <p>
                    Your little moments will
                    appear here.
                </p>

            </div>

        `;

        return;
    }


    latest.forEach(memory => {

        const card =
            document.createElement("div");

        card.className =
            "memory-card";


        card.innerHTML = `

            <div class="memory-date">
                ${formatRelativeDate(
                    memory.date
                )}
            </div>

            <p>
                ${escapeHTML(memory.text)}
            </p>

        `;


        memoryList.appendChild(card);

    });

}


/* =========================================================
   MODALS
   ========================================================= */

function openPersonModal() {

    personModal.classList.remove(
        "hidden"
    );

    personModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


function closePersonModal() {

    personModal.classList.add(
        "hidden"
    );

    personModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

    editingPersonId = null;


    const submitButton =
        personForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.textContent =
        "Save keepsake";

}


function openProfileModal() {

    profileModal.classList.remove(
        "hidden"
    );

    profileModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


function closeProfileModal() {

    profileModal.classList.add(
        "hidden"
    );

    profileModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

    selectedPersonId = null;

}


function openSettingsModal() {

    settingsModal.classList.remove(
        "hidden"
    );

    settingsModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


function closeSettingsModal() {

    settingsModal.classList.add(
        "hidden"
    );

    settingsModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


/* =========================================================
   FORM SUBMISSION
   ========================================================= */

personForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const formData =
            new FormData(personForm);


        const data = {

            name:
                formData.get("name")
                    .trim(),

            birthday:
                formData.get("birthday"),

            favoriteColor:
                formData.get(
                    "favoriteColor"
                ),

            favoriteFood:
                formData.get(
                    "favoriteFood"
                ).trim(),

            favoriteSong:
                formData.get(
                    "favoriteSong"
                ).trim(),

            hobbies:
                formData.get(
                    "hobbies"
                ).trim(),

            likes:
                formData.get(
                    "likes"
                ).trim(),

            dislikes:
                formData.get(
                    "dislikes"
                ).trim(),

            notes:
                formData.get(
                    "notes"
                ).trim()

        };


        if (!data.name) {
            return;
        }


        if (editingPersonId) {

            updatePerson(data);

        } else {

            addPerson(data);

        }

    }
);


/* =========================================================
   SEARCH
   ========================================================= */

searchInput.addEventListener(
    "input",
    () => {

        renderPeople(
            searchInput.value
        );

    }
);


/* =========================================================
   COLOR PICKER
   ========================================================= */

favoriteColor.addEventListener(
    "input",
    updateColorValue
);


function updateColorValue() {

    colorValue.textContent =
        favoriteColor.value.toUpperCase();

}


/* =========================================================
   ADD BUTTONS
   ========================================================= */

addPersonButton.addEventListener(
    "click",
    () => {

        personForm.reset();

        favoriteColor.value =
            "#6C63FF";

        updateColorValue();

        openPersonModal();

    }
);


emptyAddButton.addEventListener(
    "click",
    () => {

        personForm.reset();

        favoriteColor.value =
            "#6C63FF";

        updateColorValue();

        openPersonModal();

    }
);


/* =========================================================
   PROFILE ACTIONS
   ========================================================= */

editPersonButton.addEventListener(
    "click",
    () => {

        if (!selectedPersonId) {
            return;
        }

        const id =
            selectedPersonId;

        closeProfileModal();

        editPerson(id);

    }
);


deletePersonButton.addEventListener(
    "click",
    () => {

        if (!selectedPersonId) {
            return;
        }

        deletePerson(
            selectedPersonId
        );

    }
);


/* =========================================================
   CLOSE BUTTONS
   ========================================================= */

closeModalButton.addEventListener(
    "click",
    closePersonModal
);


closeProfileButton.addEventListener(
    "click",
    closeProfileModal
);


closeSettingsButton.addEventListener(
    "click",
    closeSettingsModal
);


/* =========================================================
   SETTINGS
   ========================================================= */

settingsButton.addEventListener(
    "click",
    openSettingsModal
);


clearDataButton.addEventListener(
    "click",
    () => {

        if (people.length === 0) {
            return;
        }


        const confirmed =
            confirm(
                "Delete every person and memory from this device?"
            );


        if (!confirmed) {
            return;
        }


        people = [];


        savePeople();

        renderPeople();

        renderMemories();

        closeSettingsModal();

    }
);


/* =========================================================
   MODAL BACKDROPS
   ========================================================= */

document.querySelectorAll(
    ".modal-backdrop"
).forEach(backdrop => {

    backdrop.addEventListener(
        "click",
        () => {

            const modal =
                backdrop.closest(
                    ".modal"
                );


            if (
                modal === personModal
            ) {

                closePersonModal();

            }

            if (
                modal === profileModal
            ) {

                closeProfileModal();

            }

            if (
                modal === settingsModal
            ) {

                closeSettingsModal();

            }

        }
    );

});


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }


        closePersonModal();

        closeProfileModal();

        closeSettingsModal();

    }
);


/* =========================================================
   NAVIGATION
   ========================================================= */

document.querySelectorAll(
    ".nav-item"
).forEach(item => {

    item.addEventListener(
        "click",
        () => {

            document.querySelectorAll(
                ".nav-item"
            ).forEach(nav => {

                nav.classList.remove(
                    "active"
                );

            });


            item.classList.add(
                "active"
            );


            const page =
                item.dataset.page;


            if (page === "people") {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }


            if (
                page === "memories"
            ) {

                document
                    .querySelector(
                        ".memories-section"
                    )
                    ?.scrollIntoView({
                        behavior: "smooth"
                    });

            }


            if (
                page === "favorites"
            ) {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                renderPeople(
                    searchInput.value
                );

            }

        }
    );

});


/* =========================================================
   VIEW ALL
   ========================================================= */

viewAllButton.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        renderPeople();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   MEMORIES BUTTON
   ========================================================= */

memoriesButton.addEventListener(
    "click",
    () => {

        document
            .querySelector(
                ".memories-section"
            )
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }
);


/* =========================================================
   HELPER — INITIALS
   ========================================================= */

function getInitials(name) {

    if (!name) {
        return "?";
    }


    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   HELPER — BIRTHDAY
   ========================================================= */

function formatBirthday(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return dateString;
    }


    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================================
   HELPER — RELATIVE DATE
   ========================================================= */

function formatRelativeDate(dateString) {

    const date =
        new Date(dateString);

    const now =
        new Date();


    const difference =
        now.getTime() -
        date.getTime();


    const seconds =
        Math.floor(
            difference / 1000
        );


    if (seconds < 60) {
        return "Just now";
    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    if (minutes < 60) {

        return `${minutes}m ago`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return `${hours}h ago`;

    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days < 7) {

        return `${days}d ago`;

    }


    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================================
   HELPER — COLOR
   ========================================================= */

function hexToRgba(
    hex,
    alpha
) {

    const cleanHex =
        hex.replace(
            "#",
            ""
        );


    if (
        cleanHex.length !== 6
    ) {
        return `rgba(108, 99, 255, ${alpha})`;
    }


    const r =
        parseInt(
            cleanHex.substring(0, 2),
            16
        );

    const g =
        parseInt(
            cleanHex.substring(2, 4),
            16
        );

    const b =
        parseInt(
            cleanHex.substring(4, 6),
            16
        );


    return `
        rgba(
            ${r},
            ${g},
            ${b},
            ${alpha}
        )
    `;
}


/* =========================================================
   SECURITY HELPER
   ========================================================= */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}