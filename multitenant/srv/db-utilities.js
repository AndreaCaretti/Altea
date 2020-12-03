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

    /**
     *
     * @param {*} tableName
     * @param {*} fieldName
     * @param {*} where
     * @param {*} tx
     * @param {*} logger
     */
    static async selectOneFieldWhere(tableName, fieldName, where, tx, logger) {
        try {
            const fieldValue = await tx.run(SELECT.one(tableName).columns(fieldName).where(where));
        } catch (error) {
            console.log(error);
        }

        if (!fieldValue) {
            throw Error(
                `selectOneFieldWhere - Record not found: ${tableName}/${JSON.stringify(where)}`
            );
        }

        if (!fieldValue[fieldName]) {
            throw Error(
                `selectOneFieldWhere - Empty field: ${tableName}/${JSON.stringify(
                    where
                )}/${fieldName}`
            );
        }

        logger.debug(
            `selectOneFieldWhere: ${tableName}/${JSON.stringify(where)}/${fieldName} -> '${
                fieldValue[fieldName]
            }'`
        );

        return fieldValue[fieldName];
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
