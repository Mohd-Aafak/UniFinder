

let url = "https://universities.hipolabs.com/search?country=";

let list = document.getElementById("universities-list");
let result = document.getElementById("result-count");
let btn = document.getElementById("search-btn");
let countryFilter = document.getElementById("country-filter");
let searchInput = document.getElementById("university-search");
let sortFilter = document.getElementById("sort-filter");
let clearBtn = document.getElementById("clear-search");
let loading = document.getElementById("loading");
let themeToggle = document.getElementById("theme-toggle");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let allUniversities = [];

// Display university cards
function displayUniversities(universities) {
    list.innerHTML = "";

    result.textContent = `Found ${universities.length} Universities`;

    if (universities.length === 0) {
        result.textContent = "No Universities Found";
         let message = document.createElement("p");
         message.classList.add("empty-message");
         message.textContent ="No Universities match your search. Try another name of university.";
         list.appendChild(message);
         return;
    }
    universities.sort((a, b) => {
    if (sortFilter.value === "za") {
        return b.name.localeCompare(a.name);
    }

    return a.name.localeCompare(b.name);
});
    universities.forEach((university) => {
        let div = document.createElement("div");
        div.classList.add("university-card");

        let h3 = document.createElement("h3");
        h3.textContent = university.name;
        div.appendChild(h3);

        let p = document.createElement("p");
        p.textContent = university.country;
        div.appendChild(p);
        let state =document.createElement("p");
        state.textContent=university["state-province"] || "state not available";
        div.appendChild(state);

        // University website
        if (university.web_pages && university.web_pages.length > 0) {
            let a = document.createElement("a");
            a.href = university.web_pages[0];
            a.textContent = "Visit Website";
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            div.appendChild(a);
        } else {
            let websiteText = document.createElement("p");
            websiteText.textContent = "Website not available";
            div.appendChild(websiteText);
        }

        // Add to Favorites button
        let button = document.createElement("button");
        button.textContent = "Add to Favorites";
        div.appendChild(button);

        let alreadyExists = favorites.some((fav) => {
            return fav.name === university.name &&
                   fav.country === university.country;
        });

        if (alreadyExists) {
            button.textContent = "Already in Favorites";
        }

        button.addEventListener("click", () => {
            let exists = favorites.some((fav) => {
                return fav.name === university.name &&
                       fav.country === university.country;
            });

            if (!exists) {
                favorites.push(university);

                localStorage.setItem(
                    "favorites",
                    JSON.stringify(favorites)
                );

                displayFavorites();
                button.textContent = "Added to Favorites";
            } else {
                button.textContent = "Already in Favorites";
            }
        });

        list.appendChild(div);
    });
}

// Search universities using country filter
btn.addEventListener("click", async () => {
    let country = document.getElementById("country-filter").value;
    let url2 = "";

    if (country === "") {
        url2 = "https://universities.hipolabs.com/search";
    } else {
        url2 = `${url}${encodeURIComponent(country)}`;
    }

    try {
        loading.classList.remove("hidden");

        let res = await fetch(url2);

        if (!res.ok) {
            throw new Error("Failed to fetch university data");
        }

        let data = await res.json();

        allUniversities = data;

        // Show results matching the current search text
        let input = searchInput.value.trim().toLowerCase();

        let filteredUniversities = allUniversities.filter((university) => {
            return university.name.toLowerCase().includes(input);
        });

        displayUniversities(filteredUniversities);
        loading.classList.add("hidden");

    } catch (error) {
        console.error("University data not found:", error);
        result.textContent = "";
        list.innerHTML = "";

let errorMessage = document.createElement("p");
errorMessage.textContent =
    "Unable to load universities.  Please Check your connection and try again.";

list.appendChild(errorMessage);
        loading.classList.add("hidden");
    }
});

// Search while typing
searchInput.addEventListener("input", () => {
    let input = searchInput.value.trim().toLowerCase();

    let filteredUniversities = allUniversities.filter((university) => {
        return university.name.toLowerCase().includes(input);
    });

    displayUniversities(filteredUniversities);
});

// Display Favorites
function displayFavorites() {
    let favList = document.getElementById("favorites-list");
    favList.innerHTML = "";
    let count = document.getElementById("favorites-count");
    count.textContent = `Favorites: ${favorites.length}`;

    if (favorites.length === 0) {
        let p = document.createElement("p");
        p.textContent = "No favorites added yet.";
        p.classList.add("empty-message");
        favList.appendChild(p);
        return;
    }

    favorites.forEach((university) => {
        let div = document.createElement("div");
        div.classList.add("university-card");

        let h3 = document.createElement("h3");
        h3.textContent = university.name;
        div.appendChild(h3);

        let p = document.createElement("p");
        p.textContent = university.country;
        div.appendChild(p);
        let state = document.createElement("p");
         state.textContent=university["state-province"] || "state not available";
        div.appendChild(state);
        if(university.web_pages && university.web_pages.length>0)
        {
            let a = document.createElement("a");
            a.href = university.web_pages[0];
            a.textContent = "Visit Website";
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            div.appendChild(a);
        }

        // Remove from Favorites button
        let removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        div.appendChild(removeBtn);

        removeBtn.addEventListener("click", () => {
            favorites = favorites.filter((fav) => {
                return !(
                    fav.name === university.name &&
                    fav.country === university.country
                );
            });

            localStorage.setItem(
                "favorites",
                JSON.stringify(favorites)
            );

            displayFavorites();
        });

        favList.appendChild(div);
    });
}
displayFavorites();
sortFilter.addEventListener("change", () => {
    let input = searchInput.value.trim().toLowerCase();

    let filteredUniversities = allUniversities.filter((university) => {
        return university.name.toLowerCase().includes(input);
    });

    displayUniversities(filteredUniversities);
});
countryFilter.addEventListener("change", () => {
    btn.click();
});
clearBtn.addEventListener("click", () => {
    searchInput.value = "";

    let filteredUniversities = allUniversities.filter((university) => {
        return university.name.toLowerCase().includes("");
    });

    displayUniversities(filteredUniversities);
});
let savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️ Light Mode";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙 Dark Mode";
    }
});
