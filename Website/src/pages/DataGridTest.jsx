import { DataGrid, DataGridHeader, HeaderButton, HeaderTextFilter } from '@/components/dataGrid/DataGrid'
import { DataColumn, DataTable } from '@/components/dataGrid/DataTable';
import { useState } from 'react'
import './DataGridTest.css'
import { Get } from '@/helpers/fetcher';

export default function DataGridTest() {
    const [filter, setFilter] = useState("");
    const [boolFilter, setBoolFilter] = useState(false);

    const testLoad = async (offset, limit) => {
        // Check network tab to see this query filters
        const res = await Get(`/api/companies?filter=${filter}&boolFilter=${boolFilter}&offset=${offset}&limit=${limit}`);

        if (res.status != 200)
            alert(res.json.message);

        console.log(res.json)

        return res.json;
    }

    return (
        <>
            <DataGrid>
                <DataGridHeader
                    title='Foo'
                    description='This is a test description to show its use'
                    filterPlaceholder='You might see this as a test'
                    addButtonTxt='Nuevo producto'
                    onAddClick={() => console.log('Hello world!')} >
                    <HeaderTextFilter filterPlaceholder='This is test'
                        className='grid-main-filter'
                        value={filter}
                        onChange={setFilter} />
                    <HeaderButton buttonText='Hello world' onClick={() => setBoolFilter(!boolFilter)} />
                </DataGridHeader>

                <DataTable onLoad={testLoad} rowTitle='Clickeame para editar!' onRowClick={(company) => { console.log(company) }}>
                    <DataColumn propertyName='name' title='Company' />
                    <DataColumn propertyName='email' title='Email' />
                    <DataColumn propertyName='rtn' title='RTN' />
                </DataTable>
            </DataGrid>
        </>
    )
}

