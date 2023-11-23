const {MongoClient} = require('mongodb')

const url  = 'mongodb://localhost:27017/Project1'

let Tdb;

module.exports = {

    ConnectDB:(callback)=>{
        MongoClient.connect(url)
        .then((doc)=>{
          Tdb = doc.db()
          console.log('Conncet DB')
          callback(null)
        })
        .catch(error=>{
            callback(error)
        })
    },
    getDB:()=>{
        return Tdb
    }
}