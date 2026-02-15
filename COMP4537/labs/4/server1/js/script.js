/**
 * Group b5 Ai disclosure:
 * We used Google Gemini to format the table 
 * from the SQL query results.
 * 
 * @link https://gemini.google.com/app
 * 
 */

class UI {
    constructor(host_url) {
        this.host_url = host_url;
        this.app = document.body;
        this.render();
        this.attachEventListeners();
    }

    createElement(tag, id, parent, text = null) {
        const element = document.createElement(tag);
        if (id) element.id = id;
        if (text) element.innerText = text;
        if (parent) parent.appendChild(element);
        return element;
    }

    render() {
        this.title = this.createElement("h1", "title", this.app, messages.title);

        // Insert Section
        this.insertSection = this.createElement("div", "insert-section", this.app);
        this.createElement("h2", null, this.insertSection, messages.insertHeader);
        this.createElement("p", null, this.insertSection, messages.insertDesc);
        this.insertBtn = this.createElement("button", "insert-btn", this.insertSection, messages.insertBtn);
        this.insertResponse = this.createElement("div", "insert-response", this.insertSection);

        // Query Section
        this.querySection = this.createElement("div", "query-section", this.app);
        this.createElement("h2", null, this.querySection, messages.queryHeader);
        this.createElement("p", null, this.querySection, messages.queryDesc);

        // Text Area
        this.sqlInput = this.createElement("textarea", "sql-input", this.querySection);
        this.queryBtn = this.createElement("button", "query-btn", this.querySection, messages.queryBtn);
        this.queryResponse = this.createElement("div", "query-response", this.querySection);
    }

    attachEventListeners() {
        this.insertBtn.onclick = () => this.insertData();
        this.queryBtn.onclick = () => this.runQuery();
    }

    formatAsTable(data) {
        if (!Array.isArray(data) || data.length === 0) return "No records found.";

        let html = "<table><thead><tr>";
        Object.keys(data[0]).forEach(key => html += `<th>${key}</th>`);
        html += "</tr></thead><tbody>";

        data.forEach(row => {
            html += "<tr>";
            Object.values(row).forEach(val => html += `<td>${val}</td>`);
            html += "</tr>";
        });

        html += "</tbody></table>";
        return html;
    }

    insertData() {
        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", this.host_url, true);
        xhttp.send();
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                this.insertResponse.innerText = messages.success;
            } else if (xhttp.readyState === 4) {
                this.insertResponse.innerText = xhttp.responseText;
            }
        };
    }

    runQuery() {
        const query = this.sqlInput.value;
        const xhttp = new XMLHttpRequest();
        const target = `${this.host_url}/${encodeURIComponent(query)}`;
        xhttp.open("GET", target, true);
        xhttp.send();
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                this.queryResponse.innerHTML = this.formatAsTable(JSON.parse(xhttp.responseText));
            } else if (xhttp.readyState === 4) {
                this.queryResponse.innerText = xhttp.responseText;
            }
        }
    }
}

const host_url = "https://b5-server2.onrender.com/api/v1/sql";
const app = new UI(host_url);