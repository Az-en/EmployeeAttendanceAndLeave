document.addEventListener('DOMContentLoaded',function () {

    // TODO: implement edit employee functionality

    // FUNCTION TO ADD DATE
    function addDate() {
        let date_p = document.getElementById("current-date");
        const date = new Date();
        const options = {
            weekday: 'long',  // e.g., "Monday"
            year: 'numeric',  // e.g., "2025"
            month: 'long',    // e.g., "May"
            day: 'numeric'    // e.g., "12"
        };
        date_p.innerText = date.toLocaleDateString(undefined, options);
    }



     // Add this line to automatically load employees
    addDate();
});