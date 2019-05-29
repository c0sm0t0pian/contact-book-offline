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
        return this.db.allDocs({ include_docs: true })
            .then(db => {
                return db.rows.map(row => {
                    return row.doc;
                });
            });
    }

    getContacts() {
       
        return this.db.find({
            selector: {
              table: {$eq: null}
            }
          }).then(function (result) {
            
          }).catch(function (err) {
            console.log(err);
          });

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