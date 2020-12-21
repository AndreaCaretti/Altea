const { v4: uuidv4 } = require("uuid");
const cds = require("@sap/cds");
// eslint-disable-next-line no-unused-vars
const Logger = require("./logger");
/**
 * DB utilities methods
 */
class DB {
    /**
     * Select a single record and return a single field
     * @param {String} tableName Table name
     * @param {String} fieldName Field name
     * @param {String} idValue Value of the key field with name "ID"
     * @param {*} tx CDS Transaction
     * @param {*} logger Logger
     */
    static async selectOneField(tableName, fieldName, idValue, tx, logger) {
        const fieldValue = await tx.run(
            SELECT.one(tableName).columns(fieldName).where({ ID: idValue })
        );

        if (!fieldValue) {
            throw Error(`SelectOneField - Record not found: ${tableName.name}/${idValue}`);
        }

        if (!fieldValue[fieldName]) {
            throw Error(`SelectOneField - Empty field: ${tableName.name}/${idValue}/${fieldName}`);
        }

        logger.logObject(
            `SelectOneField: ${tableName.name}/${idValue}/${fieldName}'`,
            fieldValue[fieldName]
        );

        return fieldValue[fieldName];
    }

    static async selectOneRowWhere(tableName, whereClause, tx, logger) {
        const singleRow = await tx.read(tableName).where(whereClause);

        if (singleRow.length === 0) {
            throw Error(
                `SelectOneRowWhere - Record not found: ${tableName.name} where ${JSON.stringify(
                    whereClause
                )} -> '${JSON.stringify(singleRow)}'`
            );
        }

        logger.logObject(
            `SelectOneRowWhere: ${tableName.name} where ${JSON.stringify(whereClause)}`,
            singleRow
        );

        return singleRow[0];
    }

    /**
     *
     * @param {cds.entries} tableName
     * @param {JSON} whereClause
     * @param {JSON} andClause
     * @param {*} tx
     * @param {Logger} logger
     */
    static async selectAllRowsWhere(tableName, whereClause, andClause, tx, logger) {
        let allRows;
        if (!andClause) {
            allRows = await tx.read(tableName).where(whereClause);
        } else {
            allRows = await tx.read(tableName).where(whereClause).and(andClause);
        }

        if (allRows.length === 0) {
            throw Error(
                `selectAllRowsWhere - Record not found: ${tableName.name} where ${JSON.stringify(
                    whereClause
                )} -> '${JSON.stringify(allRows)}'`
            );
        }
        let logString = `selectAllRowsWhere: ${tableName.name} where ${JSON.stringify(
            whereClause
        )}`;
        if (andClause) {
            logString += ` and ${JSON.stringify(andClause)}`;
        }

        logger.logObject(logString, allRows);

        return allRows;
    }

    /**
     *
     * @param {} Tabella da cds.entities
     * @param {} classe transaction
     * @param {logger} classe logger
     */
    static async selectAllRows(tableName, tx, logger) {
        const allRows = await tx.read(tableName);

        if (allRows.length === 0) {
            throw Error(
                `selectAllRowsWhere - Record not found: ${tableName.name}
                )} -> '${JSON.stringify(allRows)}'`
            );
        }

        logger.logObject(`selectAllRowsWhere: ${tableName.name}`, allRows);

        return allRows;
    }

    /**
     *
     * @param {*} tableName
     * @param {*} fieldName
     * @param {*} where
     * @param {*} tx
     * @param {*} logger
     */
    static async selectOneFieldWhere(tableName, fieldName, where, tx, logger) {
        const record = await tx.run(SELECT.one(tableName).columns(fieldName).where(where));

        if (!record) {
            throw Error(
                `selectOneFieldWhere - Record not found: ${tableName.name}/${JSON.stringify(where)}`
            );
        }
        if (record[fieldName] === null) {
            throw Error(
                `selectOneFieldWhere - Empty field: ${tableName.name}/${JSON.stringify(
                    where
                )}/${fieldName}`
            );
        }

        logger.logObject(
            `selectOneFieldWhere: table ${tableName.name} where ${JSON.stringify(
                where
            )} field ${fieldName}`,
            record[fieldName]
        );

        return record[fieldName];
    }

    /**
     *
     * @param {*} tableName
     * @param {*} idValue
     * @param {*} tx
     * @param {*} logger
     */
    static async selectOneRecord(tableName, idValue, tx, logger) {
        const record = await tx.run(SELECT.one(tableName).where({ ID: idValue }));

        if (!record) {
            throw Error(`selectOneRecord - Record not found: ${tableName.name}/${idValue}`);
        }

        logger.logObject(`selectOneRecord: ${tableName.name}/${idValue}'`, record);

        return record;
    }

    /**
     * Select all records from a table filtering by parent
     * @param {String} tableName
     * @param {String} parentIdValue of the key field with name "ID"
     * @param {*} tx
     * @param {*} logger
     */
    static async selectAllWithParent(tableName, parentIdValue, tx, logger) {
        const records = await tx.run(SELECT.from(tableName).where({ parent_ID: parentIdValue }));

        if (!records.length) {
            throw Error(`SelectAll - Records not found: ${tableName}/${parentIdValue}`);
        }
        logger.debug(`SelectAll: ${tableName.name}/${parentIdValue} -> ${records.length}`);

        return records;
    }

    /**
     * Update a single field of single record a table
     * @param {*} tableName
     * @param {*} idRecord
     * @param {*} fieldName
     * @param {*} fieldValue
     * @param {*} tx
     * @param {*} logger
     */
    static async updateSingleField(tableName, idRecord, fieldName, fieldValue, tx, logger) {
        const recordsCount = await tx.run(
            UPDATE(tableName)
                .set({ [fieldName]: fieldValue })
                .where({ ID: idRecord })
        );

        if (recordsCount === 0) {
            throw Error(`Record not updated: ${tableName.name}/${idRecord}`);
        }
        logger.debug(
            `updateSingleField: ${tableName.name}/${idRecord}/${fieldName}/${fieldValue} -> ${recordsCount}`
        );

        return recordsCount;
    }

    /**
     * Update a some fields of single record a table
     * @param {*} tableName
     * @param {*} idRecord
     * @param {*} fieldValue Object with field and values to update
     *                       eg { name: 'John', surname: 'Doe'}
     * @param {*} tx
     * @param {*} logger
     */
    static async updateSomeFields(tableName, idRecord, fieldsValue, tx, logger) {
        const recordsCount = await tx.run(
            UPDATE(tableName).set(fieldsValue).where({ ID: idRecord })
        );

        if (recordsCount === 0) {
            throw Error(
                `Record not updated: ${tableName.name}/${idRecord}/${JSON.stringify(
                    fieldsValue,
                    null,
                    2
                )}`
            );
        }
        logger.debug(
            `updateSomeFields: ${tableName.name}/${idRecord}/${JSON.stringify(
                fieldsValue,
                null,
                2
            )} -> ${recordsCount}`
        );

        return recordsCount;
    }

    /**
     *
     * @param {$user} Utente tecnico
     * @param {Logger} Classe di logger
     */

    static getTransaction(technicalUser, logger) {
        logger.logObject("Get transaction for user: ", technicalUser);
        return cds.transaction(new cds.Request({ user: technicalUser }));
    }

    /**
     *
     * @param {String} tableName
     * @param {*} row
     * @param {*} tx
     * @param {*} logger
     * @returns {Number} Numero di record inseriti
     */
    static async insertIntoTable(tableName, row, tx, logger) {
        let recordsCount;
        try {
            recordsCount = await tx.create(tableName).entries(row);
            logger.logObject(`Inserito record in tabella: ${tableName.name}`, row);
        } catch (error) {
            throw Error(`Wrong insert: ${error}/ ${JSON.stringify(row)}}`);
        }
        return recordsCount;
    }

    static async getUUID() {
        return uuidv4();
    }

    static async checkDuplicateRecords(tableName, whereClause, tx, logger) {
        let returnvalue;
        const record = await tx.run(SELECT.one(tableName).where(whereClause));
        if (record) {
            logger.debug(
                `Record Duplicato per : ${tableName.name} where ${JSON.stringify(whereClause)}`
            );
            returnvalue = true;
        } else {
            logger.debug(
                `Record NON duplicato per : ${tableName.name} where ${JSON.stringify(whereClause)}`
            );
            returnvalue = false;
        }
        return returnvalue;
    }
}

module.exports = DB;
