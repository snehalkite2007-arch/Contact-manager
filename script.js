const contactForm = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const searchInput = document.getElementById("searchInput");
const contactList = document.getElementById("contactList");
const contactCount = document.getElementById("contactCount");
const emptyMessage = document.getElementById("emptyMessage");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

let contacts = [];

try {
    contacts = JSON.parse(
        localStorage.getItem("myContacts") || "[]"
    );

    if (!Array.isArray(contacts)) {
        contacts = [];
    }

    contacts = contacts.filter(contact =>
        contact &&
        typeof contact.id === "string" &&
        typeof contact.name === "string" &&
        typeof contact.phone === "string" &&
        typeof contact.email === "string"
    );
} catch {
    contacts = [];
}

let editingId = null;

function saveContacts() {
    try {
        localStorage.setItem(
            "myContacts",
            JSON.stringify(contacts)
        );
        return true;
    } catch {
        alert("Could not save contacts in this browser.");
        return false;
    }
}

function createElement(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

function renderContacts() {
    contactList.replaceChildren();

    const query = searchInput.value.toLowerCase().trim();

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query)
    );

    contactCount.textContent =
        `${contacts.length} contact${contacts.length === 1 ? "" : "s"}`;

    emptyMessage.hidden = filteredContacts.length !== 0;

    if (contacts.length === 0) {
        emptyMessage.textContent =
            "No contacts yet. Add your first contact!";
    } else {
        emptyMessage.textContent = "No matching contacts found.";
    }

    filteredContacts.forEach(contact => {
        const card = createElement("article", "", "contact-card");

        card.appendChild(createElement("h3", contact.name));
        card.appendChild(createElement("p", "📞 " + contact.phone));
        card.appendChild(createElement("p", "✉️ " + contact.email));

        const actions = createElement("div", "", "contact-actions");

        const editBtn = createElement("button", "Edit", "edit-btn");
        editBtn.type = "button";
        editBtn.addEventListener("click", () => editContact(contact.id));

        const deleteBtn = createElement("button", "Delete", "delete-btn");
        deleteBtn.type = "button";
        deleteBtn.addEventListener("click", () => deleteContact(contact.id));

        actions.append(editBtn, deleteBtn);
        card.appendChild(actions);
        contactList.appendChild(card);
    });
}

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !phone || !email) {
        alert("Please fill in all fields.");
        return;
    }

    const previousContacts = [...contacts];

    if (editingId !== null) {
        contacts = contacts.map(contact =>
            contact.id === editingId
                ? { ...contact, name, phone, email }
                : contact
        );
    } else {
        contacts.push({
            id: crypto.randomUUID(),
            name,
            phone,
            email
        });
    }

    if (!saveContacts()) {
        contacts = previousContacts;
        return;
    }

    resetForm();
    renderContacts();
});

function editContact(id) {
    const contact = contacts.find(item => item.id === id);

    if (!contact) return;

    editingId = id;
    nameInput.value = contact.name;
    phoneInput.value = contact.phone;
    emailInput.value = contact.email;

    formTitle.textContent = "Edit Contact";
    submitBtn.textContent = "Save Changes";
    cancelBtn.hidden = false;

    nameInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteContact(id) {
    const contact = contacts.find(item => item.id === id);

    if (!contact) return;

    if (!confirm(`Delete ${contact.name} from your contacts?`)) {
        return;
    }

    const previousContacts = [...contacts];
    contacts = contacts.filter(item => item.id !== id);

    if (!saveContacts()) {
        contacts = previousContacts;
        return;
    }

    if (editingId === id) {
        resetForm();
    }

    renderContacts();
}

function resetForm() {
    contactForm.reset();
    editingId = null;
    formTitle.textContent = "Add New Contact";
    submitBtn.textContent = "Add Contact";
    cancelBtn.hidden = true;
}

cancelBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderContacts);

renderContacts();