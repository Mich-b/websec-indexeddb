// Opening or creating an IndexDB database
let db;
const request = indexedDB.open("myDatabase", 1);

request.onerror = function(event) {
    console.log("Error opening database.");
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('values')) {
        db.createObjectStore("values", { autoIncrement: true });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    fetchAllValues();
};

function storeValue() {
    const inputValue = document.getElementById("input").value;

    // Store in IndexDB
    const transaction = db.transaction(["values"], "readwrite");
    const objectStore = transaction.objectStore("values");
    objectStore.add(inputValue);

    fetchAllValues();
}

function evaluateCode() {
    try {
        const inputValue = document.getElementById("input").value;
        eval(inputValue);
    } catch (error) {
        console.error("Error evaluating code:", error);
    }
}

function fetchAllValues() {
    const transaction = db.transaction(["values"]);
    const objectStore = transaction.objectStore("values");

    const allRecords = objectStore.getAll();

    allRecords.onsuccess = function(event) {
        const valuesContainer = document.getElementById("valuesContainer");
        valuesContainer.innerHTML = ''; // Clear current content

        allRecords.result.forEach(storedValue => {
            const section = document.createElement('div');
            section.className = 'section';

            // HTML content
            const htmlRow = document.createElement('div');
            htmlRow.className = 'row';
            const htmlLabel = document.createElement('span');
            htmlLabel.className = 'label';
            htmlLabel.textContent = "Interpreting as HTML:";
            const valueAsHtml = document.createElement('div');
            valueAsHtml.className = 'content';

            valueAsHtml.innerHTML = storedValue;
            htmlRow.appendChild(htmlLabel);
            htmlRow.appendChild(valueAsHtml);

            // HREF anchor
            const hrefRow = document.createElement('div');
            hrefRow.className = 'row';
            const hrefLabel = document.createElement('span');
            hrefLabel.className = 'label';
            hrefLabel.textContent = "Interpreting as HREF attribute:";
            const valueAsHref = document.createElement('a');
            valueAsHref.href = storedValue;
            valueAsHref.textContent = storedValue;
            valueAsHref.className = 'content';
            hrefRow.appendChild(hrefLabel);
            hrefRow.appendChild(valueAsHref);

            section.appendChild(htmlRow);
            section.appendChild(hrefRow);

            valuesContainer.appendChild(section);
        });
    };
}

function loadXMLDoc() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("demo").innerHTML =
        this.responseText;
      }
    };
    xhttp.open("GET", "https://api-websec.herokuapp.com/", true); 
    xhttp.send(); 
  }

document.getElementById("deleteAll").addEventListener("click", function() {
    const deleteTransaction = db.transaction(["values"], "readwrite");
    const objectStore = deleteTransaction.objectStore("values");

    // Clear all values from the object store
    const request = objectStore.clear();

    request.onsuccess = function(event) {
        console.log("All values have been removed from the database.");
        fetchAllValues();  // Refresh the display after deletion
    };

    request.onerror = function(event) {
        console.error("Error deleting all values:", event.target.error);
    };
});
