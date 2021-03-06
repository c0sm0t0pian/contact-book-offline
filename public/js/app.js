/* eslint-disable no-console */

var CONTACT_ID_ATTR_NAME = 'data-contractid';
var CONTACT_REMOVE_CONFIRM = 'Are you sure?';
var NO_CONTACTS_TEXT = 'No contacts';

class ContactBook {

    // Aufruf aus HTML:
    // new ContactBook(Store, "http://localhost:5984");
    constructor(storeClass, remote) {
        this.store = new storeClass(
            'contacts',
            remote,
            () => {this.refresh();} //Store.onchange
        );

        console.log('Starting init()');
        this.init();
        this.refresh();
        this.toggleContactFormEditing(false);
    }

    init() {
        this.initElements();
        this.initItemTemplate();
        this.attachHandlers();

        this.populateGenderListOptions();

        // this.generateDefaultEntries();
    }

    initElements() { // 1. Init
        this.contactList = document.getElementById('contactList');

        this.contactDetailsForm = document.getElementById('contactDetails');
        this.contactIdField = document.getElementById('contactid');
        this.firstNameField = document.getElementById('firstname');
        this.lastNameField = document.getElementById('lastname');
        this.phoneField = document.getElementById('phone');
        this.selGenderField = document.getElementById("selGender");

        this.addContactButton = document.getElementById('addContact');
        this.editContactButton = document.getElementById('editContact');
        this.removeContactButton = document.getElementById('removeContact');
        this.saveContactButton = document.getElementById('saveContact');
        this.cancelEditButton = document.getElementById('cancelEdit');

        
    }

    initItemTemplate() { // 2. Init
        var contactListItem = this.contactList.querySelector('li');
        this.contactList.removeChild(contactListItem);
        this._contactTemplate = contactListItem;
    }

    attachHandlers() { // 3. Init
        this.contactDetailsForm.addEventListener('submit', event => {
            event.preventDefault();
        });

        this.addContactButton.addEventListener('click', () => { this.addContact() });
        this.editContactButton.addEventListener('click', () => { this.editContact() });
        this.removeContactButton.addEventListener('click', () => { this.removeContact() });
        this.saveContactButton.addEventListener('click', () => { this.saveContact() });
        this.cancelEditButton.addEventListener('click', () => { this.cancelEdit() });
    }


    populateGenderListOptions(){ // 4. Init
        
        let gendersJSON = ([
            {
              _id: 'g0',
              table: 'genders',
              genderID: 0,
              genderName: 'female'
            },
            {
              _id: 'g1',
              table: 'genders',
              genderID: 1,
              genderName: 'non-binary'
            },
            {
             _id: 'g2',
             table: 'genders',
             genderID: 2,
             genderName: 'male'
            }
        ]);

        this.store.saveMultiple(gendersJSON);
        
        let genders = this.store.getGenders();
        // let genders = ["apple","orange","pear"];
        
        console.log("Genders retrieved");
        // console.log(`genders: ${genders}`);
        // console.log(`typeof genders: ${typeof genders}`);
        // console.log(genders);

        let selGenderField = this.selGenderField;
        genders.then(function (genderArray) {
            
            genderArray.map( item => {
                // console.log(`item.genderName: ${item.genderName}`);
                var newOption = new Option(item.genderName, item.genderID);
                var genderListLength = selGenderField.options.length;
                // console.log(`genderListLength: ${genderListLength}`);
                selGenderField.options[genderListLength] = newOption;
            });

        });

        // genders.map( item => {
        //     console.log(`item.genderName: ${item.genderName}`);
        //     var newOption = new Option(item.genderName, item.genderID);
        //     var genderListLength = this.selGenderField.options.length;
        //     console.log(`genderListLength: ${genderListLength}`);
        //     this.selGenderField.options[genderListLength] = newOption;
        // });

        console.log("Finished population GenderList");
        // for ( const element of genders )
        // {
        //     var newOption = new Option(element,element);
        //     var genderListLength = this.selGenderField.options.length;
        //     console.log(`genderListLength: ${genderListLength}`);
        //     this.selGenderField.options[genderListLength] = newOption;
        // }
            

    }

    refresh() { // 5. Init

        this.store.getContacts().then(contacts => {
        // this.store.getAll().then(contacts => {
            this.sortContacts(contacts);
            this.renderContactList(contacts);
        });

    }

    sortContacts(contacts) {
        contacts.sort((contact1, contact2) => {
            return (contact1.firstName + contact1.lastName).localeCompare(contact2.firstName + contact2.firstName);
        });
    }

    renderContactList(contacts) {
        this.contactList.innerHTML = '';
        this.contactList.appendChild(this.createContactList(contacts));
    }

    createContactList(contacts) {
        if(!contacts.length)
            return this.createNoDataItem();

        var result = document.createDocumentFragment();

        contacts.forEach(contact => {
            result.appendChild(this.createContact(contact))
        });

        return result;
    }

    createNoDataItem() {
        var result = document.createElement('li');
        result.className = 'contact-list-empty';
        result.textContent = NO_CONTACTS_TEXT;
        return result;
    }

    createContact(contact) {
        var result = this._contactTemplate.cloneNode(true);
        result.setAttribute(CONTACT_ID_ATTR_NAME, contact._id);
        result.querySelector('.contact-name').innerText = contact.firstName + ' ' + contact.lastName;
        result.querySelector('.contact-phone').innerText = contact.phone;
        result.addEventListener('click', event => { this.showContact(event) });
        return result;
    }

    showContact(event) {
        var contactId = event.currentTarget.getAttribute(CONTACT_ID_ATTR_NAME);

        this.store.get(contactId).then(contact => {
            this.setContactDetails(contact);
            this.toggleContactFormEditing(false);
        })
    }

    addContact() {
        this.setContactDetails({ firstName: 'Name' });
        this.toggleContactFormEditing(true);
    }

    editContact() {
        var contactId = this.getContactId();

        this.store.get(this.getContactId()).then(contact => {
            this.setContactDetails(contact);
            this.toggleContactFormEditing(true);
        });
    }

    saveContact() {
        var contact = this.getContactDetails();

        this.store.save(contact).then(() => {
            this.setContactDetails({});
            this.toggleContactFormEditing(false);
            this.refresh();
        });
    }

    removeContact() {
        if(!window.confirm(CONTACT_REMOVE_CONFIRM))
            return;

        var contactId = this.getContactId();

        this.store.remove(contactId).then(() => {
            this.setContactDetails({});
            this.toggleContactFormEditing(false);
            this.refresh();
        });
    }

    cancelEdit() {
        this.setContactDetails({});
        this.toggleContactFormEditing(false);
    }

    getContactDetails() {
        return {
            _id: this.getContactId(),
            firstName: this.firstNameField.value,
            lastName: this.lastNameField.value,
            phone: this.phoneField.value,
            gender: this.selGenderField.value
        };
    }

    getContactId() {
        return this.contactIdField.value;
    }

    setContactDetails(contactDetails) {
        this.contactIdField.value = contactDetails._id || '';
        this.firstNameField.value = contactDetails.firstName || '';
        this.lastNameField.value = contactDetails.lastName || '';
        this.phoneField.value = contactDetails.phone || '';
        this.selGenderField.value = contactDetails.selGenderField || '';
    }

    toggleContactFormEditing(isEditing) { // 6. Init
        var isContactSelected = !this.getContactId();

        this.toggleFade(this.contactDetailsForm, !isEditing && isContactSelected);

        this.toggleElement(this.editContactButton, !isEditing && !isContactSelected);
        this.toggleElement(this.removeContactButton, !isEditing && !isContactSelected);

        this.toggleElement(this.addContactButton, !isEditing);
        this.toggleElement(this.saveContactButton, isEditing);
        this.toggleElement(this.cancelEditButton, isEditing);

        this.toggleDisabled(this.firstNameField, !isEditing);
        this.toggleDisabled(this.lastNameField, !isEditing);
        this.toggleDisabled(this.phoneField, !isEditing);

        this.toggleDisabled(this.selGenderField, !isEditing);

        this.firstNameField.focus();
        this.firstNameField.setSelectionRange(0, this.firstNameField.value.length);
    }

    toggleElement(element, isShown) {
        element.style.display = isShown ? 'block' : 'none';
    }

    toggleFade(element, isFade) {
        element.style.opacity = isFade ? .5 : 1;
    }

    toggleDisabled(element, isDisabled) {
        if(isDisabled) {
            element.setAttribute('disabled', '');
        } else {
            element.removeAttribute('disabled');
        }
    }
}

window.ContactBook = ContactBook;