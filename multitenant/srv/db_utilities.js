/**
 * Select a single record and return a single field
 * @param {String} tableName Table name
 * @param {String} fieldName Field name
 * @param {String} idValue Value of the key field with name "ID"
 * @param {*} tx CDS Transaction
 * @param {*} logger Logger
 */
async function selectOneField(tableName, fieldName, idValue, tx, logger) {
    const fieldValue = await tx.run(
        SELECT.one(tableName).columns(fieldName).where({ ID: idValue })
    );

    if (!fieldValue) {
        logger.error(`SelectOneField: ${tableName}/${idValue}`);

        throw Error(`Record not found: ${tableName}/${idValue}`);
    }

    if (!fieldValue[fieldName]) {
        logger.error(`SelectOneField: ${tableName}/${idValue}/${fieldName}`);

        throw Error(`Empty field: ${tableName}/${idValue}/${fieldName}`);
    }

    logger.debug(
        `SelectOneField: ${tableName}/${idValue}/${fieldName} -> '${fieldValue[fieldName]}'`
    );

    return fieldValue[fieldName];
}

/**
 * Select all records from a table filtering by parent
 * @param {String} tableName
 * @param {String} Value of the key field with name "ID"
 * @param {*} tx
 * @param {*} logger
 */
async function selectAllWithParent(tableName, parentIdValue, tx, logger) {
    const records = await tx.run(SELECT.from(tableName).where({ parent_ID: parentIdValue }));

    if (!records.length) {
        logger.error(`SelectAll: ${tableName}/${parentIdValue}`);

        throw Error(`Records not found: ${tableName}/${parentIdValue}`);
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
async function updateSingleField(tableName, idRecord, fieldName, fieldValue, tx, logger) {
    const records = await tx.run(
        UPDATE(tableName)
            .set({ [fieldName]: fieldValue })
            .where({ ID: idRecord })
    );

    if (records === 0) {
        logger.error(`updateSingleField: ${tableName}/${idRecord}`);

        throw Error(`Records not found: ${tableName}/${idRecord}`);
    }
    logger.debug(
        `updateSingleField: ${tableName}/${idRecord}/${fieldName}/${fieldValue} -> ${records}`
    );

    return records;
}

module.exports.selectOneField = selectOneField;
module.exports.selectAllWithParent = selectAllWithParent;
module.exports.updateSingleField = updateSingleField;
