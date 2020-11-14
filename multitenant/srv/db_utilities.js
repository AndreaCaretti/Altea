// Select one field from table
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

// Select all records from table reading with parent
async function selectAllWithParent(tableName, idValue, tx, logger) {
    const records = await tx.run(SELECT.from(tableName).where({ parent_ID: idValue }));

    if (!records.length) {
        logger.error(`SelectAll: ${tableName}/${idValue}`);

        throw Error(`Records not found: ${tableName}/${idValue}`);
    }
    logger.debug(`SelectAll: ${tableName}/${idValue} -> ${records.length}`);

    return records;
}

// Update single field
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
