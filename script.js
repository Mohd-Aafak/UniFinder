


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

try {
    favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!Array.isArray(favorites)) {
        favorites = [];
    }
} catch (error) {
    favorites = [];
}

// Check whether a university is already a favorite
function isFavorite(university) {
    return favorites.some((fav) => {
        return fav.name === university.name &&
               fav.country === university.country;
    });
}

// Populate countries automatically from JSON
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

    // Keep the selected country if it still exists
    if (countries.includes(selectedCountry)) {
        countryFilter.value = selectedCountry;
    }
}

// Get universities matching search, country and sorting
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

        if (sortFilter.value === "za") {
            return nameB.localeCompare(nameA);
        }

        return nameA.localeCompare(nameB);
    });

    return filtered;
}

// Create a university card
function createUniversityCard(university, isFavSection = false) {
    const div = document.createElement("div");
    div.classList.add("university-card");

    const heading = document.createElement("h3");
    heading.textContent = university.name || "Name unavailable";
    div.appendChild(heading);

    const country = document.createElement("p");
    country.textContent = university.country || "Country unavailable";
    div.appendChild(country);

    const state = document.createElement("p");
    state.textContent =
        university["state-province"] || "State not available";
    div.appendChild(state);

    // University website
    if (Array.isArray(university.web_pages) &&
        university.web_pages.length > 0) {

        const link = document.createElement("a");
        link.href = university.web_pages[0];
        link.textContent = "Visit Website";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        div.appendChild(link);
    } else {
        const websiteText = document.createElement("p");
        websiteText.textContent = "Website not available";
        div.appendChild(websiteText);
    }

    // Favorite button
    const button = document.createElement("button");
    button.type = "button";

    if (isFavSection) {
        button.textContent = "Remove from Favorites";

        button.addEventListener("click", () => {
            favorites = favorites.filter((fav) => {
                return !(
                    fav.name === university.name &&
                    fav.country === university.country
                );
            });

            saveFavorites();
            displayFavorites();
            displayUniversities(getFilteredUniversities());
        });
    } else {
        button.textContent = isFavorite(university)
            ? "Remove from Favorites"
            : "Add to Favorites";

        button.addEventListener("click", () => {
            if (isFavorite(university)) {
                favorites = favorites.filter((fav) => {
                    return !(
                        fav.name === university.name &&
                        fav.country === university.country
                    );
                });
            } else {
                favorites.push(university);
            }

            saveFavorites();
            displayFavorites();
            displayUniversities(getFilteredUniversities());
        });
    }

    div.appendChild(button);

    return div;
}

// Display universities
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

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Display favorites
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
        favList.appendChild(createUniversityCard(university, true));
    });
}

// Apply current search and filters
function updateResults() {
    displayUniversities(getFilteredUniversities());
}

// Load JSON data once
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
            throw new Error("The JSON data must be an array");
        }

        allUniversities = data;

        populateCountryDropdown(allUniversities);
        updateResults();
    } catch (error) {
        console.error("University data loading error:", error);

        result.textContent = "Unable to load universities.";

        list.innerHTML = "";

        const message = document.createElement("p");
        message.classList.add("empty-message");
        message.textContent =
            "Unable to load universities. Please check your connection and try again.";

        list.appendChild(message);
    } finally {
        loading.classList.add("hidden");
    }
}

// Search button
btn.addEventListener("click", updateResults);

// Search while typing
searchInput.addEventListener("input", updateResults);

// Filter when country changes
countryFilter.addEventListener("change", updateResults);

// Sort when option changes
sortFilter.addEventListener("change", updateResults);

// Clear search and country filter
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

    localStorage.setItem("theme", isDarkMode ? "dark" : "light");

    themeToggle.textContent = isDarkMode
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
});

// Initial setup
displayFavorites();
loadUniversities();

        
