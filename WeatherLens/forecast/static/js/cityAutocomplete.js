// Popular cities list for suggestions
// Chennai is prioritized first, then world's top cities
const popularCities = [
    // Priority: Chennai, India (user's location)
    'Chennai',
    
    // World's top major cities
    'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai', 'Dubai', 'Singapore',
    'Los Angeles', 'Chicago', 'Toronto', 'Vancouver', 'Berlin', 'Madrid', 'Rome', 'Amsterdam',
    'Barcelona', 'Vienna', 'Prague', 'Stockholm', 'Copenhagen', 'Oslo', 'Helsinki', 'Dublin',
    
    // Asian major cities
    'Beijing', 'Shanghai', 'Hong Kong', 'Seoul', 'Bangkok', 'Manila', 'Jakarta', 'Kuala Lumpur',
    'Ho Chi Minh City', 'Hanoi', 'Taipei', 'Delhi', 'Bangalore', 'Kolkata', 'Hyderabad',
    
    // Indian major cities
    'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur',
    'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Coimbatore', 'Kochi', 'Visakhapatnam',
    
    // Middle Eastern cities
    'Cairo', 'Istanbul', 'Tel Aviv', 'Riyadh', 'Jeddah', 'Doha', 'Abu Dhabi', 'Kuwait City',
    'Beirut', 'Amman', 'Baghdad', 'Tehran', 'Jerusalem',
    
    // African cities
    'Cape Town', 'Johannesburg', 'Lagos', 'Nairobi', 'Casablanca', 'Accra', 'Addis Ababa',
    
    // Australian cities
    'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Auckland', 'Wellington', 'Christchurch',
    
    // South American cities
    'São Paulo', 'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Bogotá', 'Santiago', 'Caracas',
    'Montevideo', 'Quito', 'La Paz',
    
    // North American cities
    'Mexico City', 'Montreal', 'Calgary', 'Ottawa', 'Quebec City', 'San Francisco', 'Seattle',
    'Boston', 'Miami', 'Atlanta', 'Dallas', 'Houston', 'Phoenix', 'Las Vegas', 'Denver',
    'Portland', 'San Diego', 'Austin', 'Nashville', 'New Orleans', 'Philadelphia', 'Washington',
    
    // European cities
    'Brussels', 'Zurich', 'Geneva', 'Luxembourg', 'Monaco', 'Lisbon', 'Porto', 'Athens',
    'Warsaw', 'Krakow', 'Budapest', 'Bucharest', 'Sofia', 'Belgrade', 'Zagreb', 'Ljubljana',
    'Tallinn', 'Riga', 'Vilnius', 'Minsk', 'Kiev', 'Moscow', 'Saint Petersburg',
    'Edinburgh', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol', 'Leeds',
    
    // More Indian cities
    'Mysore', 'Thiruvananthapuram', 'Bhopal', 'Vadodara', 'Patna', 'Ludhiana', 'Agra',
    'Varanasi', 'Srinagar', 'Amritsar', 'Chandigarh', 'Dehradun', 'Shimla', 'Manali',
    'Goa', 'Pondicherry', 'Mangalore', 'Hubli', 'Belgaum'
];

// City autocomplete functionality
function initCityAutocomplete() {
    const cityInput = document.querySelector('input[name="city"]');
    const form = document.querySelector('form[method="POST"]');
    
    // Check if elements exist
    if (!cityInput || !form) {
        // Retry after a short delay if elements not found
        setTimeout(initCityAutocomplete, 100);
        return;
    }
    
    const formContainer = form.parentNode; // The relative div
    const section = formContainer.parentNode; // The glass-panel section
    let suggestionsContainer = null;
    let selectedIndex = -1;

    // Create suggestions container
    function createSuggestionsContainer() {
        if (suggestionsContainer) {
            // Container exists, just ensure it's in the right place
            if (!formContainer.contains(suggestionsContainer)) {
                formContainer.appendChild(suggestionsContainer);
            }
            // Ensure form container has relative positioning
            if (window.getComputedStyle(formContainer).position === 'static') {
                formContainer.style.position = 'relative';
            }
            return;
        }
        
        // Ensure form container has relative positioning
        if (window.getComputedStyle(formContainer).position === 'static') {
            formContainer.style.position = 'relative';
        }
        
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'city-suggestions';
        suggestionsContainer.className = 'city-suggestions';
        
        // Position absolutely below the search bar (form container)
        // Using top: 100% to position it right below the form
        // Higher z-index to ensure it appears above other elements
        // Increased glass effect for better text visibility
        suggestionsContainer.style.cssText = 'position: absolute; top: 100%; left: 0; right: 0; z-index: 9999; width: 100%; margin-top: 0.25rem; border-radius: 1rem; border: 1px solid rgba(255, 255, 255, 0.2); background-color: rgba(255, 255, 255, 0.15); backdrop-filter: blur(16px); max-height: 400px; overflow-y: auto; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4); display: none;';
        
        // Insert into the form container (relative div) so it positions relative to the search bar
        formContainer.appendChild(suggestionsContainer);
    }
    
    // Update position when showing suggestions (for responsive adjustments if needed)
    function updateSuggestionsPosition() {
        if (!suggestionsContainer) return;
        // Position is handled by CSS top: 100%, no update needed
    }

    // Filter cities based on input with smart matching
    function filterCities(query) {
        if (!query || query.trim() === '') {
            // Show ALL cities when input is empty - Chennai first, then all others
            return popularCities; // Return all cities
        }
        
        const lowerQuery = query.toLowerCase().trim();
        
        // Separate cities that start with query from those that contain it
        const startsWith = [];
        const contains = [];
        
        popularCities.forEach(city => {
            const lowerCity = city.toLowerCase();
            if (lowerCity.startsWith(lowerQuery)) {
                startsWith.push(city);
            } else if (lowerCity.includes(lowerQuery)) {
                contains.push(city);
            }
        });
        
        // Sort: cities starting with query first, then cities containing it
        // Within each group, prioritize Chennai
        const sortCities = (arr) => {
            const chennaiIndex = arr.indexOf('Chennai');
            if (chennaiIndex > 0) {
                arr.splice(chennaiIndex, 1);
                arr.unshift('Chennai');
            }
            return arr;
        };
        
        const sortedStartsWith = sortCities(startsWith);
        const sortedContains = sortCities(contains);
        
        // Combine: starts with first, then contains
        const filtered = [...sortedStartsWith, ...sortedContains];
        
        // Return all filtered results (no limit when typing)
        return filtered;
    }

    // Display suggestions
    function showSuggestions(query) {
        createSuggestionsContainer();
        updateSuggestionsPosition();
        const filteredCities = filterCities(query);
        
        if (filteredCities.length === 0) {
            if (suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
            }
            return;
        }

        if (!suggestionsContainer) {
            createSuggestionsContainer();
        }

        suggestionsContainer.innerHTML = '';
        selectedIndex = -1;

        filteredCities.forEach((city, index) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            // Enhanced text visibility with better contrast
            suggestionItem.style.cssText = 'padding: 0.625rem 1rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; color: rgba(255, 255, 255, 0.95); transition: all 0.15s ease; border-bottom: 1px solid rgba(255, 255, 255, 0.1);';
            if (index === filteredCities.length - 1) {
                suggestionItem.style.borderBottom = 'none';
            }
            suggestionItem.textContent = city;
            suggestionItem.dataset.index = index;
            
            suggestionItem.addEventListener('click', function() {
                cityInput.value = city;
                if (suggestionsContainer) {
                    suggestionsContainer.style.display = 'none';
                }
                form.submit();
            });

            suggestionItem.addEventListener('mouseenter', function() {
                // Remove previous selection
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.style.backgroundColor = '';
                    item.style.color = 'rgba(255, 255, 255, 0.95)';
                });
                suggestionItem.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                suggestionItem.style.color = 'rgba(255, 255, 255, 1)';
                selectedIndex = index;
            });

            suggestionsContainer.appendChild(suggestionItem);
        });

        // Ensure container is visible and properly positioned
        suggestionsContainer.style.display = 'block';
        suggestionsContainer.style.visibility = 'visible';
        suggestionsContainer.style.opacity = '1';
        suggestionsContainer.style.position = 'absolute';
        suggestionsContainer.style.zIndex = '9999';
        
        // Force a reflow to ensure visibility
        void suggestionsContainer.offsetHeight;
    }

    // Hide suggestions
    function hideSuggestions() {
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
            selectedIndex = -1;
        }
    }

    // Handle input events
    cityInput.addEventListener('input', function(e) {
        const query = e.target.value;
        if (query.length >= 0) {
            showSuggestions(query);
        } else {
            hideSuggestions();
        }
    });

    // Show suggestions on focus if input is empty
    cityInput.addEventListener('focus', function(e) {
        e.stopPropagation();
        // Small delay to ensure DOM is ready
        setTimeout(function() {
            if (!cityInput.value || cityInput.value.trim() === '') {
                showSuggestions('');
            } else {
                showSuggestions(cityInput.value);
            }
        }, 50);
    });
    
    // Also show on click
    cityInput.addEventListener('click', function(e) {
        e.stopPropagation();
        setTimeout(function() {
            if (!cityInput.value || cityInput.value.trim() === '') {
                showSuggestions('');
            } else {
                showSuggestions(cityInput.value);
            }
        }, 50);
    });
    
    // Show on mousedown as well (before focus)
    cityInput.addEventListener('mousedown', function(e) {
        e.stopPropagation();
    });
    
    // Update position on window resize
    window.addEventListener('resize', function() {
        if (suggestionsContainer && suggestionsContainer.style.display !== 'none') {
            updateSuggestionsPosition();
        }
    });

    // Handle keyboard navigation
    cityInput.addEventListener('keydown', function(e) {
        if (!suggestionsContainer || suggestionsContainer.style.display === 'none') {
            if (e.key === 'ArrowDown' && !cityInput.value) {
                showSuggestions('');
                e.preventDefault();
            }
            return;
        }

        const items = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            // Reset previous selection
            if (selectedIndex >= 0 && items[selectedIndex]) {
                items[selectedIndex].style.backgroundColor = '';
                items[selectedIndex].style.color = 'rgba(255, 255, 255, 0.95)';
            }
            selectedIndex = (selectedIndex + 1) % items.length;
            items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            items[selectedIndex].style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            items[selectedIndex].style.color = 'rgba(255, 255, 255, 1)';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            // Reset previous selection
            if (selectedIndex >= 0 && items[selectedIndex]) {
                items[selectedIndex].style.backgroundColor = '';
                items[selectedIndex].style.color = 'rgba(255, 255, 255, 0.95)';
            }
            if (selectedIndex <= 0) {
                selectedIndex = items.length - 1;
            } else {
                selectedIndex--;
            }
            items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            items[selectedIndex].style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            items[selectedIndex].style.color = 'rgba(255, 255, 255, 1)';
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            items[selectedIndex].click();
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (suggestionsContainer && suggestionsContainer.style.display !== 'none') {
            if (!formContainer.contains(e.target) && 
                !suggestionsContainer.contains(e.target)) {
                hideSuggestions();
            }
        }
    });

    // Hide suggestions on form submit
    form.addEventListener('submit', function() {
        hideSuggestions();
    });
}

// Initialize when DOM is ready or immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCityAutocomplete);
} else {
    // DOM is already loaded
    initCityAutocomplete();
}

