import React from 'react';
import { Field, withFormik } from 'formik';
import { DatePicker } from 'antd'

const MyForm = props => {
    const {
        values,
        touched,
        errors,
        handleChange,
        handleBlur,
        handleSubmit,
    } = props;
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
                name="name"
            />
            {errors.name && touched.name && <p>{errors.name}</p>}
            <Field
                name="lastName"
                placeholder="Baby"
                render={({ field, form }) => (
                    <div>
                       <DatePicker name="date" onChange={(moment, value) => { form.setFieldValue('date', value) }}/>
                        {errors.date && touched.date && <p>{errors.date}</p>}
                    </div>
                )}
            />
            <button type="submit">Submit</button>
        </form>
    );
};

const MyEnhancedForm = withFormik({
    mapPropsToValues: () => ({ name: '', date: '' }),




    // Custom sync validation
    validate: values => {

        console.log(values);


        const errors = {};

        if (!values.name) {
            errors.name = 'Name is Required';
        }

        if (!values.date) {
            errors.date = 'Date is Required';
        }

        return errors;
    },

    handleSubmit: (values, { setSubmitting }) => {
        setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            setSubmitting(false);
        }, 100);
    },

    displayName: 'BasicForm',
})(MyForm);

export default MyEnhancedForm;