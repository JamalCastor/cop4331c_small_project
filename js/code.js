const urlBase = "http://juliesin.xyz/LAMPAPI";
// const urlBase = "http://cop4331-5.com/LAMPAPI";
const extension = "php";

let userId = 0;
let firstName = "";
let lastName = "";

function getElement(id) {
    return document.getElementById(id);
}

function getValue(id) {
    const element = getElement(id);
    return element ? element.value.trim() : "";
}

function setStatus(elementId, message, type) {
    const element = getElement(elementId);

    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.remove("success", "error");

    if (type === "success") {
        element.classList.add("success");
    }

    if (type === "error") {
        element.classList.add("error");
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function makeSafeDomId(value) {
    return String(value ?? "").replace(/[^a-zA-Z0-9_-]/g, "");
}

function sendJsonRequest(endpoint, payload, statusElementId, successCallback) {
    const jsonPayload = JSON.stringify(payload);
    const url = urlBase + "/" + endpoint + "." + extension;

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    xhr.onreadystatechange = function () {
        if (this.readyState !== 4) {
            return;
        }

        if (this.status < 200 || this.status >= 300) {
            setStatus(statusElementId, "Something went wrong. Please try again.", "error");
            return;
        }

        try {
            const jsonObject = JSON.parse(xhr.responseText);
            successCallback(jsonObject);
        } catch (err) {
            setStatus(statusElementId, "Invalid server response. Please try again.", "error");
        }
    };

    xhr.onerror = function () {
        setStatus(statusElementId, "Network error. Please try again.", "error");
    };

    try {
        xhr.send(jsonPayload);
    } catch (err) {
        setStatus(statusElementId, err.message, "error");
    }
}

function doLogin() {
    userId = 0;
    firstName = "";
    lastName = "";

    const login = getValue("loginName");
    const password = getValue("loginPassword");

    setStatus("loginResult", "", "");

    const payload = {
        login: login,
        password: password
    };

    sendJsonRequest("Login", payload, "loginResult", function (jsonObject) {
        userId = Number(jsonObject.id);

        if (userId < 1) {
            setStatus("loginResult", "Username or password is incorrect.", "error");
            return;
        }

        firstName = jsonObject.firstName || "";
        lastName = jsonObject.lastName || "";

        saveCookie();

        window.location.href = "color.html";
    });
}

function doSignup() {
    const signupFirstName = getValue("signupFirstName");
    const signupLastName = getValue("signupLastName");
    const login = getValue("signupLogin");
    const password = getValue("signupPassword");

    setStatus("signupResult", "", "");

    const payload = {
        firstName: signupFirstName,
        lastName: signupLastName,
        login: login,
        password: password
    };

    sendJsonRequest("Signup", payload, "signupResult", function (jsonObject) {
        if (jsonObject.error && jsonObject.error.length > 0) {
            setStatus("signupResult", jsonObject.error, "error");
            return;
        }

        setStatus("signupResult", "Account created successfully! Redirecting to login.", "success");

        setTimeout(function () {
            window.location.href = "index.html";
        }, 1000);
    });
}

function saveCookie() {
    const minutes = 20;
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);

    const expires = date.toUTCString();

    document.cookie = "firstName=" + encodeURIComponent(firstName) + "; expires=" + expires + "; path=/";
    document.cookie = "lastName=" + encodeURIComponent(lastName) + "; expires=" + expires + "; path=/";
    document.cookie = "userId=" + encodeURIComponent(userId) + "; expires=" + expires + "; path=/";
}

function getCookieValue(name) {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const parts = cookie.split("=");

        if (parts[0] === name) {
            return decodeURIComponent(parts.slice(1).join("="));
        }
    }

    return "";
}

function readLegacyCookie() {
    const data = document.cookie;
    const splits = data.split(",");

    for (let i = 0; i < splits.length; i++) {
        const thisOne = splits[i].trim();
        const tokens = thisOne.split("=");

        if (tokens[0] === "firstName") {
            firstName = tokens[1] || "";
        } else if (tokens[0] === "lastName") {
            lastName = tokens[1] || "";
        } else if (tokens[0] === "userId") {
            userId = parseInt(tokens[1], 10);
        }
    }
}

function readCookie() {
    userId = parseInt(getCookieValue("userId"), 10);
    firstName = getCookieValue("firstName");
    lastName = getCookieValue("lastName");

    if (!userId || userId < 1) {
        readLegacyCookie();
    }

    if (!userId || userId < 1) {
        window.location.href = "index.html";
        return;
    }

    const userNameElement = getElement("userName");

    if (userNameElement) {
        userNameElement.textContent = "Logged in as " + firstName + " " + lastName;
    }
}

function doLogout() {
    userId = 0;
    firstName = "";
    lastName = "";

    document.cookie = "firstName=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = "lastName=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

    window.location.href = "index.html";
}

function addContact() {
    const contactFirstName = getValue("contactFirstName");
    const contactLastName = getValue("contactLastName");
    const phone = getValue("contactPhone");
    const email = getValue("contactEmail");

    setStatus("contactAddResult", "", "");

    const payload = {
        firstName: contactFirstName,
        lastName: contactLastName,
        phone: phone,
        email: email,
        userId: userId
    };

    sendJsonRequest("AddContacts", payload, "contactAddResult", function (jsonObject) {
        if (jsonObject.error && jsonObject.error.length > 0) {
            setStatus("contactAddResult", jsonObject.error, "error");
            return;
        }

        setStatus("contactAddResult", "Contact has been added.", "success");

        getElement("contactFirstName").value = "";
        getElement("contactLastName").value = "";
        getElement("contactPhone").value = "";
        getElement("contactEmail").value = "";
    });
}

function normalizeContact(contact) {
    const id = contact.id || contact.ID || contact.contactId || contact.ContactID || "";

    let contactFirstName = contact.firstName || contact.FirstName || "";
    let contactLastName = contact.lastName || contact.LastName || "";

    if ((!contactFirstName && !contactLastName) && contact.name) {
        const nameParts = String(contact.name).split(" ");
        contactFirstName = nameParts[0] || "";
        contactLastName = nameParts.slice(1).join(" ");
    }

    const fullName = `${contactFirstName} ${contactLastName}`.trim() || contact.name || "Unnamed Contact";

    return {
        id: id,
        safeDomId: makeSafeDomId(id),
        firstName: contactFirstName,
        lastName: contactLastName,
        fullName: fullName,
        phone: contact.phone || contact.Phone || "",
        email: contact.email || contact.Email || ""
    };
}

function renderEmptyContacts(message) {
    const contactList = getElement("contactList");

    if (!contactList) {
        return;
    }

    contactList.innerHTML = `
        <div class="empty-state">
            ${escapeHTML(message)}
        </div>
    `;
}

function renderContacts(contacts) {
    const contactList = getElement("contactList");

    if (!contactList) {
        return;
    }

    if (!Array.isArray(contacts) || contacts.length === 0) {
        renderEmptyContacts("No contacts found. Try searching for another first name.");
        return;
    }

    contactList.innerHTML = contacts.map(function (rawContact) {
        const contact = normalizeContact(rawContact);

        const id = escapeHTML(contact.id);
        const safeDomId = escapeHTML(contact.safeDomId);
        const firstName = escapeHTML(contact.firstName);
        const lastName = escapeHTML(contact.lastName);
        const fullName = escapeHTML(contact.fullName);
        const phone = escapeHTML(contact.phone || "Not provided");
        const email = escapeHTML(contact.email || "Not provided");

        return `
            <article class="contact-card" id="contactCard${safeDomId}">
                <div>
                    <h3 class="contact-name">${fullName}</h3>

                    <div class="contact-details">
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>Email:</strong> ${email}</p>
                    </div>
                </div>

                <div class="contact-actions">
                    <button
                        class="button button-secondary button-small"
                        type="button"
                        data-action="edit"
                        data-contact-id="${id}"
                        data-dom-id="${safeDomId}"
                        aria-expanded="false"
                        aria-controls="editForm${safeDomId}"
                        aria-label="Edit ${fullName}"
                    >
                        Edit
                    </button>

                    <button
                        class="button button-danger button-small"
                        type="button"
                        data-action="delete"
                        data-contact-id="${id}"
                        data-dom-id="${safeDomId}"
                        aria-label="Delete ${fullName}"
                    >
                        Delete
                    </button>
                </div>

                <div class="edit-form" id="editForm${safeDomId}" hidden>
                    <p class="required-note">
                        <span aria-hidden="true">*</span> Required fields
                    </p>

                    <form class="edit-contact-form" data-contact-id="${id}" data-dom-id="${safeDomId}">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label" for="editFirstName${safeDomId}">
                                    First Name <span class="required" aria-hidden="true">*</span>
                                </label>
                                <input
                                    class="form-input"
                                    type="text"
                                    id="editFirstName${safeDomId}"
                                    value="${firstName}"
                                    placeholder="Enter first name"
                                    autocomplete="given-name"
                                    required
                                    aria-required="true"
                                />
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="editLastName${safeDomId}">
                                    Last Name <span class="required" aria-hidden="true">*</span>
                                </label>
                                <input
                                    class="form-input"
                                    type="text"
                                    id="editLastName${safeDomId}"
                                    value="${lastName}"
                                    placeholder="Enter last name"
                                    autocomplete="family-name"
                                    required
                                    aria-required="true"
                                />
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="editPhone${safeDomId}">
                                    Phone <span class="required" aria-hidden="true">*</span>
                                </label>
                                <input
                                    class="form-input"
                                    type="tel"
                                    id="editPhone${safeDomId}"
                                    value="${escapeHTML(contact.phone)}"
                                    placeholder="Enter phone number"
                                    autocomplete="tel"
                                    required
                                    aria-required="true"
                                />
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="editEmail${safeDomId}">
                                    Email <span class="required" aria-hidden="true">*</span>
                                </label>
                                <input
                                    class="form-input"
                                    type="email"
                                    id="editEmail${safeDomId}"
                                    value="${escapeHTML(contact.email)}"
                                    placeholder="Enter email address"
                                    autocomplete="email"
                                    required
                                    aria-required="true"
                                />
                            </div>
                        </div>

                        <div class="button-row">
                            <button class="button button-primary button-small" type="submit">
                                Save Changes
                            </button>

                            <button
                                class="button button-secondary button-small"
                                type="button"
                                data-action="cancel"
                                data-contact-id="${id}"
                                data-dom-id="${safeDomId}"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>

                    <p
                        class="status-message"
                        id="contactEditResult${safeDomId}"
                        role="status"
                        aria-live="polite"
                    ></p>
                </div>
            </article>
        `;
    }).join("");

    initializeContactListEvents();
}

function searchContacts() {
    const searchText = getValue("searchText");

    setStatus("contactSearchResult", "Searching contacts...", "");
    setStatus("contactDeleteResult", "", "");

    const payload = {
        search: searchText,
        userId: userId
    };

    sendJsonRequest("SearchContacts", payload, "contactSearchResult", function (jsonObject) {
        if (jsonObject.error && jsonObject.error.length > 0) {
            setStatus("contactSearchResult", jsonObject.error, "error");
            renderEmptyContacts("No contacts are showing right now.");
            return;
        }

        const contacts = Array.isArray(jsonObject.results) ? jsonObject.results : [];

        if (contacts.length === 0) {
            setStatus("contactSearchResult", "No contacts found.", "");
            renderEmptyContacts("No contacts found. Try searching for another first name.");
            return;
        }

        setStatus("contactSearchResult", "Contacts have been retrieved.", "success");
        renderContacts(contacts);
    });
}

function editContactById(contactId, domId) {
    const contactFirstName = getValue("editFirstName" + domId);
    const contactLastName = getValue("editLastName" + domId);
    const phone = getValue("editPhone" + domId);
    const email = getValue("editEmail" + domId);

    const editResultId = "contactEditResult" + domId;

    setStatus(editResultId, "", "");

    const payload = {
        contactId: contactId,
        userId: userId,
        firstName: contactFirstName,
        lastName: contactLastName,
        phone: phone,
        email: email
    };

    sendJsonRequest("EditContacts", payload, editResultId, function (jsonObject) {
        if (jsonObject.error && jsonObject.error.length > 0) {
            setStatus(editResultId, jsonObject.error, "error");
            return;
        }

        setStatus(editResultId, "Contact has been updated.", "success");

        setTimeout(function () {
            searchContacts();
        }, 700);
    });
}

function deleteContactById(contactId) {
    setStatus("contactDeleteResult", "", "");

    const payload = {
        contactId: contactId,
        userId: userId
    };

    sendJsonRequest("DeleteContacts", payload, "contactDeleteResult", function (jsonObject) {
        if (jsonObject.error && jsonObject.error.length > 0) {
            setStatus("contactDeleteResult", jsonObject.error, "error");
            return;
        }

        setStatus("contactDeleteResult", "Contact has been deleted.", "success");
        searchContacts();
    });
}

function showInlineEditForm(contactId, domId, button) {
    const editForm = getElement("editForm" + domId);

    if (!editForm) {
        return;
    }

    editForm.hidden = false;

    if (button) {
        button.setAttribute("aria-expanded", "true");
    }

    const firstInput = getElement("editFirstName" + domId);

    if (firstInput) {
        firstInput.focus();
    }
}

function hideInlineEditForm(contactId, domId) {
    const editForm = getElement("editForm" + domId);

    if (!editForm) {
        return;
    }

    editForm.hidden = true;

    const editButton = document.querySelector(
        '[data-action="edit"][data-contact-id="' + contactId + '"]'
    );

    if (editButton) {
        editButton.setAttribute("aria-expanded", "false");
        editButton.focus();
    }

    setStatus("contactEditResult" + domId, "", "");
}

function initializeContactListEvents() {
    const contactList = getElement("contactList");

    if (!contactList || contactList.dataset.eventsAttached === "true") {
        return;
    }

    contactList.dataset.eventsAttached = "true";

    contactList.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-action]");

        if (!button) {
            return;
        }

        const action = button.dataset.action;
        const contactId = button.dataset.contactId;
        const domId = button.dataset.domId;

        if (action === "edit") {
            showInlineEditForm(contactId, domId, button);
        }

        if (action === "cancel") {
            hideInlineEditForm(contactId, domId);
        }

        if (action === "delete") {
            deleteContactById(contactId);
        }
    });

    contactList.addEventListener("submit", function (event) {
        const form = event.target.closest(".edit-contact-form");

        if (!form) {
            return;
        }

        event.preventDefault();

        const contactId = form.dataset.contactId;
        const domId = form.dataset.domId;

        editContactById(contactId, domId);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initializeContactListEvents();
});