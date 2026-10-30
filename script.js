
const url = "./universities.json";

// HTML elements
const list = document.getElementById("universities-list");
const result = document.getElementById("result-count");
const btn = document.getElementById("search-btn");
const countryFilter = document.getElementById("country-filter");
const searchInput = document.getElementById("university-search");
const sortFilter = document.getElementById("sort-filter");
const clearBtn = document.getElementById("clear-search");
const loading = document.getElementById("loading");
const themeToggle = document.getElementById("theme-toggle");
const favList = document.getElementById("favorites-list");
const favCount = document.getElementById("favorites-count");

// App data
let allUniversities = [];
let favorites = [];

// Load saved favorites safely
try {
    const savedFavorites = JSON.parse(
        localStorage.getItem("favorites")
    );

    if (Array.isArray(savedFavorites)) {
        favorites = savedFavorites.filter(
            (university) =>
                university &&
                typeof university.name === "string" &&
                typeof university.country === "string"
        );
    }
} catch (error) {
    favorites = [];
}

// Check if university is already a favorite
function isFavorite(university) {
    return favorites.some((fav) =>
        fav.name === university.name &&
        fav.country === university.country
    );
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );
}

// Populate country dropdown from JSON
function populateCountryDropdown(universities) {
    const selectedCountry = countryFilter.value;

    const countries = [
        ...new Set(
            universities
                .map((university) => university.country)
                .filter(Boolean)
        )
    ].sort((a, b) => a.localeCompare(b));

    countryFilter.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All Countries";
    countryFilter.appendChild(allOption);

    countries.forEach((country) => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });

    if (countries.includes(selectedCountry)) {
        countryFilter.value = selectedCountry;
    }
}

// Filter and sort universities
function getFilteredUniversities() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedCountry = countryFilter.value;

    const filtered = allUniversities.filter((university) => {
        const name = (university.name || "").toLowerCase();

        const matchesName = name.includes(searchText);

        const matchesCountry =
            selectedCountry === "" ||
            university.country === selectedCountry;

        return matchesName && matchesCountry;
    });

    filtered.sort((a, b) => {
        const nameA = a.name || "";
        const nameB = b.name || "";

        return sortFilter.value === "za"
            ? nameB.localeCompare(nameA)
            : nameA.localeCompare(nameB);
    });

    return filtered;
}

// Create university card
function createUniversityCard(university, isFavSection = false) {
    const card = document.createElement("div");
    card.classList.add("university-card");

    const heading = document.createElement("h3");
    heading.textContent = university.name || "Name unavailable";
    card.appendChild(heading);

    const country = document.createElement("p");
    country.textContent = `Country: ${
        university.country || "Not available"
    }`;
    card.appendChild(country);

    const state = document.createElement("p");
    state.textContent = `State: ${
        university["state-province"] || "Not available"
    }`;
    card.appendChild(state);

    // University website
    if (
        Array.isArray(university.web_pages) &&
        university.web_pages.length > 0
    ) {
        const link = document.createElement("a");
        link.href = university.web_pages[0];
        link.textContent = "Visit Website";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
    } else {
        const websiteText = document.createElement("p");
        websiteText.textContent = "Website not available";
        card.appendChild(websiteText);
    }

    // Favorite / Remove button
    const button = document.createElement("button");
    button.type = "button";

    if (isFavSection) {
        button.textContent = "Remove from Favorites";

        button.addEventListener("click", () => {
            removeFavorite(university);
        });
    } else {
        button.textContent = isFavorite(university)
            ? "Remove from Favorites"
            : "Add to Favorites";

        button.addEventListener("click", () => {
            if (isFavorite(university)) {
                removeFavorite(university);
            } else {
                addFavorite(university);
            }
        });
    }

    card.appendChild(button);

    return card;
}

// Add university to favorites
function addFavorite(university) {
    if (isFavorite(university)) {
        return;
    }

    favorites.push(university);

    saveFavorites();
    displayFavorites();
    displayUniversities(getFilteredUniversities());
}

// Remove university from favorites
function removeFavorite(university) {
    favorites = favorites.filter((fav) =>
        !(
            fav.name === university.name &&
            fav.country === university.country
        )
    );

    saveFavorites();
    displayFavorites();
    displayUniversities(getFilteredUniversities());
}

// Display search results
function displayUniversities(universities) {
    list.innerHTML = "";

    result.textContent = `Found ${universities.length} Universities`;

    if (universities.length === 0) {
        const message = document.createElement("p");
        message.classList.add("empty-message");
        message.textContent =
            "No universities match your search. Try another name or country.";

        list.appendChild(message);
        return;
    }

    universities.forEach((university) => {
        list.appendChild(createUniversityCard(university));
    });
}

// Display favorite universities under their heading
function displayFavorites() {
    favList.innerHTML = "";

    favCount.textContent = `Favorites: ${favorites.length}`;

    if (favorites.length === 0) {
        const message = document.createElement("p");
        message.classList.add("empty-message");
        message.textContent = "No favorites added yet.";

        favList.appendChild(message);
        return;
    }

    favorites.forEach((university) => {
        const favoriteCard = createUniversityCard(
            university,
            true
        );

        favList.appendChild(favoriteCard);
    });
}

// Update search results
function updateResults() {
    displayUniversities(getFilteredUniversities());
}

// Load university data
async function loadUniversities() {
    loading.classList.remove("hidden");
    result.textContent = "Loading universities...";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to load universities.json");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("University data must be an array.");
        }

        allUniversities = data;

        populateCountryDropdown(allUniversities);
        updateResults();
        displayFavorites();
    } catch (error) {
        console.error("University loading error:", error);

        result.textContent = "Unable to load universities.";
        list.innerHTML = "";

        const message = document.createElement("p");
        message.classList.add("empty-message");
        message.textContent =
            "Unable to load universities. Please check universities.json and try again.";

        list.appendChild(message);
    } finally {
        loading.classList.add("hidden");
    }
}

// Search button
btn.addEventListener("click", updateResults);

// Search while typing
searchInput.addEventListener("input", updateResults);

// Country filter
countryFilter.addEventListener("change", updateResults);

// Sorting
sortFilter.addEventListener("change", updateResults);

// Clear filters
clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    countryFilter.value = "";
    sortFilter.value = "az";

    updateResults();
});

// Restore saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
} else {
    document.body.classList.remove("dark-mode");
    themeToggle.textContent = "🌙 Dark Mode";
}

// Toggle theme
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDarkMode =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "theme",
        isDarkMode ? "dark" : "light"
    );

    themeToggle.textContent = isDarkMode
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
});

// Initial setup
displayFavorites();
loadUniversities();



