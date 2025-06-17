import Select from 'react-select';

const MultiSelectComponent = ({ options, selectedValues, onChange }) => {
    return (
        <Select
            isMulti
            options={options}
            value={selectedValues}
            onChange={onChange}
            className="basic-multi-select"
            classNamePrefix="select"
        />
    );
};

export default MultiSelectComponent;