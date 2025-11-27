// global arrays for storing course data recieved
let allCourses = [];
let filteredCourses = [];
// To keep track of the currently displayed course
let activeCourseId = null;

// Reference to DOM elements
const courseListElement = document.getElementById('course-list');
const courseDetailsElement = document.getElementById('course-details');
const fileInput = document.getElementById('json-file-input');
const errorMessageElement = document.getElementById('error-message');
const filterDropdowns = document.querySelectorAll('.filter-dropdown');
const sortByDropdown = document.getElementById('sort-by');


// Course class to represent each course
class Course {
    constructor(data) {
        // Ensure all required fields exist, even if null/undefined in data
        this.id = data.id;
        this.title = data.title;
        this.department = data.department;
        this.level = data.level;
        this.credits = data.credits;
        // Optional fields with defaults
        this.instructor = data.instructor || 'TBD';
        this.description = data.description || 'No description available.';
        this.semester = data.semester;
    }

    // Helper method to convert semester to a sortable value
    getSortableSemester() {
        // boolean check for missing semester
        if (!this.semester) return Infinity; // Put courses with no semester at the end

        // Example semester format: "Fall 2023"
        // Separate into season and year
        const parts = this.semester.split(' ');
        const season = parts[0];
        const year = parseInt(parts[1]);

        let seasonIndex;
        switch (season) {
            case 'Winter': seasonIndex = 0; break;
            case 'Spring': seasonIndex = 1; break;
            case 'Summer': seasonIndex = 2; break;
            case 'Fall': seasonIndex = 3; break;
            // Unknown season
            default: seasonIndex = 9; 
        }
        
        // Combine year and season index for easy comparison
        // Year has more weight than season
        return year * 10 + seasonIndex;
    }

    // Returns HTML for course detail view
    getDetailsHTML() {
        return `
            <h3>${this.id}</h3>
            <p><strong>Title:</strong> ${this.title}</p>
            <p><strong>Department:</strong> ${this.department}</p>
            <p><strong>Level:</strong> ${this.level}</p>
            <p><strong>Credits:</strong> ${this.credits}</p>
            <p><strong>Instructor:</strong> ${this.instructor}</p>
            <p><strong>Semester:</strong> ${this.semester}</p>
            <hr>
            <p><strong>Description:</strong></p>
            <p>${this.description}</p>
        `;
    }
}


// Data & Error Handling

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    // Clear error messages
    errorMessageElement.textContent = '';
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            // Validate data format
            if (!Array.isArray(data)) {
                throw new Error("Invalid JSON file format. Data must be an array of courses.");
            }

            // Map data to Course objects
            allCourses = data.map(courseData => {
                // Catching errors and emptying invalid entries for each course
                try {
                    return new Course(courseData);
                } catch (e) {
                    return null;
                }
            }).filter(c => c !== null);
            
            // Creating the UI
            generateFilterOptions();
            applyFilterAndSort();
        } catch (error) {
            console.error("Data loading error:", error);
            // handle JSON parsing and file format/type errors
            errorMessageElement.textContent = `Error: Invalid JSON file format. ${error.message}`;
            allCourses = []; // Clear data on failure
            clearUI();
        }
    };

    reader.onerror = () => {
        errorMessageElement.textContent = "Error reading file.";
        allCourses = [];
        clearUI();
    };

    reader.readAsText(file);
}

// Clear UI elements
function clearUI() {
    courseListElement.innerHTML = '';
    courseDetailsElement.innerHTML = '<p>Click on a course ID on the left to see details.</p>';
    // Also clear filter/sort options if necessary
    filterDropdowns.forEach(dropdown => {
        dropdown.innerHTML = '<option value="All">All</option>';
        dropdown.value = 'All';
    });
    // Re-initialize sort options
    setupSortOptions();
    sortByDropdown.value = 'None';
}


// Programming Filtering Functionality

// Dropdown Generation
function generateFilterOptions() {
    // List of attributes to filter by
    const filters = [
        { id: 'department-filter', key: 'department' },
        { id: 'level-filter', key: 'level' },
        { id: 'credits-filter', key: 'credits' },
        { id: 'instructor-filter', key: 'instructor' },
    ];

    // iterate over each filter type
    filters.forEach(filter => {
        const dropdown = document.getElementById(filter.id);
        const uniqueValues = new Set();

        allCourses.forEach(course => {
            // Using String() for safety and consistent key lookup
            const value = String(course[filter.key]);
            if (value && value !== 'TBD') {
                uniqueValues.add(value);
            }
        });

        // Clear existing options and add 'All' option
        dropdown.innerHTML = '<option value="All">All</option>';

        // Sort unique values for presentation (numerically for level/credits, alphabetically otherwise)
        const sortedValues = Array.from(uniqueValues).sort((a, b) => {
            if (filter.key === 'level' || filter.key === 'credits') {
                return parseInt(a) - parseInt(b);
            }
            return a.localeCompare(b);
        });

        // Add unique values to dropdown elements
        sortedValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            dropdown.appendChild(option);
        });
    });
}

// Filter by Criteria using array filter method
function applyFilter() {
    let coursesToFilter = allCourses;

    // Get all selected dropdown values
    const department = document.getElementById('department-filter').value;
    const level = document.getElementById('level-filter').value;
    const credits = document.getElementById('credits-filter').value;
    const instructor = document.getElementById('instructor-filter').value;

    // Apply filters using Array.prototype.filter()
    coursesToFilter = coursesToFilter.filter(course => {
        // Check for 'All' or match specific values
        const matchesDepartment = department === 'All' || course.department === department;
        // Compare numbers for Level and Credits
        const matchesLevel = level === 'All' || course.level === parseInt(level);
        const matchesCredits = credits === 'All' || course.credits === parseInt(credits);
        const matchesInstructor = instructor === 'All' || course.instructor === instructor;

        // only courses which satisfy all selected criteria
        return matchesDepartment && matchesLevel && matchesCredits && matchesInstructor;
    });

    filteredCourses = coursesToFilter;
    return filteredCourses;
}


// Sorting Functionality 

function setupSortOptions() {
    sortByDropdown.innerHTML = `
        <option value="None">None</option>
        <option value="ID_ASC">ID (A-Z)</option>
        <option value="ID_DESC">ID (Z-A)</option>
        <option value="Title_ASC">Title (A-Z)</option>
        <option value="Title_DESC">Title (Z-A)</option>
        <option value="Semester_ASC">Semester (Earliest first)</option>
        <option value="Semester_DESC">Semester (Latest first)</option>
    `;
}

/**
 * 5. Sort by Title/ID/Semester (2 Points) - Uses sort method and normalization
 */
function applySort(courses) {
    const sortValue = sortByDropdown.value;

    if (sortValue === 'None') {
        // Fallback to sort by ID for consistency if 'None' is selected
        return courses.sort((a, b) => a.id.localeCompare(b.id)); 
    }

    // Use Array.prototype.sort()
    return courses.sort((a, b) => {
        switch (sortValue) {
            // Sort by Title (1 Point)
            case 'Title_ASC':
                return a.title.localeCompare(b.title);
            case 'Title_DESC':
                return b.title.localeCompare(a.title);

            // Sort by ID (1 Point)
            case 'ID_ASC':
                return a.id.localeCompare(b.id);
            case 'ID_DESC':
                return b.id.localeCompare(a.id);
            
            // Sort by Posted Time with Normalization (1 Point)
            case 'Semester_ASC':
                return a.getSortableSemester() - b.getSortableSemester();
            case 'Semester_DESC':
                return b.getSortableSemester() - a.getSortableSemester();
                
            default:
                return 0; // Should not happen
        }
    });
}

function applyFilterAndSort() {
    if (allCourses.length === 0) return;

    const courses = applyFilter();
    applySort(courses);
    renderCourseList(courses);
    
    // Attempt to re-select the previously active course to maintain state
    if (activeCourseId) {
        selectCourse(activeCourseId);
    } else if (courses.length > 0) {
        // If no course was selected, automatically select the first one
        selectCourse(courses[0].id);
    } else {
        courseDetailsElement.innerHTML = '<p>No courses match the current filter criteria.</p>';
        activeCourseId = null;
    }
}


// --- 7. Interactive Course Details (1 Point) & Rendering ---

function renderCourseList(courses) {
    courseListElement.innerHTML = '';
    
    courses.forEach(course => {
        const button = document.createElement('button');
        button.className = 'course-listing';
        button.textContent = course.id;
        button.dataset.courseId = course.id;
        
        // Add event listener for Interactive Course Details
        button.addEventListener('click', () => {
            selectCourse(course.id);
        });

        courseListElement.appendChild(button);
    });
}

function selectCourse(id) {
    activeCourseId = id;
    
    // Remove 'active' class from all buttons
    document.querySelectorAll('.course-listing').forEach(btn => {
        btn.classList.remove('active');
    });

    const selectedCourse = filteredCourses.find(c => c.id === id);
    const activeButton = document.querySelector(`.course-listing[data-course-id="${id}"]`);

    if (selectedCourse) {
        // Display details
        courseDetailsElement.innerHTML = selectedCourse.getDetailsHTML();
    } else {
        // Handles case where the previously active course is filtered out
        courseDetailsElement.innerHTML = '<p>Course details not available (may be filtered out).</p>';
        activeCourseId = null;
        return;
    }

    if (activeButton) {
        // Set 'active' class on the clicked button
        activeButton.classList.add('active');
    }
}


// Event Listeners

fileInput.addEventListener('change', handleFileSelect);

// Attach event listener to all filter dropdowns
filterDropdowns.forEach(dropdown => {
    dropdown.addEventListener('change', applyFilterAndSort);
});

// Attach event listener to the sort dropdown
sortByDropdown.addEventListener('change', applyFilterAndSort);

// Initial setup of sort options
setupSortOptions();