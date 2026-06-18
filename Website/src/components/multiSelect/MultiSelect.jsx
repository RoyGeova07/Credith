import { useState } from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import './MultiSelect.css'

export default function MultiSelect({
    title,
    selected,
    onSelect,
    onLoad,
    pageSize,
    isDisabled=false,
}) {
    const [isLoading, setIsLoading] = useState(false);

    const load = async (search, loadedOptions, {page}) => {
        setIsLoading(true);
        try {
            return onLoad(search, loadedOptions, {page})
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AsyncPaginate isMulti

            classNamePrefix="multi-select"
            placeholder={title}
            isClearable={true}
            isSearchable={true}
            isLoading={isLoading}
            pageSize={pageSize || 10}
            value={selected}
            onChange={onSelect}
            loadOptions={load}
            closeMenuOnSelect={false}
            additional={{ page: 1 }}
            isDisabled={isDisabled}
            
        />
    )
}
