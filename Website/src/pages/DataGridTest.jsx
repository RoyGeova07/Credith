import { DataGrid, DataGridHeader, HeaderButton, HeaderTextFilter } from '@/components/dataGrid/DataGrid'
import { DataColumn, DataTable } from '@/components/dataGrid/DataTable';
import { useState } from 'react'
import './DataGridTest.css'

export default function DataGridTest() {
    const [filter, setFilter] = useState("");

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
                        onChange={setFilter}/>
                    <HeaderButton buttonText='Hello world' onClick={() => alert(filter)} />
                </DataGridHeader>
                
                <DataTable>
                    <DataColumn title='Name'/>
                    <DataColumn title='Email'/>
                </DataTable>
            </DataGrid>
        </>
    )
}

