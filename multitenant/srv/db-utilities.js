const { v4: uuidv4 } = require("uuid");
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
            throw Error(`SelectOneField - Record not found: ${tableName}/${idValue}`);
        }

        if (!fieldValue[fieldName]) {
            throw Error(`SelectOneField - Empty field: ${tableName}/${idValue}/${fieldName}`);
        }

        logger.debug(
            `SelectOneField: ${tableName}/${idValue}/${fieldName} -> '${fieldValue[fieldName]}'`
        );

        return fieldValue[fieldName];
    }

    static selectAllRowsWhere(tableName, where, tx, logger) {
        const rowValue = tx.run(SELECT.from(tableName).where(where));

        if (!rowValue) {
            throw Error(
                `selectAllRowsWhere - Record not found: ${tableName}/${JSON.stringify(where)}`
            );
        }

        if (!rowValue) {
            throw Error(
                `selectAllRowsWhere - Empty field: ${tableName}/${JSON.stringify(
                    where
                )}/${rowValue}`
            );
        }

        logger.debug(
            `selectAllRowsWhere: ${tableName}/${JSON.stringify(where)}/${where} -> '${rowValue}'`
        );

        return rowValue;
    }

    /**
     *
     * @param {*} tableName
     * @param {*} fieldName
     * @param {*} where
     * @param {*} tx
     * @param {*} logger
     */
    static selectOneRowWhere(tableName, where, tx, logger) {
        const rowValue = tx.run(SELECT.one(tableName).where(where));

        if (!rowValue) {
            throw Error(
                `selectOneRowWhere - Record not found: ${tableName}/${JSON.stringify(where)}`
            );
        }

        if (!rowValue) {
            throw Error(
                `selectOneRowWhere - Empty field: ${tableName}/${JSON.stringify(where)}/${rowValue}`
            );
        }

        logger.debug(
            `selectOneRowWhere: ${tableName}/${JSON.stringify(where)}/${where} -> '${rowValue}'`
        );

        return rowValue;
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
            throw Error(`selectOneRecord - Record not found: ${tableName}/${idValue}`);
        }

        logger.debug(`selectOneRecord: ${tableName}/${idValue} -> '${JSON.stringify(record)}'`);

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
        logger.debug(`SelectAll: ${tableName}/${parentIdValue} -> ${records.length}`);

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
            throw Error(`Record not updated: ${tableName}/${idRecord}`);
        }
        logger.debug(
            `updateSingleField: ${tableName}/${idRecord}/${fieldName}/${fieldValue} -> ${recordsCount}`
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
                `Record not updated: ${tableName}/${idRecord}/${JSON.stringify(
                    fieldsValue,
                    null,
                    2
                )}`
            );
        }
        logger.debug(
            `updateSomeFields: ${tableName}/${idRecord}/${JSON.stringify(
                fieldsValue,
                null,
                2
            )} -> ${recordsCount}`
        );

        return recordsCount;
    }

    static getTransaction(technicalUser, logger) {
        logger.logObject("Get transaction for user: ", technicalUser);
        return cds.transaction(new cds.Request({ user: technicalUser }));
    }

    /** Metodo per inserimento singolo di un record in tabella
     *
     * @param {*} tableName - Nome Tabella
     * @param {*} row  - Valore xsa inserire in tabella
     * @param {*} tx  - TX context per inserimento in tabella
     * @param {*} Logger  - classe di logger globale
     */
    static async insertIntoTable(tableName, row, tx, Logger) {
        const oTX = tx;
        let recordsCount;
        try {
            recordsCount = await oTX.create(tableName).entries(row);
            Logger.debug(`Record append: ${tableName.name}/ ${JSON.stringify(row)}}`);
        } catch (error) {
            oTX.rollback();
            throw Error(`Wrong insert: ${error}/ ${JSON.stringify(row)}}`);
        }
        await oTX.commit();
        return recordsCount;
    }

    /**
     *
     * @param {*} tableName - Nome tabella
     * @param {*} whereClause - Condizione di where esempio { ID: idValue }
     * @param {*} tx - TX contect per esecuzione query
     * @param {*} logger - classe di logger globale
     */
    static async selectOneRecordUsing(tableName, whereClause, tx, logger) {
        const record = await tx.run(SELECT.one(tableName).where(whereClause));

        if (!record) {
            throw Error(
                `SelectOneRecord - Record not found for table : ${tableName} and where clause ${whereClause}`
            );
        }

        logger.debug(
            `SelectOneRecord for table : ${tableName} and whereCause ${whereClause} -> '${JSON.stringify(
                record
            )}'`
        );

        return record;
    }

    /**
     * Metodo recupero dinamico di un UUID
     */
    static async getUUID() {
        return uuidv4();
    }

    static async checkDuplicateRecords(tableName, fieldName, fieldValue) {
        const record = SELECT.one(tableName).columns(fieldName).where({ fieldName: fieldValue });
        if (record) {
            throw Error(`Record Duplicato per ${tableName.name}/${fieldName}: ${fieldValue}`);
        }
        return false;
    }

    // ----- DA PROVARE ------ //
    static async join(tableName, tableNameJoin, joinContidion, whereCondition, tx, Logger) {
        // ----- DA PROVARE ------ //
        try {
            const res = await tx.run(
                SELECT
                    // .from("cloudcoldchain.Areas as A")
                    .from("tableName")
                    // .join("cloudcoldchain.AreaCategories as B")
                    .join("tableNameJoin")
                    .on({
                        // xpr: ["A.category_ID", "=", "B.ID"],
                        joinContidion,
                    })
                    // .where("A.ID", "=", "valueString")
                    .where(whereCondition)
            );
            return res;
        } catch (error) {
            Logger.debug(`Error: ${error}/ ${tableName.name} JOIN ${tableNameJoin.name}`);
            throw Error(`error on Join: ${error} / ${tableName.name} JOIN ${tableNameJoin.name}`);
        }
    }
}

module.exports = DB;
