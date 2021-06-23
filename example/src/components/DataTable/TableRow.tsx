import React from 'react';

const TableRow = (props: any) => {
    
    const item = props.item;
    const cols = props.cols;

    const isArray = Array.isArray(item);

    return (
        <tr className="no-text-overflow">

            {
                isArray &&
                item.map((value: any, index: number) => {
                    return <td key={cols[index]} className={cellClass(value)}>
                        {
                            formatValue(value)
                        }
                    </td>
                })   
            }

            {
                !isArray &&
                cols.map((c: any, index: number) => {
                    return <td key={cols[index]} className={cellClass(item[c])}>
                        {
                            formatValue(item[c])
                        }
                    </td>
                })
            }
        </tr>
    )
}

export default TableRow;

function formatValue(value: any) {
    if (typeof value === 'number') {
        return value.toFixed(0);
    }
    return value;
}
function cellClass(value: any) {
    if (typeof value === 'number') {
        return 'number';
    }
    return '';
}