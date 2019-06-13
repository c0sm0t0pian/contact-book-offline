/* eslint-disable no-undef */
/* eslint-disable no-console */

class Store {

    //name = 'contacts', remote = 'URL::PORT', onChange = function
    constructor(name, remote, onChange) {
        
        this.db = new PouchDB(name);

        PouchDB.sync(name, `${remote}/${name}`, {
            live: true,
            retry: true
        }).on('change', info => {
            onChange(info);
        });

        //PouchDB.replicate(this.db, 'http://localhost:5984/mydb', {live: true});


    }

    getAll() {
        let returnObject;
        
        returnObject = this.db.allDocs({ include_docs: true })
            .then(records => {
                console.log('records:');
                console.log(records);

                // erstellt Array 
                return records.rows.map(row => {
                    console.log('row:');
                    console.log(row);
                    console.log('row.doc:');
                    console.log(row.doc);
                    return row.doc;
                });

            });

        console.log('Returning (returnObject): ');
        console.log(returnObject);
        return returnObject;
    }

    getContacts() {

        console.log("Getting contacts only...");
        let returnObject;

        returnObject = this.db.find({
            selector: {
                table : { "$exists" : false }
            }
        }).then(contactsrecords => {
            console.log('contactsrecords:');
            console.log(contactsrecords);

            //erstellt Array
            return contactsrecords.docs.map(row => {
                console.log('row:');
                console.log(row);
                return row;                
            });
        }).catch(function (err) {
            console.log(err);
        });

        console.log('Returning (returnObject contacts): ');
        console.log(returnObject);
        return returnObject;
    
    }

    get(id) {
        return this.db.get(id);
    }

    save(item) {
        return item._id
            ? this.update(item)
            : this.add(item);
    }

    saveMultiple(items) {
        
        this.db.bulkDocs(items);

    }

    add(item) {
        return this.db.post(item);
    }

    update(item) {
        return this.db.get(item._id)
            .then(updatingItem => {
                Object.assign(updatingItem, item);
                return this.db.put(updatingItem);
            });
    }

    remove(id) {
        return this.db.get(id)
            .then(item => {
                return this.db.remove(item);
            });
    }
}