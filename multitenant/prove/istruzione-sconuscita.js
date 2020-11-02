function _beforeInputValidationDeep(data, context, model, target) {
    console.log(data);
    console.log(context);
    console.log(model);
    console.log(target);
}

const beforeInputValidation = ({ model } = {}) => {
    return (context) => {
        if (context.target) {
            return _beforeInputValidationDeep(context.data, context, model, context.target);
        }
    };
};

const request = {
    target: "target",
    data: {
        nome: "sam",
    },
    model: "contenuto-model",
};

const func = beforeInputValidation(request);

func.call(null, request);
